import { useState } from 'react';
import { Upload, Users } from 'lucide-react';
import { PageHeader, ImportDialog, type ImportColumn } from '@/components/dash';
import { Button } from '@/components/ui/button';
import { bulkImportStudents } from '@/lib/academic-hooks';
import { useQueryClient } from '@tanstack/react-query';

const COLUMNS: ImportColumn[] = [
  { key: 'full_name', label: 'full_name', required: true },
  { key: 'email', label: 'email', required: true },
  { key: 'role', label: 'role' },
];

export function ImportStudentsPage() {
  const [open, setOpen] = useState(false);
  const qc = useQueryClient();

  const handleImport = async (rows: Record<string, string>[]) => {
    const result = await bulkImportStudents(rows);
    qc.invalidateQueries({ queryKey: ['students'] });
    qc.invalidateQueries({ queryKey: ['enrollments'] });
    return result;
  };

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Bulk Import Students"
        description="Import multiple students at once using a CSV file."
        breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Import Students' }]}
        action={
          <Button onClick={() => setOpen(true)}>
            <Upload className="mr-2 h-4 w-4" />
            Import CSV
          </Button>
        }
      />

      <div className="rounded-lg border bg-muted/30 p-6">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary/10">
            <Users className="h-6 w-6 text-primary" />
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-semibold">How bulk import works</h3>
            <p className="text-sm text-muted-foreground">
              Upload a CSV file with columns: <code className="rounded bg-muted px-1 py-0.5 text-xs">full_name</code>,{' '}
              <code className="rounded bg-muted px-1 py-0.5 text-xs">email</code>, and optionally{' '}
              <code className="rounded bg-muted px-1 py-0.5 text-xs">role</code> (defaults to "student").
              Each row creates a student account. Download a template to get started.
            </p>
          </div>
        </div>
      </div>

      <ImportDialog
        open={open}
        onOpenChange={setOpen}
        title="Import Students"
        description="Upload a CSV file to bulk-create student accounts."
        columns={COLUMNS}
        onImport={handleImport}
        templateName="students"
      />
    </div>
  );
}
