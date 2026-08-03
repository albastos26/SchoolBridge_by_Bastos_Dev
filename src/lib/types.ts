export type UserRole =
  | 'director'
  | 'head_of_studies'
  | 'head_of_discipline'
  | 'teacher'
  | 'economist'
  | 'storekeeper'
  | 'nurse'
  | 'parent'
  | 'student';

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  role: UserRole;
  avatar_url: string | null;
  phone: string | null;
  is_active: boolean;
  email_verified: boolean;
  created_at: string;
  updated_at: string;
}

export interface NavItem {
  label: string;
  to: string;
  icon: React.ComponentType<{ className?: string }>;
  roles?: UserRole[];
  badge?: string;
}

export interface NavSection {
  title: string;
  items: NavItem[];
}

export interface Notification {
  id: string;
  title: string;
  description: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  created_at: string;
}

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export interface Column<T> {
  key: string;
  header: string;
  cell?: (row: T) => React.ReactNode;
  className?: string;
  sortable?: boolean;
}

export interface FilterOption {
  label: string;
  value: string;
}

export interface StatCardData {
  label: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  icon: React.ComponentType<{ className?: string }>;
  accent?: 'primary' | 'success' | 'warning' | 'info' | 'destructive';
}
