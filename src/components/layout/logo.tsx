import { Link } from 'react-router-dom';
import { GraduationCap } from 'lucide-react';
import { cn } from '@/lib/utils';

export function Logo({ className, showText = true }: { className?: string; showText?: boolean }) {
  return (
    <Link to="/dashboard" className={cn('flex items-center gap-2.5', className)}>
      <div className="flex h-8 w-8 items-center justify-center rounded-lg gradient-primary">
        <GraduationCap className="h-4.5 w-4.5 text-primary-foreground" />
      </div>
      {showText && (
        <span className="text-base font-semibold tracking-tight">Scholaria</span>
      )}
    </Link>
  );
}
