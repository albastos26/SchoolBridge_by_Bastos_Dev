import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { MailCheck, Loader2, ArrowLeft, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/lib/auth';
import { AuthLayout, AuthHeader } from '@/components/auth/auth-layout';

export function VerifyEmailPage() {
  const { resendVerification } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [resending, setResending] = useState(false);

  const email = (location.state as { email?: string })?.email ?? '';

  const handleResend = async () => {
    if (!email) {
      toast({ title: 'Cannot resend', description: 'No email address on file.', variant: 'destructive' });
      return;
    }
    setResending(true);
    const { error } = await resendVerification(email);
    setResending(false);
    if (error) {
      toast({ title: 'Resend failed', description: error, variant: 'destructive' });
      return;
    }
    toast({ title: 'Email sent', description: 'A new verification link has been sent.' });
  };

  return (
    <AuthLayout
      quote="Setting up took minutes. Our teachers, students, and parents all have exactly the access they need."
      quoteAuthor="IT Director, Oakridge Academy"
    >
      <AuthHeader title="Verify your email" description="We sent a verification link to confirm your account." />

      <div className="mt-8 space-y-4">
        <div className="flex flex-col items-center rounded-lg border bg-info/5 p-6 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-info/10">
            <MailCheck className="h-6 w-6 text-info" />
          </div>
          <h3 className="mt-3 text-sm font-semibold">Check your inbox</h3>
          {email ? (
            <p className="mt-1 text-xs text-muted-foreground">
              We sent a verification link to <span className="font-medium text-foreground">{email}</span>.
              Click the link in the email to verify your account.
            </p>
          ) : (
            <p className="mt-1 text-xs text-muted-foreground">
              Click the link in the email we sent you to verify your account.
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Button
            variant="outline"
            className="w-full"
            onClick={handleResend}
            disabled={resending || !email}
          >
            {resending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Resending...
              </>
            ) : (
              <>
                <RefreshCw className="mr-2 h-4 w-4" />
                Resend verification email
              </>
            )}
          </Button>

          <Button asChild variant="ghost" className="w-full" onClick={() => navigate('/login')}>
            <Link to="/login">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to sign in
            </Link>
          </Button>
        </div>

        <p className="text-center text-xs text-muted-foreground">
          Already verified?{' '}
          <Link to="/login" className="font-medium text-primary hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
}
