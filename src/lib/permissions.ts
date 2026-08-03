import type { UserRole } from './types';

export const ALL_ROLES: UserRole[] = [
  'director',
  'head_of_studies',
  'head_of_discipline',
  'teacher',
  'economist',
  'storekeeper',
  'nurse',
  'parent',
  'student',
];

export const ROLE_LABELS: Record<UserRole, string> = {
  director: 'Director',
  head_of_studies: 'Head of Studies',
  head_of_discipline: 'Head of Discipline',
  teacher: 'Teacher',
  economist: 'Economist',
  storekeeper: 'Storekeeper',
  nurse: 'Nurse',
  parent: 'Parent',
  student: 'Student',
};

export function roleLabel(role: UserRole): string {
  return ROLE_LABELS[role] ?? role;
}

export type BadgeVariant = 'default' | 'secondary' | 'destructive' | 'outline' | 'success' | 'warning' | 'info';

export const ROLE_BADGE_VARIANT: Record<UserRole, BadgeVariant> = {
  director: 'destructive',
  head_of_studies: 'info',
  head_of_discipline: 'warning',
  teacher: 'default',
  economist: 'secondary',
  storekeeper: 'secondary',
  nurse: 'success',
  parent: 'outline',
  student: 'secondary',
};

export const ROLE_BADGE_CLASS: Record<UserRole, string> = {
  director: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
  head_of_studies: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
  head_of_discipline: 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20',
  teacher: 'bg-primary/10 text-primary border-primary/20',
  economist: 'bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-500/20',
  storekeeper: 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20',
  nurse: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
  parent: 'bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/20',
  student: 'bg-muted text-muted-foreground border-border',
};

export const ROLE_DESCRIPTIONS: Record<UserRole, string> = {
  director: 'Full system access. Oversees all school operations, staff, and configuration.',
  head_of_studies: 'Manages academics: subjects, classes, timetables, and academic reports.',
  head_of_discipline: 'Manages student discipline, attendance policies, and behavior records.',
  teacher: 'Manages classes, attendance, grades, and assignments for assigned subjects.',
  economist: 'Manages school finances, fees, invoices, and payments.',
  storekeeper: 'Manages school inventory, supplies, and stock.',
  nurse: 'Manages student health records and medical incidents.',
  parent: 'Views child attendance, grades, and school communications.',
  student: 'Views timetable, assignments, grades, and attendance.',
};

export type Permission =
  | 'dashboard:view'
  | 'students:view'
  | 'students:manage'
  | 'staff:view'
  | 'staff:manage'
  | 'classes:view'
  | 'classes:manage'
  | 'subjects:view'
  | 'subjects:manage'
  | 'timetable:view'
  | 'timetable:manage'
  | 'attendance:view'
  | 'attendance:manage'
  | 'grades:view'
  | 'grades:manage'
  | 'discipline:view'
  | 'discipline:manage'
  | 'finance:view'
  | 'finance:manage'
  | 'inventory:view'
  | 'inventory:manage'
  | 'health:view'
  | 'health:manage'
  | 'reports:view'
  | 'reports:manage'
  | 'settings:view'
  | 'settings:manage'
  | 'profile:view'
  | 'profile:edit'
  | 'notifications:view';

const ALL_PERMISSIONS: Permission[] = [
  'dashboard:view',
  'students:view', 'students:manage',
  'staff:view', 'staff:manage',
  'classes:view', 'classes:manage',
  'subjects:view', 'subjects:manage',
  'timetable:view', 'timetable:manage',
  'attendance:view', 'attendance:manage',
  'grades:view', 'grades:manage',
  'discipline:view', 'discipline:manage',
  'finance:view', 'finance:manage',
  'inventory:view', 'inventory:manage',
  'health:view', 'health:manage',
  'reports:view', 'reports:manage',
  'settings:view', 'settings:manage',
  'profile:view', 'profile:edit',
  'notifications:view',
];

export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  director: ALL_PERMISSIONS,
  head_of_studies: [
    'dashboard:view',
    'students:view', 'students:manage',
    'staff:view',
    'classes:view', 'classes:manage',
    'subjects:view', 'subjects:manage',
    'timetable:view', 'timetable:manage',
    'attendance:view', 'attendance:manage',
    'grades:view', 'grades:manage',
    'reports:view', 'reports:manage',
    'profile:view', 'profile:edit',
    'notifications:view',
  ],
  head_of_discipline: [
    'dashboard:view',
    'students:view', 'students:manage',
    'staff:view',
    'attendance:view', 'attendance:manage',
    'discipline:view', 'discipline:manage',
    'reports:view',
    'profile:view', 'profile:edit',
    'notifications:view',
  ],
  teacher: [
    'dashboard:view',
    'students:view',
    'classes:view',
    'subjects:view',
    'timetable:view',
    'attendance:view', 'attendance:manage',
    'grades:view', 'grades:manage',
    'reports:view',
    'profile:view', 'profile:edit',
    'notifications:view',
  ],
  economist: [
    'dashboard:view',
    'students:view',
    'finance:view', 'finance:manage',
    'reports:view',
    'profile:view', 'profile:edit',
    'notifications:view',
  ],
  storekeeper: [
    'dashboard:view',
    'inventory:view', 'inventory:manage',
    'reports:view',
    'profile:view', 'profile:edit',
    'notifications:view',
  ],
  nurse: [
    'dashboard:view',
    'students:view',
    'health:view', 'health:manage',
    'reports:view',
    'profile:view', 'profile:edit',
    'notifications:view',
  ],
  parent: [
    'dashboard:view',
    'students:view',
    'attendance:view',
    'grades:view',
    'reports:view',
    'profile:view', 'profile:edit',
    'notifications:view',
  ],
  student: [
    'dashboard:view',
    'timetable:view',
    'grades:view',
    'attendance:view',
    'profile:view', 'profile:edit',
    'notifications:view',
  ],
};

export function hasPermission(role: UserRole | undefined, permission: Permission): boolean {
  if (!role) return false;
  return ROLE_PERMISSIONS[role].includes(permission);
}

export function hasAnyPermission(role: UserRole | undefined, permissions: Permission[]): boolean {
  if (!role) return false;
  return permissions.some((p) => ROLE_PERMISSIONS[role].includes(p));
}

export function canManage(role: UserRole | undefined, area: Permission): boolean {
  return hasPermission(role, area);
}
