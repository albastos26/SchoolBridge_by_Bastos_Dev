import {
  Users,
  GraduationCap,
  CalendarCheck,
  TrendingUp,
  ClipboardList,
  CreditCard,
  Package,
  HeartPulse,
  Gavel,
  BookOpen,
  School,
  Bell,
  type LucideIcon,
} from 'lucide-react';
import { PageHeader, StatCard, DashboardCard, ChartCard } from '@/components/dash';
import { useAuth } from '@/lib/auth';
import { ROLE_LABELS, ROLE_DESCRIPTIONS } from '@/lib/permissions';
import { RoleBadge } from '@/components/auth/role-badge';
import type { UserRole, StatCardData } from '@/lib/types';

interface RoleDashboard {
  stats: StatCardData[];
  quickActions: { label: string; icon: LucideIcon; description: string }[];
  activity: { text: string; time: string }[];
}

const ROLE_DASHBOARDS: Record<UserRole, RoleDashboard> = {
  director: {
    stats: [
      { label: 'Total Students', value: '1,248', change: 12, changeLabel: 'vs last term', icon: GraduationCap, accent: 'primary' },
      { label: 'Total Staff', value: '86', change: 3, changeLabel: 'vs last term', icon: Users, accent: 'info' },
      { label: 'Monthly Revenue', value: '$48.2k', change: 8, changeLabel: 'vs last month', icon: CreditCard, accent: 'success' },
      { label: 'Active Issues', value: '4', change: -50, changeLabel: 'since last week', icon: Gavel, accent: 'warning' },
    ],
    quickActions: [
      { label: 'View Reports', icon: TrendingUp, description: 'School-wide analytics' },
      { label: 'Manage Staff', icon: Users, description: 'Add or edit staff' },
      { label: 'Finance', icon: CreditCard, description: 'Budget overview' },
      { label: 'Settings', icon: School, description: 'System configuration' },
    ],
    activity: [
      { text: 'Term 2 report cards published', time: '5m ago' },
      { text: 'New teacher onboarded: Mr. Adams', time: '1h ago' },
      { text: 'Budget approved for science lab', time: '3h ago' },
      { text: 'Board meeting scheduled for Friday', time: '5h ago' },
    ],
  },
  head_of_studies: {
    stats: [
      { label: 'Active Classes', value: '42', icon: School, accent: 'primary' },
      { label: 'Subjects Offered', value: '28', icon: BookOpen, accent: 'info' },
      { label: 'Avg Pass Rate', value: '92%', change: 4, changeLabel: 'vs last term', icon: TrendingUp, accent: 'success' },
      { label: 'Pending Grades', value: '17', icon: ClipboardList, accent: 'warning' },
    ],
    quickActions: [
      { label: 'Timetable', icon: CalendarCheck, description: 'Manage schedules' },
      { label: 'Subjects', icon: BookOpen, description: 'Curriculum setup' },
      { label: 'Classes', icon: School, description: 'Class management' },
      { label: 'Reports', icon: TrendingUp, description: 'Academic reports' },
    ],
    activity: [
      { text: 'Timetable updated for Grade 10', time: '20m ago' },
      { text: 'New subject added: Computer Science', time: '2h ago' },
      { text: 'Mid-term exam schedule published', time: '4h ago' },
      { text: 'Teacher assignment updated for Math', time: '6h ago' },
    ],
  },
  head_of_discipline: {
    stats: [
      { label: 'Attendance Rate', value: '94.2%', change: 1.4, changeLabel: 'this week', icon: CalendarCheck, accent: 'success' },
      { label: 'Open Cases', value: '7', icon: Gavel, accent: 'warning' },
      { label: 'Resolved This Week', value: '12', change: 20, changeLabel: 'vs last week', icon: CheckCircleIcon, accent: 'primary' },
      { label: 'Incidents Reported', value: '3', change: -40, changeLabel: 'since last week', icon: ClipboardList, accent: 'info' },
    ],
    quickActions: [
      { label: 'Discipline Log', icon: Gavel, description: 'View all cases' },
      { label: 'Attendance', icon: CalendarCheck, description: 'Track attendance' },
      { label: 'Reports', icon: TrendingUp, description: 'Behavior reports' },
      { label: 'Students', icon: GraduationCap, description: 'Student records' },
    ],
    activity: [
      { text: 'Discipline case #234 resolved', time: '15m ago' },
      { text: 'Attendance warning sent to 5 students', time: '1h ago' },
      { text: 'New incident reported in Grade 9-B', time: '3h ago' },
      { text: 'Parent meeting scheduled for student #1023', time: '5h ago' },
    ],
  },
  teacher: {
    stats: [
      { label: 'My Classes', value: '6', icon: School, accent: 'primary' },
      { label: 'My Students', value: '184', icon: GraduationCap, accent: 'info' },
      { label: 'Pending Grades', value: '23', icon: ClipboardList, accent: 'warning' },
      { label: "Today's Classes", value: '4', icon: CalendarCheck, accent: 'success' },
    ],
    quickActions: [
      { label: 'Take Attendance', icon: CalendarCheck, description: 'Mark today\'s attendance' },
      { label: 'Enter Grades', icon: ClipboardList, description: 'Record student grades' },
      { label: 'My Timetable', icon: CalendarCheck, description: 'View schedule' },
      { label: 'My Students', icon: GraduationCap, description: 'Student list' },
    ],
    activity: [
      { text: 'Attendance submitted for Grade 8-A', time: '30m ago' },
      { text: 'Grades entered for Math quiz', time: '2h ago' },
      { text: 'Assignment posted for Grade 10-B', time: '4h ago' },
      { text: 'Parent query from Mrs. Smith', time: '6h ago' },
    ],
  },
  economist: {
    stats: [
      { label: 'Monthly Revenue', value: '$48.2k', change: 8, changeLabel: 'vs last month', icon: CreditCard, accent: 'success' },
      { label: 'Outstanding Fees', value: '$12.4k', change: -15, changeLabel: 'vs last month', icon: ClipboardList, accent: 'warning' },
      { label: 'Paid Invoices', value: '342', change: 12, changeLabel: 'this month', icon: CheckCircleIcon, accent: 'primary' },
      { label: 'Pending Invoices', value: '28', icon: CreditCard, accent: 'info' },
    ],
    quickActions: [
      { label: 'Invoices', icon: CreditCard, description: 'Manage billing' },
      { label: 'Payments', icon: CreditCard, description: 'Record payments' },
      { label: 'Reports', icon: TrendingUp, description: 'Financial reports' },
      { label: 'Students', icon: GraduationCap, description: 'Fee status' },
    ],
    activity: [
      { text: 'Invoice #1023 paid in full', time: '10m ago' },
      { text: 'Fee reminder sent to 12 students', time: '1h ago' },
      { text: 'Monthly financial report generated', time: '3h ago' },
      { text: 'New invoice created for Term 2', time: '5h ago' },
    ],
  },
  storekeeper: {
    stats: [
      { label: 'Total Items', value: '1,842', icon: Package, accent: 'primary' },
      { label: 'Low Stock', value: '14', icon: Package, accent: 'warning' },
      { label: 'Items Issued', value: '67', change: 8, changeLabel: 'this week', icon: Package, accent: 'info' },
      { label: 'Pending Orders', value: '5', icon: ClipboardList, accent: 'destructive' },
    ],
    quickActions: [
      { label: 'Inventory', icon: Package, description: 'View stock levels' },
      { label: 'Issue Items', icon: Package, description: 'Record issuance' },
      { label: 'Restock', icon: Package, description: 'Create orders' },
      { label: 'Reports', icon: TrendingUp, description: 'Stock reports' },
    ],
    activity: [
      { text: '50 notebooks issued to Grade 9', time: '25m ago' },
      { text: 'Low stock alert: Lab chemicals', time: '1h ago' },
      { text: 'Restock order received: Sports equipment', time: '3h ago' },
      { text: 'Inventory audit completed', time: '5h ago' },
    ],
  },
  nurse: {
    stats: [
      { label: 'Visits Today', value: '12', icon: HeartPulse, accent: 'primary' },
      { label: 'Active Cases', value: '4', icon: HeartPulse, accent: 'warning' },
      { label: 'Medications Given', value: '8', icon: HeartPulse, accent: 'info' },
      { label: 'Students Tracked', value: '1,248', icon: GraduationCap, accent: 'success' },
    ],
    quickActions: [
      { label: 'Health Records', icon: HeartPulse, description: 'Student health files' },
      { label: 'Log Visit', icon: HeartPulse, description: 'Record a clinic visit' },
      { label: 'Medications', icon: HeartPulse, description: 'Track medications' },
      { label: 'Reports', icon: TrendingUp, description: 'Health reports' },
    ],
    activity: [
      { text: 'Student visited clinic: headache', time: '15m ago' },
      { text: 'Medication administered to student #452', time: '1h ago' },
      { text: 'Health alert: flu symptoms in Grade 7', time: '3h ago' },
      { text: 'Annual health screening scheduled', time: '5h ago' },
    ],
  },
  parent: {
    stats: [
      { label: "Children", value: '2', icon: GraduationCap, accent: 'primary' },
      { label: 'Attendance', value: '96%', change: 2, changeLabel: 'this month', icon: CalendarCheck, accent: 'success' },
      { label: 'Avg Grade', value: 'B+', icon: TrendingUp, accent: 'info' },
      { label: 'Unread Notices', value: '3', icon: Bell, accent: 'warning' },
    ],
    quickActions: [
      { label: 'Attendance', icon: CalendarCheck, description: 'View attendance' },
      { label: 'Grades', icon: TrendingUp, description: 'View grades' },
      { label: 'Timetable', icon: CalendarCheck, description: 'Class schedule' },
      { label: 'Reports', icon: TrendingUp, description: 'Progress reports' },
    ],
    activity: [
      { text: 'Grade posted: Math test - 85%', time: '1h ago' },
      { text: 'Attendance marked: Present', time: '3h ago' },
      { text: 'School notice: Parent-teacher meeting', time: '5h ago' },
      { text: 'Report card available for Term 1', time: '1d ago' },
    ],
  },
  student: {
    stats: [
      { label: 'Attendance', value: '96%', change: 2, changeLabel: 'this term', icon: CalendarCheck, accent: 'success' },
      { label: 'Avg Grade', value: 'B+', icon: TrendingUp, accent: 'primary' },
      { label: "Today's Classes", value: '5', icon: CalendarCheck, accent: 'info' },
      { label: 'Pending Tasks', value: '3', icon: ClipboardList, accent: 'warning' },
    ],
    quickActions: [
      { label: 'Timetable', icon: CalendarCheck, description: 'My schedule' },
      { label: 'Grades', icon: TrendingUp, description: 'My grades' },
      { label: 'Attendance', icon: CalendarCheck, description: 'My attendance' },
      { label: 'Profile', icon: Users, description: 'My profile' },
    ],
    activity: [
      { text: 'Grade posted: Math test - 85%', time: '1h ago' },
      { text: 'Assignment due in 3 days: English essay', time: '3h ago' },
      { text: 'Timetable updated for this week', time: '5h ago' },
      { text: 'School notice: Sports day Friday', time: '1d ago' },
    ],
  },
};

function CheckCircleIcon({ className }: { className?: string }) {
  return <ClipboardList className={className} />;
}

export function DashboardPage() {
  const { profile } = useAuth();

  if (!profile) return null;

  const dashboard = ROLE_DASHBOARDS[profile.role];
  const firstName = (profile.full_name ?? 'there').split(' ')[0];

  return (
    <div className="animate-fade-in">
      <PageHeader
        title={`Welcome back, ${firstName}`}
        description={ROLE_DESCRIPTIONS[profile.role]}
        breadcrumbs={[{ label: 'Dashboard' }]}
        action={<RoleBadge role={profile.role} />}
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {dashboard.stats.map((s) => (
          <StatCard key={s.label} data={s} />
        ))}
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <DashboardCard title="Quick Actions" description="Shortcuts to your most common tasks">
          <div className="grid grid-cols-2 gap-3">
            {dashboard.quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <button
                  key={action.label}
                  className="flex flex-col items-start gap-2 rounded-lg border p-4 text-left transition-all hover:border-primary/30 hover:bg-accent"
                >
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                    <Icon className="h-4.5 w-4.5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{action.label}</p>
                    <p className="text-xs text-muted-foreground">{action.description}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </DashboardCard>

        <ChartCard title="Recent Activity" description="Latest events relevant to you">
          <div className="space-y-3">
            {dashboard.activity.map((item, i) => (
              <div key={i} className="flex items-start gap-3 rounded-lg border p-3">
                <div className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary" />
                <div className="flex-1">
                  <p className="text-sm font-medium leading-tight">{item.text}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">{item.time}</p>
                </div>
              </div>
            ))}
          </div>
        </ChartCard>
      </div>
    </div>
  );
}
