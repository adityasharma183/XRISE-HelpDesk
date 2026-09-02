import React, { SelectHTMLAttributes, forwardRef } from 'react';
import { cn } from '../../lib/utils';

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  error?: string;
  label?: string;
  options?: SelectOption[];
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, error, label, options, children, id, ...props }, ref) => {
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
        <div className="relative">
          <select
            id={inputId}
            ref={ref}
            aria-invalid={!!error}
            className={cn(
              'flex h-10 w-full appearance-none rounded-lg border border-[#C9B9A6]/20 bg-[#111114]/90 px-3.5 py-2 text-sm text-[#F5F5F7] backdrop-blur-md transition-all shadow-[0_4px_16px_rgba(0,0,0,0.4),inset_0_1px_1px_rgba(255,255,255,0.04)] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#C9B9A6] focus-visible:border-[#C9B9A6] disabled:cursor-not-allowed disabled:opacity-40 cursor-pointer pr-9',
              error && 'border-red-500/80 focus-visible:ring-red-500',
              className
            )}
            {...props}
          >
            {options
              ? options.map((opt) => (
                  <option key={opt.value} value={opt.value} className="bg-[#111114] text-[#F5F5F7]">
                    {opt.label}
                  </option>
                ))
              : children}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-[#C9B9A6]">
            <svg
              className="h-4 w-4 fill-current"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
            >
              <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
            </svg>
          </div>
        </div>
        {error && (
          <p className="text-xs font-mono text-red-400 animate-fadeIn">
            {error}
          </p>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';
