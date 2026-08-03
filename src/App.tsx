import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { AuthProvider } from '@/lib/auth';
import { ThemeProvider } from '@/lib/theme';
import { queryClient } from '@/lib/query-client';
import { DashboardShell } from '@/components/layout/dashboard-shell';
import { ProtectedRoute, RoleRoute } from '@/components/auth/protected-route';
import { LoginPage } from '@/pages/login';
import { RegisterPage } from '@/pages/register';
import { ForgotPasswordPage } from '@/pages/forgot-password';
import { ResetPasswordPage } from '@/pages/reset-password';
import { VerifyEmailPage } from '@/pages/verify-email';
import { DashboardPage } from '@/pages/dashboard';
import { ProfilePage } from '@/pages/profile';
import { NotFoundPage } from '@/pages/not-found';
import { PlaceholderPage } from '@/pages/placeholder';
import type { UserRole } from '@/lib/types';

// Academic structure pages
import { DepartmentsPage } from '@/pages/academic/departments';
import { StreamsPage } from '@/pages/academic/streams';
import { AcademicYearsPage } from '@/pages/academic/academic-years';
import { TermsPage } from '@/pages/academic/terms';
import { SubjectsPage } from '@/pages/academic/subjects';
import { ClassesPage } from '@/pages/academic/classes';
import { TeacherAssignmentsPage } from '@/pages/academic/teacher-assignments';
import { StudentRegistrationPage } from '@/pages/academic/student-registration';
import { ClassAllocationPage } from '@/pages/academic/class-allocation';
import { StudentPromotionPage } from '@/pages/academic/student-promotion';
import { ParentLinkingPage } from '@/pages/academic/parent-linking';
import { ImportStudentsPage } from '@/pages/academic/import-students';
import { ImportTeachersPage } from '@/pages/academic/import-teachers';

// Teacher module
import { TeacherDashboardPage } from '@/pages/teacher/teacher-dashboard';
import { TakeAttendancePage } from '@/pages/teacher/take-attendance';
import { ManageAssessmentsPage } from '@/pages/teacher/manage-assessments';
import { ManageGradesPage } from '@/pages/teacher/manage-grades';
import { ManageRemarksPage } from '@/pages/teacher/manage-remarks';
import { TranscriptsPage } from '@/pages/teacher/transcripts';

// Discipline module
import { DisciplineDashboardPage } from '@/pages/discipline/discipline-dashboard';
import { DisciplineRecordsPage } from '@/pages/discipline/discipline-records';
import { BehaviorHistoryPage } from '@/pages/discipline/behavior-history';
import { DisciplineReportsPage } from '@/pages/discipline/discipline-reports';

// Nurse module
import { NurseDashboardPage } from '@/pages/nurse/nurse-dashboard';
import { MedicalVisitsPage } from '@/pages/nurse/medical-visits';
import { EmergencyContactsPage } from '@/pages/nurse/emergency-contacts';
import { MedicalReportsPage } from '@/pages/nurse/medical-reports';

// Finance module
import { FinanceDashboardPage } from '@/pages/finance/finance-dashboard';
import { FeeStructuresPage } from '@/pages/finance/fee-structures';
import { InvoicesPage } from '@/pages/finance/invoices';
import { PaymentsPage } from '@/pages/finance/payments';
import { ExpensesPage } from '@/pages/finance/expenses';
import { FinanceReportsPage } from '@/pages/finance/finance-reports';

// Inventory module
import { InventoryDashboardPage } from '@/pages/inventory/inventory-dashboard';
import { InventoryItemsPage } from '@/pages/inventory/inventory-items';
import { SuppliersPage } from '@/pages/inventory/suppliers';
import { StockMovementsPage } from '@/pages/inventory/stock-movements';
import { InventoryReportsPage } from '@/pages/inventory/inventory-reports';

// Parent portal
import { ParentDashboardPage } from '@/pages/parent/parent-dashboard';
import { ParentAttendancePage } from '@/pages/parent/parent-attendance';
import { ParentGradesPage } from '@/pages/parent/parent-grades';
import { ParentFeesPage } from '@/pages/parent/parent-fees';
import { ParentAnnouncementsPage } from '@/pages/parent/parent-announcements';

// Student portal
import { StudentDashboardPage } from '@/pages/student/student-dashboard';
import { StudentAttendancePage } from '@/pages/student/student-attendance';
import { StudentGradesPage } from '@/pages/student/student-grades';
import { StudentTranscriptPage } from '@/pages/student/student-transcript';
import { StudentHomeworkPage } from '@/pages/student/student-homework';
import { StudentAnnouncementsPage } from '@/pages/student/student-announcements';

// Director module
import { DirectorDashboardPage } from '@/pages/director/director-dashboard';
import { useAuditLogs } from '@/lib/module-hooks';

const ACADEMIC_MANAGERS: UserRole[] = ['director', 'head_of_studies'];
const LEADERSHIP: UserRole[] = ['director', 'head_of_studies', 'head_of_discipline'];
const DIRECTOR_ONLY: UserRole[] = ['director'];
const FINANCE: UserRole[] = ['director', 'economist'];
const INVENTORY: UserRole[] = ['director', 'storekeeper'];
const HEALTH: UserRole[] = ['director', 'nurse'];
const DISCIPLINE_ROLES: UserRole[] = ['director', 'head_of_discipline'];
const TEACHER_ONLY: UserRole[] = ['teacher'];
const PARENT_ONLY: UserRole[] = ['parent'];
const STUDENT_ONLY: UserRole[] = ['student'];

function AuditLogsPage() {
  const { data, isLoading } = useAuditLogs();
  return (
    <PlaceholderPage
      title="Audit Logs"
      description="System activity tracking and audit trail."
    />
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <BrowserRouter>
          <AuthProvider>
            <Routes>
              {/* Public auth routes */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/reset-password" element={<ResetPasswordPage />} />
              <Route path="/verify-email" element={<VerifyEmailPage />} />

              {/* Protected app routes */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <DashboardShell />
                  </ProtectedRoute>
                }
              >
                <Route index element={<DashboardPage />} />
                <Route path="profile" element={<ProfilePage />} />
                <Route path="notifications" element={<PlaceholderPage title="Notifications" description="View all your notifications." />} />

                {/* Academic structure */}
                <Route path="departments" element={<RoleRoute roles={ACADEMIC_MANAGERS}><DepartmentsPage /></RoleRoute>} />
                <Route path="streams" element={<RoleRoute roles={ACADEMIC_MANAGERS}><StreamsPage /></RoleRoute>} />
                <Route path="academic-years" element={<RoleRoute roles={ACADEMIC_MANAGERS}><AcademicYearsPage /></RoleRoute>} />
                <Route path="terms" element={<RoleRoute roles={ACADEMIC_MANAGERS}><TermsPage /></RoleRoute>} />
                <Route path="subjects" element={<RoleRoute roles={ACADEMIC_MANAGERS}><SubjectsPage /></RoleRoute>} />
                <Route path="classes" element={<RoleRoute roles={ACADEMIC_MANAGERS}><ClassesPage /></RoleRoute>} />
                <Route path="teacher-assignments" element={<RoleRoute roles={ACADEMIC_MANAGERS}><TeacherAssignmentsPage /></RoleRoute>} />

                {/* Student management */}
                <Route path="student-registration" element={<RoleRoute roles={ACADEMIC_MANAGERS}><StudentRegistrationPage /></RoleRoute>} />
                <Route path="class-allocation" element={<RoleRoute roles={ACADEMIC_MANAGERS}><ClassAllocationPage /></RoleRoute>} />
                <Route path="student-promotion" element={<RoleRoute roles={ACADEMIC_MANAGERS}><StudentPromotionPage /></RoleRoute>} />
                <Route path="parent-linking" element={<RoleRoute roles={ACADEMIC_MANAGERS}><ParentLinkingPage /></RoleRoute>} />
                <Route path="import-students" element={<RoleRoute roles={ACADEMIC_MANAGERS}><ImportStudentsPage /></RoleRoute>} />
                <Route path="import-teachers" element={<RoleRoute roles={ACADEMIC_MANAGERS}><ImportTeachersPage /></RoleRoute>} />

                {/* Teacher module */}
                <Route path="teacher-dashboard" element={<RoleRoute roles={TEACHER_ONLY}><TeacherDashboardPage /></RoleRoute>} />
                <Route path="take-attendance" element={<RoleRoute roles={TEACHER_ONLY}><TakeAttendancePage /></RoleRoute>} />
                <Route path="assessments" element={<RoleRoute roles={TEACHER_ONLY}><ManageAssessmentsPage /></RoleRoute>} />
                <Route path="grading" element={<RoleRoute roles={TEACHER_ONLY}><ManageGradesPage /></RoleRoute>} />
                <Route path="remarks" element={<RoleRoute roles={TEACHER_ONLY}><ManageRemarksPage /></RoleRoute>} />
                <Route path="transcripts" element={<RoleRoute roles={TEACHER_ONLY}><TranscriptsPage /></RoleRoute>} />

                {/* Discipline module */}
                <Route path="discipline-dashboard" element={<RoleRoute roles={DISCIPLINE_ROLES}><DisciplineDashboardPage /></RoleRoute>} />
                <Route path="discipline-records" element={<RoleRoute roles={DISCIPLINE_ROLES}><DisciplineRecordsPage /></RoleRoute>} />
                <Route path="behavior-history" element={<RoleRoute roles={DISCIPLINE_ROLES}><BehaviorHistoryPage /></RoleRoute>} />
                <Route path="discipline-reports" element={<RoleRoute roles={DISCIPLINE_ROLES}><DisciplineReportsPage /></RoleRoute>} />

                {/* Nurse module */}
                <Route path="nurse-dashboard" element={<RoleRoute roles={HEALTH}><NurseDashboardPage /></RoleRoute>} />
                <Route path="medical-visits" element={<RoleRoute roles={HEALTH}><MedicalVisitsPage /></RoleRoute>} />
                <Route path="emergency-contacts" element={<RoleRoute roles={HEALTH}><EmergencyContactsPage /></RoleRoute>} />
                <Route path="medical-reports" element={<RoleRoute roles={HEALTH}><MedicalReportsPage /></RoleRoute>} />

                {/* Finance module */}
                <Route path="finance-dashboard" element={<RoleRoute roles={FINANCE}><FinanceDashboardPage /></RoleRoute>} />
                <Route path="fee-structures" element={<RoleRoute roles={FINANCE}><FeeStructuresPage /></RoleRoute>} />
                <Route path="invoices" element={<RoleRoute roles={FINANCE}><InvoicesPage /></RoleRoute>} />
                <Route path="payments" element={<RoleRoute roles={FINANCE}><PaymentsPage /></RoleRoute>} />
                <Route path="expenses" element={<RoleRoute roles={FINANCE}><ExpensesPage /></RoleRoute>} />
                <Route path="finance-reports" element={<RoleRoute roles={FINANCE}><FinanceReportsPage /></RoleRoute>} />

                {/* Inventory module */}
                <Route path="inventory-dashboard" element={<RoleRoute roles={INVENTORY}><InventoryDashboardPage /></RoleRoute>} />
                <Route path="inventory-items" element={<RoleRoute roles={INVENTORY}><InventoryItemsPage /></RoleRoute>} />
                <Route path="suppliers" element={<RoleRoute roles={INVENTORY}><SuppliersPage /></RoleRoute>} />
                <Route path="stock-movements" element={<RoleRoute roles={INVENTORY}><StockMovementsPage /></RoleRoute>} />
                <Route path="inventory-reports" element={<RoleRoute roles={INVENTORY}><InventoryReportsPage /></RoleRoute>} />

                {/* Parent portal */}
                <Route path="parent-dashboard" element={<RoleRoute roles={PARENT_ONLY}><ParentDashboardPage /></RoleRoute>} />
                <Route path="parent-attendance" element={<RoleRoute roles={PARENT_ONLY}><ParentAttendancePage /></RoleRoute>} />
                <Route path="parent-grades" element={<RoleRoute roles={PARENT_ONLY}><ParentGradesPage /></RoleRoute>} />
                <Route path="parent-fees" element={<RoleRoute roles={PARENT_ONLY}><ParentFeesPage /></RoleRoute>} />
                <Route path="parent-announcements" element={<RoleRoute roles={PARENT_ONLY}><ParentAnnouncementsPage /></RoleRoute>} />

                {/* Student portal */}
                <Route path="student-dashboard" element={<RoleRoute roles={STUDENT_ONLY}><StudentDashboardPage /></RoleRoute>} />
                <Route path="student-attendance" element={<RoleRoute roles={STUDENT_ONLY}><StudentAttendancePage /></RoleRoute>} />
                <Route path="student-grades" element={<RoleRoute roles={STUDENT_ONLY}><StudentGradesPage /></RoleRoute>} />
                <Route path="student-transcript" element={<RoleRoute roles={STUDENT_ONLY}><StudentTranscriptPage /></RoleRoute>} />
                <Route path="student-homework" element={<RoleRoute roles={STUDENT_ONLY}><StudentHomeworkPage /></RoleRoute>} />
                <Route path="student-announcements" element={<RoleRoute roles={STUDENT_ONLY}><StudentAnnouncementsPage /></RoleRoute>} />

                {/* Director module */}
                <Route path="director-dashboard" element={<RoleRoute roles={DIRECTOR_ONLY}><DirectorDashboardPage /></RoleRoute>} />
                <Route path="audit-logs" element={<RoleRoute roles={DIRECTOR_ONLY}><AuditLogsPage /></RoleRoute>} />

                {/* Legacy placeholders */}
                <Route path="students" element={<PlaceholderPage title="Students" description="Manage student records, enrollment, and profiles." />} />
                <Route path="staff" element={<RoleRoute roles={LEADERSHIP}><PlaceholderPage title="Staff" description="Manage teaching and administrative staff." /></RoleRoute>} />
                <Route path="timetable" element={<PlaceholderPage title="Timetable" description="View and edit the school timetable." />} />
                <Route path="attendance" element={<PlaceholderPage title="Attendance" description="Track and manage student attendance." />} />
                <Route path="grades" element={<PlaceholderPage title="Grades" description="View and manage student grades." />} />
                <Route path="reports" element={<PlaceholderPage title="Reports" description="Generate and view school reports." />} />
                <Route path="settings" element={<RoleRoute roles={DIRECTOR_ONLY}><PlaceholderPage title="Settings" description="Configure school and system settings." /></RoleRoute>} />
              </Route>

              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
            <Toaster />
          </AuthProvider>
        </BrowserRouter>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
