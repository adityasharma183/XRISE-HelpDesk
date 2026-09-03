import React, { useEffect, useState } from 'react';
import { Check, Clock, Sparkles, CheckCircle2, ShieldAlert } from 'lucide-react';
import { TicketStatus } from '../types/ticket.types';

interface TicketProgressTrackerProps {
  status: TicketStatus;
  className?: string;
}

interface StepInfo {
  key: string;
  label: string;
  description: string;
}

const STAGES: StepInfo[] = [
  {
    key: 'submitted',
    label: 'Submitted',
    description: 'Received & Logged',
  },
  {
    key: 'open',
    label: 'Open',
    description: 'In Triage Queue',
  },
  {
    key: 'in_progress',
    label: 'In Progress',
    description: 'Under Investigation',
  },
  {
    key: 'resolved',
    label: 'Resolved',
    description: 'Resolution Verified',
  },
];

/**
 * Maps existing database TicketStatus values to lifecycle step index:
 * - 0: Submitted (Entry state)
 * - 1: OPEN (Queued for agent review)
 * - 2: IN_PROGRESS (Agent actively diagnosing)
 * - 3: RESOLVED / CLOSED (Issue solved / ticket archived)
 */
function getActiveStepIndex(status: TicketStatus): number {
  switch (status) {
    case 'OPEN':
      return 1;
    case 'IN_PROGRESS':
      return 2;
    case 'RESOLVED':
    case 'CLOSED':
      return 3;
    default:
      return 1;
  }
}

export function TicketProgressTracker({ status, className = '' }: TicketProgressTrackerProps) {
  const activeIndex = getActiveStepIndex(status);
  const [animatedIndex, setAnimatedIndex] = useState(0);

  // Subtle load animation for the progress bar
  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedIndex(activeIndex);
    }, 150);
    return () => clearTimeout(timer);
  }, [activeIndex]);

  const progressPercent = (animatedIndex / (STAGES.length - 1)) * 100;

  return (
    <div
      className={`p-5 sm:p-6 rounded-xl bg-[#111115]/90 border border-[#C9B9A6]/20 backdrop-blur-md shadow-[0_12px_32px_rgba(0,0,0,0.5),inset_0_1px_1px_rgba(255,255,255,0.06)] space-y-6 ${className}`}
      aria-label="Ticket lifecycle progress"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-white/[0.06]">
        <div className="flex items-center gap-2">
          <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#C9B9A6] flex items-center gap-1.5">
            <Clock className="h-3 w-3 text-[#C9B9A6]" />
            Lifecycle Stage
          </span>
        </div>
        <div className="font-mono text-xs text-[#9E9EA8] flex items-center gap-2">
          <span>Status:</span>
          <span className="font-bold text-[#F5F5F7] uppercase tracking-wider">
            {status === 'CLOSED' ? 'Closed (Archived)' : status.replace('_', ' ')}
          </span>
          <span className="text-[#C9B9A6]">•</span>
          <span className="text-[#C9B9A6] font-semibold">{Math.round(progressPercent)}% Complete</span>
        </div>
      </div>

      {/* Progress Bar & Nodes */}
      <div className="relative pt-2 pb-1">
        {/* Connecting Progress Track Line */}
        <div
          className="absolute top-[22px] left-[6%] right-[6%] h-[3px] bg-white/[0.08] rounded-full -translate-y-1/2 z-0"
          aria-hidden="true"
        >
          <div
            className="h-full bg-gradient-to-r from-[#C9B9A6] via-[#DFD5C6] to-[#C9B9A6] rounded-full transition-all duration-700 ease-out shadow-[0_0_12px_rgba(201,185,166,0.5)]"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Steps Grid */}
        <div className="relative z-10 grid grid-cols-4 gap-1 sm:gap-2 text-center">
          {STAGES.map((stage, idx) => {
            const isCompleted = idx < activeIndex || (idx === activeIndex && (status === 'RESOLVED' || status === 'CLOSED'));
            const isCurrent = idx === activeIndex && status !== 'RESOLVED' && status !== 'CLOSED';
            const isUpcoming = idx > activeIndex;

            return (
              <div
                key={stage.key}
                className="flex flex-col items-center group"
              >
                {/* Node Circle */}
                <div
                  className={`h-8 w-8 sm:h-9 sm:w-9 rounded-full flex items-center justify-center font-mono text-xs transition-all duration-300 ${
                    isCompleted
                      ? 'bg-[#C9B9A6] text-[#0A0A0C] border-2 border-[#C9B9A6] shadow-[0_0_16px_rgba(201,185,166,0.35)]'
                      : isCurrent
                      ? 'bg-[#111114] text-[#DFD5C6] border-2 border-[#C9B9A6] ring-4 ring-[#C9B9A6]/25 shadow-[0_0_20px_rgba(201,185,166,0.45)] scale-105'
                      : 'bg-[#16161B] text-[#5A5A66] border-2 border-white/10'
                  }`}
                >
                  {isCompleted ? (
                    <Check className="h-4 w-4 stroke-[2.5]" />
                  ) : isCurrent ? (
                    <div className="h-2.5 w-2.5 rounded-full bg-[#C9B9A6] animate-pulse" />
                  ) : (
                    <span className="text-[11px] font-bold text-[#5A5A66]">{idx + 1}</span>
                  )}
                </div>

                {/* Text Labels */}
                <div className="mt-2.5 space-y-0.5 max-w-[90px] sm:max-w-none">
                  <div
                    className={`font-sans text-xs sm:text-sm font-semibold transition-colors ${
                      isCompleted
                        ? 'text-[#DFD5C6]'
                        : isCurrent
                        ? 'text-[#F5F5F7] font-bold'
                        : 'text-[#5A5A66]'
                    }`}
                  >
                    {stage.label}
                  </div>
                  <div
                    className={`font-mono text-[9px] sm:text-[10px] uppercase tracking-wider hidden xs:block transition-colors ${
                      isCurrent
                        ? 'text-[#C9B9A6] font-medium'
                        : isCompleted
                        ? 'text-[#9E9EA8]'
                        : 'text-[#444450]'
                    }`}
                  >
                    {stage.description}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
