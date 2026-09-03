import React, { useRef } from 'react';
import { Paperclip, X, FileText, Image as ImageIcon, AlertCircle } from 'lucide-react';

interface FileUploadInputProps {
  files: File[];
  onFilesChange: (files: File[]) => void;
  maxFiles?: number;
  maxSizeBytes?: number;
  error?: string | null;
  className?: string;
}

const DEFAULT_MAX_FILES = 5;
const DEFAULT_MAX_SIZE = 10 * 1024 * 1024; // 10MB

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function FileUploadInput({
  files,
  onFilesChange,
  maxFiles = DEFAULT_MAX_FILES,
  maxSizeBytes = DEFAULT_MAX_SIZE,
  error,
  className = '',
}: FileUploadInputProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [localError, setLocalError] = React.useState<string | null>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalError(null);
    const selectedFiles = Array.from(e.target.files || []);
    if (!selectedFiles.length) return;

    if (files.length + selectedFiles.length > maxFiles) {
      setLocalError(`You can only attach up to ${maxFiles} files per submission.`);
      return;
    }

    for (const file of selectedFiles) {
      if (file.size > maxSizeBytes) {
        setLocalError(`"${file.name}" exceeds the ${formatFileSize(maxSizeBytes)} limit.`);
        return;
      }
    }

    onFilesChange([...files, ...selectedFiles]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeFile = (index: number) => {
    const updated = files.filter((_, i) => i !== index);
    onFilesChange(updated);
    setLocalError(null);
  };

  const displayedError = error || localError;

  return (
    <div className={`space-y-2.5 ${className}`}>
      <div className="flex items-center justify-between">
        <label className="text-[11px] font-mono uppercase tracking-[0.14em] text-[#C9B9A6] flex items-center gap-1.5">
          <Paperclip className="h-3.5 w-3.5" />
          <span>Attachments ({files.length}/{maxFiles})</span>
        </label>
        <span className="text-[10px] font-mono text-[#70707C]">
          Max 10MB each (Images, PDF, Docs, CSV, TXT)
        </span>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        multiple
        onChange={handleFileSelect}
        accept="image/jpeg,image/png,image/webp,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,text/plain,text/csv"
        className="hidden"
        disabled={files.length >= maxFiles}
      />

      {files.length < maxFiles && (
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="w-full py-2.5 px-3 rounded-md border border-dashed border-[#C9B9A6]/30 hover:border-[#C9B9A6]/60 bg-[#16161C]/50 hover:bg-[#16161C]/80 text-[#9E9EA8] hover:text-[#F5F5F7] font-mono text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
        >
          <Paperclip className="h-3.5 w-3.5 text-[#C9B9A6]" />
          <span>Click to attach files or screenshots</span>
        </button>
      )}

      {displayedError && (
        <div className="text-[11px] font-mono text-red-400 flex items-center gap-1.5">
          <AlertCircle className="h-3.5 w-3.5 shrink-0" />
          <span>{displayedError}</span>
        </div>
      )}

      {files.length > 0 && (
        <div className="space-y-1.5">
          {files.map((file, idx) => {
            const isImage = file.type.startsWith('image/');
            return (
              <div
                key={`${file.name}-${idx}`}
                className="flex items-center justify-between p-2 rounded-md bg-[#16161C]/90 border border-white/10 text-xs font-mono text-[#F5F5F7]"
              >
                <div className="flex items-center gap-2 min-w-0">
                  {isImage ? (
                    <ImageIcon className="h-4 w-4 text-[#C9B9A6] shrink-0" />
                  ) : (
                    <FileText className="h-4 w-4 text-[#C9B9A6] shrink-0" />
                  )}
                  <span className="truncate text-[12px]">{file.name}</span>
                  <span className="text-[10px] text-[#70707C] shrink-0">
                    ({formatFileSize(file.size)})
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => removeFile(idx)}
                  className="p-1 text-[#70707C] hover:text-red-400 hover:bg-white/5 rounded transition-colors cursor-pointer ml-2"
                  title="Remove file"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
