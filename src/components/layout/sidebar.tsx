import { NavLink } from 'react-router-dom';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { NAV_SECTIONS, filterNavByRole } from '@/lib/navigation';
import { useAuth } from '@/lib/auth';
import { Logo } from './logo';

interface SidebarProps {
  onNavigate?: () => void;
  className?: string;
}

export function Sidebar({ onNavigate, className }: SidebarProps) {
  const { profile } = useAuth();
  const sections = filterNavByRole(NAV_SECTIONS, profile?.role ?? 'student');

  return (
    <div className={cn('flex h-full flex-col bg-sidebar', className)}>
      <div className="flex h-16 items-center justify-between px-5">
        <Logo />
        {onNavigate && (
          <Button variant="ghost" size="icon" className="lg:hidden" onClick={onNavigate}>
            <X className="h-5 w-5" />
          </Button>
        )}
      </div>

      <ScrollArea className="flex-1 px-3">
        <nav className="space-y-6 py-4">
          {sections.map((section) => (
            <div key={section.title}>
              <p className="px-3 pb-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground/70">
                {section.title}
              </p>
              <div className="space-y-0.5">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  return (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      onClick={onNavigate}
                      className={({ isActive }) =>
                        cn('sidebar-item', isActive && 'sidebar-item-active')
                      }
                    >
                      <Icon className="h-4 w-4 shrink-0" />
                      <span>{item.label}</span>
                      {item.badge && (
                        <span className="ml-auto rounded-full bg-primary/10 px-1.5 py-0.5 text-xs font-medium text-primary">
                          {item.badge}
                        </span>
                      )}
                    </NavLink>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
      </ScrollArea>

      <div className="border-t border-sidebar-border p-4">
        <div className="rounded-lg bg-gradient-to-br from-primary/10 to-info/5 p-3">
          <p className="text-xs font-medium text-foreground">Scholaria v1.0</p>
          <p className="mt-0.5 text-xs text-muted-foreground">School Management System</p>
        </div>
      </div>
    </div>
  );
}
