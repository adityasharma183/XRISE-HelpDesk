import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Crown,
  ShieldCheck,
  Headphones,
  ShieldAlert,
  Eye,
  EyeOff,
  Copy,
  Check,
  ExternalLink,
  Lock,
  Mail,
  Key,
} from 'lucide-react';
import {
  PREDEFINED_STAFF_ACCOUNTS,
  MASTER_ADMIN_ACCOUNT,
  SUPPORT_STAFF_ACCOUNTS,
  StaffAccount,
} from '../../../config/staffAccounts';

export function EvaluationAccess() {
  const [revealedPasswords, setRevealedPasswords] = useState<Record<string, boolean>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const togglePasswordVisibility = (accountId: string) => {
    setRevealedPasswords((prev) => ({
      ...prev,
      [accountId]: !prev[accountId],
    }));
  };

  const handleCopyCredentials = async (account: StaffAccount) => {
    const textToCopy = `Email: ${account.email}\nPassword: ${account.password}`;
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(textToCopy);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = textToCopy;
        textarea.style.position = 'fixed';
        textarea.style.left = '-999999px';
        textarea.style.top = '-999999px';
        document.body.appendChild(textarea);
        textarea.focus();
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
      setCopiedId(account.id);
      setTimeout(() => {
        setCopiedId((current) => (current === account.id ? null : current));
      }, 2000);
    } catch {
      // Fallback
    }
  };

  const getAccountIcon = (iconType: StaffAccount['iconType']) => {
    switch (iconType) {
      case 'crown':
        return <Crown className="h-5 w-5 text-[#EAD8C3]" />;
      case 'dispatch':
        return <ShieldCheck className="h-4 w-4 text-[#C9B9A6]" />;
      case 'escalation':
        return <ShieldAlert className="h-4 w-4 text-[#C9B9A6]" />;
      case 'support':
      default:
        return <Headphones className="h-4 w-4 text-[#C9B9A6]" />;
    }
  };

  return (
    <section className="glass-drop-panel p-6 sm:p-10 lg:p-12 space-y-10 rounded-sm">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-[#C9B9A6]/15">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-2.5 font-mono text-[11px] uppercase tracking-[0.24em] text-[#C9B9A6]">
            <span className="h-px w-6 bg-[#C25E1A]" />
            <span>EVALUATION ACCESS</span>
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-normal text-[#F5F5F7] tracking-tight">
            Evaluation Access
          </h2>
          <p className="text-xs sm:text-sm text-[#9E9EA8] font-sans max-w-xl">
            Pre-configured accounts for evaluating the XRISEHelpDesk staff portal.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <Link to="/login">
            <button
              type="button"
              id="eval-access-portal-btn"
              className="border border-[#C9B9A6] bg-[#C9B9A6] hover:bg-[#DFD5C6] text-[#0A0A0C] font-mono text-xs uppercase tracking-[0.14em] font-bold px-6 py-3 rounded-xs transition-all flex items-center gap-2 cursor-pointer shadow-[0_2px_12px_rgba(201,185,166,0.25)] active:scale-95"
            >
              <span>Access Staff Portal</span>
              <ExternalLink className="h-3.5 w-3.5" />
            </button>
          </Link>
        </div>
      </div>

      {/* 1. MASTER ADMIN Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 font-mono text-xs uppercase tracking-[0.2em] text-[#C9B9A6] font-semibold">
          <Crown className="h-3.5 w-3.5 text-[#EAD8C3]" />
          <span>MASTER ADMIN</span>
        </div>

        {MASTER_ADMIN_ACCOUNT && (
          <div
            id="master-admin-card"
            className="border border-[#C9B9A6]/35 bg-gradient-to-br from-[#1A1A22]/95 via-[#141419]/90 to-[#0F0F13]/95 p-6 sm:p-8 rounded-sm shadow-[0_20px_50px_rgba(0,0,0,0.7),inset_0_1px_2px_rgba(201,185,166,0.15)] transition-all hover:border-[#C9B9A6]/60 relative overflow-hidden"
          >
            {/* Subtle luxury ambient accent */}
            <div className="absolute top-0 right-0 w-72 h-72 bg-gradient-to-bl from-[#C9B9A6]/10 to-transparent pointer-events-none rounded-full blur-3xl" />

            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
              {/* Left Column: Identity & Badges */}
              <div className="lg:col-span-5 space-y-3">
                <div className="flex items-center gap-3.5">
                  <div className="h-12 w-12 rounded-xs bg-[#24242E] border border-[#C9B9A6]/40 flex items-center justify-center shadow-md">
                    {getAccountIcon(MASTER_ADMIN_ACCOUNT.iconType)}
                  </div>
                  <div>
                    <h3 className="font-serif text-xl sm:text-2xl font-normal text-[#F5F5F7]">
                      {MASTER_ADMIN_ACCOUNT.name}
                    </h3>
                    <div className="flex items-center gap-2 pt-1 flex-wrap font-mono">
                      <span className="text-[10px] uppercase font-bold bg-[#C9B9A6] text-[#0A0A0C] px-2 py-0.5 rounded-xs tracking-wider">
                        {MASTER_ADMIN_ACCOUNT.role}
                      </span>
                      <span className="text-[10px] uppercase tracking-wider text-[#C9B9A6] border border-[#C9B9A6]/30 px-2 py-0.5 rounded-xs bg-[#16161B]">
                        {MASTER_ADMIN_ACCOUNT.roleBadge}
                      </span>
                    </div>
                  </div>
                </div>

                {MASTER_ADMIN_ACCOUNT.description && (
                  <p className="text-xs text-[#9E9EA8] font-sans leading-relaxed pt-1">
                    {MASTER_ADMIN_ACCOUNT.description}
                  </p>
                )}
              </div>

              {/* Middle Column: Credentials Fields */}
              <div className="lg:col-span-4 space-y-3 border-t lg:border-t-0 lg:border-l border-white/[0.08] lg:pl-6 pt-4 lg:pt-0">
                {/* Email Field */}
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 font-mono text-[10.5px] uppercase tracking-wider text-[#9E9EA8]">
                    <Mail className="h-3 w-3 text-[#C9B9A6]" />
                    <span>Email Address</span>
                  </div>
                  <div className="font-mono text-xs sm:text-sm font-semibold text-[#DFD5C6] bg-[#0E0E12]/90 border border-white/10 px-3 py-2 rounded-xs flex items-center justify-between select-all">
                    <span>{MASTER_ADMIN_ACCOUNT.email}</span>
                  </div>
                </div>

                {/* Password Field */}
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 font-mono text-[10.5px] uppercase tracking-wider text-[#9E9EA8]">
                    <Key className="h-3 w-3 text-[#C9B9A6]" />
                    <span>Password</span>
                  </div>
                  <div className="font-mono text-xs sm:text-sm font-semibold text-[#DFD5C6] bg-[#0E0E12]/90 border border-white/10 px-3 py-1.5 rounded-xs flex items-center justify-between">
                    <span className="tracking-widest">
                      {revealedPasswords[MASTER_ADMIN_ACCOUNT.id]
                        ? MASTER_ADMIN_ACCOUNT.password
                        : '••••••••••••'}
                    </span>
                    <button
                      type="button"
                      onClick={() => togglePasswordVisibility(MASTER_ADMIN_ACCOUNT.id)}
                      title={
                        revealedPasswords[MASTER_ADMIN_ACCOUNT.id]
                          ? 'Hide password'
                          : 'Reveal password'
                      }
                      aria-label={`Toggle password visibility for ${MASTER_ADMIN_ACCOUNT.name}`}
                      className="p-1 text-[#9E9EA8] hover:text-[#F5F5F7] transition-colors rounded-xs hover:bg-white/5 cursor-pointer ml-2"
                    >
                      {revealedPasswords[MASTER_ADMIN_ACCOUNT.id] ? (
                        <EyeOff className="h-4 w-4 text-[#C9B9A6]" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Right Column: Actions */}
              <div className="lg:col-span-3 flex flex-col justify-center gap-2.5 border-t lg:border-t-0 lg:border-l border-white/[0.08] lg:pl-6 pt-4 lg:pt-0">
                <button
                  type="button"
                  onClick={() => handleCopyCredentials(MASTER_ADMIN_ACCOUNT)}
                  aria-label={`Copy credentials for ${MASTER_ADMIN_ACCOUNT.name}`}
                  className="w-full border border-[#C9B9A6]/40 bg-[#C9B9A6]/10 hover:bg-[#C9B9A6]/20 hover:border-[#C9B9A6] text-[#DFD5C6] font-mono text-xs uppercase tracking-[0.14em] font-semibold px-4 py-2.5 rounded-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm active:scale-95"
                >
                  {copiedId === MASTER_ADMIN_ACCOUNT.id ? (
                    <>
                      <Check className="h-4 w-4 text-[#C9B9A6]" />
                      <span className="text-[#C9B9A6]">✓ Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5 text-[#C9B9A6]" />
                      <span>Copy Credentials</span>
                    </>
                  )}
                </button>

                <Link to="/login" className="w-full">
                  <button
                    type="button"
                    className="w-full border border-white/10 bg-white/[0.03] hover:bg-white/[0.08] hover:border-white/25 text-[#9E9EA8] hover:text-[#F5F5F7] font-mono text-xs uppercase tracking-[0.14em] px-4 py-2.5 rounded-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <span>Sign In As Admin</span>
                    <ExternalLink className="h-3 w-3" />
                  </button>
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 2. SUPPORT STAFF Section */}
      <div className="space-y-4 pt-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 font-mono text-xs uppercase tracking-[0.2em] text-[#C9B9A6] font-semibold">
            <ShieldCheck className="h-3.5 w-3.5 text-[#C9B9A6]" />
            <span>SUPPORT STAFF</span>
          </div>
          <span className="font-mono text-[10.5px] uppercase tracking-widest text-[#70707C]">
            {SUPPORT_STAFF_ACCOUNTS.length} Active Agents
          </span>
        </div>

        {/* Dynamic Support Agents Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {SUPPORT_STAFF_ACCOUNTS.map((account) => (
            <div
              key={account.id}
              id={`staff-card-${account.id}`}
              className="border border-[#C9B9A6]/20 bg-[#16161B]/80 hover:border-[#C9B9A6]/45 p-5 sm:p-6 rounded-sm backdrop-blur-md transition-all flex flex-col justify-between space-y-5 shadow-[0_12px_32px_rgba(0,0,0,0.5)] group"
            >
              {/* Header: Icon, Name & Role */}
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-xs bg-[#1F1F26] border border-[#C9B9A6]/25 flex items-center justify-center shrink-0 group-hover:border-[#C9B9A6]/50 transition-colors">
                      {getAccountIcon(account.iconType)}
                    </div>
                    <div>
                      <h4 className="font-serif text-lg font-normal text-[#F5F5F7]">
                        {account.name}
                      </h4>
                      <div className="font-mono text-[10.5px] uppercase tracking-wider text-[#C9B9A6]">
                        {account.role}
                      </div>
                    </div>
                  </div>

                  <span className="text-[9.5px] font-mono uppercase bg-[#C9B9A6]/15 border border-[#C9B9A6]/30 text-[#DFD5C6] px-2 py-0.5 rounded-xs tracking-wider shrink-0">
                    {account.roleBadge}
                  </span>
                </div>

                {account.description && (
                  <p className="text-xs text-[#9E9EA8] font-sans leading-relaxed line-clamp-2">
                    {account.description}
                  </p>
                )}
              </div>

              {/* Credential Details */}
              <div className="space-y-2.5 pt-2 border-t border-white/[0.06]">
                {/* Email */}
                <div className="space-y-1">
                  <div className="flex items-center gap-1 font-mono text-[10px] uppercase tracking-wider text-[#8A8A96]">
                    <Mail className="h-2.5 w-2.5 text-[#C9B9A6]" />
                    <span>Email</span>
                  </div>
                  <div className="font-mono text-xs font-medium text-[#DFD5C6] bg-[#0E0E12]/80 border border-white/10 px-2.5 py-1.5 rounded-xs select-all truncate">
                    {account.email}
                  </div>
                </div>

                {/* Password */}
                <div className="space-y-1">
                  <div className="flex items-center gap-1 font-mono text-[10px] uppercase tracking-wider text-[#8A8A96]">
                    <Lock className="h-2.5 w-2.5 text-[#C9B9A6]" />
                    <span>Password</span>
                  </div>
                  <div className="font-mono text-xs font-medium text-[#DFD5C6] bg-[#0E0E12]/80 border border-white/10 px-2.5 py-1 rounded-xs flex items-center justify-between">
                    <span className="tracking-widest">
                      {revealedPasswords[account.id] ? account.password : '••••••••••••'}
                    </span>
                    <button
                      type="button"
                      onClick={() => togglePasswordVisibility(account.id)}
                      title={revealedPasswords[account.id] ? 'Hide password' : 'Reveal password'}
                      aria-label={`Toggle password visibility for ${account.name}`}
                      className="p-1 text-[#9E9EA8] hover:text-[#F5F5F7] transition-colors rounded-xs hover:bg-white/5 cursor-pointer ml-2"
                    >
                      {revealedPasswords[account.id] ? (
                        <EyeOff className="h-3.5 w-3.5 text-[#C9B9A6]" />
                      ) : (
                        <Eye className="h-3.5 w-3.5" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Action: Copy Credentials */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => handleCopyCredentials(account)}
                  aria-label={`Copy credentials for ${account.name}`}
                  className="w-full border border-[#C9B9A6]/30 bg-[#C9B9A6]/[0.08] hover:bg-[#C9B9A6]/20 hover:border-[#C9B9A6] text-[#DFD5C6] font-mono text-xs uppercase tracking-[0.12em] font-semibold px-3 py-2 rounded-xs transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                >
                  {copiedId === account.id ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-[#C9B9A6]" />
                      <span className="text-[#C9B9A6]">✓ Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3 w-3 text-[#C9B9A6]" />
                      <span>Copy Credentials</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
