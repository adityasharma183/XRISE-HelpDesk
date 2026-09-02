import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { LogIn, AlertCircle } from 'lucide-react';
import { loginSchema, LoginFormData } from '../schemas/auth.schemas';
import { Input } from '../../../components/ui/Input';

interface LoginFormProps {
  onSubmit: (data: LoginFormData) => Promise<void>;
  formError?: string | null;
  onFillCredentials?: (email: string, pass: string) => void;
}

export function LoginForm({ onSubmit, formError }: LoginFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
      {formError && (
        <div role="alert" className="p-4 border border-red-500/30 bg-red-950/40 text-red-300 text-xs flex items-center gap-2.5 font-mono">
          <AlertCircle className="h-4 w-4 shrink-0 text-red-400" />
          <span>{formError}</span>
        </div>
      )}

      <Input
        label="Staff email"
        type="email"
        required
        placeholder="e.g. agent1@xriseai.com"
        error={errors.email?.message}
        {...register('email')}
      />

      <Input
        label="Password"
        type="password"
        required
        placeholder="••••••••••••"
        error={errors.password?.message}
        {...register('password')}
      />

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full border border-[#C9B9A6] bg-[#C9B9A6] hover:bg-[#DFD5C6] text-[#0A0A0C] font-mono text-xs uppercase tracking-[0.14em] font-bold px-6 py-3.5 transition-all flex items-center justify-center gap-2 disabled:opacity-50 shadow-[0_4px_20px_rgba(201,185,166,0.3)] active:scale-[0.98] cursor-pointer"
      >
        <LogIn className="h-4 w-4" />
        {isSubmitting ? 'Signing in...' : 'Sign in to workspace'}
      </button>
    </form>
  );
}
