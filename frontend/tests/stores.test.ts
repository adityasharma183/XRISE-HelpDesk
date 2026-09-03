import { describe, it, expect, beforeEach } from 'vitest';
import { useAuthStore } from '../src/features/auth/store/authStore';
import { useUiStore } from '../src/store/useUiStore';

describe('Zustand Stores', () => {
  beforeEach(() => {
    // Reset stores
    useAuthStore.setState({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
    });

    useUiStore.setState({
      sidebarOpen: false,
      activeTicketView: 'cards',
      replyDrafts: {},
      isCreateTicketModalOpen: false,
    });
  });

  describe('useAuthStore', () => {
    it('initializes with unauthenticated state', () => {
      const state = useAuthStore.getState();
      expect(state.user).toBeNull();
      expect(state.token).toBeNull();
      expect(state.isAuthenticated).toBe(false);
    });

    it('sets user and updates isAuthenticated', () => {
      const testUser = {
        id: 'agent-123',
        name: 'Alex Rivera',
        email: 'alex@example.com',
        role: 'AGENT' as const,
        isActive: true,
        createdAt: new Date().toISOString(),
      };

      useAuthStore.getState().setUser(testUser);


      const state = useAuthStore.getState();
      expect(state.user).toEqual(testUser);
      expect(state.isAuthenticated).toBe(true);
    });

    it('clears error correctly', () => {
      useAuthStore.setState({ error: 'Invalid credentials' });
      expect(useAuthStore.getState().error).toBe('Invalid credentials');

      useAuthStore.getState().clearError();
      expect(useAuthStore.getState().error).toBeNull();
    });
  });

  describe('useUiStore', () => {
    it('manages sidebar toggle state', () => {
      expect(useUiStore.getState().sidebarOpen).toBe(false);

      useUiStore.getState().toggleSidebar();
      expect(useUiStore.getState().sidebarOpen).toBe(true);

      useUiStore.getState().setSidebarOpen(false);
      expect(useUiStore.getState().sidebarOpen).toBe(false);
    });

    it('manages active ticket view preference', () => {
      expect(useUiStore.getState().activeTicketView).toBe('cards');

      useUiStore.getState().setActiveTicketView('table');
      expect(useUiStore.getState().activeTicketView).toBe('table');
    });

    it('manages auto-saved reply drafts by ticketId', () => {
      useUiStore.getState().setReplyDraft('ticket-101', 'Working on your issue now.');
      expect(useUiStore.getState().replyDrafts['ticket-101']).toBe('Working on your issue now.');

      useUiStore.getState().clearReplyDraft('ticket-101');
      expect(useUiStore.getState().replyDrafts['ticket-101']).toBeUndefined();
    });

    it('manages create ticket modal state', () => {
      expect(useUiStore.getState().isCreateTicketModalOpen).toBe(false);

      useUiStore.getState().setCreateTicketModalOpen(true);
      expect(useUiStore.getState().isCreateTicketModalOpen).toBe(true);
    });
  });
});
