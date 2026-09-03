import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AiAssistantPanel } from '../src/features/tickets/components/AiAssistantPanel';
import { Ticket } from '../src/features/tickets/types/ticket.types';
import { ticketApi } from '../src/features/tickets/api/ticketApi';

vi.mock('../src/features/tickets/api/ticketApi', () => ({
  ticketApi: {
    analyzeTicket: vi.fn().mockResolvedValue({
      category: 'BILLING',
      suggestedPriority: 'HIGH',
      sentiment: 'NEGATIVE',
      reason: 'Customer reported duplicate charge and requested refund.',
    }),
    summarizeTicket: vi.fn().mockResolvedValue({
      summary: 'Customer requests a refund for a duplicate subscription charge.',
      mainProblem: 'Duplicate charge of $49',
      keyContext: 'Transaction occurred on August 30',
      actionsTaken: 'None yet',
      currentState: 'Open in queue',
      suggestedNextStep: 'Verify transaction in Stripe and issue refund',
    }),
    generateAiDraft: vi.fn().mockResolvedValue({
      draft: 'Hi Sarah,\n\nThank you for reaching out. We have initiated the refund for your duplicate charge.\n\nBest regards,\nXRISEHelpDesk Support Team',
    }),

  },
}));

const mockTicket: Ticket = {
  id: 'mock-1',
  ticketId: 'XR-TEST01',
  customer: { name: 'Sarah Connor', email: 'sarah@resistance.org' },
  subject: 'Subscription charge refund request',
  body: 'I was billed twice on August 30. Please refund the duplicate transaction.',
  priority: 'HIGH',
  status: 'OPEN',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

function renderWithQueryClient(ui: React.ReactElement) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
  return render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>);
}

describe('AiAssistantPanel', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders AI header, Gemini model badge, and Human-in-the-Loop indicator', () => {
    renderWithQueryClient(
      <AiAssistantPanel ticket={mockTicket} onApplyDraft={vi.fn()} />
    );

    expect(screen.getByText('AI Support Assistant')).toBeInTheDocument();
    expect(screen.getByText('Gemini 3.6 Flash')).toBeInTheDocument();
    expect(screen.getByText('Human-in-the-Loop')).toBeInTheDocument();
  });

  it('renders action buttons for Analyze Ticket, Summarize Ticket, and Generate Reply', () => {
    renderWithQueryClient(
      <AiAssistantPanel ticket={mockTicket} onApplyDraft={vi.fn()} />
    );

    expect(screen.getByText('Analyze Ticket')).toBeInTheDocument();
    expect(screen.getByText('Summarize Ticket')).toBeInTheDocument();
    expect(screen.getByText('Generate Reply')).toBeInTheDocument();
  });

  it('triggers and renders Smart Analysis output on click', async () => {
    renderWithQueryClient(
      <AiAssistantPanel ticket={mockTicket} onApplyDraft={vi.fn()} />
    );

    const analyzeBtn = screen.getByText('Analyze Ticket');
    fireEvent.click(analyzeBtn);

    await waitFor(() => {
      expect(ticketApi.analyzeTicket).toHaveBeenCalledWith(mockTicket.ticketId);
      expect(screen.getByText('Ticket Classification & Triage')).toBeInTheDocument();
      expect(screen.getByText('BILLING')).toBeInTheDocument();
      expect(screen.getByText(/Customer reported duplicate charge/i)).toBeInTheDocument();
    });
  });

  it('triggers and renders Ticket Summary output on click', async () => {
    renderWithQueryClient(
      <AiAssistantPanel ticket={mockTicket} onApplyDraft={vi.fn()} />
    );

    const summarizeBtn = screen.getByText('Summarize Ticket');
    fireEvent.click(summarizeBtn);

    await waitFor(() => {
      expect(ticketApi.summarizeTicket).toHaveBeenCalledWith(mockTicket.ticketId);
      expect(screen.getByText('Summary')).toBeInTheDocument();
      expect(screen.getByText(/Customer's Main Problem/i)).toBeInTheDocument();
      expect(screen.getByText(/Verify transaction in Stripe/i)).toBeInTheDocument();
    });
  });

  it('triggers and renders Draft Reply with apply action', async () => {
    const handleApplyDraft = vi.fn();
    renderWithQueryClient(
      <AiAssistantPanel ticket={mockTicket} onApplyDraft={handleApplyDraft} />
    );

    const draftBtn = screen.getByText('Generate Reply');
    fireEvent.click(draftBtn);

    await waitFor(() => {
      expect(ticketApi.generateAiDraft).toHaveBeenCalledWith(mockTicket.ticketId);
      expect(screen.getByText(/Draft Reply:/i)).toBeInTheDocument();
      expect(screen.getByText('Use Draft')).toBeInTheDocument();
    });

    const useDraftBtn = screen.getByText('Use Draft');
    fireEvent.click(useDraftBtn);

    expect(handleApplyDraft).toHaveBeenCalledWith(expect.stringContaining('Hi Sarah'));
  });

  it('displays graceful error message and retry button when AI operation fails', async () => {
    vi.mocked(ticketApi.analyzeTicket).mockRejectedValueOnce(new Error('Network error'));

    renderWithQueryClient(
      <AiAssistantPanel ticket={mockTicket} onApplyDraft={vi.fn()} />
    );

    const analyzeBtn = screen.getByText('Analyze Ticket');
    fireEvent.click(analyzeBtn);

    await waitFor(() => {
      expect(
        screen.getByText('AI service is temporarily unavailable. You can continue replying manually.')
      ).toBeInTheDocument();
      expect(screen.getByText('Retry')).toBeInTheDocument();
    });
  });

  it('allows agent to edit the generated draft response before using it', async () => {
    const handleApplyDraft = vi.fn();
    renderWithQueryClient(
      <AiAssistantPanel ticket={mockTicket} onApplyDraft={handleApplyDraft} />
    );

    const draftBtn = screen.getByText('Generate Reply');
    fireEvent.click(draftBtn);

    await waitFor(() => {
      expect(screen.getByPlaceholderText(/Edit draft response here/i)).toBeInTheDocument();
    });

    const textarea = screen.getByPlaceholderText(/Edit draft response here/i) as HTMLTextAreaElement;
    fireEvent.change(textarea, { target: { value: 'Hi Sarah, this is a custom edited reply.' } });
    expect(textarea.value).toBe('Hi Sarah, this is a custom edited reply.');

    const useDraftBtn = screen.getByText('Use Draft');
    fireEvent.click(useDraftBtn);

    expect(handleApplyDraft).toHaveBeenCalledWith('Hi Sarah, this is a custom edited reply.');
  });
});



