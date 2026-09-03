import React from 'react';
import { Paperclip, FileText, Image as ImageIcon, ExternalLink, Download } from 'lucide-react';
import { AttachmentMeta } from '../../features/tickets/types/ticket.types';

interface AttachmentListProps {
  attachments?: AttachmentMeta[];
  className?: string;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function AttachmentList({ attachments, className = '' }: AttachmentListProps) {
  if (!attachments || attachments.length === 0) return null;

  return (
    <div className={`space-y-2 pt-2 ${className}`}>
      <div className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-wider text-[#9E9EA8]">
        <Paperclip className="h-3 w-3 text-[#C9B9A6]" />
        <span>Attachments ({attachments.length})</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {attachments.map((att, idx) => {
          const isImage = att.mimeType.startsWith('image/');
          return (
            <a
              key={att.publicId || idx}
              href={att.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2.5 p-2 rounded-lg bg-[#111115]/80 hover:bg-[#181820] border border-[#C9B9A6]/20 hover:border-[#C9B9A6]/50 transition-all group cursor-pointer text-left"
            >
              {isImage ? (
                <div className="h-10 w-10 rounded bg-[#1A1A22] overflow-hidden shrink-0 border border-white/10 flex items-center justify-center">
                  <img
                    src={att.url}
                    alt={att.fileName}
                    className="h-full w-full object-cover group-hover:scale-105 transition-transform"
                    loading="lazy"
                  />
                </div>
              ) : (
                <div className="h-10 w-10 rounded bg-[#1A1A22] shrink-0 border border-white/10 flex items-center justify-center text-[#C9B9A6]">
                  <FileText className="h-5 w-5" />
                </div>
              )}

              <div className="min-w-0 flex-1">
                <div className="text-xs font-mono text-[#F5F5F7] truncate group-hover:text-[#DFD5C6] transition-colors">
                  {att.fileName}
                </div>
                <div className="text-[10px] font-mono text-[#70707C]">
                  {formatFileSize(att.size)}
                </div>
              </div>

              <div className="text-[#70707C] group-hover:text-[#C9B9A6] p-1 shrink-0">
                <ExternalLink className="h-3.5 w-3.5" />
              </div>
            </a>
          );
        })}
      </div>
    </div>
  );
}
