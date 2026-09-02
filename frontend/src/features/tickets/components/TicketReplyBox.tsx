import React, { useState } from 'react';
import { Send, Sparkles } from 'lucide-react';
import { Textarea } from '../../../components/ui/Textarea';

interface TicketReplyBoxProps {
  onSubmit: (body: string) => Promise<void>;
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

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || isSubmitting) return;
    await onSubmit(replyText);
    setReplyText('');
  };

  const handleAiDraft = async () => {
    if (!onGenerateAiDraft) return;
    const draft = await onGenerateAiDraft();
    if (draft) {
      setReplyText(draft);
    }
  };

  return (
    <form onSubmit={handleSend} className="rounded-xl border border-gray-200 bg-white p-4 space-y-3 shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold text-gray-900">
          Reply to Customer
        </label>
        {onGenerateAiDraft && (
          <button
            type="button"
            onClick={handleAiDraft}
            disabled={isGeneratingAi}
            className="text-xs font-semibold text-purple-600 hover:text-purple-700 inline-flex items-center gap-1 bg-purple-50 hover:bg-purple-100 px-2.5 py-1 rounded-md transition-colors disabled:opacity-50"
          >
            <Sparkles className="h-3 w-3" />
            {isGeneratingAi ? 'Generating AI reply...' : '✨ Draft with Gemini AI'}
          </button>
        )}
      </div>

      <Textarea
        rows={4}
        value={replyText}
        onChange={(e) => setReplyText(e.target.value)}
        placeholder="Type your response to the customer..."
        required
      />

      <div className="flex items-center justify-between pt-1">
        <span className="text-[10px] text-gray-400">
          Customer will receive an update in real-time.
        </span>
        <button
          type="submit"
          disabled={isSubmitting || !replyText.trim()}
          className="bg-[#111827] hover:bg-black text-white text-xs font-semibold px-4 py-2 rounded-lg transition-colors flex items-center gap-1.5 disabled:opacity-50"
        >
          <Send className="h-3.5 w-3.5" />
          {isSubmitting ? 'Sending...' : 'Send reply'}
        </button>
      </div>
    </form>
  );
}
