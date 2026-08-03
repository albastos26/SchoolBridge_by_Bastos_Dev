import { SlidersHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { FilterOption } from '@/lib/types';

interface FilterItem {
  key: string;
  label: string;
  options: FilterOption[];
  value?: string;
  onChange: (value: string) => void;
}

interface FiltersProps {
  filters: FilterItem[];
  className?: string;
}

export function Filters({ filters, className }: FiltersProps) {
  if (filters.length === 0) return null;

  return (
    <div className={cn('flex flex-wrap items-center gap-3', className)}>
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <SlidersHorizontal className="h-4 w-4" />
        <span>Filters</span>
      </div>
      {filters.map((f) => (
        <Select key={f.key} value={f.value ?? 'all'} onValueChange={f.onChange}>
          <SelectTrigger className="h-9 w-[160px]">
            <SelectValue placeholder={f.label} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All {f.label}</SelectItem>
            {f.options.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ))}
    </div>
  );
}

export function ClearFiltersButton({ onClick }: { onClick: () => void }) {
  return (
    <Button variant="ghost" size="sm" onClick={onClick} className="text-muted-foreground">
      Clear filters
    </Button>
  );
}
