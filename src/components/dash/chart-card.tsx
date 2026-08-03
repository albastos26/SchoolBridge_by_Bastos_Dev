import { cn } from '@/lib/utils';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';

interface ChartCardProps {
  title?: string;
  description?: string;
  className?: string;
  children?: React.ReactNode;
  action?: React.ReactNode;
}

export function ChartCard({ title, description, className, children, action }: ChartCardProps) {
  return (
    <Card className={cn('card-hover', className)}>
      {(title || action) && (
        <CardHeader className="flex flex-row items-start justify-between space-y-0">
          <div className="space-y-1">
            {title && <CardTitle className="text-base">{title}</CardTitle>}
            {description && <CardDescription>{description}</CardDescription>}
          </div>
          {action}
        </CardHeader>
      )}
      <CardContent className="pt-2">{children}</CardContent>
    </Card>
  );
}
