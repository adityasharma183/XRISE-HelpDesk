import React, { useState } from 'react';
import {
  Sparkles,
  FileText,
  MessageSquare,
  Loader2,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  RefreshCw,
  Copy,
  Check,
  Zap,
  Bot,
  ShieldAlert,
  ThumbsUp,
  Minus,
  ThumbsDown,
} from 'lucide-react';
import {
  Ticket,
  TicketPriority,
  AiAnalysisResult,
  AiSummaryResult,
} from '../types/ticket.types';
import {
  useAnalyzeTicketMutation,
  useSummarizeTicketMutation,
  useAiDraftMutation,
} from '../hooks/useTickets';

interface AiAssistantPanelProps {
  ticket: Ticket;
  onApplyDraft: (draftText: string) => void;
  onUpdatePriority?: (priority: TicketPriority) => void;
}

export function AiAssistantPanel({
  ticket,
  onApplyDraft,
  onUpdatePriority,
}: AiAssistantPanelProps) {
  const [analysis, setAnalysis] = useState<AiAnalysisResult | null>(null);
  const [summary, setSummary] = useState<AiSummaryResult | null>(null);
  const [draft, setDraft] = useState<string>('');
  const [isCopied, setIsCopied] = useState(false);

  // Mutations
  const analyzeMutation = useAnalyzeTicketMutation(ticket.ticketId, {
    onSuccess: (data) => setAnalysis(data),
  });

  const summarizeMutation = useSummarizeTicketMutation(ticket.ticketId, {
    onSuccess: (data) => setSummary(data),
  });

  const draftMutation = useAiDraftMutation(ticket.ticketId, {
    onSuccess: (data) => setDraft(data.draft),
  });

  const handleCopyDraft = () => {
    if (!draft) return;
    navigator.clipboard.writeText(draft);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case 'POSITIVE':
        return <ThumbsUp className="h-3.5 w-3.5 text-emerald-400" />;
      case 'NEGATIVE':
        return <ThumbsDown className="h-3.5 w-3.5 text-red-400" />;
      default:
        return <Minus className="h-3.5 w-3.5 text-gray-400" />;
    }
  };

  const getPriorityBadgeColor = (p: string) => {
    switch (p) {
      case 'URGENT':
        return 'bg-red-950/50 text-red-300 border-red-800/40';
      case 'HIGH':
        return 'bg-orange-950/50 text-orange-300 border-orange-800/40';
      case 'MEDIUM':
        return 'bg-amber-950/50 text-amber-300 border-amber-800/40';
      case 'LOW':
        return 'bg-blue-950/50 text-blue-300 border-blue-800/40';
      default:
        return 'bg-white/[0.04] text-[#9E9EA8] border-white/[0.08]';
    }
  };

  return (
    <div className="glass-drop-panel p-5 sm:p-7 space-y-6 shadow-[0_20px_50px_-10px_rgba(0,0,0,0.8)] text-[#F5F5F7]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#C9B9A6]/15">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 bg-[#C9B9A6]/15 text-[#DFD5C6] border border-[#C9B9A6]/30 flex items-center justify-center shadow-[0_4px_16px_rgba(0,0,0,0.4)]">
            <Sparkles className="h-4 w-4 text-[#C9B9A6]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-serif text-base font-normal text-[#F5F5F7]">AI Support Assistant</h3>
              <span className="font-mono text-[10.5px] font-bold uppercase px-2.5 py-0.5 bg-[#C9B9A6]/15 text-[#DFD5C6] border border-[#C9B9A6]/30">
                Gemini 3.6 Flash
              </span>
            </div>
            <p className="text-[11px] text-[#9E9EA8] mt-0.5 font-sans">
              Smart ticket triage, conversation summary, and draft composer assistance.
            </p>
          </div>
        </div>

        {/* Human in the loop badge */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#16161B]/80 border border-[#C9B9A6]/25 font-mono text-[11px] text-[#DFD5C6] self-start sm:self-auto backdrop-blur-md shadow-xs">
          <Bot className="h-3.5 w-3.5 text-[#C9B9A6]" />
          <span>Human-in-the-Loop</span>
        </div>
      </div>

      {/* Action Buttons Toolbar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
        {/* Button 1: Analyze */}
        <button
          type="button"
          onClick={() => analyzeMutation.mutate()}
          disabled={analyzeMutation.isPending}
          aria-label="Analyze ticket classification and sentiment"
          className={`px-4 py-3 border font-mono text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer ${
            analysis
              ? 'bg-[#C9B9A6]/20 border-[#C9B9A6] text-[#DFD5C6] font-bold shadow-[0_4px_16px_rgba(201,185,166,0.15)]'
              : 'bg-[#16161B]/80 border-white/10 hover:border-[#C9B9A6]/50 text-[#F5F5F7]'
          } disabled:opacity-60 disabled:cursor-not-allowed active:scale-[0.98] backdrop-blur-md`}
        >
          {analyzeMutation.isPending ? (
            <>
              <Loader2 className="h-3.5 w-3.5 animate-spin text-[#C9B9A6]" />
              <span>Analyzing...</span>
            </>
          ) : (
            <>
              <Zap className="h-3.5 w-3.5 text-[#C9B9A6]" />
              <span>{analysis ? 'Re-analyze Ticket' : 'Analyze Ticket'}</span>
            </>
          )}
        </button>

        {/* Button 2: Summarize */}
        <button
          type="button"
          onClick={() => summarizeMutation.mutate()}
          disabled={summarizeMutation.isPending}
          aria-label="Summarize multi-turn conversation history"
          className={`px-4 py-3 border font-mono text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer ${
            summary
              ? 'bg-[#C9B9A6]/20 border-[#C9B9A6] text-[#DFD5C6] font-bold shadow-[0_4px_16px_rgba(201,185,166,0.15)]'
              : 'bg-[#16161B]/80 border-white/10 hover:border-[#C9B9A6]/50 text-[#F5F5F7]'
          } disabled:opacity-60 disabled:cursor-not-allowed active:scale-[0.98] backdrop-blur-md`}
        >
          {summarizeMutation.isPending ? (
            <>
              <Loader2 className="h-3.5 w-3.5 animate-spin text-[#C9B9A6]" />
              <span>Summarizing...</span>
            </>
          ) : (
            <>
              <FileText className="h-3.5 w-3.5 text-[#C9B9A6]" />
              <span>{summary ? 'Refresh Summary' : 'Summarize Ticket'}</span>
            </>
          )}
        </button>

        {/* Button 3: Generate Draft */}
        <button
          type="button"
          onClick={() => draftMutation.mutate()}
          disabled={draftMutation.isPending}
          aria-label="Generate context-aware reply draft"
          className={`px-4 py-3 border font-mono text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer ${
            draft
              ? 'bg-[#C9B9A6]/20 border-[#C9B9A6] text-[#DFD5C6] font-bold shadow-[0_4px_16px_rgba(201,185,166,0.15)]'
              : 'bg-[#16161B]/80 border-white/10 hover:border-[#C9B9A6]/50 text-[#F5F5F7]'
          } disabled:opacity-60 disabled:cursor-not-allowed active:scale-[0.98] backdrop-blur-md`}
        >
          {draftMutation.isPending ? (
            <>
              <Loader2 className="h-3.5 w-3.5 animate-spin text-[#C9B9A6]" />
              <span>Generating reply...</span>
            </>
          ) : (
            <>
              <MessageSquare className="h-3.5 w-3.5 text-[#C9B9A6]" />
              <span>{draft ? 'Regenerate' : 'Generate Reply'}</span>
            </>
          )}
        </button>
      </div>

      {/* Loading Skeletons */}
      {analyzeMutation.isPending && (
        <div className="p-4 bg-[#16161B]/80 border border-white/10 space-y-3 animate-pulse backdrop-blur-md">
          <div className="flex items-center justify-between">
            <div className="h-4 w-36 bg-white/10" />
            <div className="h-3 w-20 bg-white/5" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            <div className="h-14 bg-white/5" />
            <div className="h-14 bg-white/5" />
            <div className="h-14 bg-white/5" />
          </div>
          <div className="h-10 bg-white/5" />
        </div>
      )}

      {summarizeMutation.isPending && (
        <div className="p-4 sm:p-5 bg-[#16161B]/80 border border-white/10 space-y-3.5 animate-pulse backdrop-blur-md">
          <div className="flex items-center justify-between pb-2 border-b border-white/10">
            <div className="h-4 w-32 bg-white/10" />
            <div className="h-3 w-24 bg-white/5" />
          </div>
          <div className="h-14 bg-white/5" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div className="h-14 bg-white/5" />
            <div className="h-14 bg-white/5" />
          </div>
        </div>
      )}

      {draftMutation.isPending && (
        <div className="p-4 bg-[#16161B]/80 border border-white/10 space-y-3 animate-pulse backdrop-blur-md">
          <div className="flex items-center justify-between">
            <div className="h-4 w-28 bg-white/10" />
            <div className="h-3 w-24 bg-white/5" />
          </div>
          <div className="h-28 bg-white/5" />
          <div className="flex justify-between items-center pt-1">
            <div className="h-3 w-44 bg-white/5" />
            <div className="h-7 w-24 bg-white/10" />
          </div>
        </div>
      )}

      {/* Error Alert State */}
      {(analyzeMutation.isError || summarizeMutation.isError || draftMutation.isError) && (
        <div className="p-4 border border-red-500/30 bg-red-950/40 text-red-300 text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-in fade-in duration-200 font-mono">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-red-400 shrink-0" />
            <span className="font-medium">
              AI service is temporarily unavailable. You can continue replying manually.
            </span>
          </div>
          <button
            type="button"
            onClick={() => {
              analyzeMutation.reset();
              summarizeMutation.reset();
              draftMutation.reset();
            }}
            className="px-3 py-1 bg-[#111114] hover:border-[#C9B9A6] border border-white/15 font-mono text-xs uppercase tracking-wider text-[#F5F5F7] transition-colors self-end sm:self-auto shrink-0 cursor-pointer"
          >
            Retry
          </button>
        </div>
      )}

      {/* 1. Smart Analysis Output Card */}
      {analysis && (
        <div className="p-5 bg-[#16161B]/80 border border-[#C9B9A6]/20 space-y-4 animate-in fade-in slide-in-from-top-1 duration-200 backdrop-blur-md shadow-inner">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold text-[#DFD5C6] flex items-center gap-2 uppercase tracking-wider">
              <Zap className="h-3.5 w-3.5 text-[#C9B9A6]" />
              Ticket Classification &amp; Triage
            </span>
            <span className="font-mono text-[10px] uppercase text-[#9E9EA8]">AI Suggested</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            {/* Category */}
            <div className="p-3.5 bg-[#111114]/90 border border-white/10 space-y-1">
              <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-[#C9B9A6] block">
                Category
              </span>
              <span className="font-mono font-bold text-[#DFD5C6]">{analysis.category}</span>
            </div>

            {/* Suggested Priority */}
            <div className="p-3.5 bg-[#111114]/90 border border-white/10 space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-[#C9B9A6]">
                  Suggested Priority
                </span>
                {onUpdatePriority && ticket.priority !== analysis.suggestedPriority && (
                  <button
                    type="button"
                    onClick={() => onUpdatePriority(analysis.suggestedPriority)}
                    className="font-mono text-[10px] font-bold text-[#C9B9A6] hover:underline cursor-pointer"
                  >
                    Apply →
                  </button>
                )}
              </div>
              <div className="flex items-center gap-1.5">
                <span
                  className={`font-mono text-[10px] font-bold uppercase px-2 py-0.5 border ${getPriorityBadgeColor(
                    analysis.suggestedPriority
                  )}`}
                >
                  {analysis.suggestedPriority}
                </span>
                {ticket.priority === analysis.suggestedPriority && (
                  <span className="font-mono text-[10px] text-emerald-400 font-medium">✓ Matches</span>
                )}
              </div>
            </div>

            {/* Sentiment */}
            <div className="p-3.5 bg-[#111114]/90 border border-white/10 space-y-1">
              <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-[#C9B9A6] block">
                Sentiment
              </span>
              <div className="flex items-center gap-1.5 font-bold text-[#F5F5F7] font-mono">
                {getSentimentIcon(analysis.sentiment)}
                <span className="capitalize">{analysis.sentiment.toLowerCase()}</span>
              </div>
            </div>
          </div>

          {/* Reasoning */}
          <div className="text-xs text-[#9E9EA8] bg-[#111114]/90 p-3.5 border border-white/10 leading-relaxed font-sans">
            <strong className="font-mono font-semibold text-[#DFD5C6]">Reason: </strong>
            {analysis.reason}
          </div>
        </div>
      )}

      {/* 2. Ticket Summary Output Card */}
      {summary && (
        <div className="p-5 bg-[#16161B]/80 border border-[#C9B9A6]/20 space-y-4 animate-in fade-in slide-in-from-top-1 duration-200 backdrop-blur-md shadow-inner">
          <div className="flex items-center justify-between pb-2 border-b border-white/10">
            <span className="text-xs font-mono font-bold text-[#DFD5C6] flex items-center gap-2 uppercase tracking-wider">
              <FileText className="h-4 w-4 text-[#C9B9A6]" />
              Summary
            </span>
            <span className="font-mono text-[10px] uppercase font-bold text-[#DFD5C6] bg-[#C9B9A6]/15 border border-[#C9B9A6]/30 px-2.5 py-0.5">
              Fact-Based • No Hallucinations
            </span>
          </div>

          {/* Main Problem */}
          <div className="p-3.5 bg-[#111114]/90 border border-white/10 space-y-1">
            <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-[#C9B9A6] block">
              1. Customer's Main Problem
            </span>
            <p className="text-xs sm:text-sm font-semibold text-[#F5F5F7] font-sans">
              {summary.mainProblem}
            </p>
          </div>

          {/* Important Context & Actions Taken */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3.5 bg-[#111114]/90 border border-white/10 space-y-1">
              <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-[#9E9EA8] block">
                2. Important Context
              </span>
              <p className="text-xs text-[#9E9EA8] leading-relaxed font-sans">
                {summary.keyContext || 'Initial ticket details provided in description.'}
              </p>
            </div>

            <div className="p-3.5 bg-[#111114]/90 border border-white/10 space-y-1">
              <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-[#9E9EA8] block">
                3. Actions Already Taken
              </span>
              <p className="text-xs text-[#9E9EA8] leading-relaxed font-sans">
                {summary.actionsTaken || 'No support actions logged yet.'}
              </p>
            </div>
          </div>

          {/* Current State & Next Step */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3.5 bg-[#111114]/90 border border-white/10 space-y-1">
              <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-[#9E9EA8] block">
                4. Current State
              </span>
              <p className="text-xs font-semibold text-[#F5F5F7] font-sans">
                {summary.currentState}
              </p>
            </div>

            <div className="p-3.5 bg-[#C9B9A6]/15 border border-[#C9B9A6]/30 space-y-1">
              <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-[#C9B9A6] block">
                5. Suggested Next Step
              </span>
              <p className="text-xs font-bold text-[#DFD5C6] font-sans">
                {summary.suggestedNextStep}
              </p>
            </div>
          </div>

          {/* Summary Overview */}
          <p className="text-xs text-[#9E9EA8] italic bg-[#111114]/90 p-3.5 border border-white/10 leading-relaxed font-sans">
            "{summary.summary}"
          </p>
        </div>
      )}

      {/* 3. AI Draft Reply Output Card */}
      {draft && (
        <div className="p-5 bg-[#16161B]/80 border border-[#C9B9A6]/20 space-y-3.5 animate-in fade-in slide-in-from-top-1 duration-200 backdrop-blur-md shadow-inner">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold text-[#DFD5C6] flex items-center gap-2 uppercase tracking-wider">
              <MessageSquare className="h-3.5 w-3.5 text-[#C9B9A6]" />
              Draft Reply:
            </span>
            <span className="font-mono text-[10px] font-bold uppercase text-amber-300 bg-amber-950/40 border border-amber-800/40 px-2.5 py-0.5">
              ⚠️ Review before sending
            </span>
          </div>

          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            rows={6}
            className="w-full text-xs sm:text-sm bg-[#111114]/90 border border-white/10 p-3.5 text-[#F5F5F7] leading-relaxed focus:outline-none focus:ring-1 focus:ring-[#C9B9A6] font-sans shadow-inner"
            placeholder="Edit draft response here..."
          />

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2 border-t border-white/10">
            <span className="font-mono text-[11px] text-[#9E9EA8]">
              Draft is not sent automatically. Use Draft to place into reply composer.
            </span>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => draftMutation.mutate()}
                disabled={draftMutation.isPending}
                className="px-3.5 py-2 border border-[#C9B9A6]/30 bg-[#111114] hover:border-[#C9B9A6] text-[#F5F5F7] font-mono text-xs uppercase tracking-wider flex items-center gap-1.5 transition-colors disabled:opacity-50 cursor-pointer"
              >
                <RefreshCw className={`h-3.5 w-3.5 text-[#C9B9A6] ${draftMutation.isPending ? 'animate-spin' : ''}`} />
                <span>Regenerate</span>
              </button>

              <button
                type="button"
                onClick={handleCopyDraft}
                className="px-3.5 py-2 border border-[#C9B9A6]/30 bg-[#111114] hover:border-[#C9B9A6] text-[#F5F5F7] font-mono text-xs uppercase tracking-wider flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Copy to clipboard"
              >
                {isCopied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5 text-[#C9B9A6]" />}
                <span>{isCopied ? 'Copied' : 'Copy'}</span>
              </button>

              <button
                type="button"
                onClick={() => onApplyDraft(draft)}
                className="border border-[#C9B9A6] bg-[#C9B9A6] hover:bg-[#DFD5C6] text-[#0A0A0C] font-mono text-xs uppercase tracking-[0.14em] font-bold px-5 py-2 transition-all flex items-center justify-center gap-1.5 shadow-[0_4px_16px_rgba(201,185,166,0.3)] active:scale-95 cursor-pointer"
              >
                <ArrowRight className="h-3.5 w-3.5" />
                <span>Use Draft</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
