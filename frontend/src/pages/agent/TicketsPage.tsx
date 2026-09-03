import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuthStore } from '../../features/auth/store/authStore';
import { useTicketsQuery } from '../../features/tickets/hooks/useTickets';
import { useAgentsQuery } from '../../features/agents/hooks/useAgents';
import {
  Search,
  RefreshCw,
  Plus,
  X,
} from 'lucide-react';
import { Select } from '../../components/ui/Select';
import { Button } from '../../components/ui/Button';
import { EmptyState } from '../../components/common/EmptyState';
import { ErrorState } from '../../components/common/ErrorState';
import { TableLoadingSkeleton } from '../../components/common/LoadingSkeleton';
import { Pagination } from '../../components/common/Pagination';
import { TicketCard } from '../../features/tickets/components/TicketCard';
import { CreateTicketModal } from '../../features/tickets/components/CreateTicketModal';

export function TicketsPage() {
  const { user } = useAuthStore();
  const [searchParams, setSearchParams] = useSearchParams();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Search & Filter State from URL
  const page = Number(searchParams.get('page')) || 1;
  const search = searchParams.get('search') || '';
  const status = searchParams.get('status') || '';
  const priority = searchParams.get('priority') || '';
  const assignee = searchParams.get('assignee') || '';

  const [searchInput, setSearchInput] = useState(search);

  // Debounced search sync to URL
  useEffect(() => {
    const handler = setTimeout(() => {
      if (searchInput !== search) {
        const nextParams = new URLSearchParams(searchParams);
        if (searchInput) {
          nextParams.set('search', searchInput);
        } else {
          nextParams.delete('search');
        }
        nextParams.set('page', '1');
        setSearchParams(nextParams);
      }
    }, 350);

    return () => clearTimeout(handler);
  }, [searchInput, search, searchParams, setSearchParams]);

  // Fetch agents list for Admin filter
  const { data: agents } = useAgentsQuery(user?.role === 'ADMIN');

  // Fetch tickets with server-side filters and pagination
  const { data, isLoading, isFetching, isError, error, refetch } = useTicketsQuery({
    page,
    limit: 10,
    search: search || undefined,
    status: (status as any) || undefined,
    priority: (priority as any) || undefined,
    assignee: assignee || undefined,
  });

  const handleFilterChange = (key: string, val: string) => {
    const nextParams = new URLSearchParams(searchParams);
    if (val) {
      nextParams.set(key, val);
    } else {
      nextParams.delete(key);
    }
    nextParams.set('page', '1');
    setSearchParams(nextParams);
  };

  const handlePageChange = (newPage: number) => {
    const nextParams = new URLSearchParams(searchParams);
    nextParams.set('page', String(newPage));
    setSearchParams(nextParams);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleClearFilters = () => {
    setSearchInput('');
    setSearchParams(new URLSearchParams());
  };

  const hasActiveFilters = !!(search || status || priority || assignee);

  const stats = data?.stats;

  const tabs = [
    { id: '', label: 'All tickets', count: stats?.total },
    { id: 'OPEN', label: 'Open', count: stats?.open },
    { id: 'IN_PROGRESS', label: 'In progress', count: stats?.inProgress },
    { id: 'RESOLVED', label: 'Resolved', count: stats?.resolved },
  ];

  return (
    <div className="space-y-6 pb-16 text-[#F5F5F7]">
      {/* Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="font-serif text-2xl sm:text-4xl font-normal tracking-tight text-[#F5F5F7]">
              {user?.role === 'ADMIN' ? 'All support ' : 'Assigned '}
              <span className="text-[#C9B9A6] italic font-serif">tickets</span>
            </h1>
            <span className="font-mono text-xs font-bold px-2.5 py-0.5 bg-[#C9B9A6]/15 text-[#DFD5C6] border border-[#C9B9A6]/30">
              {data?.pagination.total ?? 0}
            </span>
          </div>
          <p className="text-xs text-[#9E9EA8] mt-1 font-sans">
            Sovereign ticket queue and live dispatch telemetry.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isLoading || isFetching}
            className="text-xs font-mono uppercase tracking-wider h-10 border-[#C9B9A6]/30 text-[#DFD5C6] hover:border-[#C9B9A6]"
          >
            <RefreshCw className={`mr-2 h-3.5 w-3.5 text-[#C9B9A6] ${isFetching ? 'animate-spin' : ''}`} />
            Refresh
          </Button>

          <button
            type="button"
            onClick={() => setIsCreateModalOpen(true)}
            className="border border-[#C9B9A6] bg-[#C9B9A6] hover:bg-[#DFD5C6] text-[#0A0A0C] font-mono text-xs uppercase tracking-[0.14em] font-bold px-6 py-2.5 transition-all flex items-center gap-2 shadow-[0_4px_20px_rgba(201,185,166,0.3)] active:scale-95 cursor-pointer"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>{user?.role === 'ADMIN' ? 'Create & Assign Task' : 'New ticket'}</span>
          </button>
        </div>
      </div>

      {/* Black & Dark Beige Filter & Search Bar with Glass Drop */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 p-2 glass-drop-panel">
        {/* Search Input */}
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#C9B9A6]" />
          <input
            type="text"
            placeholder="Search tickets by ID, subject, customer..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="w-full pl-9 pr-9 py-2 text-xs bg-transparent border-0 focus:outline-none placeholder:text-[#6E6E78] text-[#F5F5F7] font-sans"
          />
          {searchInput && (
            <button
              type="button"
              onClick={() => setSearchInput('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9E9EA8] hover:text-[#F5F5F7] p-1"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Filter Controls Row */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full lg:w-auto">
          {/* Status Tabs */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0 scrollbar-none shrink-0 border-t sm:border-t-0 pt-2 sm:pt-0 border-white/10 font-mono text-xs uppercase">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => handleFilterChange('status', tab.id)}
                className={`px-3 py-1.5 text-xs font-mono uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer ${
                  status === tab.id
                    ? 'text-[#0A0A0C] bg-[#C9B9A6] font-bold shadow-[0_2px_12px_rgba(201,185,166,0.3)]'
                    : 'text-[#9E9EA8] hover:text-[#DFD5C6] hover:bg-white/[0.04]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {/* Priority Dropdown */}
            <div className="flex-1 sm:w-28 shrink-0">
              <Select
                value={priority}
                onChange={(e) => handleFilterChange('priority', e.target.value)}
                options={[
                  { value: '', label: 'Priority' },
                  { value: 'LOW', label: 'Low' },
                  { value: 'MEDIUM', label: 'Medium' },
                  { value: 'HIGH', label: 'High' },
                  { value: 'URGENT', label: 'Urgent' },
                ]}
              />
            </div>

            {/* Admin Assignee Dropdown */}
            {user?.role === 'ADMIN' && (
              <div className="flex-1 sm:w-36 shrink-0">
                <Select
                  value={assignee}
                  onChange={(e) => handleFilterChange('assignee', e.target.value)}
                >
                  <option value="">All Staff</option>
                  <option value="unassigned">⚠️ Unassigned</option>
                  {agents?.map((ag) => (
                    <option key={ag.id} value={ag.id}>
                      {ag.name.split(' ')[0]} ({ag.role === 'ADMIN' ? '👑 Admin' : '🛡️ Agent'})
                    </option>
                  ))}
                </Select>
              </div>
            )}

            {hasActiveFilters && (
              <button
                type="button"
                onClick={handleClearFilters}
                className="font-mono text-xs text-red-400 hover:text-red-300 px-3 py-1.5 font-bold whitespace-nowrap transition-colors cursor-pointer"
              >
                Reset
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Linear Card Ticket List */}
      <div className="space-y-3">
        {isLoading && <TableLoadingSkeleton rows={6} />}

        {isError && (
          <ErrorState
            title="Unable to fetch tickets"
            message={(error as any)?.message}
            onRetry={() => refetch()}
          />
        )}

        {!isLoading && !isError && data?.tickets.length === 0 && (
          <div className="p-12 glass-drop-panel text-center shadow-lg">
            <EmptyState
              title={hasActiveFilters ? 'No matching tickets found' : 'No tickets in your queue'}
              description={
                hasActiveFilters
                  ? 'Try adjusting your search query or reset active filters.'
                  : 'All tickets have been addressed.'
              }
              actionLabel={hasActiveFilters ? 'Reset Filters' : undefined}
              onAction={hasActiveFilters ? handleClearFilters : undefined}
            />
          </div>
        )}

        {!isLoading && !isError && data && data.tickets.map((ticket, index) => {
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

      {/* Pagination */}
      {!isLoading && !isError && data && (
        <Pagination
          currentPage={data.pagination.page}
          totalPages={data.pagination.totalPages}
          totalItems={data.pagination.total}
          limit={data.pagination.limit}
          onPageChange={handlePageChange}
          isLoading={isFetching}
        />
      )}

      <CreateTicketModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />
    </div>
  );
}
