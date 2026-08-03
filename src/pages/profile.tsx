import { useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Camera, Loader2, Mail, Phone, Shield, CheckCircle2, AlertCircle, Save } from 'lucide-react';
import { PageHeader } from '@/components/dash';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/lib/auth';
import { RoleBadge } from '@/components/auth/role-badge';
import { ROLE_LABELS, ROLE_DESCRIPTIONS } from '@/lib/permissions';

const schema = z.object({
  full_name: z.string().min(2, 'Name must be at least 2 characters'),
  phone: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

export function ProfilePage() {
  const { profile, uploadAvatar, updateProfile } = useAuth();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      full_name: profile?.full_name ?? '',
      phone: profile?.phone ?? '',
    },
  });

  if (!profile) return null;

  const initials = (profile.full_name || profile.email || '?')
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      toast({ title: 'File too large', description: 'Avatar must be under 2MB.', variant: 'destructive' });
      return;
    }

    setUploading(true);
    const { error } = await uploadAvatar(file);
    setUploading(false);
    if (error) {
      toast({ title: 'Upload failed', description: error, variant: 'destructive' });
      return;
    }
    toast({ title: 'Avatar updated', description: 'Your profile photo has been updated.' });
  };

  const onSubmit = async (values: FormValues) => {
    setSaving(true);
    const { error } = await updateProfile({
      full_name: values.full_name,
      phone: values.phone ?? null,
    });
    setSaving(false);
    if (error) {
      toast({ title: 'Update failed', description: error, variant: 'destructive' });
      return;
    }
    toast({ title: 'Profile saved', description: 'Your changes have been saved.' });
  };

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Profile"
        description="Manage your personal information and account details."
        breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Profile' }]}
      />

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Avatar + role card */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-base">Avatar & Role</CardTitle>
            <CardDescription>Your photo and access level</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-col items-center gap-4">
              <div className="relative">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={profile.avatar_url ?? undefined} alt={profile.full_name ?? ''} />
                  <AvatarFallback className="bg-primary/10 text-2xl font-semibold text-primary">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="absolute bottom-0 right-0 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-md transition-transform hover:scale-105 disabled:opacity-50"
                >
                  {uploading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Camera className="h-4 w-4" />
                  )}
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarChange}
                />
              </div>
              <div className="text-center">
                <p className="text-base font-semibold">{profile.full_name ?? 'User'}</p>
                <p className="text-sm text-muted-foreground">{profile.email}</p>
              </div>
              <RoleBadge role={profile.role} />
            </div>

            <Separator />

            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <Shield className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                <div>
                  <p className="text-xs font-medium text-muted-foreground">Role</p>
                  <p className="text-sm font-medium">{ROLE_LABELS[profile.role]}</p>
                  <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                    {ROLE_DESCRIPTIONS[profile.role]}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                {profile.email_verified ? (
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                ) : (
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-warning" />
                )}
                <div>
                  <p className="text-xs font-medium text-muted-foreground">Email verification</p>
                  <p className="text-sm font-medium">
                    {profile.email_verified ? 'Verified' : 'Not verified'}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Edit profile card */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Personal Information</CardTitle>
            <CardDescription>Update your personal details</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="full_name">Full name</Label>
                <Input id="full_name" placeholder="Your full name" {...register('full_name')} />
                {errors.full_name && (
                  <p className="text-xs text-destructive">{errors.full_name.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    value={profile.email}
                    disabled
                    className="cursor-not-allowed pl-9 opacity-60"
                  />
                </div>
                <p className="text-xs text-muted-foreground">Email cannot be changed. Contact an administrator.</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input id="phone" placeholder="+1 234 567 890" className="pl-9" {...register('phone')} />
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <Button type="submit" disabled={saving || !isDirty}>
                  {saving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Save changes
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
