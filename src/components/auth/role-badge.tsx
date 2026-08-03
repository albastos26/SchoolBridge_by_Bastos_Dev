import { cn } from '@/lib/utils';
import { ROLE_LABELS, ROLE_BADGE_CLASS } from '@/lib/permissions';
import type { UserRole } from '@/lib/types';

interface RoleBadgeProps {
  role: UserRole;
  className?: string;
}

export function RoleBadge({ role, className }: RoleBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium',
        ROLE_BADGE_CLASS[role],
        className
      )}
    >
      {ROLE_LABELS[role]}
    </span>
  );
}
