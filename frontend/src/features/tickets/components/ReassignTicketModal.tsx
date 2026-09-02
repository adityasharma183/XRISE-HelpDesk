import React, { useState } from 'react';
import { UserCheck } from 'lucide-react';
import { User } from '../../auth/types/auth.types';

interface ReassignTicketModalProps {
  agents: User[];
  currentAssigneeId?: string | null;
  onReassign: (assigneeId: string) => Promise<void>;
  isLoading?: boolean;
}

export function ReassignTicketModal({
  agents,
  currentAssigneeId,
  onReassign,
  isLoading = false,
}: ReassignTicketModalProps) {
  const [selectedAgentId, setSelectedAgentId] = useState(currentAssigneeId || '');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAgentId) return;
    await onReassign(selectedAgentId);
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 rounded-xl border border-gray-200 bg-white space-y-3">
      <div className="flex items-center gap-1.5 text-xs font-bold text-gray-900">
        <UserCheck className="h-4 w-4 text-blue-600" />
        <span>Reassign Ticket (Admin Only)</span>
      </div>

      <div className="flex items-center gap-2">
        <select
          value={selectedAgentId}
          onChange={(e) => setSelectedAgentId(e.target.value)}
          className="flex-1 text-xs bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-1 focus:ring-black"
        >
          <option value="" disabled>Select support agent</option>
          {agents.map((agent) => (
            <option key={agent.id} value={agent.id}>
              {agent.name} ({agent.email})
            </option>
          ))}
        </select>

        <button
          type="submit"
          disabled={isLoading || !selectedAgentId || selectedAgentId === currentAssigneeId}
          className="bg-[#111827] hover:bg-black text-white text-xs font-semibold px-3 py-2 rounded-lg transition-colors disabled:opacity-50"
        >
          {isLoading ? 'Updating...' : 'Assign'}
        </button>
      </div>
    </form>
  );
}
