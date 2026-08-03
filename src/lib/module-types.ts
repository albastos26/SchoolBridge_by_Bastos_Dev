import type { UserRole } from './types';

export interface AttendanceRecord {
  id: string;
  class_id: string;
  subject_id: string | null;
  student_id: string;
  date: string;
  status: 'present' | 'absent' | 'late' | 'excused';
  notes: string | null;
  recorded_by: string | null;
  created_at: string;
  updated_at: string;
  student?: { id: string; full_name: string | null; email: string; avatar_url: string | null } | null;
  class?: { id: string; name: string } | null;
  subject?: { id: string; name: string } | null;
}

export interface Assessment {
  id: string;
  title: string;
  type: 'quiz' | 'exam' | 'assignment' | 'homework';
  subject_id: string;
  class_id: string;
  academic_year_id: string;
  term_id: string | null;
  teacher_id: string;
  max_score: number;
  due_date: string | null;
  description: string | null;
  status: 'draft' | 'published' | 'closed';
  created_at: string;
  updated_at: string;
  subject?: { id: string; name: string; code: string } | null;
  class?: { id: string; name: string } | null;
  academic_year?: { id: string; name: string } | null;
  teacher?: { id: string; full_name: string | null } | null;
  _count?: { grades: number };
}

export interface Grade {
  id: string;
  assessment_id: string;
  student_id: string;
  score: number;
  remarks: string | null;
  graded_by: string | null;
  created_at: string;
  updated_at: string;
  student?: { id: string; full_name: string | null; email: string; avatar_url: string | null } | null;
  assessment?: { id: string; title: string; type: string; max_score: number; subject?: { name: string } | null } | null;
}

export interface StudentRemark {
  id: string;
  student_id: string;
  class_id: string;
  academic_year_id: string;
  term_id: string | null;
  teacher_id: string;
  remark: string;
  category: 'general' | 'academic' | 'behavior' | 'improvement';
  created_at: string;
  updated_at: string;
  student?: { id: string; full_name: string | null } | null;
  teacher?: { id: string; full_name: string | null } | null;
}

export interface DisciplineRecord {
  id: string;
  student_id: string;
  class_id: string | null;
  incident_date: string;
  type: 'warning' | 'minor' | 'major' | 'suspension' | 'expulsion';
  description: string;
  action_taken: string | null;
  status: 'open' | 'resolved' | 'escalated';
  reported_by: string | null;
  resolved_by: string | null;
  resolved_at: string | null;
  created_at: string;
  updated_at: string;
  student?: { id: string; full_name: string | null; email: string } | null;
  class?: { id: string; name: string } | null;
  reporter?: { id: string; full_name: string | null } | null;
}

export interface MedicalVisit {
  id: string;
  student_id: string;
  visit_date: string;
  diagnosis: string | null;
  treatment: string | null;
  medication: string | null;
  severity: 'minor' | 'moderate' | 'serious' | 'emergency';
  notes: string | null;
  recorded_by: string | null;
  created_at: string;
  updated_at: string;
  student?: { id: string; full_name: string | null; email: string } | null;
}

export interface EmergencyContact {
  id: string;
  student_id: string;
  name: string;
  relationship: string;
  phone: string;
  email: string | null;
  is_primary: boolean;
  created_at: string;
  updated_at: string;
  student?: { id: string; full_name: string | null } | null;
}

export interface FeeStructure {
  id: string;
  name: string;
  academic_year_id: string;
  term_id: string | null;
  grade_level: number | null;
  amount: number;
  fee_type: 'tuition' | 'registration' | 'lab' | 'library' | 'sports' | 'other';
  description: string | null;
  created_at: string;
  updated_at: string;
  academic_year?: { id: string; name: string } | null;
}

export interface Invoice {
  id: string;
  invoice_number: string;
  student_id: string;
  fee_structure_id: string | null;
  academic_year_id: string;
  amount: number;
  paid_amount: number;
  status: 'unpaid' | 'partial' | 'paid' | 'overdue' | 'cancelled';
  due_date: string | null;
  issued_date: string;
  notes: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  student?: { id: string; full_name: string | null; email: string } | null;
  academic_year?: { id: string; name: string } | null;
  _count?: { payments: number };
}

export interface Payment {
  id: string;
  receipt_number: string;
  invoice_id: string;
  student_id: string;
  amount: number;
  payment_method: 'cash' | 'bank_transfer' | 'mobile_money' | 'card' | 'check';
  payment_date: string;
  recorded_by: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  student?: { id: string; full_name: string | null; email: string } | null;
  invoice?: { id: string; invoice_number: string } | null;
}

export interface Expense {
  id: string;
  category: 'salaries' | 'supplies' | 'maintenance' | 'utilities' | 'transport' | 'other';
  description: string;
  amount: number;
  expense_date: string;
  recorded_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface InventoryItem {
  id: string;
  name: string;
  sku: string | null;
  category: string;
  unit: string;
  quantity: number;
  reorder_level: number;
  unit_cost: number;
  location: string | null;
  created_at: string;
  updated_at: string;
}

export interface Supplier {
  id: string;
  name: string;
  contact_person: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  created_at: string;
  updated_at: string;
}

export interface StockMovement {
  id: string;
  item_id: string;
  supplier_id: string | null;
  type: 'in' | 'out' | 'adjustment';
  quantity: number;
  reason: string | null;
  recorded_by: string | null;
  created_at: string;
  item?: { id: string; name: string; unit: string } | null;
  supplier?: { id: string; name: string } | null;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  audience: 'all' | 'staff' | 'students' | 'parents' | 'class';
  class_id: string | null;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  published_by: string;
  published_at: string;
  expires_at: string | null;
  created_at: string;
  updated_at: string;
  author?: { id: string; full_name: string | null } | null;
  class?: { id: string; name: string } | null;
}

export interface AuditLog {
  id: string;
  user_id: string | null;
  action: string;
  entity_type: string | null;
  entity_id: string | null;
  details: Record<string, unknown> | null;
  ip_address: string | null;
  created_at: string;
  user?: { id: string; full_name: string | null; email: string } | null;
}
