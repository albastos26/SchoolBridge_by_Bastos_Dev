import type { ReactNode } from 'react';
import { Logo } from '@/components/layout/logo';
import { ThemeToggle } from '@/components/layout/theme-toggle';

interface AuthLayoutProps {
  children: ReactNode;
  quote?: string;
  quoteAuthor?: string;
}

export function AuthLayout({ children, quote, quoteAuthor }: AuthLayoutProps) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="relative flex flex-col justify-center px-6 py-12 lg:px-16">
        <div className="absolute right-6 top-6">
          <ThemeToggle />
        </div>
        <div className="mx-auto w-full max-w-sm">{children}</div>
      </div>

      <div className="relative hidden overflow-hidden gradient-primary lg:block">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.15),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(255,255,255,0.1),transparent_50%)]" />
        <div className="relative flex h-full flex-col justify-end p-16 text-primary-foreground">
          {quote && (
            <blockquote className="space-y-4">
              <p className="text-xl font-medium leading-relaxed">"{quote}"</p>
              {quoteAuthor && <footer className="text-sm opacity-90">— {quoteAuthor}</footer>}
            </blockquote>
          )}
        </div>
      </div>
    </div>
  );
}

export function AuthHeader({ title, description }: { title: string; description: string }) {
  return (
    <>
      <Logo />
      <div className="mt-10 space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
    </>
  );
}
