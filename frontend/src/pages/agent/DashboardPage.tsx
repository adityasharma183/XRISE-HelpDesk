import React, { useState } from 'react';
import { useAuthStore } from '../../features/auth/store/authStore';
import { useTicketsQuery } from '../../features/tickets/hooks/useTickets';
import { Plus, Search } from 'lucide-react';
import { DashboardHeader, DashboardMetricsGrid, useDashboardSocket } from '../../features/dashboard';
import { TicketCard } from '../../features/tickets/components/TicketCard';
import { TableLoadingSkeleton } from '../../components/common/LoadingSkeleton';
import { EmptyState } from '../../components/common/EmptyState';
import { ErrorState } from '../../components/common/ErrorState';
import { CreateTicketModal } from '../../features/tickets/components/CreateTicketModal';

export function DashboardPage() {
  const { user } = useAuthStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'ALL' | 'OPEN' | 'IN_PROGRESS' | 'RESOLVED'>('ALL');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Real-time Dashboard WebSocket synchronization
  useDashboardSocket();

  // Fetch tickets for active agent/admin
  const { data, isLoading, isError, error, refetch } = useTicketsQuery({
    limit: 10,
    status: activeTab === 'ALL' ? undefined : activeTab,
    search: searchTerm || undefined,
  });

  const tickets = data?.tickets || [];
  const stats = data?.stats || {
    total: 0,
    open: 0,
    inProgress: 0,
    resolved: 0,
    closed: 0,
  };

  const filteredTickets = tickets.filter((t) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      t.ticketId.toLowerCase().includes(term) ||
      t.subject.toLowerCase().includes(term) ||
      t.customer.name.toLowerCase().includes(term) ||
      t.customer.email.toLowerCase().includes(term)
    );
  });

  return (
    <div className="space-y-8 pb-12 text-[#F5F5F7]">
      {/* 1. Header Greeting */}
      <DashboardHeader userName={user?.name} />

      {/* 2. Top Metric KPI Grid (2x2 Grid) */}
      <DashboardMetricsGrid stats={stats} />

      {/* 3. Section Header: All tickets & New Ticket Button */}
      <div className="space-y-5 pt-2 text-[#F5F5F7]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h2 className="font-serif text-xl sm:text-2xl font-normal text-[#F5F5F7]">
                All tickets
              </h2>
              <span className="font-mono text-xs font-bold px-2.5 py-0.5 bg-[#C9B9A6]/15 text-[#DFD5C6] border border-[#C9B9A6]/30">
                {stats.total}
              </span>
            </div>
            <p className="text-xs text-[#9E9EA8] mt-1 font-sans">
              Active tickets requiring engineering review, triage, or reply dispatch.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setIsCreateModalOpen(true)}
            className="w-full sm:w-auto border border-[#C9B9A6] bg-[#C9B9A6] hover:bg-[#DFD5C6] text-[#0A0A0C] font-mono text-xs uppercase tracking-[0.14em] font-bold px-6 py-3 transition-all flex items-center justify-center gap-2 shadow-[0_4px_20px_rgba(201,185,166,0.3)] active:scale-95 cursor-pointer"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>{user?.role === 'ADMIN' ? 'Create & Assign Task' : 'New ticket'}</span>
          </button>
        </div>

        {/* Search Input + Filter Tabs Bar (Glass Drop) */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 p-2 glass-drop-panel">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#C9B9A6]" />
            <input
              type="text"
              placeholder="Search tickets by ID, subject, customer..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs bg-transparent border-0 focus:outline-none placeholder:text-[#6E6E78] text-[#F5F5F7] font-sans"
            />
          </div>

          {/* Right Tabs */}
          <div className="flex items-center gap-1 w-full md:w-auto overflow-x-auto pb-1 md:pb-0 scrollbar-none border-t md:border-t-0 pt-2 md:pt-0 border-white/10 font-mono text-xs uppercase">
            {[
              { id: 'ALL', label: 'All tickets' },
              { id: 'OPEN', label: 'Open' },
              { id: 'IN_PROGRESS', label: 'In progress' },
              { id: 'RESOLVED', label: 'Resolved' },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-3 py-1.5 text-xs font-mono uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer ${
                  activeTab === tab.id
                    ? 'text-[#0A0A0C] bg-[#C9B9A6] font-bold shadow-[0_2px_12px_rgba(201,185,166,0.3)]'
                    : 'text-[#9E9EA8] hover:text-[#DFD5C6] hover:bg-white/[0.04]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* 4. Ticket Cards List */}
        <div className="space-y-3">
          {isLoading && <TableLoadingSkeleton rows={4} />}

          {isError && (
            <ErrorState
              title="Failed to load tickets"
              message={(error as any)?.message}
              onRetry={() => refetch()}
            />
          )}

          {!isLoading && !isError && filteredTickets.length === 0 && (
            <div className="p-12 glass-drop-panel text-center shadow-lg">
              <EmptyState
                title="No tickets found"
                description={
                  searchTerm
                    ? `No tickets match "${searchTerm}"`
                    : 'All tickets in this category have been addressed.'
                }
              />
            </div>
          )}

          {!isLoading && !isError && filteredTickets.map((ticket, index) => {
            const categoryTag = index % 3 === 0 ? 'Billing' : index % 3 === 1 ? 'Technical' : 'Account';
            return (
              <TicketCard
                key={ticket.id}
                ticket={ticket}
                categoryName={categoryTag}
              />
            );
          })}
        </div>
      </div>

      <CreateTicketModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />
    </div>
  );
}
