import React, { TextareaHTMLAttributes, forwardRef } from 'react';
import { cn } from '../../lib/utils';

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: string;
  label?: string;
  helperText?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, error, label, helperText, id, ...props }, ref) => {
    const inputId = id || props.name;

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-[11px] font-mono uppercase tracking-[0.14em] text-[#C9B9A6]"
          >
            {label}
            {props.required && <span className="text-[#C25E1A] font-bold ml-1">*</span>}
          </label>
        )}
        <textarea
          id={inputId}
          ref={ref}
          aria-invalid={!!error}
          aria-describedby={error ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined}
          className={cn(
            'flex min-h-[100px] w-full rounded-lg border border-[#C9B9A6]/20 bg-[#111114]/90 px-3.5 py-2.5 text-sm text-[#F5F5F7] backdrop-blur-md placeholder:text-[#6E6E78] shadow-[0_4px_16px_rgba(0,0,0,0.4),inset_0_1px_1px_rgba(255,255,255,0.04)] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#C9B9A6] focus-visible:border-[#C9B9A6] disabled:cursor-not-allowed disabled:opacity-40 transition-all',
            error && 'border-red-500/80 focus-visible:ring-red-500',
            className
          )}
          {...props}
        />
        {helperText && !error && (
          <p id={`${inputId}-helper`} className="text-xs text-[#9E9EA8]">
            {helperText}
          </p>
        )}
        {error && (
          <p id={`${inputId}-error`} className="text-xs font-mono text-red-400 animate-fadeIn">
            {error}
          </p>
        )}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';
