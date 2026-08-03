import { Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ThemeToggle } from './theme-toggle';
import { CommandPalette } from './command-palette';
import { NotificationCenter } from './notification-center';
import { UserMenu } from './user-menu';

interface HeaderProps {
  onMenuClick: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b bg-background/80 px-4 backdrop-blur-xl lg:px-6">
      <Button
        variant="ghost"
        size="icon"
        className="lg:hidden"
        onClick={onMenuClick}
        aria-label="Open menu"
      >
        <Menu className="h-5 w-5" />
      </Button>

      <div className="flex-1">
        <CommandPalette />
      </div>

      <div className="flex items-center gap-1.5">
        <ThemeToggle />
        <Separator orientation="vertical" className="mx-1 h-6" />
        <NotificationCenter />
        <UserMenu />
      </div>
    </header>
  );
}
