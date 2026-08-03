import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, Mail, Lock, User, ArrowRight, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/lib/auth';
import { AuthLayout, AuthHeader } from '@/components/auth/auth-layout';
import { ALL_ROLES, ROLE_LABELS, ROLE_BADGE_CLASS } from '@/lib/permissions';
import type { UserRole } from '@/lib/types';
import { cn } from '@/lib/utils';

const schema = z.object({
  fullName: z.string().min(2, 'Enter your full name'),
  email: z.string().email('Enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type FormValues = z.infer<typeof schema>;

export function RegisterPage() {
  const { signUp } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [submitting, setSubmitting] = useState(false);
  const [selectedRole, setSelectedRole] = useState<UserRole>('student');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const onSubmit = async (values: FormValues) => {
    setSubmitting(true);
    const { error } = await signUp(values.email, values.password, values.fullName, selectedRole);
    setSubmitting(false);
    if (error) {
      toast({ title: 'Sign up failed', description: error, variant: 'destructive' });
      return;
    }
    toast({
      title: 'Account created',
      description: 'Please check your email to verify your account, then sign in.',
    });
    navigate('/verify-email', { state: { email: values.email } });
  };

  return (
    <AuthLayout
      quote="Setting up took minutes. Our teachers, students, and parents all have exactly the access they need — nothing more, nothing less."
      quoteAuthor="IT Director, Oakridge Academy"
    >
      <AuthHeader title="Create your account" description="Join Scholaria to manage your school in one place." />

      <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-4">
        <div className="space-y-2">
          <Label htmlFor="fullName">Full name</Label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input id="fullName" placeholder="Jane Doe" className="pl-9" {...register('fullName')} />
          </div>
          {errors.fullName && <p className="text-xs text-destructive">{errors.fullName.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input id="email" type="email" placeholder="you@school.edu" className="pl-9" {...register('email')} />
          </div>
          {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input id="password" type="password" placeholder="••••••••" className="pl-9" {...register('password')} />
          </div>
          {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
        </div>

        <div className="space-y-2">
          <Label>I am a...</Label>
          <div className="grid grid-cols-3 gap-2">
            {ALL_ROLES.map((role) => (
              <button
                key={role}
                type="button"
                onClick={() => setSelectedRole(role)}
                className={cn(
                  'relative rounded-lg border px-2 py-2 text-xs font-medium transition-all',
                  selectedRole === role
                    ? 'border-primary bg-primary/5 text-primary ring-1 ring-primary'
                    : 'border-border text-muted-foreground hover:border-foreground/20 hover:text-foreground'
                )}
              >
                {selectedRole === role && (
                  <CheckCircle2 className="absolute -right-1 -top-1 h-3.5 w-3.5 text-primary bg-background rounded-full" />
                )}
                {ROLE_LABELS[role]}
              </button>
            ))}
          </div>
          <div className="pt-1">
            <span
              className={cn(
                'inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium',
                ROLE_BADGE_CLASS[selectedRole]
              )}
            >
              {ROLE_LABELS[selectedRole]}
            </span>
          </div>
        </div>

        <Button type="submit" className="w-full" disabled={submitting}>
          {submitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating account...
            </>
          ) : (
            <>
              Create account
              <ArrowRight className="ml-2 h-4 w-4" />
            </>
          )}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Already have an account?{' '}
        <Link to="/login" className="font-medium text-primary hover:underline">
          Sign in
        </Link>
      </p>
    </AuthLayout>
  );
}
