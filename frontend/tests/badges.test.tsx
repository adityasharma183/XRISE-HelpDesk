import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TicketStatusBadge } from '../src/features/tickets/components/TicketStatusBadge';
import { TicketPriorityBadge } from '../src/features/tickets/components/TicketPriorityBadge';

describe('TicketStatusBadge', () => {
  it('renders OPEN status badge with correct text and accessibility label', () => {
    render(<TicketStatusBadge status="OPEN" />);
    const badge = screen.getByLabelText('Ticket status: Open');
    expect(badge).toBeInTheDocument();
    expect(screen.getByText('Open')).toBeInTheDocument();
  });

  it('renders IN_PROGRESS status badge correctly', () => {
    render(<TicketStatusBadge status="IN_PROGRESS" />);
    expect(screen.getByLabelText('Ticket status: In Progress')).toBeInTheDocument();
    expect(screen.getByText('In Progress')).toBeInTheDocument();
  });

  it('renders RESOLVED and CLOSED badges', () => {
    const { rerender } = render(<TicketStatusBadge status="RESOLVED" />);
    expect(screen.getByText('Resolved')).toBeInTheDocument();

    rerender(<TicketStatusBadge status="CLOSED" />);
    expect(screen.getByText('Closed')).toBeInTheDocument();
  });
});

describe('TicketPriorityBadge', () => {
  it('renders URGENT priority badge with aria label', () => {
    render(<TicketPriorityBadge priority="URGENT" />);
    expect(screen.getByLabelText('Priority: Urgent')).toBeInTheDocument();
    expect(screen.getByText('Urgent')).toBeInTheDocument();
  });

  it('renders LOW, MEDIUM, and HIGH priority badges', () => {
    const { rerender } = render(<TicketPriorityBadge priority="LOW" />);
    expect(screen.getByText('Low')).toBeInTheDocument();

    rerender(<TicketPriorityBadge priority="MEDIUM" />);
    expect(screen.getByText('Medium')).toBeInTheDocument();

    rerender(<TicketPriorityBadge priority="HIGH" />);
    expect(screen.getByText('High')).toBeInTheDocument();
  });
});
