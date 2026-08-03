import { useState, type ReactNode } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';

export type FieldType = 'text' | 'number' | 'date' | 'select' | 'textarea' | 'switch';

export interface FormFieldDef {
  name: string;
  label: string;
  type: FieldType;
  placeholder?: string;
  options?: { label: string; value: string }[];
  required?: boolean;
  defaultValue?: string | number | boolean | null;
  min?: number;
  max?: number;
  helpText?: string;
}

interface FormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  fields: FormFieldDef[];
  onSubmit: (values: Record<string, unknown>) => Promise<void>;
  submitLabel?: string;
}

function buildSchema(fields: FormFieldDef[]) {
  const shape: Record<string, z.ZodTypeAny> = {};
  for (const f of fields) {
    let fieldSchema: z.ZodTypeAny;
    if (f.type === 'number') {
      let s = z.coerce.number();
      if (f.min != null) s = s.min(f.min);
      if (f.max != null) s = s.max(f.max);
      fieldSchema = f.required ? s : z.coerce.number().optional();
    } else if (f.type === 'switch') {
      fieldSchema = z.boolean().optional();
    } else if (f.type === 'date') {
      fieldSchema = f.required ? z.string().min(1, `${f.label} is required`) : z.string().optional();
    } else if (f.type === 'select') {
      fieldSchema = f.required ? z.string().min(1, `${f.label} is required`) : z.string().optional();
    } else {
      fieldSchema = f.required ? z.string().min(1, `${f.label} is required`) : z.string().optional();
    }
    shape[f.name] = fieldSchema;
  }
  return z.object(shape);
}

function buildDefaults(fields: FormFieldDef[]) {
  const defaults: Record<string, unknown> = {};
  for (const f of fields) {
    if (f.type === 'switch') {
      defaults[f.name] = (f.defaultValue as boolean) ?? false;
    } else if (f.type === 'number') {
      defaults[f.name] = (f.defaultValue as number) ?? '';
    } else {
      defaults[f.name] = (f.defaultValue as string) ?? '';
    }
  }
  return defaults;
}

export function FormDialog({
  open,
  onOpenChange,
  title,
  description,
  fields,
  onSubmit,
  submitLabel = 'Save',
}: FormDialogProps) {
  const [submitting, setSubmitting] = useState(false);

  const schema = buildSchema(fields);
  const defaults = buildDefaults(fields);

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: defaults,
  });

  const handleOpenChange = (open: boolean) => {
    if (!open) reset(buildDefaults(fields));
    onOpenChange(open);
  };

  const handleFormSubmit = async (values: Record<string, unknown>) => {
    setSubmitting(true);
    try {
      const processed: Record<string, unknown> = { ...values };
      for (const f of fields) {
        if (f.type === 'select' && processed[f.name] === '') {
          processed[f.name] = null;
        }
      }
      await onSubmit(processed);
      onOpenChange(false);
      reset(buildDefaults(fields));
    } finally {
      setSubmitting(false);
    }
  };

  const renderField = (field: FormFieldDef): ReactNode => {
    if (field.type === 'select') {
      return (
        <Controller
          control={control}
          name={field.name}
          render={({ field: f }) => (
            <Select value={(f.value as string) ?? ''} onValueChange={f.onChange}>
              <SelectTrigger>
                <SelectValue placeholder={field.placeholder ?? 'Select...'} />
              </SelectTrigger>
              <SelectContent>
                {field.options?.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
      );
    }

    if (field.type === 'switch') {
      return (
        <Controller
          control={control}
          name={field.name}
          render={({ field: f }) => (
            <div className="flex items-center gap-3 pt-2">
              <Switch checked={f.value as boolean} onCheckedChange={f.onChange} />
              <span className="text-sm text-muted-foreground">
                {(f.value as boolean) ? 'Enabled' : 'Disabled'}
              </span>
            </div>
          )}
        />
      );
    }

    if (field.type === 'textarea') {
      return <Textarea placeholder={field.placeholder} {...register(field.name)} />;
    }

    return (
      <Input
        type={field.type === 'number' ? 'number' : field.type === 'date' ? 'date' : 'text'}
        placeholder={field.placeholder}
        {...register(field.name)}
      />
    );
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          {fields.map((field) => (
            <div key={field.name} className="space-y-2">
              <Label htmlFor={field.name}>
                {field.label}
                {field.required && <span className="ml-0.5 text-destructive">*</span>}
              </Label>
              {renderField(field)}
              {field.helpText && <p className="text-xs text-muted-foreground">{field.helpText}</p>}
              {errors[field.name] && (
                <p className="text-xs text-destructive">
                  {(errors[field.name]?.message as string) ?? 'Invalid value'}
                </p>
              )}
            </div>
          ))}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={submitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                submitLabel
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
