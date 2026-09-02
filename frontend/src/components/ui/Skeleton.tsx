import React, { HTMLAttributes } from 'react';
import { cn } from '../../lib/utils';

export function Skeleton({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('animate-pulse bg-white/[0.06] border border-white/[0.04]', className)}
      {...props}
    />
  );
}

