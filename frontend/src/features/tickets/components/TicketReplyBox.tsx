import React, { useState } from 'react';
import { Send, Sparkles, Loader2 } from 'lucide-react';
import { Textarea } from '../../../components/ui/Textarea';
import { FileUploadInput } from '../../../components/ui/FileUploadInput';

interface TicketReplyBoxProps {
  onSubmit: (body: string, files?: File[]) => Promise<void>;
  isSubmitting?: boolean;
  onGenerateAiDraft?: () => Promise<string | undefined>;
  isGeneratingAi?: boolean;
}

export function TicketReplyBox({
  onSubmit,
  isSubmitting = false,
  onGenerateAiDraft,
  isGeneratingAi = false,
}: TicketReplyBoxProps) {
  const [replyText, setReplyText] = useState('');
  const [files, setFiles] = useState<File[]>([]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || isSubmitting) return;
    await onSubmit(replyText, files);
    setReplyText('');
    setFiles([]);
  };

  const handleAiDraft = async () => {
    if (!onGenerateAiDraft) return;
    const draft = await onGenerateAiDraft();
    if (draft) {
      setReplyText(draft);
    }
  };

  return (
    <form
      onSubmit={handleSend}
      className="glass-drop-panel p-5 sm:p-6 rounded-xl space-y-4 text-[#F5F5F7]"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-white/[0.08]">
        <div>
          <label className="font-mono text-xs uppercase tracking-wider font-bold text-[#F5F5F7] block">
            Post Staff Reply
          </label>
          <span className="text-[11px] text-[#9E9EA8] font-sans">
            Customer will receive this message and resolution telemetry.
          </span>
        </div>

        {onGenerateAiDraft && (
          <button
            type="button"
            onClick={handleAiDraft}
            disabled={isGeneratingAi}
            className="self-start sm:self-auto text-xs font-mono font-bold uppercase tracking-wider text-[#DFD5C6] inline-flex items-center gap-1.5 bg-[#C9B9A6]/15 hover:bg-[#C9B9A6]/25 border border-[#C9B9A6]/30 px-3 py-1.5 rounded-md transition-all disabled:opacity-50 cursor-pointer shadow-xs active:scale-95"
          >
            {isGeneratingAi ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin text-[#C9B9A6]" />
                <span>Generating Draft...</span>
              </>
            ) : (
              <>
                <Sparkles className="h-3.5 w-3.5 text-[#C9B9A6]" />
                <span>✨ AI Draft Reply</span>
              </>
            )}
          </button>
        )}
      </div>

      <Textarea
        rows={4}
        value={replyText}
        onChange={(e) => setReplyText(e.target.value)}
        placeholder="Type a verified, helpful response to the customer..."
        required
      />

      <FileUploadInput
        files={files}
        onFilesChange={setFiles}
      />

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
        <span className="text-[11px] text-[#9E9EA8] font-mono">
          Markdown and file attachments are supported.
        </span>
        <button
          type="submit"
          disabled={isSubmitting || !replyText.trim()}
          className="border border-[#C9B9A6] bg-[#C9B9A6] hover:bg-[#DFD5C6] text-[#0A0A0C] font-mono text-xs uppercase tracking-[0.14em] font-bold px-6 py-2.5 rounded-lg transition-all flex items-center justify-center gap-2 shadow-[0_4px_20px_rgba(201,185,166,0.3)] disabled:opacity-50 active:scale-95 cursor-pointer"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-3.5 w-3.5 animate-spin text-[#0A0A0C]" />
              <span>Sending...</span>
            </>
          ) : (
            <>
              <Send className="h-3.5 w-3.5" />
              <span>Send Reply</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
}
