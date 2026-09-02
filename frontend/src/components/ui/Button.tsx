import React, { ButtonHTMLAttributes, forwardRef } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { Loader2 } from 'lucide-react';
import { cn } from '../../lib/utils';

export const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-lg text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C9B9A6] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0A0A0C] disabled:pointer-events-none disabled:opacity-40 active:scale-[0.98] cursor-pointer',
  {
    variants: {
      variant: {
        default: 'bg-[#C9B9A6] text-[#0A0A0C] font-mono text-xs uppercase tracking-[0.12em] font-bold hover:bg-[#DFD5C6] shadow-[0_4px_20px_rgba(201,185,166,0.25)] transition-all duration-300',
        destructive: 'bg-red-950/50 text-red-300 border border-red-800/40 hover:bg-red-900/40 shadow-xs',
        outline: 'border border-[#C9B9A6]/30 bg-[#C9B9A6]/[0.04] text-[#F5F5F7] font-mono text-xs uppercase tracking-[0.12em] hover:border-[#C9B9A6] hover:bg-[#C9B9A6]/15 hover:text-[#DFD5C6] backdrop-blur-md shadow-[0_8px_20px_rgba(0,0,0,0.5)] transition-all duration-300',
        secondary: 'bg-[#16161B] text-[#DFD5C6] border border-[#C9B9A6]/20 hover:border-[#C9B9A6]/50 hover:bg-[#1D1D24] shadow-xs',
        ghost: 'text-[#9E9EA8] hover:text-[#F5F5F7] hover:bg-white/[0.05]',
        link: 'text-[#C9B9A6] underline-offset-4 hover:underline font-semibold',
        gradient: 'bg-gradient-to-r from-[#DFD5C6] via-[#C9B9A6] to-[#B3A18C] text-[#0A0A0C] font-mono text-xs uppercase tracking-[0.12em] font-black shadow-[0_8px_25px_rgba(201,185,166,0.3)]',
      },
      size: {
        default: 'h-10 px-5 py-2',
        sm: 'h-8 rounded-md px-3 text-xs',
        lg: 'h-12 rounded-lg px-8 text-sm',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  isLoading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, isLoading, disabled, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(buttonVariants({ variant, size, className }))}
        {...props}
      >
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
