import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { LogIn } from 'lucide-react';
import { loginSchema, LoginFormData } from '../schemas/auth.schemas';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';

interface LoginFormProps {
  onSubmit: (data: LoginFormData) => void | Promise<void>;
  formError?: string | null;
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
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      {formError && (
        <div className="p-3 bg-red-950/40 border border-red-800/50 rounded-lg text-xs font-mono text-red-400">
          {formError}
        </div>
      )}

      <Input
        label="Staff Email"
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
        placeholder="••••••••"
        error={errors.password?.message}
        {...register('password')}
      />

      <Button
        type="submit"
        isLoading={isSubmitting}
        className="w-full mt-2"
      >
        <LogIn className="mr-2 h-4 w-4" />
        <span>Sign In</span>
      </Button>
    </form>
  );
}
