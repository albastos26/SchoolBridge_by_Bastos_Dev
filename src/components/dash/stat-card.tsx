import { TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card } from '@/components/ui/card';
import type { StatCardData } from '@/lib/types';

const accentMap = {
  primary: 'bg-primary/10 text-primary',
  success: 'bg-success/10 text-success',
  warning: 'bg-warning/10 text-warning',
  info: 'bg-info/10 text-info',
  destructive: 'bg-destructive/10 text-destructive',
};

export function StatCard({ data, className }: { data: StatCardData; className?: string }) {
  const Icon = data.icon;
  const positive = (data.change ?? 0) >= 0;
  const TrendIcon = positive ? TrendingUp : TrendingDown;
  const accent = data.accent ?? 'primary';

  return (
    <Card className={cn('p-5 card-hover', className)}>
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-sm font-medium text-muted-foreground">{data.label}</p>
          <p className="text-2xl font-semibold tracking-tight">{data.value}</p>
        </div>
        <div className={cn('flex h-11 w-11 items-center justify-center rounded-xl', accentMap[accent])}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
      {data.change !== undefined && (
        <div className="mt-4 flex items-center gap-2 text-xs">
          <span
            className={cn(
              'inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 font-medium',
              positive ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive'
            )}
          >
            <TrendIcon className="h-3 w-3" />
            {positive ? '+' : ''}
            {data.change}%
          </span>
          {data.changeLabel && <span className="text-muted-foreground">{data.changeLabel}</span>}
        </div>
      )}
    </Card>
  );
}
