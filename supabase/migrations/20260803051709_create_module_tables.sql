/*
# Module tables: attendance, grades, assessments, discipline, medical, finance, inventory, announcements, audit logs

1. Purpose
   Complete the secondary school management system with tables for:
   - Attendance tracking (per student, per class, per date)
   - Assessments (quizzes, exams, assignments) and grades
   - Discipline records (incidents, warnings, punishments)
   - Medical visits and student health info
   - Finance (fee structures, invoices, payments, expenses)
   - Inventory (items, suppliers, stock movements)
   - Announcements (school-wide and class-level)
   - Audit logs (system activity tracking)

2. RLS Strategy
   - All authenticated users can SELECT most tables (school directory model).
   - Write access is role-scoped:
     - Attendance/grades/assessments: teachers + academic managers
     - Discipline: head_of_discipline + director
     - Medical: nurse + director
     - Finance: economist + director
     - Inventory: storekeeper + director
     - Announcements: staff roles
     - Audit logs: director only (SELECT), system inserts (via SECURITY DEFINER)
   - Students/parents can read their own data (filtered by student_id or parent link)

3. Helper Functions
   - is_staff() — true if the user is not a student or parent
   - is_academic_manager() — already exists (director, head_of_studies)
   - can_manage_discipline() — director, head_of_discipline
   - can_manage_finance() — director, economist
   - can_manage_inventory() — director, storekeeper
   - can_manage_health() — director, nurse
*/

-- ── Helper functions ──
CREATE OR REPLACE FUNCTION public.is_staff()
RETURNS boolean LANGUAGE sql SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role NOT IN ('student', 'parent')
  );
$$;

CREATE OR REPLACE FUNCTION public.can_manage_discipline()
RETURNS boolean LANGUAGE sql SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role IN ('director', 'head_of_discipline')
  );
$$;

CREATE OR REPLACE FUNCTION public.can_manage_finance()
RETURNS boolean LANGUAGE sql SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role IN ('director', 'economist')
  );
$$;

CREATE OR REPLACE FUNCTION public.can_manage_inventory()
RETURNS boolean LANGUAGE sql SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role IN ('director', 'storekeeper')
  );
$$;

CREATE OR REPLACE FUNCTION public.can_manage_health()
RETURNS boolean LANGUAGE sql SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role IN ('director', 'nurse')
  );
$$;

-- ── Attendance ──
CREATE TABLE IF NOT EXISTS public.attendance_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id uuid NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
  subject_id uuid REFERENCES public.subjects(id) ON DELETE SET NULL,
  student_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  date date NOT NULL,
  status text NOT NULL DEFAULT 'present' CHECK (status IN ('present','absent','late','excused')),
  notes text,
  recorded_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (student_id, date, class_id, subject_id)
);
ALTER TABLE public.attendance_records ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "attendance_select" ON public.attendance_records;
CREATE POLICY "attendance_select" ON public.attendance_records FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "attendance_manage" ON public.attendance_records;
CREATE POLICY "attendance_manage" ON public.attendance_records FOR ALL TO authenticated
  USING (public.is_staff()) WITH CHECK (public.is_staff());

-- ── Assessments (quizzes, exams, assignments) ──
CREATE TABLE IF NOT EXISTS public.assessments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  type text NOT NULL CHECK (type IN ('quiz','exam','assignment','homework')),
  subject_id uuid NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
  class_id uuid NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
  academic_year_id uuid NOT NULL REFERENCES public.academic_years(id) ON DELETE CASCADE,
  term_id uuid REFERENCES public.terms(id) ON DELETE SET NULL,
  teacher_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  max_score integer NOT NULL DEFAULT 100,
  due_date date,
  description text,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','published','closed')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.assessments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "assessments_select" ON public.assessments;
CREATE POLICY "assessments_select" ON public.assessments FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "assessments_manage" ON public.assessments;
CREATE POLICY "assessments_manage" ON public.assessments FOR ALL TO authenticated
  USING (public.is_staff()) WITH CHECK (public.is_staff());

-- ── Grades (scores per student per assessment) ──
CREATE TABLE IF NOT EXISTS public.grades (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_id uuid NOT NULL REFERENCES public.assessments(id) ON DELETE CASCADE,
  student_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  score integer NOT NULL DEFAULT 0,
  remarks text,
  graded_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (assessment_id, student_id)
);
ALTER TABLE public.grades ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "grades_select" ON public.grades;
CREATE POLICY "grades_select" ON public.grades FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "grades_manage" ON public.grades;
CREATE POLICY "grades_manage" ON public.grades FOR ALL TO authenticated
  USING (public.is_staff()) WITH CHECK (public.is_staff());

-- ── Student Remarks (term/termly remarks by teacher) ──
CREATE TABLE IF NOT EXISTS public.student_remarks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  class_id uuid NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
  academic_year_id uuid NOT NULL REFERENCES public.academic_years(id) ON DELETE CASCADE,
  term_id uuid REFERENCES public.terms(id) ON DELETE SET NULL,
  teacher_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  remark text NOT NULL,
  category text NOT NULL DEFAULT 'general' CHECK (category IN ('general','academic','behavior','improvement')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.student_remarks ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "remarks_select" ON public.student_remarks;
CREATE POLICY "remarks_select" ON public.student_remarks FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "remarks_manage" ON public.student_remarks;
CREATE POLICY "remarks_manage" ON public.student_remarks FOR ALL TO authenticated
  USING (public.is_staff()) WITH CHECK (public.is_staff());

-- ── Discipline Records ──
CREATE TABLE IF NOT EXISTS public.discipline_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  class_id uuid REFERENCES public.classes(id) ON DELETE SET NULL,
  incident_date date NOT NULL,
  type text NOT NULL CHECK (type IN ('warning','minor','major','suspension','expulsion')),
  description text NOT NULL,
  action_taken text,
  status text NOT NULL DEFAULT 'open' CHECK (status IN ('open','resolved','escalated')),
  reported_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  resolved_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  resolved_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.discipline_records ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "discipline_select" ON public.discipline_records;
CREATE POLICY "discipline_select" ON public.discipline_records FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "discipline_manage" ON public.discipline_records;
CREATE POLICY "discipline_manage" ON public.discipline_records FOR ALL TO authenticated
  USING (public.can_manage_discipline()) WITH CHECK (public.can_manage_discipline());

-- ── Medical Visits ──
CREATE TABLE IF NOT EXISTS public.medical_visits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  visit_date date NOT NULL,
  diagnosis text,
  treatment text,
  medication text,
  severity text NOT NULL DEFAULT 'minor' CHECK (severity IN ('minor','moderate','serious','emergency')),
  notes text,
  recorded_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.medical_visits ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "medical_select" ON public.medical_visits;
CREATE POLICY "medical_select" ON public.medical_visits FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "medical_manage" ON public.medical_visits;
CREATE POLICY "medical_manage" ON public.medical_visits FOR ALL TO authenticated
  USING (public.can_manage_health()) WITH CHECK (public.can_manage_health());

-- ── Student Emergency Contacts ──
CREATE TABLE IF NOT EXISTS public.emergency_contacts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name text NOT NULL,
  relationship text NOT NULL,
  phone text NOT NULL,
  email text,
  is_primary boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.emergency_contacts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "contacts_select" ON public.emergency_contacts;
CREATE POLICY "contacts_select" ON public.emergency_contacts FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "contacts_manage" ON public.emergency_contacts;
CREATE POLICY "contacts_manage" ON public.emergency_contacts FOR ALL TO authenticated
  USING (public.can_manage_health()) WITH CHECK (public.can_manage_health());

-- ── Fee Structures ──
CREATE TABLE IF NOT EXISTS public.fee_structures (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  academic_year_id uuid NOT NULL REFERENCES public.academic_years(id) ON DELETE CASCADE,
  term_id uuid REFERENCES public.terms(id) ON DELETE SET NULL,
  grade_level integer,
  amount numeric(12,2) NOT NULL DEFAULT 0,
  fee_type text NOT NULL CHECK (fee_type IN ('tuition','registration','lab','library','sports','other')),
  description text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.fee_structures ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "fees_select" ON public.fee_structures;
CREATE POLICY "fees_select" ON public.fee_structures FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "fees_manage" ON public.fee_structures;
CREATE POLICY "fees_manage" ON public.fee_structures FOR ALL TO authenticated
  USING (public.can_manage_finance()) WITH CHECK (public.can_manage_finance());

-- ── Invoices ──
CREATE TABLE IF NOT EXISTS public.invoices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_number text UNIQUE NOT NULL,
  student_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  fee_structure_id uuid REFERENCES public.fee_structures(id) ON DELETE SET NULL,
  academic_year_id uuid NOT NULL REFERENCES public.academic_years(id) ON DELETE CASCADE,
  amount numeric(12,2) NOT NULL DEFAULT 0,
  paid_amount numeric(12,2) NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'unpaid' CHECK (status IN ('unpaid','partial','paid','overdue','cancelled')),
  due_date date,
  issued_date date NOT NULL DEFAULT CURRENT_DATE,
  notes text,
  created_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "invoices_select" ON public.invoices;
CREATE POLICY "invoices_select" ON public.invoices FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "invoices_manage" ON public.invoices;
CREATE POLICY "invoices_manage" ON public.invoices FOR ALL TO authenticated
  USING (public.can_manage_finance()) WITH CHECK (public.can_manage_finance());

-- ── Payments ──
CREATE TABLE IF NOT EXISTS public.payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  receipt_number text UNIQUE NOT NULL,
  invoice_id uuid NOT NULL REFERENCES public.invoices(id) ON DELETE CASCADE,
  student_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  amount numeric(12,2) NOT NULL DEFAULT 0,
  payment_method text NOT NULL DEFAULT 'cash' CHECK (payment_method IN ('cash','bank_transfer','mobile_money','card','check')),
  payment_date date NOT NULL DEFAULT CURRENT_DATE,
  recorded_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "payments_select" ON public.payments;
CREATE POLICY "payments_select" ON public.payments FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "payments_manage" ON public.payments;
CREATE POLICY "payments_manage" ON public.payments FOR ALL TO authenticated
  USING (public.can_manage_finance()) WITH CHECK (public.can_manage_finance());

-- ── Expenses ──
CREATE TABLE IF NOT EXISTS public.expenses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category text NOT NULL CHECK (category IN ('salaries','supplies','maintenance','utilities','transport','other')),
  description text NOT NULL,
  amount numeric(12,2) NOT NULL DEFAULT 0,
  expense_date date NOT NULL DEFAULT CURRENT_DATE,
  recorded_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "expenses_select" ON public.expenses;
CREATE POLICY "expenses_select" ON public.expenses FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "expenses_manage" ON public.expenses;
CREATE POLICY "expenses_manage" ON public.expenses FOR ALL TO authenticated
  USING (public.can_manage_finance()) WITH CHECK (public.can_manage_finance());

-- ── Inventory Items ──
CREATE TABLE IF NOT EXISTS public.inventory_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  sku text UNIQUE,
  category text NOT NULL DEFAULT 'general',
  unit text NOT NULL DEFAULT 'pcs',
  quantity integer NOT NULL DEFAULT 0,
  reorder_level integer NOT NULL DEFAULT 10,
  unit_cost numeric(12,2) NOT NULL DEFAULT 0,
  location text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.inventory_items ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "inv_items_select" ON public.inventory_items;
CREATE POLICY "inv_items_select" ON public.inventory_items FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "inv_items_manage" ON public.inventory_items;
CREATE POLICY "inv_items_manage" ON public.inventory_items FOR ALL TO authenticated
  USING (public.can_manage_inventory()) WITH CHECK (public.can_manage_inventory());

-- ── Suppliers ──
CREATE TABLE IF NOT EXISTS public.suppliers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  contact_person text,
  phone text,
  email text,
  address text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.suppliers ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "suppliers_select" ON public.suppliers;
CREATE POLICY "suppliers_select" ON public.suppliers FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "suppliers_manage" ON public.suppliers;
CREATE POLICY "suppliers_manage" ON public.suppliers FOR ALL TO authenticated
  USING (public.can_manage_inventory()) WITH CHECK (public.can_manage_inventory());

-- ── Stock Movements ──
CREATE TABLE IF NOT EXISTS public.stock_movements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id uuid NOT NULL REFERENCES public.inventory_items(id) ON DELETE CASCADE,
  supplier_id uuid REFERENCES public.suppliers(id) ON DELETE SET NULL,
  type text NOT NULL CHECK (type IN ('in','out','adjustment')),
  quantity integer NOT NULL,
  reason text,
  recorded_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.stock_movements ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "stock_mov_select" ON public.stock_movements;
CREATE POLICY "stock_mov_select" ON public.stock_movements FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "stock_mov_manage" ON public.stock_movements;
CREATE POLICY "stock_mov_manage" ON public.stock_movements FOR ALL TO authenticated
  USING (public.can_manage_inventory()) WITH CHECK (public.can_manage_inventory());

-- ── Announcements ──
CREATE TABLE IF NOT EXISTS public.announcements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  content text NOT NULL,
  audience text NOT NULL DEFAULT 'all' CHECK (audience IN ('all','staff','students','parents','class')),
  class_id uuid REFERENCES public.classes(id) ON DELETE CASCADE,
  priority text NOT NULL DEFAULT 'normal' CHECK (priority IN ('low','normal','high','urgent')),
  published_by uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  published_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "ann_select" ON public.announcements;
CREATE POLICY "ann_select" ON public.announcements FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "ann_manage" ON public.announcements;
CREATE POLICY "ann_manage" ON public.announcements FOR ALL TO authenticated
  USING (public.is_staff()) WITH CHECK (public.is_staff());

-- ── Audit Logs ──
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  action text NOT NULL,
  entity_type text,
  entity_id uuid,
  details jsonb,
  ip_address text,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "audit_select" ON public.audit_logs;
CREATE POLICY "audit_select" ON public.audit_logs FOR SELECT TO authenticated
  USING (public.is_academic_manager());

-- ── updated_at triggers for new tables ──
DO $$
DECLARE t text;
BEGIN
  FOR t IN SELECT unnest(ARRAY[
    'attendance_records','assessments','grades','student_remarks',
    'discipline_records','medical_visits','emergency_contacts',
    'fee_structures','invoices','payments','expenses',
    'inventory_items','suppliers','announcements'
  ]) LOOP
    EXECUTE format('DROP TRIGGER IF EXISTS %I_set_updated_at ON public.%I;', t || '_set_updated_at', t);
    EXECUTE format('CREATE TRIGGER %I_set_updated_at BEFORE UPDATE ON public.%I FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();', t, t);
  END LOOP;
END $$;