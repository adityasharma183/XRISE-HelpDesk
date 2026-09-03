import React, { useState } from 'react';
import { Eye, EyeOff, Copy, Check, Shield, UserCheck } from 'lucide-react';
import { MASTER_ADMIN_ACCOUNT, SUPPORT_STAFF_ACCOUNTS, StaffAccount } from '../../../config/staffAccounts';

export function EvaluationAccess() {
  const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>({});
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const togglePassword = (accountId: string) => {
    setShowPasswords(prev => ({ ...prev, [accountId]: !prev[accountId] }));
  };

  const copyUsername = async (accountId: string, email: string) => {
    try {
      await navigator.clipboard.writeText(email);
      setCopiedKey(`${accountId}-username`);
      setTimeout(() => setCopiedKey(null), 2000);
    } catch (err) {
      console.error('Failed to copy username:', err);
    }
  };

  const copyPassword = async (accountId: string, pass: string) => {
    try {
      await navigator.clipboard.writeText(pass);
      setCopiedKey(`${accountId}-password`);
      setTimeout(() => setCopiedKey(null), 2000);
    } catch (err) {
      console.error('Failed to copy password:', err);
    }
  };

  const renderAccount = (account: StaffAccount) => {
    const isShowing = showPasswords[account.id] || false;
    const isUsernameCopied = copiedKey === `${account.id}-username`;
    const isPasswordCopied = copiedKey === `${account.id}-password`;

    return (
      <div
        key={account.id}
        className="p-5 border border-[#C9B9A6]/20 rounded-xl bg-[#16161B]/85 backdrop-blur-md space-y-4 shadow-[0_12px_32px_rgba(0,0,0,0.5),inset_0_1px_1px_rgba(255,255,255,0.06)] hover:border-[#C9B9A6]/35 transition-all"
      >
        {/* Header with Name and Badges */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between gap-2">
            <h3 className="font-serif text-lg text-[#F5F5F7] font-medium tracking-tight">
              {account.name}
            </h3>
            <div className="flex gap-1.5 items-center text-[10px] font-mono">
              <span className="px-2 py-0.5 bg-[#C9B9A6]/15 text-[#DFD5C6] rounded-xs font-semibold uppercase tracking-wider">
                {account.role}
              </span>
            </div>
          </div>
          {account.description && (
            <p className="text-xs text-[#9E9EA8] font-sans leading-relaxed line-clamp-2">
              {account.description}
            </p>
          )}
        </div>

        {/* Credentials Details Block */}
        <div className="p-3 rounded-lg bg-[#111114]/90 border border-white/[0.06] space-y-2.5 font-mono text-xs">
          {/* Username / Email Row */}
          <div className="flex items-center justify-between gap-2 pb-2 border-b border-white/[0.04]">
            <span className="text-[10px] uppercase tracking-wider text-[#7A7A88]">Username:</span>
            <span className="text-[#F5F5F7] font-medium select-all truncate">
              {account.email}
            </span>
          </div>

          {/* Password Row */}
          <div className="flex items-center justify-between gap-2">
            <span className="text-[10px] uppercase tracking-wider text-[#7A7A88]">Password:</span>
            <div className="flex items-center gap-2">
              <span className="text-[#DFD5C6] font-medium tracking-wider select-all">
                {isShowing ? account.password : '••••••••'}
              </span>
              <button
                type="button"
                aria-label={`Toggle password visibility for ${account.name}`}
                onClick={() => togglePassword(account.id)}
                className="text-[#9E9EA8] hover:text-[#F5F5F7] transition-colors p-0.5 rounded-xs"
                title={isShowing ? 'Hide password' : 'Show password'}
              >
                {isShowing ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Independent Copy Buttons */}
        <div className="grid grid-cols-2 gap-2 pt-1">
          {/* Copy Username Button */}
          <button
            type="button"
            aria-label={`Copy username for ${account.name}`}
            onClick={() => copyUsername(account.id, account.email)}
            className={`flex items-center justify-center gap-1.5 text-[11px] font-mono font-bold uppercase tracking-wider py-2 px-2.5 rounded-md transition-all border ${
              isUsernameCopied
                ? 'bg-emerald-950/60 border-emerald-500/50 text-emerald-300'
                : 'bg-[#111114] hover:bg-[#1D1D24] text-[#F5F5F7] border-[#C9B9A6]/25 hover:border-[#C9B9A6]/50'
            }`}
          >
            {isUsernameCopied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span className="truncate">Copied User</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-[#C9B9A6] shrink-0" />
                <span className="truncate">Copy User</span>
              </>
            )}
          </button>

          {/* Copy Password Button */}
          <button
            type="button"
            aria-label={`Copy password for ${account.name}`}
            onClick={() => copyPassword(account.id, account.password)}
            className={`flex items-center justify-center gap-1.5 text-[11px] font-mono font-bold uppercase tracking-wider py-2 px-2.5 rounded-md transition-all border ${
              isPasswordCopied
                ? 'bg-emerald-950/60 border-emerald-500/50 text-emerald-300'
                : 'bg-[#111114] hover:bg-[#1D1D24] text-[#F5F5F7] border-[#C9B9A6]/25 hover:border-[#C9B9A6]/50'
            }`}
          >
            {isPasswordCopied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span className="truncate">Copied Pass</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-[#C9B9A6] shrink-0" />
                <span className="truncate">Copy Pass</span>
              </>
            )}
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8 mt-12 mb-12">
      {/* Section Title */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.24em] text-[#C9B9A6] before:h-px before:w-[28px] before:bg-[#C25E1A] before:content-['']">
          <span>04 · EVALUATION ACCESS</span>
        </div>
        <h2 className="font-serif text-2xl sm:text-3xl text-[#F5F5F7] tracking-tight">
          Pre-configured <span className="text-[#C9B9A6] italic font-serif">Staff Roster</span>
        </h2>
        <p className="text-xs sm:text-sm text-[#9E9EA8] max-w-md mx-auto font-sans leading-relaxed">
          One-click evaluation credentials. Copy username and password independently to sign in to the agent portal.
        </p>
      </div>

      {/* Master Admin Card */}
      <div className="max-w-md mx-auto space-y-3">
        <div className="flex items-center justify-center gap-2 font-mono text-[10px] uppercase tracking-[0.2em] text-[#C9B9A6]/90">
          <Shield className="w-3.5 h-3.5 text-[#C9B9A6]" />
          <span>Global Supervision Access</span>
        </div>
        {renderAccount(MASTER_ADMIN_ACCOUNT)}
      </div>

      {/* Support Staff Grid */}
      <div className="max-w-5xl mx-auto space-y-4 pt-6 border-t border-[#C9B9A6]/15">
        <div className="flex items-center justify-between px-2">
          <div className="flex items-center gap-2 font-mono text-xs text-[#DFD5C6] uppercase tracking-wider font-bold">
            <UserCheck className="w-4 h-4 text-[#C9B9A6]" />
            <span>Support &amp; Triage Staff</span>
          </div>
          <span className="font-mono text-xs text-[#9E9EA8]">
            {SUPPORT_STAFF_ACCOUNTS.length} Assigned Agents
          </span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {SUPPORT_STAFF_ACCOUNTS.map(renderAccount)}
        </div>
      </div>
    </div>
  );
}
