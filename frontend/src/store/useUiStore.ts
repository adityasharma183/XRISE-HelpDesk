import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface UiState {
  sidebarOpen: boolean;
  activeTicketView: 'table' | 'cards';
  replyDrafts: Record<string, string>; // ticketId -> auto-saved reply draft
  isCreateTicketModalOpen: boolean;

  // Actions
  toggleSidebar: () => void;
  setSidebarOpen: (isOpen: boolean) => void;
  setActiveTicketView: (view: 'table' | 'cards') => void;
  setReplyDraft: (ticketId: string, text: string) => void;
  clearReplyDraft: (ticketId: string) => void;
  setCreateTicketModalOpen: (open: boolean) => void;
}

export const useUiStore = create<UiState>()(
  persist(
    (set) => ({
      sidebarOpen: false,
      activeTicketView: 'cards',
      replyDrafts: {},
      isCreateTicketModalOpen: false,

      toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
      setSidebarOpen: (isOpen) => set({ sidebarOpen: isOpen }),
      setActiveTicketView: (view) => set({ activeTicketView: view }),
      setReplyDraft: (ticketId, text) =>
        set((state) => ({
          replyDrafts: { ...state.replyDrafts, [ticketId]: text },
        })),
      clearReplyDraft: (ticketId) =>
        set((state) => {
          const nextDrafts = { ...state.replyDrafts };
          delete nextDrafts[ticketId];
          return { replyDrafts: nextDrafts };
        }),
      setCreateTicketModalOpen: (open) => set({ isCreateTicketModalOpen: open }),
    }),
    {
      name: 'xr_ui_preferences',
      partialize: (state) => ({
        activeTicketView: state.activeTicketView,
        replyDrafts: state.replyDrafts,
      }),
    }
  )
);
