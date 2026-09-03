import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { X, UserCheck, Send, Loader2, Sparkles } from 'lucide-react';
import { useAuthStore } from '../../auth/store/authStore';
import { submitTicketSchema, SubmitTicketFormData } from '../schemas/ticket.schemas';
import { useCreateInternalTicketMutation } from '../hooks/useTickets';
import { useAgentsQuery } from '../../agents/hooks/useAgents';
import { Input } from '../../../components/ui/Input';
import { Textarea } from '../../../components/ui/Textarea';
import { FileUploadInput } from '../../../components/ui/FileUploadInput';

interface CreateTicketModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CreateTicketModal({ isOpen, onClose }: CreateTicketModalProps) {
  const { user } = useAuthStore();
  const [selectedAssigneeId, setSelectedAssigneeId] = useState<string>('');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  // Fetch agents if Admin
  const { data: agents } = useAgentsQuery(isOpen && user?.role === 'ADMIN');

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<SubmitTicketFormData>({
    resolver: zodResolver(submitTicketSchema),
    defaultValues: {
      name: '',
      email: '',
      subject: '',
      body: '',
      priority: 'MEDIUM',
    },
  });

  const currentPriority = watch('priority');

  const createMutation = useCreateInternalTicketMutation({
    onSuccess: (newTicket) => {
      const assignedName = agents?.find((a) => a.id === selectedAssigneeId)?.name;
      toast.success(
        assignedName
          ? `Ticket #${newTicket.ticketId} created & assigned to ${assignedName}!`
          : `Ticket #${newTicket.ticketId} created successfully!`
      );
      reset();
      setSelectedAssigneeId('');
      setSelectedFiles([]);
      onClose();
    },
    onError: (err: any) => {
      toast.error(err.message || 'Failed to create ticket');
    },
  });

  if (!isOpen) return null;

  const priorities = [
    { value: 'LOW', label: 'Low' },
    { value: 'MEDIUM', label: 'Medium' },
    { value: 'HIGH', label: 'High' },
    { value: 'URGENT', label: 'Urgent' },
  ] as const;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-[16px] animate-in fade-in text-[#F5F5F7]">
      <div className="relative overflow-hidden rounded-lg border border-[#C9B9A6]/30 bg-[#111115]/90 max-w-lg w-full max-h-[92vh] overflow-y-auto p-6 sm:p-8 space-y-6 backdrop-blur-[24px] shadow-[0_35px_80px_-15px_rgba(0,0,0,0.95),inset_0_1px_2px_rgba(255,255,255,0.12),0_0_60px_rgba(201,185,166,0.08)]">
        {/* Ambient Glass Glow */}
        <div className="absolute -top-20 -right-20 h-48 w-48 rounded-full bg-[#C9B9A6]/10 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 h-48 w-48 rounded-full bg-[#C25E1A]/08 blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#C9B9A6]/15 relative z-10">
          <div>
            <div className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-[#C9B9A6] mb-1">
              <Sparkles className="h-3 w-3" />
              <span>Internal Dispatch Engine</span>
            </div>
            <h2 className="font-serif text-xl sm:text-2xl font-normal text-[#F5F5F7]">
              {user?.role === 'ADMIN' ? 'Create & Assign Task / Ticket' : 'Create New Ticket'}
            </h2>
            <p className="text-xs text-[#9E9EA8] mt-0.5 font-sans">
              {user?.role === 'ADMIN'
                ? 'Assign a support task or log a customer ticket directly to an agent.'
                : 'Log a new customer inquiry into the support queue.'}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-[#9E9EA8] hover:text-[#F5F5F7] rounded-md hover:bg-white/[0.05] transition-colors cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form
          onSubmit={handleSubmit((data) =>
            createMutation.mutate({
              data: {
                ...data,
                assigneeId: selectedAssigneeId || undefined,
              },
              files: selectedFiles,
            })
          )}
          className="space-y-5 relative z-10"
          noValidate
        >
          {/* Admin Agent Assignment Selector with Glass Drop */}
          {user?.role === 'ADMIN' && (
            <div className="p-4 rounded-md bg-[#16161C]/80 border border-[#C9B9A6]/25 space-y-2 backdrop-blur-md shadow-[0_8px_20px_rgba(0,0,0,0.5),inset_0_1px_1px_rgba(255,255,255,0.06)]">
              <div className="flex items-center justify-between">
                <label className="font-mono text-xs font-bold text-[#DFD5C6] flex items-center gap-1.5 uppercase tracking-wider">
                  <UserCheck className="h-4 w-4 text-[#C9B9A6]" />
                  Assign Task to Agent
                </label>
                <span className="font-mono text-[10px] uppercase font-bold text-[#0A0A0C] bg-[#C9B9A6] px-2.5 py-0.5 rounded-xs border border-[#C9B9A6]">
                  Admin Control
                </span>
              </div>
              <select
                value={selectedAssigneeId}
                onChange={(e) => setSelectedAssigneeId(e.target.value)}
                className="w-full text-xs bg-[#111114] border border-[#C9B9A6]/25 rounded-md px-3 py-2.5 text-[#F5F5F7] focus:outline-none focus:ring-1 focus:ring-[#C9B9A6] font-mono shadow-inner"
              >
                <option value="">Leave Unassigned (General Queue)</option>
                <option value="round-robin">⚡ Round-Robin Auto-Assign (Next Available Agent)</option>
                {agents?.map((agent) => (
                  <option key={agent.id} value={agent.id}>
                    {agent.name} — {agent.role === 'ADMIN' ? '👑 Administrator' : '🛡️ Support Agent'} ({agent.email})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Customer info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Customer Name"
              required
              placeholder="e.g. Maya Chen"
              error={errors.name?.message}
              {...register('name')}
            />

            <Input
              label="Customer Email"
              type="email"
              required
              placeholder="e.g. maya@example.com"
              error={errors.email?.message}
              {...register('email')}
            />
          </div>

          <Input
            label="Subject"
            required
            placeholder="e.g. SSO Setup Request or Billing Error"
            error={errors.subject?.message}
            {...register('subject')}
          />

          {/* Priority with Glass Drop Buttons */}
          <div className="space-y-1.5">
            <label className="block text-[11px] font-mono uppercase tracking-[0.14em] text-[#C9B9A6]">
              Priority
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {priorities.map((p) => {
                const isSelected = currentPriority === p.value;
                return (
                  <button
                    key={p.value}
                    type="button"
                    onClick={() => setValue('priority', p.value, { shouldValidate: true })}
                    className={`py-2.5 px-2 rounded-md border text-center font-mono text-xs uppercase font-bold transition-all duration-200 cursor-pointer backdrop-blur-md ${
                      isSelected
                        ? 'border-[#C9B9A6] bg-[#C9B9A6]/20 text-[#DFD5C6] shadow-[0_4px_16px_rgba(201,185,166,0.25),inset_0_1px_1px_rgba(255,255,255,0.2)]'
                        : 'border-white/10 bg-[#16161C]/60 text-[#9E9EA8] hover:border-[#C9B9A6]/40 shadow-sm'
                    }`}
                  >
                    {p.label}
                  </button>
                );
              })}
            </div>
          </div>

          <Textarea
            label="Task / Issue Description"
            required
            rows={4}
            placeholder="Detailed description of what needs to be solved or investigated..."
            error={errors.body?.message}
            {...register('body')}
          />

          {/* File Attachments */}
          <FileUploadInput
            files={selectedFiles}
            onFilesChange={setSelectedFiles}
          />

          {/* Footer */}
          <div className="pt-4 border-t border-white/[0.08] flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 font-mono text-xs uppercase tracking-wider text-[#9E9EA8] hover:text-[#F5F5F7] transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || createMutation.isPending}
              className="border border-[#C9B9A6] bg-gradient-to-r from-[#DFD5C6] via-[#C9B9A6] to-[#B3A18C] text-[#0A0A0C] font-mono text-xs uppercase tracking-[0.14em] font-black px-6 py-3 rounded-md transition-all duration-300 flex items-center justify-center gap-2 shadow-[0_8px_25px_rgba(201,185,166,0.35)] hover:shadow-[0_12px_35px_rgba(201,185,166,0.5)] disabled:opacity-50 active:scale-95 cursor-pointer"
            >
              {createMutation.isPending ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin text-[#0A0A0C]" />
                  <span>Creating...</span>
                </>
              ) : (
                <>
                  <Send className="h-3.5 w-3.5" />
                  <span>{user?.role === 'ADMIN' ? 'Create & Assign Task' : 'Create Ticket'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
