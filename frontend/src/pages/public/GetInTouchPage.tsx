import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import confetti from 'canvas-confetti';
import {
  Mail,
  Copy,
  Check,
  Send,
  Star,
  MessageSquareHeart,
  ExternalLink,
  Clock,
  Sparkles,
  CheckCircle2,
  HelpCircle,
  ArrowRight,
} from 'lucide-react';
import { Input } from '../../components/ui/Input';
import { Textarea } from '../../components/ui/Textarea';
import { ScrollReveal } from '../../components/common/ScrollReveal';

const feedbackSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  category: z.enum(['GENERAL', 'FEATURE', 'BUG', 'PRAISE']),
  rating: z.number().min(1, 'Please select a rating').max(5),
  recommend: z.enum(['YES', 'MAYBE', 'NO']),
  message: z.string().min(10, 'Feedback must be at least 10 characters').max(3000, 'Max 3000 characters'),
});

type FeedbackFormData = z.infer<typeof feedbackSchema>;

export function GetInTouchPage() {
  const [isCopied, setIsCopied] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submittedData, setSubmittedData] = useState<FeedbackFormData | null>(null);

  const directEmail = 'adityaa.sharma183@gmail.com';

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FeedbackFormData>({
    resolver: zodResolver(feedbackSchema),
    defaultValues: {
      name: '',
      email: '',
      category: 'GENERAL',
      rating: 5,
      recommend: 'YES',
      message: '',
    },
  });

  const currentRating = watch('rating');
  const currentCategory = watch('category');
  const currentRecommend = watch('recommend');
  const messageText = watch('message') || '';

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(directEmail);
    setIsCopied(true);
    toast.success('Email copied to clipboard!');
    setTimeout(() => setIsCopied(false), 2500);
  };

  const categories = [
    { value: 'GENERAL', label: 'General Experience', desc: 'Overall platform thoughts' },
    { value: 'FEATURE', label: 'Feature Request', desc: 'New capabilities & ideas' },
    { value: 'BUG', label: 'Bug / Issue', desc: 'Something not working' },
    { value: 'PRAISE', label: 'Support Praise', desc: 'Compliment our team' },
  ] as const;

  const ratingDescriptions: Record<number, string> = {
    1: 'Needs significant improvement 😞',
    2: 'Below expectations 😐',
    3: 'Average experience 🙂',
    4: 'Great experience! 😊',
    5: 'Outstanding & exceptional! 🌟',
  };

  const onSubmit = async (data: FeedbackFormData) => {
    await new Promise((resolve) => setTimeout(resolve, 600));
    setSubmittedData(data);
    setIsSubmitted(true);
    try {
      confetti({
        particleCount: 60,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#C9B9A6', '#DFD5C6', '#0A0A0C', '#C25E1A'],
      });
    } catch {}
    toast.success('Thank you! Your feedback has been received.');
  };

  const handleReset = () => {
    reset();
    setIsSubmitted(false);
    setSubmittedData(null);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-12 py-4 text-[#F5F5F7]">
      {/* Sovereign Header */}
      <ScrollReveal direction="up" distance={16}>
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.24em] text-[#C9B9A6] before:h-px before:w-[28px] before:bg-[#C25E1A] before:content-['']">
            <span>03 · DIRECT CONTACT &amp; FEEDBACK</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-5xl font-normal text-[#F5F5F7] tracking-tight">
            How can we <span className="text-[#C9B9A6] italic font-serif">connect?</span>
          </h1>
          <p className="text-xs sm:text-sm text-[#9E9EA8] max-w-lg mx-auto font-sans leading-relaxed">
            Reach out directly with your queries or share your feedback to help us build a faster, more intelligent support platform.
          </p>
        </div>
      </ScrollReveal>

      {/* Direct Contact Banner Card (Dark Beige Travertine Theme) */}
      <ScrollReveal direction="up" distance={18} delay={0.05}>
        <div className="travertine-card p-6 sm:p-10 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.85)] space-y-8 relative overflow-hidden">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-3 max-w-lg">
              <div className="inline-flex items-center gap-2 font-mono text-[10.5px] uppercase tracking-[0.16em] text-[#4A4237] font-bold">
                <Mail className="h-3.5 w-3.5" />
                <span>Direct Queries &amp; Architecture Inquiries</span>
              </div>
              <h2 className="font-serif text-2xl sm:text-3xl font-normal text-[#111113]">
                Any queries? Reach us directly:
              </h2>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-mono text-base sm:text-xl font-bold text-[#F5F5F7] bg-[#111114] border border-[#C9B9A6]/30 px-4 py-1.5 select-all shadow-md">
                  {directEmail}
                </span>
              </div>
              <p className="text-xs text-[#3D372F] font-sans">
                For custom deployments, institution inquiries, or immediate assistance, email us anytime.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-row sm:flex-col gap-3 w-full md:w-auto shrink-0">
              <button
                type="button"
                onClick={handleCopyEmail}
                className="flex-1 sm:flex-none px-6 py-3 border border-[#111114] bg-[#FFFFFF]/80 hover:bg-[#FFFFFF] text-[#111113] font-mono text-xs uppercase tracking-[0.14em] font-bold flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-95 shadow-md"
              >
                {isCopied ? (
                  <>
                    <Check className="h-4 w-4 text-emerald-700" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4 text-[#111113]" />
                    <span>Copy email</span>
                  </>
                )}
              </button>

              <a
                href={`mailto:${directEmail}?subject=XRISEHelpDesk Inquiry`}
                className="flex-1 sm:flex-none"
              >
                <button
                  type="button"
                  className="w-full px-6 py-3 border border-[#111114] bg-[#111114] hover:bg-[#1D1D24] text-[#F5F5F7] font-mono text-xs uppercase tracking-[0.14em] font-bold flex items-center justify-center gap-2 transition-all shadow-md active:scale-95 cursor-pointer"
                >
                  <Mail className="h-4 w-4 text-[#C9B9A6]" />
                  <span>Send Mail</span>
                  <ExternalLink className="h-3 w-3 opacity-60" />
                </button>
              </a>
            </div>
          </div>

          {/* Feature Pill Tags */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 border-t border-[#111113]/20 font-mono text-xs text-[#332E27]">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-[#111113] shrink-0" />
              <span>Response within <strong className="text-[#111113]">2-4 hours</strong></span>
            </div>
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-[#111113] shrink-0" />
              <span>Assisted by <strong className="text-[#111113]">Gemini 3.6</strong> triage</span>
            </div>
            <div className="flex items-center gap-2">
              <HelpCircle className="h-4 w-4 text-[#111113] shrink-0" />
              <span>Direct human engineer review</span>
            </div>
          </div>
        </div>
      </ScrollReveal>

      {/* Interactive Feedback Form Section (Glass Drop Panel) */}
      <ScrollReveal direction="up" distance={18} delay={0.1}>
        <div className="glass-drop-panel p-6 sm:p-10 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.85)] space-y-6">
        <div className="border-b border-[#C9B9A6]/15 pb-5 space-y-1">
          <div className="flex items-center gap-2.5">
            <MessageSquareHeart className="h-5 w-5 text-[#C9B9A6]" />
            <h2 className="font-serif text-2xl sm:text-3xl font-normal text-[#F5F5F7]">
              Share Your Feedback
            </h2>
          </div>
          <p className="text-xs text-[#9E9EA8] font-sans">
            Your insights directly shape our AI reasoning pipeline and support architecture.
          </p>
        </div>

        {isSubmitted ? (
          <div className="py-8 text-center space-y-6 animate-in fade-in zoom-in-95 duration-200">
            <div className="mx-auto h-16 w-16 rounded-sm bg-[#C9B9A6]/15 text-[#C9B9A6] flex items-center justify-center border border-[#C9B9A6]/30 shadow-md">
              <CheckCircle2 className="h-8 w-8 text-[#C9B9A6]" />
            </div>

            <div className="space-y-2 max-w-md mx-auto">
              <h3 className="font-serif text-2xl sm:text-3xl font-normal text-[#F5F5F7]">
                Thank you for your <span className="text-[#C9B9A6] italic font-serif">feedback!</span>
              </h3>
              <p className="text-xs sm:text-sm text-[#9E9EA8] font-sans">
                We have registered your evaluation and ratings. Our engineering team reviews each submission.
              </p>
            </div>

            {submittedData && (
              <div className="p-5 border border-[#C9B9A6]/20 bg-[#16161B]/80 max-w-md mx-auto text-left text-xs space-y-2 font-mono shadow-inner">
                <div className="flex items-center justify-between text-[#F5F5F7] font-semibold">
                  <span>Rating: {'⭐'.repeat(submittedData.rating)}</span>
                  <span className="text-[10px] uppercase font-bold px-2 py-0.5 bg-[#C9B9A6] text-[#0A0A0C] border border-[#C9B9A6]">
                    {submittedData.category}
                  </span>
                </div>
                <p className="text-[#9E9EA8] font-sans italic pt-1">"{submittedData.message}"</p>
              </div>
            )}

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-3">
              <button
                type="button"
                onClick={handleReset}
                className="w-full sm:w-auto px-6 py-3 border border-[#C9B9A6]/30 bg-[#16161B] hover:border-[#C9B9A6] text-[#F5F5F7] font-mono text-xs uppercase tracking-[0.14em] transition-colors cursor-pointer"
              >
                Submit another response
              </button>

              <Link to="/" className="w-full sm:w-auto">
                <button
                  type="button"
                  className="w-full sm:w-auto border border-[#C9B9A6] bg-[#C9B9A6] hover:bg-[#DFD5C6] text-[#0A0A0C] font-mono text-xs uppercase tracking-[0.14em] font-bold px-7 py-3 transition-all flex items-center justify-center gap-2 shadow-[0_4px_16px_rgba(201,185,166,0.3)] cursor-pointer"
                >
                  <span>Back to Home</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
            {/* 1. Rating Stars */}
            <div className="space-y-2">
              <label className="block text-[11px] font-mono uppercase tracking-[0.14em] text-[#C9B9A6]">
                Overall Satisfaction Rating
              </label>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setValue('rating', star, { shouldValidate: true })}
                    className="p-1 text-2xl transition-transform hover:scale-120 focus:outline-none cursor-pointer"
                    title={`${star} star`}
                  >
                    <Star
                      className={`h-7 w-7 transition-colors ${
                        star <= currentRating
                          ? 'fill-[#C9B9A6] text-[#C9B9A6]'
                          : 'text-[#4A4A55] hover:text-[#C9B9A6]/60'
                      }`}
                    />
                  </button>
                ))}
                <span className="font-mono text-xs text-[#DFD5C6] font-semibold ml-2">
                  {ratingDescriptions[currentRating] || ''}
                </span>
              </div>
            </div>

            {/* 2. Category Selector */}
            <div className="space-y-2">
              <label className="block text-[11px] font-mono uppercase tracking-[0.14em] text-[#C9B9A6]">
                Feedback Category
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {categories.map((c) => {
                  const isSelected = currentCategory === c.value;
                  return (
                    <button
                      key={c.value}
                      type="button"
                      onClick={() => setValue('category', c.value, { shouldValidate: true })}
                      className={`p-3.5 border text-left transition-all cursor-pointer ${
                        isSelected
                          ? 'border-[#C9B9A6] bg-[#C9B9A6]/15 text-[#DFD5C6] shadow-sm'
                          : 'border-[#C9B9A6]/20 bg-[#16161B]/80 hover:border-[#C9B9A6]/50 text-[#9E9EA8]'
                      }`}
                    >
                      <div className={`text-xs font-mono font-bold ${isSelected ? 'text-[#C9B9A6]' : 'text-[#F5F5F7]'}`}>
                        {c.label}
                      </div>
                      <div className="text-[10px] text-[#7E7E8A] mt-0.5 font-sans">{c.desc}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 3. Name & Email Inputs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Your Name"
                required
                placeholder="e.g. Maya Chen"
                error={errors.name?.message}
                {...register('name')}
              />

              <Input
                label="Your Email"
                type="email"
                required
                placeholder="e.g. maya@company.com"
                error={errors.email?.message}
                {...register('email')}
              />
            </div>

            {/* 4. Recommendation */}
            <div className="space-y-2">
              <label className="block text-[11px] font-mono uppercase tracking-[0.14em] text-[#C9B9A6]">
                Would you recommend XRISE HelpDesk to other organizations?
              </label>
              <div className="flex items-center gap-3">
                {[
                  { value: 'YES', label: '👍 Yes, absolutely' },
                  { value: 'MAYBE', label: '🤔 Neutral' },
                  { value: 'NO', label: '👎 Not yet' },
                ].map((opt) => {
                  const isSelected = currentRecommend === opt.value;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setValue('recommend', opt.value as any, { shouldValidate: true })}
                      className={`px-4 py-2 border font-mono text-xs uppercase tracking-wider transition-all cursor-pointer ${
                        isSelected
                          ? 'border-[#C9B9A6] bg-[#C9B9A6] text-[#0A0A0C] font-bold shadow-xs'
                          : 'border-[#C9B9A6]/20 bg-[#16161B]/80 hover:border-[#C9B9A6]/50 text-[#9E9EA8]'
                      }`}
                    >
                      {opt.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 5. Message Textarea */}
            <div className="space-y-1.5">
              <Textarea
                label="Your Feedback / Suggestions"
                required
                rows={5}
                placeholder="Tell us what you loved, what felt slow, or what capabilities you'd like to see next..."
                error={errors.message?.message}
                {...register('message')}
              />
              <div className="text-right text-[10px] text-[#70707C] font-mono">
                {messageText.length} / 3000 chars
              </div>
            </div>

            {/* Submit Bar */}
            <div className="pt-4 border-t border-[#C9B9A6]/15 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-3">
              <Link to="/" className="w-full sm:w-auto">
                <button
                  type="button"
                  className="w-full sm:w-auto px-6 py-3 font-mono text-xs uppercase tracking-[0.14em] text-[#9E9EA8] hover:text-[#F5F5F7] text-center transition-colors cursor-pointer"
                >
                  Cancel
                </button>
              </Link>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full sm:w-auto border border-[#C9B9A6] bg-[#C9B9A6] hover:bg-[#DFD5C6] text-[#0A0A0C] font-mono text-xs uppercase tracking-[0.14em] font-bold px-8 py-3.5 transition-all flex items-center justify-center gap-2 shadow-[0_4px_20px_rgba(201,185,166,0.3)] disabled:opacity-50 active:scale-95 cursor-pointer"
              >
                <Send className="h-3.5 w-3.5" />
                {isSubmitting ? 'Submitting...' : 'Submit feedback'}
              </button>
            </div>
          </form>
        )}
      </div>
      </ScrollReveal>
    </div>
  );
}
