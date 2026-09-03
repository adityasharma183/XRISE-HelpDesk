import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { EvaluationAccess } from '../src/features/public-portal/components/EvaluationAccess';
import {
  MASTER_ADMIN_ACCOUNT,
  SUPPORT_STAFF_ACCOUNTS,
} from '../src/config/staffAccounts';

describe('EvaluationAccess Component', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('renders section title and subtitle correctly', () => {
    render(
      <BrowserRouter>
        <EvaluationAccess />
      </BrowserRouter>
    );

    expect(screen.getAllByText(/EVALUATION ACCESS/i).length).toBeGreaterThan(0);
    expect(
      screen.getByText('One-click evaluation credentials. Copy username and password independently to sign in to the agent portal.')
    ).toBeInTheDocument();
  });

  it('renders the Master Admin card with correct details', () => {
    render(
      <BrowserRouter>
        <EvaluationAccess />
      </BrowserRouter>
    );

    expect(screen.getByText(MASTER_ADMIN_ACCOUNT.name)).toBeInTheDocument();
    expect(screen.getByText(MASTER_ADMIN_ACCOUNT.email)).toBeInTheDocument();
    expect(screen.getAllByText(MASTER_ADMIN_ACCOUNT.role).length).toBeGreaterThan(0);
  });

  it('renders all support staff accounts dynamically', () => {
    render(
      <BrowserRouter>
        <EvaluationAccess />
      </BrowserRouter>
    );

    expect(screen.getByText('Support & Triage Staff')).toBeInTheDocument();
    expect(screen.getByText(`${SUPPORT_STAFF_ACCOUNTS.length} Assigned Agents`)).toBeInTheDocument();

    for (const agent of SUPPORT_STAFF_ACCOUNTS) {
      expect(screen.getByText(agent.name)).toBeInTheDocument();
      expect(screen.getByText(agent.email)).toBeInTheDocument();
    }
  });

  it('masks passwords by default and reveals them when eye toggle is clicked', () => {
    render(
      <BrowserRouter>
        <EvaluationAccess />
      </BrowserRouter>
    );

    // Passwords should be masked by default
    expect(screen.queryByText('admin@123')).not.toBeInTheDocument();
    expect(screen.queryByText('agent1@123')).not.toBeInTheDocument();

    // Click toggle for Master Admin
    const adminToggle = screen.getByLabelText(`Toggle password visibility for ${MASTER_ADMIN_ACCOUNT.name}`);
    fireEvent.click(adminToggle);

    expect(screen.getByText('admin@123')).toBeInTheDocument();

    // Click toggle again to hide
    fireEvent.click(adminToggle);
    expect(screen.queryByText('admin@123')).not.toBeInTheDocument();

    // Click toggle for Agent 1
    const agent1 = SUPPORT_STAFF_ACCOUNTS[0];
    const agent1Toggle = screen.getByLabelText(`Toggle password visibility for ${agent1.name}`);
    fireEvent.click(agent1Toggle);

    expect(screen.getByText('agent1@123')).toBeInTheDocument();
  });

  it('copies username and password independently to clipboard and shows feedback', async () => {
    const writeTextMock = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, {
      clipboard: {
        writeText: writeTextMock,
      },
    });

    render(
      <BrowserRouter>
        <EvaluationAccess />
      </BrowserRouter>
    );

    // 1. Test independent username copy
    const adminCopyUserBtn = screen.getByLabelText(`Copy username for ${MASTER_ADMIN_ACCOUNT.name}`);
    fireEvent.click(adminCopyUserBtn);

    expect(writeTextMock).toHaveBeenCalledWith('admin@xriseai.com');

    await waitFor(() => {
      expect(screen.getByText('Copied User')).toBeInTheDocument();
    });

    // 2. Test independent password copy
    const adminCopyPassBtn = screen.getByLabelText(`Copy password for ${MASTER_ADMIN_ACCOUNT.name}`);
    fireEvent.click(adminCopyPassBtn);

    expect(writeTextMock).toHaveBeenCalledWith('admin@123');

    await waitFor(() => {
      expect(screen.getByText('Copied Pass')).toBeInTheDocument();
    });
  });
});
