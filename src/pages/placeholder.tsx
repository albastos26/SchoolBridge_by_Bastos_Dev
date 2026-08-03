import { PageHeader } from '@/components/dash';
import { Construction } from 'lucide-react';

export function PlaceholderPage({ title, description }: { title: string; description?: string }) {
  return (
    <div className="animate-fade-in">
      <PageHeader title={title} description={description} breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: title }]} />
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-24 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
          <Construction className="h-7 w-7 text-primary" />
        </div>
        <h2 className="mt-4 text-lg font-semibold">Coming soon</h2>
        <p className="mt-1 max-w-sm text-sm text-muted-foreground">
          This module is part of the foundation. Business features will be built on top of this design system.
        </p>
      </div>
    </div>
  );
}
