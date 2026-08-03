import { useState, useRef } from 'react';
import { Upload, FileSpreadsheet, Download, Loader2, CheckCircle2, AlertCircle, X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export interface ImportColumn {
  key: string;
  label: string;
  required?: boolean;
}

interface ImportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  columns: ImportColumn[];
  onImport: (rows: Record<string, string>[]) => Promise<{ success: number; errors: { row: number; message: string }[] }>;
  templateName?: string;
}

function parseCSV(text: string): string[][] {
  const rows: string[][] = [];
  let current: string[] = [];
  let field = '';
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (inQuotes) {
      if (char === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        field += char;
      }
    } else {
      if (char === '"') {
        inQuotes = true;
      } else if (char === ',') {
        current.push(field);
        field = '';
      } else if (char === '\n') {
        current.push(field);
        rows.push(current);
        current = [];
        field = '';
      } else if (char !== '\r') {
        field += char;
      }
    }
  }
  if (field || current.length > 0) {
    current.push(field);
    rows.push(current);
  }
  return rows;
}

function downloadTemplate(columns: ImportColumn[], name: string) {
  const header = columns.map((c) => c.label).join(',');
  const sampleRow = columns.map((c) => c.required ? `Sample_${c.key}` : '').join(',');
  const csv = `${header}\n${sampleRow}`;
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${name}_template.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export function ImportDialog({
  open,
  onOpenChange,
  title,
  description,
  columns,
  onImport,
  templateName = 'import',
}: ImportDialogProps) {
  const [file, setFile] = useState<File | null>(null);
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<{ success: number; errors: { row: number; message: string }[] } | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const reset = () => {
    setFile(null);
    setResult(null);
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) reset();
    onOpenChange(open);
  };

  const handleFile = (f: File) => {
    if (!f.name.endsWith('.csv')) return;
    setFile(f);
    setResult(null);
  };

  const handleProcess = async () => {
    if (!file) return;
    setProcessing(true);
    try {
      const text = await file.text();
      const rows = parseCSV(text);
      if (rows.length < 2) {
        setResult({ success: 0, errors: [{ row: 0, message: 'File must contain a header row and at least one data row' }] });
        setProcessing(false);
        return;
      }
      const header = rows[0].map((h) => h.trim().toLowerCase());
      const dataRows: Record<string, string>[] = [];
      for (let i = 1; i < rows.length; i++) {
        const row = rows[i];
        if (row.length === 1 && row[0] === '') continue;
        const obj: Record<string, string> = {};
        columns.forEach((col, idx) => {
          const headerIdx = header.findIndex((h) => h === col.label.toLowerCase() || h === col.key.toLowerCase());
          if (headerIdx >= 0) {
            obj[col.key] = row[headerIdx]?.trim() ?? '';
          } else if (idx < row.length) {
            obj[col.key] = row[idx]?.trim() ?? '';
          } else {
            obj[col.key] = '';
          }
        });
        dataRows.push(obj);
      }
      const res = await onImport(dataRows);
      setResult(res);
    } catch {
      setResult({ success: 0, errors: [{ row: 0, message: 'Failed to parse file' }] });
    } finally {
      setProcessing(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>

        {!result ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between rounded-lg border bg-muted/30 p-3">
              <div className="flex items-center gap-2 text-sm">
                <FileSpreadsheet className="h-4 w-4 text-muted-foreground" />
                <span>Required columns: {columns.map((c) => c.label).join(', ')}</span>
              </div>
            </div>

            <button
              onClick={() => downloadTemplate(columns, templateName)}
              className="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed p-3 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            >
              <Download className="h-4 w-4" />
              Download CSV template
            </button>

            <div
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragOver(false);
                const f = e.dataTransfer.files[0];
                if (f) handleFile(f);
              }}
              onClick={() => fileInputRef.current?.click()}
              className={cn(
                'flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 text-center transition-colors cursor-pointer',
                dragOver ? 'border-primary bg-primary/5' : 'border-border hover:border-foreground/20'
              )}
            >
              {file ? (
                <div className="flex items-center gap-2 text-sm">
                  <FileSpreadsheet className="h-5 w-5 text-success" />
                  <span className="font-medium">{file.name}</span>
                  <button
                    onClick={(e) => { e.stopPropagation(); setFile(null); }}
                    className="ml-2 text-muted-foreground hover:text-foreground"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <>
                  <Upload className="h-8 w-8 text-muted-foreground/50" />
                  <p className="mt-2 text-sm font-medium">Drop CSV file here or click to browse</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">CSV files only, max 5MB</p>
                </>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) handleFile(f);
                }}
              />
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className={cn(
              'flex items-center gap-3 rounded-lg border p-4',
              result.errors.length === 0 ? 'border-success/20 bg-success/5' : 'border-warning/20 bg-warning/5'
            )}>
              {result.errors.length === 0 ? (
                <CheckCircle2 className="h-5 w-5 text-success" />
              ) : (
                <AlertCircle className="h-5 w-5 text-warning" />
              )}
              <div className="text-sm">
                <p className="font-medium">
                  {result.success} record{result.success !== 1 ? 's' : ''} imported successfully
                </p>
                {result.errors.length > 0 && (
                  <p className="text-muted-foreground">{result.errors.length} error{result.errors.length !== 1 ? 's' : ''} found</p>
                )}
              </div>
            </div>

            {result.errors.length > 0 && (
              <div className="max-h-48 space-y-1.5 overflow-y-auto scrollbar-thin">
                {result.errors.map((err, i) => (
                  <div key={i} className="flex items-start gap-2 rounded-md border bg-destructive/5 p-2 text-xs">
                    <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-destructive" />
                    <div>
                      <span className="font-medium">Row {err.row}:</span> {err.message}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <DialogFooter>
          {result ? (
            <Button onClick={() => handleOpenChange(false)} className="w-full">Done</Button>
          ) : (
            <>
              <Button variant="outline" onClick={() => handleOpenChange(false)} disabled={processing}>
                Cancel
              </Button>
              <Button onClick={handleProcess} disabled={!file || processing}>
                {processing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Importing...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    Import
                  </>
                )}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
