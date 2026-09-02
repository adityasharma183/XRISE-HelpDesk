import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { PublicLayout } from '../components/layout/PublicLayout';
import { AgentLayout } from '../components/layout/AgentLayout';
import { ProtectedRoute } from '../features/auth';

import { LandingPage } from '../pages/public/LandingPage';
import { SubmitTicketPage } from '../pages/public/SubmitTicketPage';
import { CheckStatusPage } from '../pages/public/CheckStatusPage';
import { GetInTouchPage } from '../pages/public/GetInTouchPage';
import { LoginPage } from '../pages/agent/LoginPage';
import { DashboardPage } from '../pages/agent/DashboardPage';
import { TicketsPage } from '../pages/agent/TicketsPage';
import { TicketDetailPage } from '../pages/agent/TicketDetailPage';

export function AppRoutes() {
  return (
    <Routes>
      {/* 1. Public Customer Routes */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/submit-ticket" element={<SubmitTicketPage />} />
        <Route path="/check-status" element={<CheckStatusPage />} />
        <Route path="/get-in-touch" element={<GetInTouchPage />} />
        <Route path="/contact" element={<Navigate to="/get-in-touch" replace />} />
      </Route>


      {/* 2. Authentication */}
      <Route path="/login" element={<LoginPage />} />

      {/* 3. Protected Staff / Agent / Admin Routes */}
      <Route
        path="/agent"
        element={
          <ProtectedRoute>
            <AgentLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/agent/dashboard" replace />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="tickets" element={<TicketsPage />} />
        <Route path="tickets/:ticketId" element={<TicketDetailPage />} />
      </Route>

      {/* 4. Fallback Catch-all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
