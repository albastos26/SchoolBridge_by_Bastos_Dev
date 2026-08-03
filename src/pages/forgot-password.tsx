import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, Mail, ArrowLeft, MailCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/lib/auth';
import { AuthLayout, AuthHeader } from '@/components/auth/auth-layout';

const schema = z.object({
  email: z.string().email('Enter a valid email address'),
});

type FormValues = z.infer<typeof schema>;

export function ForgotPasswordPage() {
  const { resetPassword } = useAuth();
  const { toast } = useToast();
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const onSubmit = async (values: FormValues) => {
    setSubmitting(true);
    const { error } = await resetPassword(values.email);
    setSubmitting(false);
    if (error) {
      toast({ title: 'Request failed', description: error, variant: 'destructive' });
      return;
    }
    setSent(true);
    toast({
      title: 'Check your email',
      description: 'We sent a password reset link to your email address.',
    });
  };

  return (
    <AuthLayout
      quote="Scholaria transformed how we manage our school. Everything from attendance to reports is now in one beautiful place."
      quoteAuthor="Principal, Riverside Secondary School"
    >
      <AuthHeader
        title="Forgot password"
        description="Enter your email and we'll send you a link to reset your password."
      />

      {sent ? (
        <div className="mt-8 space-y-4">
          <div className="flex flex-col items-center rounded-lg border bg-success/5 p-6 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-success/10">
              <MailCheck className="h-6 w-6 text-success" />
            </div>
            <h3 className="mt-3 text-sm font-semibold">Email sent</h3>
            <p className="mt-1 text-xs text-muted-foreground">
              Check your inbox for the password reset link. The link expires in 1 hour.
            </p>
          </div>
          <Button asChild variant="outline" className="w-full">
            <Link to="/login">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to sign in
            </Link>
          </Button>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input id="email" type="email" placeholder="you@school.edu" className="pl-9" {...register('email')} />
            </div>
            {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
          </div>

          <Button type="submit" className="w-full" disabled={submitting}>
            {submitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending link...
              </>
            ) : (
              'Send reset link'
            )}
          </Button>
        </form>
      )}

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Remembered your password?{' '}
        <Link to="/login" className="font-medium text-primary hover:underline">
          Sign in
        </Link>
      </p>
    </AuthLayout>
  );
}
