import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { EmptyState } from '../src/components/common/EmptyState';
import { ErrorState } from '../src/components/common/ErrorState';
import { PageHeader } from '../src/components/common/PageHeader';
import { TicketCard } from '../src/features/tickets/components/TicketCard';
import { Ticket } from '../src/features/tickets/types/ticket.types';

const sampleTicket: Ticket = {
  id: 'ticket-1',
  ticketId: 'XR-001234',
  customer: { name: 'Tony Stark', email: 'tony@stark.com' },
  subject: 'Arc reactor calibration request',
  body: 'Need urgent diagnostic assistance with the new Mark VII power output readings.',
  priority: 'URGENT',
  status: 'IN_PROGRESS',
  assignee: {
    id: 'agent-1',
    name: 'Pepper Potts',
    email: 'pepper@stark.com',
    role: 'AGENT',
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};


describe('Common UI Components', () => {
  it('renders EmptyState with title, description, and action', () => {
    render(
      <EmptyState
        title="No Tickets Found"
        description="Try adjusting your filter or search query."
      />
    );

    expect(screen.getByText('No Tickets Found')).toBeInTheDocument();
    expect(screen.getByText('Try adjusting your filter or search query.')).toBeInTheDocument();
  });

  it('renders ErrorState with custom title and retry button', () => {
    render(
      <ErrorState
        title="Something went wrong"
        message="Network timeout occurred."
      />
    );

    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    expect(screen.getByText('Network timeout occurred.')).toBeInTheDocument();
  });

  it('renders PageHeader with heading, description, and children', () => {
    render(
      <BrowserRouter>
        <PageHeader
          title="Support Dashboard"
          description="Monitor real-time ticket queues and resolution metrics."
          actions={<button type="button">New Action</button>}
        />
      </BrowserRouter>
    );

    expect(screen.getByText('Support Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Monitor real-time ticket queues and resolution metrics.')).toBeInTheDocument();
    expect(screen.getByText('New Action')).toBeInTheDocument();
  });

  it('renders TicketCard with subject, customer, priority, and status', () => {
    render(
      <BrowserRouter>
        <TicketCard ticket={sampleTicket} />
      </BrowserRouter>
    );

    expect(screen.getByText('Arc reactor calibration request')).toBeInTheDocument();
    expect(screen.getByText('Tony Stark')).toBeInTheDocument();
    expect(screen.getByText('Pepper')).toBeInTheDocument();
    expect(screen.getByText('Urgent')).toBeInTheDocument();
    expect(screen.getByText('In Progress')).toBeInTheDocument();
  });
});

