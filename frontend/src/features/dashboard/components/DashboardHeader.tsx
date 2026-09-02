import React from 'react';

interface DashboardHeaderProps {
  userName?: string;
}

export function DashboardHeader({ userName = 'Jordan' }: DashboardHeaderProps) {
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const firstName = userName ? userName.split(' ')[0] : 'Jordan';

  return (
    <div className="space-y-2 text-[#F5F5F7]">
      <div className="inline-flex items-center gap-2 font-mono text-[10.5px] uppercase tracking-[0.2em] text-[#C9B9A6]">
        <span className="h-px w-6 bg-[#C25E1A]" />
        <span>MISSION CONTROL OVERVIEW</span>
      </div>
      <h1 className="font-serif text-2xl sm:text-4xl font-normal tracking-tight text-[#F5F5F7]">
        {getGreeting()}, <span className="text-[#C9B9A6] italic font-serif">{firstName}</span>
      </h1>
      <p className="text-xs sm:text-sm text-[#9E9EA8] font-sans">
        Sovereign dispatch telemetry, queue health, and assigned ticket operations.
      </p>
    </div>
  );
}
