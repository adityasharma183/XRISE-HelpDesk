import React from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { Plus, Search, MessageSquareHeart, ExternalLink } from 'lucide-react';

export function PublicLayout() {
  const location = useLocation();

  const navItems = [
    { label: 'Submit ticket', href: '/submit-ticket', icon: Plus },
    { label: 'Check status', href: '/check-status', icon: Search },
    { label: 'Feedback', href: '/get-in-touch', icon: MessageSquareHeart },
  ];

  const isGetInTouchActive = location.pathname === '/get-in-touch';

  return (
    <div className="min-h-screen flex flex-col bg-[#0A0A0C] text-[#F5F5F7] font-sans antialiased selection:bg-[#C9B9A6] selection:text-[#0A0A0C]">
      {/* Top Black & Dark Beige Navbar with Glass Drop */}
      <header className="sticky top-0 z-50 border-b border-[#C9B9A6]/20 bg-[#0A0A0C]/80 backdrop-blur-[22px] shadow-[0_12px_40px_-10px_rgba(0,0,0,0.85)] transition-all duration-300">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between gap-4">
          {/* Brand Lockup */}
          <Link to="/" className="flex items-center gap-3 shrink-0 group">
            <div className="h-9 w-9 rounded-sm bg-gradient-to-br from-[#DFD5C6] via-[#C9B9A6] to-[#A89680] text-[#0A0A0C] flex items-center justify-center font-bold shadow-[0_4px_16px_rgba(201,185,166,0.3)] transition-transform duration-300 group-hover:scale-105">
              <span className="font-mono text-xs font-black tracking-tighter">XR</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="font-serif text-xl sm:text-2xl font-normal tracking-tight text-[#F5F5F7]">
                XRISE<span className="text-[#C9B9A6]">HelpDesk</span>
              </span>
              <span className="hidden sm:inline-block font-mono text-[10.5px] tracking-[0.2em] text-[#C9B9A6]/80 uppercase pl-2 border-l border-[#C9B9A6]/25">
                Support Portal
              </span>
            </div>
          </Link>

          {/* Navigation & Action Buttons */}
          <nav className="flex items-center gap-2 sm:gap-4">
            <div className="flex items-center gap-1 sm:gap-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.href;
                return (
                  <Link key={item.href} to={item.href}>
                    <button
                      type="button"
                      className={`px-3 sm:px-4 py-2 font-mono text-[11px] sm:text-[11.5px] tracking-[0.14em] uppercase transition-all duration-300 flex items-center gap-1.5 rounded-sm cursor-pointer ${
                        isActive
                          ? 'text-[#C9B9A6] bg-[#C9B9A6]/10 border border-[#C9B9A6]/40 font-bold shadow-[0_4px_16px_rgba(0,0,0,0.5),inset_0_1px_1px_rgba(201,185,166,0.15)]'
                          : 'text-[#9E9EA8] hover:text-[#DFD5C6] hover:bg-white/[0.04]'
                      }`}
                    >
                      <Icon className="h-3.5 w-3.5" />
                      <span>{item.label}</span>
                    </button>
                  </Link>
                );
              })}
            </div>

            <div className="h-4 w-px bg-[#C9B9A6]/20 mx-1 hidden md:block" />

            {/* Staff portal link */}
            <Link
              to="/login"
              className="font-mono text-[11px] sm:text-[11.5px] tracking-[0.14em] text-[#9E9EA8] hover:text-[#DFD5C6] uppercase hidden md:flex items-center gap-1 px-2.5 py-2 transition-colors duration-300"
            >
              <span>Sign in</span>
              <ExternalLink className="h-3 w-3 opacity-60" />
            </Link>

            {/* Get in touch CTA Button (Glass Drop & Dark Beige) */}
            <Link to="/get-in-touch">
              <button
                type="button"
                className={`font-mono text-[11px] sm:text-[11.5px] tracking-[0.14em] uppercase px-4 sm:px-5 py-2.5 rounded-sm transition-all duration-300 flex items-center gap-1.5 cursor-pointer ${
                  isGetInTouchActive
                    ? 'border border-[#C9B9A6] bg-[#C9B9A6] text-[#0A0A0C] font-bold shadow-[0_4px_20px_rgba(201,185,166,0.35)]'
                    : 'border border-[#C9B9A6]/30 bg-[#C9B9A6]/[0.05] text-[#F5F5F7] hover:border-[#C9B9A6] hover:bg-[#C9B9A6]/15 hover:text-[#DFD5C6] backdrop-blur-md shadow-[0_8px_20px_rgba(0,0,0,0.5)]'
                }`}
              >
                <span>Get in touch</span>
                <span className="text-xs transition-transform duration-300 group-hover:translate-x-1">→</span>
              </button>
            </Link>
          </nav>
        </div>
      </header>

      {/* Main Page Body */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <Outlet />
      </main>

      {/* Black & Dark Beige Footer */}
      <footer className="border-t border-[#C9B9A6]/15 bg-[#0D0D10] py-12 text-xs text-[#9E9EA8]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-8">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-8 border-b border-[#C9B9A6]/10">
            <div className="space-y-2">
              <div className="flex items-center gap-2.5">
                <div className="h-6 w-6 rounded-sm bg-[#C9B9A6] text-[#0A0A0C] flex items-center justify-center font-mono font-bold text-[11px]">
                  XR
                </div>
                <span className="font-serif text-lg text-[#F5F5F7] tracking-tight">
                  XRISE <span className="font-sans font-light text-xs text-[#C9B9A6]">AI Systems</span>
                </span>
              </div>
              <p className="text-xs text-[#9E9EA8] max-w-md leading-relaxed font-sans">
                Sovereign AI systems for enterprise &amp; institutions: multi-step support agents, intelligent triaging, and mission-control portals.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-5 sm:gap-7 font-mono text-[11px] tracking-[0.14em] uppercase">
              <Link to="/submit-ticket" className="text-[#9E9EA8] hover:text-[#C9B9A6] transition-colors">
                Submit Ticket
              </Link>
              <Link to="/check-status" className="text-[#9E9EA8] hover:text-[#C9B9A6] transition-colors">
                Track Request
              </Link>
              <Link to="/get-in-touch" className="text-[#9E9EA8] hover:text-[#C9B9A6] transition-colors">
                Contact &amp; Feedback
              </Link>
              <Link to="/login" className="text-[#9E9EA8] hover:text-[#C9B9A6] transition-colors flex items-center gap-1">
                Staff Portal <ExternalLink className="h-3 w-3 opacity-60" />
              </Link>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 font-mono text-[10.5px] text-[#70707C]">
            <p>© {new Date().getFullYear()} XRISE AI Systems India Pvt Ltd. All rights reserved.</p>
            <p className="flex items-center gap-2">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>Sovereign Systems Operational · Powered by Gemini AI</span>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
