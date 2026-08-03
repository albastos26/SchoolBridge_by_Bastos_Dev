import {
  LayoutDashboard,
  Users,
  GraduationCap,
  CalendarDays,
  ClipboardList,
  BookOpen,
  School,
  Settings,
  CreditCard,
  BarChart3,
  Bell,
  HeartPulse,
  Package,
  Gavel,
  UserCircle,
  Building2,
  Layers,
  CalendarRange,
  BookMarked,
  Network,
  UserPlus,
  ArrowRightLeft,
  ArrowUpCircle,
  Link2,
  Upload,
  FileText,
  Stethoscope,
  Phone,
  Receipt,
  TrendingDown,
  PackageOpen,
  AlertTriangle,
  ClipboardCheck,
  type LucideIcon,
} from 'lucide-react';
import type { NavSection, UserRole } from './types';

export const ALL_ROLES: UserRole[] = [
  'director', 'head_of_studies', 'head_of_discipline', 'teacher',
  'economist', 'storekeeper', 'nurse', 'parent', 'student',
];

const ACADEMIC_MANAGERS: UserRole[] = ['director', 'head_of_studies'];
const STAFF_ROLES: UserRole[] = ['director', 'head_of_studies', 'head_of_discipline', 'teacher', 'economist', 'storekeeper', 'nurse'];
const LEADERSHIP_ROLES: UserRole[] = ['director', 'head_of_studies', 'head_of_discipline'];
const DISCIPLINE_ROLES: UserRole[] = ['director', 'head_of_discipline'];
const FINANCE_ROLES: UserRole[] = ['director', 'economist'];
const INVENTORY_ROLES: UserRole[] = ['director', 'storekeeper'];
const HEALTH_ROLES: UserRole[] = ['director', 'nurse'];
const TEACHER_ONLY: UserRole[] = ['teacher'];

export const NAV_SECTIONS: NavSection[] = [
  {
    title: 'Overview',
    items: [
      { label: 'Dashboard', to: '/dashboard', icon: LayoutDashboard },
    ],
  },
  {
    title: 'Academic Structure',
    items: [
      { label: 'Departments', to: '/departments', icon: Building2, roles: ACADEMIC_MANAGERS },
      { label: 'Streams', to: '/streams', icon: Layers, roles: ACADEMIC_MANAGERS },
      { label: 'Academic Years', to: '/academic-years', icon: CalendarRange, roles: ACADEMIC_MANAGERS },
      { label: 'Terms', to: '/terms', icon: CalendarDays, roles: ACADEMIC_MANAGERS },
      { label: 'Subjects', to: '/subjects', icon: BookMarked, roles: ACADEMIC_MANAGERS },
      { label: 'Classes', to: '/classes', icon: School, roles: ACADEMIC_MANAGERS },
      { label: 'Teacher Assignments', to: '/teacher-assignments', icon: Network, roles: ACADEMIC_MANAGERS },
    ],
  },
  {
    title: 'Student Management',
    items: [
      { label: 'Student Registration', to: '/student-registration', icon: UserPlus, roles: ACADEMIC_MANAGERS },
      { label: 'Class Allocation', to: '/class-allocation', icon: ArrowRightLeft, roles: ACADEMIC_MANAGERS },
      { label: 'Student Promotion', to: '/student-promotion', icon: ArrowUpCircle, roles: ACADEMIC_MANAGERS },
      { label: 'Parent Linking', to: '/parent-linking', icon: Link2, roles: ACADEMIC_MANAGERS },
      { label: 'Import Students', to: '/import-students', icon: Upload, roles: ACADEMIC_MANAGERS },
      { label: 'Import Teachers', to: '/import-teachers', icon: Upload, roles: ACADEMIC_MANAGERS },
    ],
  },
  {
    title: 'Teaching',
    items: [
      { label: 'Teacher Dashboard', to: '/teacher-dashboard', icon: LayoutDashboard, roles: TEACHER_ONLY },
      { label: 'Take Attendance', to: '/take-attendance', icon: ClipboardCheck, roles: TEACHER_ONLY },
      { label: 'Assessments', to: '/assessments', icon: ClipboardList, roles: TEACHER_ONLY },
      { label: 'Grading', to: '/grading', icon: BarChart3, roles: TEACHER_ONLY },
      { label: 'Remarks', to: '/remarks', icon: FileText, roles: TEACHER_ONLY },
      { label: 'Transcripts', to: '/transcripts', icon: FileText, roles: TEACHER_ONLY },
    ],
  },
  {
    title: 'Discipline',
    items: [
      { label: 'Discipline Dashboard', to: '/discipline-dashboard', icon: LayoutDashboard, roles: DISCIPLINE_ROLES },
      { label: 'Discipline Records', to: '/discipline-records', icon: Gavel, roles: DISCIPLINE_ROLES },
      { label: 'Behavior History', to: '/behavior-history', icon: AlertTriangle, roles: DISCIPLINE_ROLES },
      { label: 'Discipline Reports', to: '/discipline-reports', icon: BarChart3, roles: DISCIPLINE_ROLES },
    ],
  },
  {
    title: 'Health',
    items: [
      { label: 'Nurse Dashboard', to: '/nurse-dashboard', icon: LayoutDashboard, roles: HEALTH_ROLES },
      { label: 'Medical Visits', to: '/medical-visits', icon: Stethoscope, roles: HEALTH_ROLES },
      { label: 'Emergency Contacts', to: '/emergency-contacts', icon: Phone, roles: HEALTH_ROLES },
      { label: 'Medical Reports', to: '/medical-reports', icon: BarChart3, roles: HEALTH_ROLES },
    ],
  },
  {
    title: 'Finance',
    items: [
      { label: 'Finance Dashboard', to: '/finance-dashboard', icon: LayoutDashboard, roles: FINANCE_ROLES },
      { label: 'Fee Structures', to: '/fee-structures', icon: CreditCard, roles: FINANCE_ROLES },
      { label: 'Invoices', to: '/invoices', icon: FileText, roles: FINANCE_ROLES },
      { label: 'Payments', to: '/payments', icon: Receipt, roles: FINANCE_ROLES },
      { label: 'Expenses', to: '/expenses', icon: TrendingDown, roles: FINANCE_ROLES },
      { label: 'Finance Reports', to: '/finance-reports', icon: BarChart3, roles: FINANCE_ROLES },
    ],
  },
  {
    title: 'Inventory',
    items: [
      { label: 'Inventory Dashboard', to: '/inventory-dashboard', icon: LayoutDashboard, roles: INVENTORY_ROLES },
      { label: 'Inventory Items', to: '/inventory-items', icon: Package, roles: INVENTORY_ROLES },
      { label: 'Suppliers', to: '/suppliers', icon: Users, roles: INVENTORY_ROLES },
      { label: 'Stock In/Out', to: '/stock-movements', icon: PackageOpen, roles: INVENTORY_ROLES },
      { label: 'Inventory Reports', to: '/inventory-reports', icon: BarChart3, roles: INVENTORY_ROLES },
    ],
  },
  {
    title: 'Parent Portal',
    items: [
      { label: 'Parent Dashboard', to: '/parent-dashboard', icon: LayoutDashboard, roles: ['parent'] },
      { label: 'Attendance', to: '/parent-attendance', icon: ClipboardCheck, roles: ['parent'] },
      { label: 'Grades', to: '/parent-grades', icon: BarChart3, roles: ['parent'] },
      { label: 'Fee Status', to: '/parent-fees', icon: CreditCard, roles: ['parent'] },
      { label: 'Announcements', to: '/parent-announcements', icon: Bell, roles: ['parent'] },
    ],
  },
  {
    title: 'Student Portal',
    items: [
      { label: 'Student Dashboard', to: '/student-dashboard', icon: LayoutDashboard, roles: ['student'] },
      { label: 'My Attendance', to: '/student-attendance', icon: ClipboardCheck, roles: ['student'] },
      { label: 'My Grades', to: '/student-grades', icon: BarChart3, roles: ['student'] },
      { label: 'Transcript', to: '/student-transcript', icon: FileText, roles: ['student'] },
      { label: 'Homework', to: '/student-homework', icon: ClipboardList, roles: ['student'] },
      { label: 'Announcements', to: '/student-announcements', icon: Bell, roles: ['student'] },
    ],
  },
  {
    title: 'Director',
    items: [
      { label: 'Director Overview', to: '/director-dashboard', icon: LayoutDashboard, roles: ['director'] },
      { label: 'Audit Logs', to: '/audit-logs', icon: FileText, roles: ['director'] },
    ],
  },
  {
    title: 'Account',
    items: [
      { label: 'Profile', to: '/profile', icon: UserCircle },
      { label: 'Notifications', to: '/notifications', icon: Bell },
      { label: 'Settings', to: '/settings', icon: Settings, roles: ['director'] },
    ],
  },
];

export function filterNavByRole(sections: NavSection[], role: UserRole): NavSection[] {
  return sections
    .map((section) => ({
      ...section,
      items: section.items.filter((item) => !item.roles || item.roles.includes(role)),
    }))
    .filter((section) => section.items.length > 0);
}

export const ROLE_NAV_ICONS: Record<UserRole, LucideIcon> = {
  director: Settings,
  head_of_studies: BookOpen,
  head_of_discipline: Gavel,
  teacher: Users,
  economist: CreditCard,
  storekeeper: Package,
  nurse: HeartPulse,
  parent: Users,
  student: GraduationCap,
};
