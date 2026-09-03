import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useAuthStore, LoginForm, LoginFormData } from '../../features/auth';

export function LoginPage() {
  const { login, error } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [formError, setFormError] = useState<string | null>(null);

  const from = (location.state as any)?.from?.pathname || '/agent/dashboard';

  const onSubmit = async (formData: LoginFormData) => {
    setFormError(null);
    try {
      await login(formData);
      navigate(from, { replace: true });
    } catch (err: any) {
      setFormError(err.message || 'Invalid email or password');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#0A0A0C] text-[#F5F5F7] font-sans antialiased selection:bg-[#C9B9A6] selection:text-[#0A0A0C]">
      <div className="w-full max-w-sm space-y-6">
        {/* Back Link */}
        <Link
          to="/"
          className="inline-flex items-center font-mono text-xs uppercase tracking-[0.14em] text-[#9E9EA8] hover:text-[#DFD5C6] transition-colors"
        >
          <ArrowLeft className="mr-2 h-3.5 w-3.5 text-[#C9B9A6]" />
          Back to Public Portal
        </Link>

        <div className="glass-drop-panel p-8 sm:p-10 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.85)] space-y-6">
          {/* Logo & Heading */}
          <div className="text-center space-y-2">
            <div className="mx-auto h-10 w-10 rounded-sm bg-gradient-to-br from-[#DFD5C6] via-[#C9B9A6] to-[#A89680] text-[#0A0A0C] flex items-center justify-center font-bold text-sm mb-3 shadow-[0_4px_16px_rgba(201,185,166,0.3)]">
              <span className="font-mono text-xs font-black">XR</span>
            </div>
            <h1 className="font-serif text-2xl sm:text-3xl font-normal text-[#F5F5F7] tracking-tight">
              Mission Control <span className="text-[#C9B9A6] italic font-serif">Access</span>
            </h1>
            <p className="text-xs text-[#9E9EA8] font-sans">
              Sign in to manage assigned queues, AI reasoning &amp; triage.
            </p>
          </div>

          <LoginForm onSubmit={onSubmit} formError={formError || error} />
        </div>
      </div>
    </div>
  );
}
