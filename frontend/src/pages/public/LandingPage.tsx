import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Search, ArrowRight, Mail } from 'lucide-react';
import { ScrollReveal } from '../../components/common/ScrollReveal';
import { ScrollStaggerContainer, ScrollStaggerItem } from '../../components/common/ScrollStagger';
import { EvaluationAccess } from '../../features/public-portal';

export function LandingPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/check-status?q=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate('/submit-ticket');
    }
  };

  const capabilities = [
    {
      num: '01',
      title: 'Agentic AI Triage',
      desc: 'Multi-step autonomous agents powered by Gemini 3.6 that classify intent, assess customer sentiment, and draft replies instantly.',
      tag: 'Autonomous Support',
      link: '/submit-ticket',
    },
    {
      num: '02',
      title: 'Mission Control & SLAs',
      desc: 'Live telemetry tracking with real-time resolution stages, verified email lookup, and enterprise sub-15 minute response guarantees.',
      tag: 'Real-Time Telemetry',
      link: '/check-status',
    },
    {
      num: '03',
      title: 'Sovereign RBAC Architecture',
      desc: 'Database-isolated role access control ensuring Agents only see assigned records, while Administrators maintain global oversight.',
      tag: 'Data Sovereignty',
      link: '/login',
    },
  ];

  return (
    <div className="space-y-24 py-4 text-[#F5F5F7]">
      {/* 1. Black & Dark Beige Hero Section (Matching Screenshot) */}
      <section className="relative pt-6 pb-12 sm:pb-16 border-b border-[#C9B9A6]/15">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Hero Text */}
          <ScrollReveal direction="up" distance={20} duration={0.6} className="lg:col-span-7 space-y-7">
            {/* Eyebrow with copper dash */}
            <div className="inline-flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.24em] text-[#C9B9A6]">
              <span className="h-px w-8 bg-[#C25E1A]" />
              <span>THE FIRM · SOVEREIGN AI SYSTEMS</span>
            </div>

            {/* Headline */}
            <div className="space-y-3">
              <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-normal leading-[1.08] tracking-tight text-[#F5F5F7]">
                Building intelligent systems. <br />
                <span className="text-[#C9B9A6] italic font-serif">Empowering next generation.</span>
              </h1>
              <p className="text-sm sm:text-base text-[#9E9EA8] max-w-xl font-sans leading-relaxed pt-1">
                We engineer secure, scalable AI support infrastructure across automated ticket intelligence, deterministic knowledge retrieval, and human-in-the-loop governance.
              </p>
            </div>

            {/* Action CTAs with Glass Drop Effect */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
              <Link to="/submit-ticket">
                <button
                  type="button"
                  className="w-full sm:w-auto border border-[#C9B9A6] bg-[#C9B9A6] hover:bg-[#DFD5C6] text-[#0A0A0C] font-mono text-xs uppercase tracking-[0.14em] font-bold px-8 py-3.5 rounded-sm transition-all duration-300 shadow-[0_4px_20px_rgba(201,185,166,0.3)] flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                >
                  <Plus className="h-4 w-4" />
                  <span>Submit a Request</span>
                </button>
              </Link>

              <Link to="/check-status">
                <button
                  type="button"
                  className="w-full sm:w-auto border border-[#C9B9A6]/30 bg-[#16161B]/80 hover:border-[#C9B9A6] hover:bg-[#C9B9A6]/10 text-[#F5F5F7] font-mono text-xs uppercase tracking-[0.14em] px-7 py-3.5 rounded-sm backdrop-blur-md transition-all duration-300 shadow-[0_10px_30px_-5px_rgba(0,0,0,0.6)] flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Search className="h-4 w-4 text-[#C9B9A6]" />
                  <span>Track Ticket Status</span>
                </button>
              </Link>

              <Link to="/get-in-touch">
                <button
                  type="button"
                  className="w-full sm:w-auto border border-white/10 bg-white/[0.02] hover:border-[#C9B9A6]/50 hover:bg-white/[0.05] text-[#9E9EA8] hover:text-[#F5F5F7] font-mono text-xs uppercase tracking-[0.14em] px-6 py-3.5 rounded-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Mail className="h-4 w-4 text-[#C9B9A6]" />
                  <span>Direct Contact</span>
                </button>
              </Link>
            </div>

            {/* Integrated Search Box with Glass Drop */}
            <form onSubmit={handleSearchSubmit} className="pt-2 max-w-xl">
              <div className="relative flex items-center border border-[#C9B9A6]/25 bg-[#111114]/90 p-1.5 rounded-sm shadow-[0_12px_32px_rgba(0,0,0,0.6),inset_0_1px_1px_rgba(255,255,255,0.06)] backdrop-blur-xl focus-within:border-[#C9B9A6] transition-all">
                <Search className="h-5 w-5 text-[#C9B9A6] ml-3 shrink-0" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search telemetry ID (e.g. XR-9A2K4B) or knowledge base..."
                  className="w-full bg-transparent px-3.5 py-2.5 text-xs sm:text-sm text-[#F5F5F7] placeholder:text-[#6E6E78] focus:outline-none font-sans"
                />
                <button
                  type="submit"
                  className="border border-[#C9B9A6] bg-[#C9B9A6] text-[#0A0A0C] font-mono text-xs uppercase tracking-[0.14em] font-bold px-5 py-2.5 rounded-xs transition-all shrink-0 hover:bg-[#DFD5C6] shadow-[0_2px_12px_rgba(201,185,166,0.25)] cursor-pointer"
                >
                  Lookup
                </button>
              </div>

              {/* Quick Chips */}
              <div className="flex items-center gap-2 pt-2.5 flex-wrap font-mono text-xs text-[#9E9EA8]">
                <span className="text-[10.5px] uppercase tracking-wider text-[#70707C]">Frequent Inquiries:</span>
                {['XR-9A2K4B', 'XR-5H1L8Z', 'Billing Dispute', 'SSO Setup'].map((pill) => (
                  <button
                    key={pill}
                    type="button"
                    onClick={() => setSearchQuery(pill)}
                    className="px-2.5 py-0.5 border border-[#C9B9A6]/20 bg-[#16161B] hover:border-[#C9B9A6] hover:text-[#DFD5C6] text-[#C9B9A6] text-[11px] rounded-xs transition-colors cursor-pointer"
                  >
                    {pill}
                  </button>
                ))}
              </div>
            </form>
          </ScrollReveal>

          {/* Right Column: Hero Dark Beige Travertine Stone Card (Exact Visual from Screenshot) */}
          <ScrollReveal direction="up" distance={24} delay={0.15} duration={0.65} className="lg:col-span-5 flex justify-center">
            <div className="w-full max-w-[420px] aspect-square rounded-sm p-8 sm:p-10 flex flex-col items-center justify-center text-center relative overflow-hidden travertine-card group transition-transform duration-500 hover:scale-[1.01]">
              {/* Subtle ambient lighting layer */}
              <div className="absolute inset-0 bg-gradient-to-tr from-black/10 via-transparent to-white/20 pointer-events-none" />

              {/* Embossed Luxury Monogram / Title */}
              <div className="space-y-4 relative z-10 select-none">
                <div className="mx-auto h-16 w-16 rounded-xs bg-[#111113] text-[#DFD5C6] flex items-center justify-center font-mono font-black text-2xl shadow-[0_15px_35px_rgba(0,0,0,0.5),inset_0_1px_2px_rgba(255,255,255,0.2)]">
                  XR
                </div>
                <div className="space-y-1">
                  <h2 className="font-serif text-3xl sm:text-4xl font-normal tracking-tight text-[#111113] drop-shadow-[0_2px_4px_rgba(0,0,0,0.15)]">
                    XRISE
                  </h2>
                  <div className="font-mono text-xs uppercase tracking-[0.26em] text-[#332E27] font-semibold">
                    AI SYSTEMS INDIA
                  </div>
                </div>
                <div className="pt-2 border-t border-[#111113]/20 flex items-center justify-center gap-2 font-mono text-[10px] uppercase tracking-widest text-[#4A4237]">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#111113] animate-pulse" />
                  <span>Sovereign Support Node</span>
                </div>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* 2. Live Telemetry Metric Bar (Staggered Entrance) */}
      <ScrollStaggerContainer staggerChildren={0.07} className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'SOVEREIGN CAPABILITIES', value: '12', unit: 'Autonomous' },
          { label: 'DISPATCH RESPONSE SLA', value: '< 15', unit: 'Minutes' },
          { label: 'TRIAGE ACCURACY', value: '99.8', unit: '%' },
          { label: 'AI REASONING CORE', value: '24/7', unit: 'Gemini 3.6' },
        ].map((m, idx) => (
          <ScrollStaggerItem key={idx}>
            <div className="glass-drop-card p-6 sm:p-7 space-y-2">
              <span className="font-mono text-[10px] sm:text-[10.5px] uppercase tracking-[0.2em] text-[#C9B9A6]/80 block">
                {m.label}
              </span>
              <div className="font-mono text-3xl sm:text-4xl font-bold tracking-tight text-[#F5F5F7] flex items-baseline gap-1.5">
                <span>{m.value}</span>
                <span className="text-xs sm:text-sm font-normal text-[#C9B9A6] font-sans">{m.unit}</span>
              </div>
            </div>
          </ScrollStaggerItem>
        ))}
      </ScrollStaggerContainer>

      {/* 3. Section 01: Core Architecture Pillars */}
      <section className="space-y-8">
        <ScrollReveal direction="up" distance={16} className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 border-b border-[#C9B9A6]/15">
          <div className="space-y-2">
            <div className="font-mono text-[11px] uppercase tracking-[0.24em] text-[#C9B9A6] flex items-center gap-2">
              <span className="h-px w-6 bg-[#C25E1A]" />
              <span>01 · ARCHITECTURE</span>
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl font-normal text-[#F5F5F7] tracking-tight">
              Sovereign Pillars of the Platform
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-[#9E9EA8] max-w-md font-sans leading-relaxed">
            Enterprise-grade reliability without external vendor dependencies. Fully private, deterministic, and auditable.
          </p>
        </ScrollReveal>

        <ScrollStaggerContainer staggerChildren={0.09} className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {capabilities.map((cap) => (
            <ScrollStaggerItem key={cap.num}>
              <Link to={cap.link} className="group block h-full">
                <div className="glass-drop-card p-8 h-full flex flex-col justify-between">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between font-mono text-xs text-[#9E9EA8]">
                      <span className="text-sm font-bold text-[#C9B9A6]">{cap.num}</span>
                      <span className="text-[10px] uppercase tracking-[0.16em] px-2.5 py-0.5 border border-[#C9B9A6]/25 bg-[#C9B9A6]/[0.06] text-[#DFD5C6]">
                        {cap.tag}
                      </span>
                    </div>
                    <h3 className="font-serif text-2xl font-normal text-[#F5F5F7] group-hover:text-[#C9B9A6] transition-colors">
                      {cap.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-[#9E9EA8] font-sans leading-relaxed">
                      {cap.desc}
                    </p>
                  </div>

                  <div className="pt-6 mt-6 border-t border-white/[0.08] flex items-center justify-between text-xs font-mono uppercase tracking-[0.14em] text-[#C9B9A6] group-hover:text-[#DFD5C6]">
                    <span>Explore capability</span>
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </div>
                </div>
              </Link>
            </ScrollStaggerItem>
          ))}
        </ScrollStaggerContainer>
      </section>


      {/* 5. Section 03: Direct Inquiries Banner (Dark Beige Travertine Stone Theme) */}
      <ScrollReveal direction="up" distance={20}>
        <section className="travertine-card p-8 sm:p-12 shadow-[0_30px_70px_-15px_rgba(0,0,0,0.85)] space-y-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
            <div className="space-y-3 max-w-xl">
              <div className="inline-flex items-center gap-2 font-mono text-[10.5px] uppercase tracking-[0.18em] text-[#4A4237] font-bold">
                <Mail className="h-3.5 w-3.5" />
                <span>Direct Queries &amp; Architecture Inquiries</span>
              </div>
              <h3 className="font-serif text-2xl sm:text-4xl font-normal text-[#111113]">
                Any queries? Reach us directly at:
              </h3>
              <div className="flex items-center gap-3 flex-wrap">
                <span className="font-mono text-lg sm:text-2xl font-bold text-[#F5F5F7] bg-[#111114] px-4 py-1.5 select-all shadow-[0_10px_25px_rgba(0,0,0,0.5)] border border-[#C9B9A6]/30">
                  adityaa.sharma183@gmail.com
                </span>
              </div>
              <p className="text-xs text-[#3D372F] font-sans">
                Have suggestions or custom integration requirements? Share your feedback through our dedicated response portal.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto shrink-0">
              <Link to="/get-in-touch" className="w-full sm:w-auto">
                <button
                  type="button"
                  className="w-full border border-[#111114] bg-[#111114] hover:bg-[#1D1D24] text-[#F5F5F7] font-mono text-xs uppercase tracking-[0.14em] font-bold px-7 py-4 rounded-sm transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Mail className="h-4 w-4 text-[#C9B9A6]" />
                  <span>Contact &amp; Feedback Form</span>
                </button>
              </Link>
            </div>
          </div>
        </section>
      </ScrollReveal>

      {/* 6. Section 04: Evaluation Access */}
      <ScrollReveal direction="up" distance={18}>
        <EvaluationAccess />
      </ScrollReveal>
    </div>
  );
}
