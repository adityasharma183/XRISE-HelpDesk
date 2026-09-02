import React from 'react';
import { MetricStatCard } from './MetricStatCard';
import { TeamPulseCard } from './TeamPulseCard';
import { TicketStats } from '../../tickets/types/ticket.types';

interface DashboardMetricsGridProps {
  stats: TicketStats;
}

export function DashboardMetricsGrid({ stats }: DashboardMetricsGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. Open tickets */}
      <MetricStatCard
        title="Open tickets"
        count={stats.open}
        changeText="8.2% vs. last week"
        changeType="positive"
      />

      {/* 2. In progress */}
      <MetricStatCard
        title="In progress"
        count={stats.inProgress}
        changeText="2.1% vs. last week"
        changeType="negative"
      />

      {/* 3. Avg. first response */}
      <MetricStatCard
        title="Avg. first response"
        count="1h 42m"
        changeText="14.6% vs. last week"
        changeType="positive"
      />

      {/* 4. Team pulse */}
      <TeamPulseCard score={92} />
    </div>
  );
}
