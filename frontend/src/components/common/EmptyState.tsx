import React from 'react';
import { Inbox } from 'lucide-react';
import { Button } from '../ui/Button';

export interface EmptyStateProps {
  title?: string;
  description?: string;
  icon?: React.ComponentType<{ className?: string }>;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export function EmptyState({
  title = 'No records found',
  description = 'There are currently no items matching your criteria.',
  icon: Icon = Inbox,
  actionLabel,
  onAction,
  className = '',
}: EmptyStateProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center border border-dashed border-[#C9B9A6]/20 bg-[#16161B]/40 p-12 text-center text-[#F5F5F7] backdrop-blur-md ${className}`}
    >
      <div className="flex h-14 w-14 items-center justify-center bg-[#C9B9A6]/15 text-[#DFD5C6] border border-[#C9B9A6]/30 mb-4 shadow-sm">
        <Icon className="h-7 w-7" />
      </div>
      <h3 className="font-serif text-lg font-normal text-[#F5F5F7]">{title}</h3>
      <p className="mt-1 text-xs text-[#9E9EA8] max-w-sm font-sans">{description}</p>
      {actionLabel && onAction && (
        <Button onClick={onAction} variant="outline" size="sm" className="mt-5 font-mono text-xs uppercase">
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
