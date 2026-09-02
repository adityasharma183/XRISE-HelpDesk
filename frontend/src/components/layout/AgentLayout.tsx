import React, { useState } from 'react';
import { Link, NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '../../features/auth';
import { ticketApi } from '../../features/tickets';
import {
  Inbox,
  LayoutGrid,
  Users,
  Tag,
  Sliders,
  Bell,
  ChevronDown,
  LogOut,
  Menu,
  X,
} from 'lucide-react';
import { Button } from '../ui/Button';

export function AgentLayout() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isWorkspaceDropdownOpen, setIsWorkspaceDropdownOpen] = useState(false);

  // Live ticket stats for the sidebar inbox counter
  const { data: statsData } = useQuery({
    queryKey: ['sidebar-stats'],
    queryFn: () => ticketApi.getTickets({ limit: 1 }),
    refetchInterval: 30000,
  });

  const openCount = statsData?.stats?.open ?? 0;

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navLinks = [
    { label: 'Inbox', href: '/agent/dashboard', icon: Inbox, badge: openCount },
    { label: 'All Tickets', href: '/agent/tickets', icon: LayoutGrid },
    { label: 'Team', href: '/agent/tickets', icon: Users },
  ];

  const manageLinks = [
    { label: 'Tags', href: '/agent/tickets', icon: Tag },
    { label: 'Settings', href: '/agent/tickets', icon: Sliders },
  ];

  const userInitials = user?.name
    ? user.name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase()
    : 'XR';

  const getBreadcrumbs = () => {
    if (location.pathname.includes('/agent/tickets/')) {
      const parts = location.pathname.split('/');
      const ticketId = parts[parts.length - 1];
      return (
        <div className="flex items-center gap-2 text-xs font-mono text-[#9E9EA8] truncate">
          <Link to="/agent/dashboard" className="hover:text-[#C9B9A6] transition-colors hidden sm:inline">INBOX</Link>
          <span className="text-[#5A5A66] hidden sm:inline">/</span>
          <Link to="/agent/tickets" className="hover:text-[#C9B9A6] transition-colors">TICKETS</Link>
          <span className="text-[#5A5A66]">/</span>
          <span className="text-[#DFD5C6] font-mono font-bold truncate max-w-[140px] sm:max-w-none">
            #{ticketId}
          </span>
        </div>
      );
    }
    return (
      <div className="flex items-center gap-2 text-xs font-mono text-[#9E9EA8]">
        <Link to="/agent/dashboard" className="hover:text-[#C9B9A6] transition-colors">INBOX</Link>
        <span className="text-[#5A5A66]">/</span>
        <span className="text-[#F5F5F7] font-semibold uppercase">
          {location.pathname === '/agent/tickets' ? 'All tickets' : 'Mission Control'}
        </span>
      </div>
    );
  };

  const SidebarContent = ({ onNavigate }: { onNavigate?: () => void }) => (
    <div className="flex flex-col h-full bg-[#0E0E12] text-[#F5F5F7] select-none border-r border-[#C9B9A6]/15">
      {/* Brand Lockup */}
      <div className="h-18 flex items-center justify-between px-5 border-b border-[#C9B9A6]/15">
        <Link to="/agent/dashboard" onClick={onNavigate} className="flex items-center gap-2.5 group">
          <div className="h-7 w-7 rounded-sm bg-gradient-to-br from-[#DFD5C6] via-[#C9B9A6] to-[#A89680] text-[#0A0A0C] flex items-center justify-center font-mono font-black text-xs shadow-xs transition-transform group-hover:scale-105">
            XR
          </div>
          <span className="font-serif text-base tracking-tight text-[#F5F5F7]">
            XRISE<span className="text-[#C9B9A6]">HelpDesk</span>
          </span>
        </Link>

        {onNavigate && (
          <button
            type="button"
            onClick={onNavigate}
            className="lg:hidden p-1.5 text-[#9E9EA8] hover:text-[#F5F5F7]"
            aria-label="Close menu"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      <div className="px-3 space-y-6 flex-1 overflow-y-auto pt-5" data-lenis-prevent>
        {/* Workspace Card Selector (Glass Drop) */}
        <div>
          <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#C9B9A6]/80 px-2 mb-2">
            Sovereign Node
          </div>
          <div
            onClick={() => setIsWorkspaceDropdownOpen(!isWorkspaceDropdownOpen)}
            className="p-3 border border-[#C9B9A6]/20 bg-[#16161B]/80 hover:border-[#C9B9A6]/50 transition-all flex items-center justify-between cursor-pointer shadow-inner backdrop-blur-md"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="h-7 w-7 bg-[#C9B9A6] text-[#0A0A0C] flex items-center justify-center font-mono font-bold text-xs shrink-0 rounded-xs">
                XR
              </div>
              <div className="min-w-0">
                <div className="text-xs font-mono font-bold text-[#F5F5F7] truncate leading-tight">Northstar AI Node</div>
                <div className="text-[10px] font-mono text-[#9E9EA8] truncate leading-tight">Primary Dispatch</div>
              </div>
            </div>
            <ChevronDown className="h-3 w-3 text-[#9E9EA8] shrink-0" />
          </div>
        </div>

        {/* Workspace Menu */}
        <div>
          <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#C9B9A6]/80 px-2 mb-2">
            Main Menu
          </div>
          <div className="space-y-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isInboxActive = link.label === 'Inbox' && location.pathname === '/agent/dashboard';
              const isTicketsActive = link.label === 'All Tickets' && location.pathname === '/agent/tickets';
              const isCurrentRoute = location.pathname === link.href;
              const isItemActive = isCurrentRoute || isInboxActive || isTicketsActive;
              return (
                <NavLink
                  key={link.label}
                  to={link.href}
                  onClick={onNavigate}
                  className={
                    `flex items-center justify-between px-3 py-2.5 font-mono text-xs uppercase tracking-wider transition-all rounded-sm ${
                      isItemActive
                        ? 'bg-[#C9B9A6] text-[#0A0A0C] font-bold shadow-[0_4px_16px_rgba(201,185,166,0.3)]'
                        : 'text-[#9E9EA8] hover:bg-white/[0.04] hover:text-[#DFD5C6]'
                    }`
                  }
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className="h-4 w-4" />
                    <span>{link.label}</span>
                  </div>
                  {typeof link.badge === 'number' && (
                    <span className={`font-mono text-[10px] px-2 py-0.5 border font-bold ${
                      isItemActive
                        ? 'bg-[#0A0A0C] text-[#DFD5C6] border-[#0A0A0C]'
                        : 'bg-[#16161B] text-[#C9B9A6] border-[#C9B9A6]/30'
                    }`}>
                      {link.badge}
                    </span>
                  )}
                </NavLink>
              );

            })}
          </div>
        </div>

        {/* Management & Settings */}
        <div>
          <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#C9B9A6]/80 px-2 mb-2">
            System
          </div>
          <div className="space-y-1">
            {manageLinks.map((link) => {
              const Icon = link.icon;
              return (
                <NavLink
                  key={link.label}
                  to={link.href}
                  onClick={onNavigate}
                  className="flex items-center gap-2.5 px-3 py-2 font-mono text-xs uppercase tracking-wider text-[#9E9EA8] hover:bg-white/[0.04] hover:text-[#DFD5C6] transition-colors"
                >
                  <Icon className="h-4 w-4 text-[#7A7A85]" />
                  <span>{link.label}</span>
                </NavLink>
              );
            })}
          </div>
        </div>
      </div>

      {/* Staff Profile Footer Card */}
      <div className="p-3.5 border-t border-[#C9B9A6]/15 flex items-center justify-between bg-[#141418]">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="h-8 w-8 bg-[#C9B9A6] text-[#0A0A0C] flex items-center justify-center font-mono font-bold text-xs shrink-0 rounded-xs">
            {userInitials}
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-xs font-bold text-[#F5F5F7] truncate leading-tight font-sans">{user?.name || 'Jordan Lee'}</span>
            <span className="font-mono text-[10px] text-[#C9B9A6] uppercase font-bold">{user?.role?.toLowerCase() || 'agent'}</span>
          </div>
        </div>

        <button
          type="button"
          onClick={handleLogout}
          title="Sign out"
          className="text-[#9E9EA8] hover:text-red-400 p-2 transition-colors cursor-pointer"
        >
          <LogOut className="h-4 w-4" />
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex bg-[#0A0A0C] text-[#F5F5F7] font-sans antialiased selection:bg-[#C9B9A6] selection:text-[#0A0A0C]">
      {/* Desktop Fixed Sidebar */}
      <aside className="hidden lg:flex flex-col w-[240px] sticky top-0 h-screen shrink-0 z-30">
        <SidebarContent />
      </aside>

      {/* Mobile Slide-Over Sidebar Drawer */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in"
            onClick={() => setIsMobileMenuOpen(false)}
          />

          <aside className="relative w-72 max-w-[85vw] bg-[#0E0E12] h-full shadow-2xl flex flex-col z-10 animate-in slide-in-from-left duration-200">
            <SidebarContent onNavigate={() => setIsMobileMenuOpen(false)} />
          </aside>
        </div>
      )}

      {/* Main Viewport Content Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#0A0A0C]">
        {/* Top Header Bar with Glass Drop */}
        <header className="h-18 px-4 sm:px-6 lg:px-8 flex items-center justify-between border-b border-[#C9B9A6]/15 sticky top-0 bg-[#0A0A0C]/80 backdrop-blur-[20px] shadow-sm z-20">
          {/* Left Breadcrumb & Hamburger */}
          <div className="flex items-center gap-3 min-w-0">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden h-8 w-8 shrink-0 -ml-1 text-[#F5F5F7]"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </Button>
            {getBreadcrumbs()}
          </div>

          {/* Right Header Items */}
          <div className="flex items-center gap-3 sm:gap-5 shrink-0">
            {/* Role Indicator */}
            <div className="flex items-center gap-2 font-mono text-xs text-[#9E9EA8]">
              <span className="hidden md:inline">ROLE:</span>
              <div className="flex items-center gap-1.5 text-[#DFD5C6] font-bold px-3 py-1 border border-[#C9B9A6]/25 bg-[#16161B]/80 text-xs shadow-xs backdrop-blur-md">
                <span>{user?.role === 'ADMIN' ? '👑 SYSTEM ADMIN' : '🛡️ DISPATCH AGENT'}</span>
              </div>
            </div>

            {/* Notification Bell */}
            <button
              type="button"
              className="relative text-[#9E9EA8] hover:text-[#DFD5C6] p-2 transition-colors cursor-pointer"
              title="Notifications"
            >
              <Bell className="h-4 w-4" />
              <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-[#C9B9A6]" />
            </button>

            {/* User Avatar */}
            <div className="flex items-center gap-1.5 cursor-pointer pl-1">
              <div className="h-8 w-8 bg-[#C9B9A6] text-[#0A0A0C] font-mono flex items-center justify-center font-bold text-xs rounded-xs shadow-xs">
                {userInitials}
              </div>
            </div>
          </div>
        </header>

        {/* Main Viewport Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-6xl w-full mx-auto overflow-y-auto" data-lenis-prevent>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
