import React, { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuthStore } from '../../features/auth/store/authStore';
import { useUiStore } from '../../store/useUiStore';
import { TicketStatus } from '../../features/tickets/types/ticket.types';
import { addReplySchema, AddReplyFormData } from '../../features/tickets/schemas/ticket.schemas';
import {
  useTicketDetailQuery,
  useTicketTimelineQuery,
  useAddReplyMutation,
  useUpdateTicketStatusMutation,
  useReassignTicketMutation,
  useAiDraftMutation,
} from '../../features/tickets/hooks/useTickets';
import { useAgentsQuery } from '../../features/agents/hooks/useAgents';
import { AiAssistantPanel } from '../../features/tickets';
import {
  Send,
  Sparkles,
  ArrowLeft,
} from 'lucide-react';
import { Textarea } from '../../components/ui/Textarea';
import { Select } from '../../components/ui/Select';
import { TicketDetailSkeleton } from '../../components/common/LoadingSkeleton';
import { ErrorState } from '../../components/common/ErrorState';
import { formatDate } from '../../lib/utils';
import { AttachmentList } from '../../components/ui/AttachmentList';
import { FileUploadInput } from '../../components/ui/FileUploadInput';

export function TicketDetailPage() {
  const { ticketId } = useParams<{ ticketId: string }>();
  const { user } = useAuthStore();
  const { replyDrafts, setReplyDraft, clearReplyDraft } = useUiStore();

  // 1. Query Ticket Details
  const {
    data: ticket,
    isLoading: isTicketLoading,
    isError: isTicketError,
    error: ticketError,
    refetch: refetchTicket,
  } = useTicketDetailQuery(ticketId);

  // 2. Query Ticket Timeline & Messages
  const {
    data: timeline,
    isLoading: isTimelineLoading,
    refetch: refetchTimeline,
  } = useTicketTimelineQuery(ticketId);

  // 3. Query Agents List (Admin only for reassignment)
  const { data: agents } = useAgentsQuery(user?.role === 'ADMIN');

  // 4. Reply Form setup
  const savedDraft = ticketId ? replyDrafts[ticketId] || '' : '';
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<AddReplyFormData>({
    resolver: zodResolver(addReplySchema),
    defaultValues: {
      body: savedDraft,
    },
  });

  const replyBodyValue = watch('body');

  // Auto-sync draft to Zustand UI store
  useEffect(() => {
    if (ticketId && replyBodyValue !== undefined) {
      if (replyBodyValue.trim()) {
        setReplyDraft(ticketId, replyBodyValue);
      } else {
        clearReplyDraft(ticketId);
      }
    }
  }, [ticketId, replyBodyValue, setReplyDraft, clearReplyDraft]);

  const [replyFiles, setReplyFiles] = React.useState<File[]>([]);

  // Mutations
  const replyMutation = useAddReplyMutation(ticketId || '', {
    onSuccess: () => {
      reset({ body: '' });
      setReplyFiles([]);
      if (ticketId) clearReplyDraft(ticketId);
    },
  });

  const statusMutation = useUpdateTicketStatusMutation(ticketId || '');
  const reassignMutation = useReassignTicketMutation(ticketId || '');

  const aiDraftMutation = useAiDraftMutation(ticketId || '', {
    onSuccess: (res) => {
      setValue('body', res.draft, { shouldValidate: true });
    },
  });

  const onReplySubmit = (data: AddReplyFormData) => {
    replyMutation.mutate({ body: data.body, files: replyFiles });
  };

  const handleApplyDraft = (draftText: string) => {
    setValue('body', draftText, { shouldValidate: true });
    const composerEl = document.getElementById('ticket-reply-composer');
    if (composerEl) {
      composerEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
      composerEl.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault();
      handleSubmit(onReplySubmit)();
    }
  };

  const isAiGenerating = aiDraftMutation.isPending;

  if (isTicketLoading) {
    return (
      <div className="space-y-6">
        <TicketDetailSkeleton />
      </div>
    );
  }

  if (isTicketError || !ticket) {
    return (
      <div className="space-y-6">
        <ErrorState
          title="Unable to load ticket details"
          message={(ticketError as any)?.message || 'This ticket could not be found or you do not have permission.'}
          onRetry={() => {
            refetchTicket();
            refetchTimeline();
          }}
        />
      </div>
    );
  }

  const customerInitials = ticket.customer.name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const getStatusMeta = (st: string) => {
    switch (st) {
      case 'OPEN':
        return { label: 'Open', dot: 'bg-red-400', text: 'text-red-400' };
      case 'IN_PROGRESS':
        return { label: 'In progress', dot: 'bg-[#C9B9A6]', text: 'text-[#DFD5C6]' };
      case 'RESOLVED':
        return { label: 'Resolved', dot: 'bg-emerald-400', text: 'text-emerald-400' };
      case 'CLOSED':
        return { label: 'Closed', dot: 'bg-gray-400', text: 'text-gray-400' };
      default:
        return { label: 'Open', dot: 'bg-red-400', text: 'text-red-400' };
    }
  };

  const statusMeta = getStatusMeta(ticket.status);

  return (
    <div className="space-y-6 pb-16 text-[#F5F5F7]">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-[#C9B9A6]/15">
        <div className="space-y-2 min-w-0">
          <div className="flex items-center gap-2 flex-wrap font-mono text-xs">
            <Link
              to="/agent/tickets"
              className="text-[#9E9EA8] hover:text-[#DFD5C6] inline-flex items-center gap-1 mr-1 transition-colors uppercase tracking-wider"
            >
              <ArrowLeft className="h-3.5 w-3.5 text-[#C9B9A6]" /> Back
            </Link>
            <span className="font-bold text-[#DFD5C6]">
              #{ticket.ticketId}
            </span>
            <div className="flex items-center gap-1.5 ml-1">
              <span className={`h-2 w-2 rounded-full ${statusMeta.dot}`} />
              <span className={`${statusMeta.text} font-semibold`}>{statusMeta.label}</span>
            </div>
          </div>
          <h1 className="font-serif text-xl sm:text-3xl font-normal text-[#F5F5F7] tracking-tight break-words">
            {ticket.subject}
          </h1>
        </div>

        <div className="flex items-center gap-2 shrink-0 self-start sm:self-auto">
          <span className="font-mono text-[10.5px] font-bold uppercase px-3 py-1 bg-[#C9B9A6]/15 text-[#DFD5C6] border border-[#C9B9A6]/30 tracking-wider">
            {ticket.priority} PRIORITY
          </span>
        </div>
      </div>

      {/* Main 2-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT: Conversation & Messages */}
        <div className="lg:col-span-2 space-y-6">
          {/* Initial Ticket Card (Glass Drop) */}
          <div className="glass-drop-panel p-5 sm:p-7 shadow-[0_20px_50px_-10px_rgba(0,0,0,0.8)] space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs pb-4 border-b border-white/[0.08]">
              <div className="flex items-center gap-3 min-w-0">
                <div className="h-8 w-8 bg-[#C9B9A6] text-[#0A0A0C] flex items-center justify-center font-mono font-bold text-xs shrink-0 rounded-xs shadow-xs">
                  {customerInitials}
                </div>
                <div className="min-w-0 font-mono">
                  <span className="font-bold text-[#F5F5F7] truncate">{ticket.customer.name}</span>
                  <span className="text-[#9E9EA8] ml-2 text-[11px] break-all">&lt;{ticket.customer.email}&gt;</span>
                </div>
              </div>
              <span className="font-mono text-[#9E9EA8] text-xs shrink-0">{formatDate(ticket.createdAt)}</span>
            </div>
            <p className="text-sm text-[#F5F5F7] whitespace-pre-wrap leading-relaxed break-words font-sans">
              {ticket.body}
            </p>
            <AttachmentList attachments={ticket.attachments} />
          </div>

          {/* Timeline & Responses */}
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs font-mono text-[#C9B9A6] font-bold uppercase tracking-wider">
              <span>Activity &amp; Replies</span>
              <span className="text-[#7A7A85] lowercase font-normal">
                {timeline?.messages.length || 1} messages
              </span>
            </div>

            {isTimelineLoading ? (
              <div className="p-4 space-y-2">
                <div className="h-16 bg-[#16161B] animate-pulse" />
              </div>
            ) : timeline && (timeline.messages.length > 1 || timeline.events.length > 0) ? (
              <div className="space-y-3 relative before:absolute before:inset-0 before:left-3 before:w-0.5 before:bg-[#C9B9A6]/20">
                {(() => {
                  const combined = [
                    ...timeline.messages.slice(1).map((m) => ({ kind: 'message' as const, data: m, date: new Date(m.createdAt) })),
                    ...timeline.events.map((e) => ({ kind: 'event' as const, data: e, date: new Date(e.createdAt) })),
                  ].sort((a, b) => a.date.getTime() - b.date.getTime());

                  return combined.map((item, idx) => {
                    if (item.kind === 'message') {
                      const msg = item.data;
                      const isAgent = msg.senderType === 'AGENT';
                      return (
                        <div key={`msg-${msg.id || idx}`} className="relative pl-7 sm:pl-8">
                          <div
                            className={`absolute left-1.5 top-4 h-3.5 w-3.5 rounded-full border-2 bg-[#0A0A0C] ${
                              isAgent ? 'border-[#C9B9A6]' : 'border-white/40'
                            }`}
                          />
                          <div
                            className={`p-5 glass-drop-card ${
                              isAgent
                                ? 'bg-[#18181F]/90 border-[#C9B9A6]/30 text-[#F5F5F7]'
                                : 'bg-[#131317]/90 border-white/10 text-[#F5F5F7]'
                            }`}
                          >
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs mb-2">
                              <span className="font-mono font-bold text-[#DFD5C6]">
                                {isAgent ? 'Support Engineer: ' : 'Customer: '} {msg.senderName}
                              </span>
                              <span className="font-mono text-[#9E9EA8] text-[11px]">{formatDate(msg.createdAt)}</span>
                            </div>
                            <p className="text-sm text-[#F5F5F7] whitespace-pre-wrap leading-relaxed break-words font-sans">
                              {msg.body}
                            </p>
                            <AttachmentList attachments={msg.attachments} />
                          </div>
                        </div>
                      );
                    } else {
                      const ev = item.data;
                      return (
                        <div key={`ev-${ev.id || idx}`} className="relative pl-7 sm:pl-8 py-1">
                          <div className="absolute left-2 top-3 h-2 w-2 rounded-full bg-[#7A7A85]" />
                          <div className="font-mono text-xs text-[#9E9EA8] bg-[#16161B]/80 px-3.5 py-1.5 inline-flex items-center gap-2 border border-[#C9B9A6]/20 flex-wrap backdrop-blur-md">
                            <span className="font-bold text-[#F5F5F7]">{ev.actor.name}</span>
                            {ev.type === 'CREATED' && 'created ticket'}
                            {ev.type === 'ASSIGNED' && `assigned ticket to ${ev.metadata?.assigneeName || 'agent'}`}
                            {ev.type === 'REASSIGNED' && `reassigned ticket to ${ev.metadata?.newAssigneeName || 'agent'}`}
                            {ev.type === 'REPLIED' && 'sent reply'}
                            {ev.type === 'STATUS_CHANGED' && `changed status to ${ev.metadata?.newStatus}`}
                            <span className="text-[10px] text-[#7A7A85]">• {formatDate(ev.createdAt)}</span>
                          </div>
                        </div>
                      );
                    }
                  });
                })()}
              </div>
            ) : null}
          </div>

          {/* AI Assistant Panel */}
          <AiAssistantPanel
            ticket={ticket}
            onApplyDraft={handleApplyDraft}
          />

          {/* Reply Composer (Glass Drop) */}
          <div className="glass-drop-panel p-5 sm:p-6 space-y-4 shadow-[0_20px_50px_-10px_rgba(0,0,0,0.8)]">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="font-mono text-xs font-bold uppercase tracking-wider text-[#C9B9A6]">
                Compose Reply
              </span>
              <button
                type="button"
                onClick={() => aiDraftMutation.mutate()}
                disabled={isAiGenerating}
                className="font-mono text-xs font-semibold text-[#DFD5C6] hover:text-[#FFFFFF] inline-flex items-center gap-1.5 px-3 py-1 bg-[#C9B9A6]/15 border border-[#C9B9A6]/30 transition-colors cursor-pointer"
              >
                <Sparkles className="h-3.5 w-3.5 text-[#C9B9A6]" />
                {isAiGenerating ? 'Generating...' : '✨ Generate Reply'}
              </button>
            </div>

            <form onSubmit={handleSubmit(onReplySubmit)} className="space-y-3">
              <Textarea
                id="ticket-reply-composer"
                placeholder="Write your response to the customer..."
                rows={5}
                error={errors.body?.message}
                onKeyDown={handleKeyDown}
                {...register('body')}
              />

              <FileUploadInput
                files={replyFiles}
                onFilesChange={setReplyFiles}
              />

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pt-2">
                <span className="font-mono text-[11px] text-[#7A7A85] hidden sm:inline">
                  Press <strong>Ctrl+Enter</strong> or <strong>⌘+Enter</strong> to send
                </span>
                <button
                  type="submit"
                  disabled={!replyBodyValue?.trim() || replyMutation.isPending}
                  className="w-full sm:w-auto border border-[#C9B9A6] bg-[#C9B9A6] hover:bg-[#DFD5C6] text-[#0A0A0C] font-mono text-xs uppercase tracking-[0.14em] font-bold px-7 py-3 transition-all flex items-center justify-center gap-2 shadow-[0_4px_20px_rgba(201,185,166,0.3)] disabled:opacity-50 active:scale-95 cursor-pointer"
                >
                  <Send className="h-3.5 w-3.5" />
                  {replyMutation.isPending ? 'Sending...' : 'Send reply'}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* RIGHT: Actions & Info */}
        <div className="space-y-5">
          {/* Status Changer (Glass Drop) */}
          <div className="glass-drop-panel p-5 sm:p-6 space-y-4 shadow-xl">
            <span className="font-mono text-xs font-bold uppercase tracking-wider text-[#C9B9A6] block">
              Ticket Status
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => statusMutation.mutate('OPEN')}
                className={`px-3 py-2.5 font-mono text-xs uppercase font-bold border transition-all cursor-pointer ${
                  ticket.status === 'OPEN'
                    ? 'bg-red-950/50 border-red-800/60 text-red-300 shadow-sm'
                    : 'bg-[#16161B]/80 border-white/10 text-[#9E9EA8] hover:border-[#C9B9A6]/40 hover:text-[#F5F5F7]'
                }`}
              >
                Open
              </button>

              <button
                type="button"
                onClick={() => statusMutation.mutate('IN_PROGRESS')}
                className={`px-3 py-2.5 font-mono text-xs uppercase font-bold border transition-all cursor-pointer ${
                  ticket.status === 'IN_PROGRESS'
                    ? 'bg-[#C9B9A6]/20 border-[#C9B9A6] text-[#DFD5C6] shadow-sm'
                    : 'bg-[#16161B]/80 border-white/10 text-[#9E9EA8] hover:border-[#C9B9A6]/40 hover:text-[#F5F5F7]'
                }`}
              >
                In progress
              </button>

              <button
                type="button"
                onClick={() => statusMutation.mutate('RESOLVED')}
                className={`px-3 py-2.5 font-mono text-xs uppercase font-bold border transition-all cursor-pointer ${
                  ticket.status === 'RESOLVED'
                    ? 'bg-emerald-950/50 border-emerald-800/60 text-emerald-300 shadow-sm'
                    : 'bg-[#16161B]/80 border-white/10 text-[#9E9EA8] hover:border-[#C9B9A6]/40 hover:text-[#F5F5F7]'
                }`}
              >
                Resolved
              </button>

              <button
                type="button"
                onClick={() => statusMutation.mutate('CLOSED')}
                className={`px-3 py-2.5 font-mono text-xs uppercase font-bold border transition-all cursor-pointer ${
                  ticket.status === 'CLOSED'
                    ? 'bg-white/10 border-white/30 text-[#F5F5F7] shadow-sm'
                    : 'bg-[#16161B]/80 border-white/10 text-[#9E9EA8] hover:border-[#C9B9A6]/40 hover:text-[#F5F5F7]'
                }`}
              >
                Closed
              </button>
            </div>
          </div>

          {/* Task / Agent Assignment Card (Glass Drop) */}
          <div className="glass-drop-panel p-5 sm:p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs font-bold uppercase tracking-wider text-[#C9B9A6] block">
                Task Assignee
              </span>
              {user?.role === 'ADMIN' && (
                <span className="font-mono text-[10px] uppercase font-bold text-[#0A0A0C] bg-[#C9B9A6] px-2.5 py-0.5 border border-[#C9B9A6]">
                  Admin Control
                </span>
              )}
            </div>

            {/* Current Assignee info */}
            <div className="p-3.5 bg-[#16161B]/80 border border-[#C9B9A6]/20 flex items-center gap-3 backdrop-blur-md shadow-inner">
              {ticket.assignee ? (
                <>
                  <div className="h-9 w-9 bg-[#C9B9A6] text-[#0A0A0C] flex items-center justify-center font-mono font-bold text-xs shrink-0 rounded-xs">
                    {ticket.assignee.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="text-xs flex-1 min-w-0 font-mono">
                    <div className="font-bold text-[#F5F5F7] truncate">{ticket.assignee.name}</div>
                    <div className="text-[11px] text-[#9E9EA8] truncate">{ticket.assignee.email}</div>
                    <span className="inline-block mt-1 text-[9px] uppercase font-bold px-2 py-0.5 bg-[#C9B9A6]/15 text-[#DFD5C6] border border-[#C9B9A6]/30">
                      {ticket.assignee.role}
                    </span>
                  </div>
                </>
              ) : (
                <div className="font-mono text-xs text-amber-300 font-semibold flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-amber-400 shrink-0" />
                  <span>Unassigned (Waiting in Queue)</span>
                </div>
              )}
            </div>

            {/* Admin Controls */}
            {user?.role === 'ADMIN' ? (
              <div className="space-y-3 pt-2 border-t border-white/[0.08]">
                <label className="font-mono text-xs font-semibold text-[#9E9EA8] block">
                  Assign / Reassign Task:
                </label>
                <Select
                  value={ticket.assignee?.id || 'unassigned'}
                  disabled={reassignMutation.isPending}
                  onChange={(e) => {
                    reassignMutation.mutate(e.target.value);
                  }}
                >
                  <option value="unassigned">⚠️ Unassigned (General Queue)</option>
                  <option value="round-robin">⚡ Round-Robin Auto-Assign (Next Available Agent)</option>
                  {agents?.map((ag) => (
                    <option key={ag.id} value={ag.id}>
                      {ag.name} ({ag.role === 'ADMIN' ? '👑 Admin' : '🛡️ Agent'}) — {ag.email}
                    </option>
                  ))}
                </Select>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <button
                    type="button"
                    disabled={reassignMutation.isPending}
                    onClick={() => reassignMutation.mutate('round-robin')}
                    className="w-full font-mono text-[11px] uppercase tracking-wider font-semibold py-2.5 px-3 border border-[#C9B9A6]/40 bg-[#C9B9A6]/10 hover:bg-[#C9B9A6]/20 hover:border-[#C9B9A6] text-[#DFD5C6] transition-colors text-center flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    <span>⚡ Round-Robin</span>
                  </button>

                  {ticket.assignee?.id !== user?.id && (
                    <button
                      type="button"
                      disabled={reassignMutation.isPending}
                      onClick={() => user?.id && reassignMutation.mutate(user.id)}
                      className="w-full font-mono text-[11px] uppercase tracking-wider font-semibold py-2.5 px-3 border border-[#C9B9A6]/30 bg-[#16161B] hover:border-[#C9B9A6] hover:text-[#DFD5C6] text-[#F5F5F7] transition-colors text-center flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                      <span>Take Task (Me)</span>
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="font-mono text-[11px] text-[#9E9EA8]">
                {ticket.assignee?.id === user?.id
                  ? '✅ This task is assigned to you.'
                  : 'Assigned staff member is responsible for this ticket.'}
              </div>
            )}
          </div>

          {/* Customer Card (Glass Drop) */}
          <div className="glass-drop-panel p-5 sm:p-6 space-y-4 shadow-xl">
            <span className="font-mono text-xs font-bold uppercase tracking-wider text-[#C9B9A6] block">
              Customer Details
            </span>
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 bg-[#C9B9A6] text-[#0A0A0C] flex items-center justify-center font-mono font-bold text-xs shrink-0 rounded-xs shadow-xs">
                {customerInitials}
              </div>
              <div className="text-xs font-mono">
                <div className="font-bold text-[#F5F5F7]">{ticket.customer.name}</div>
                <div className="text-[#9E9EA8] text-[11px]">{ticket.customer.email}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
