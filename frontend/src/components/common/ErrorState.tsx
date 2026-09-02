import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '../ui/Button';

export interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  className?: string;
}

export function ErrorState({
  title = 'Something went wrong',
  message = 'An error occurred while loading this data. Please try again.',
  onRetry,
  className = '',
}: ErrorStateProps) {
  return (
    <div
      role="alert"
      className={`flex flex-col items-center justify-center border border-red-500/30 bg-red-950/40 p-12 text-center text-[#F5F5F7] backdrop-blur-md ${className}`}
    >
      <div className="flex h-14 w-14 items-center justify-center bg-red-900/40 text-red-400 border border-red-500/30 mb-4 shadow-sm">
        <AlertCircle className="h-7 w-7" />
      </div>
      <h3 className="font-serif text-lg font-normal text-[#F5F5F7]">{title}</h3>
      <p className="mt-1 text-xs text-[#9E9EA8] max-w-md font-sans">{message}</p>
      {onRetry && (
        <Button onClick={onRetry} variant="outline" size="sm" className="mt-5 border-red-500/30 text-red-300 hover:bg-red-950/50 font-mono text-xs uppercase">
          <RefreshCw className="mr-2 h-3.5 w-3.5" />
          Try Again
        </Button>
      )}
    </div>
  );
}
