import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { supabase } from './supabase';
import type {
  AttendanceRecord, Assessment, Grade, StudentRemark,
  DisciplineRecord, MedicalVisit, EmergencyContact,
  FeeStructure, Invoice, Payment, Expense,
  InventoryItem, Supplier, StockMovement,
  Announcement, AuditLog,
} from './module-types';

const QK = {
  attendance: ['attendance'] as const,
  assessments: ['assessments'] as const,
  grades: ['grades'] as const,
  remarks: ['remarks'] as const,
  discipline: ['discipline'] as const,
  medical: ['medical'] as const,
  contacts: ['emergency_contacts'] as const,
  feeStructures: ['fee_structures'] as const,
  invoices: ['invoices'] as const,
  payments: ['payments'] as const,
  expenses: ['expenses'] as const,
  inventory: ['inventory_items'] as const,
  suppliers: ['suppliers'] as const,
  stockMovements: ['stock_movements'] as const,
  announcements: ['announcements'] as const,
  auditLogs: ['audit_logs'] as const,
};

function makeMutation<T, V>(
  mutationFn: (vars: V) => Promise<T>,
  queryKey: readonly unknown[],
  successMsg: string,
) {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey });
      toast({ title: successMsg });
    },
    onError: (e: Error) => toast({ title: 'Failed', description: e.message, variant: 'destructive' }),
  });
}

function makeDeleteMutation(
  mutationFn: (id: string) => Promise<void>,
  queryKey: readonly unknown[],
  successMsg: string,
) {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey });
      toast({ title: successMsg });
    },
    onError: (e: Error) => toast({ title: 'Failed', description: e.message, variant: 'destructive' }),
  });
}

// ── Attendance ──
export function useAttendance(classId?: string, date?: string) {
  return useQuery({
    queryKey: [...QK.attendance, classId, date],
    queryFn: async () => {
      let q = supabase.from('attendance_records')
        .select('*, student:student_id(id,full_name,email,avatar_url), class:class_id(id,name), subject:subject_id(id,name)');
      if (classId) q = q.eq('class_id', classId);
      if (date) q = q.eq('date', date);
      q = q.order('date', { ascending: false });
      const { data, error } = await q;
      if (error) throw error;
      return data as AttendanceRecord[];
    },
  });
}
export function useBulkUpsertAttendance() {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async (records: { class_id: string; student_id: string; date: string; status: string; subject_id?: string | null; recorded_by: string }[]) => {
      const { data, error } = await supabase.from('attendance_records').upsert(records, { onConflict: 'student_id,date,class_id,subject_id' }).select();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QK.attendance });
      toast({ title: 'Attendance saved' });
    },
    onError: (e: Error) => toast({ title: 'Failed', description: e.message, variant: 'destructive' }),
  });
}

// ── Assessments ──
export function useAssessments(filters?: { classId?: string; teacherId?: string; type?: string }) {
  return useQuery({
    queryKey: [...QK.assessments, filters],
    queryFn: async () => {
      let q = supabase.from('assessments')
        .select('*, subject:subject_id(id,name,code), class:class_id(id,name), academic_year:academic_year_id(id,name), teacher:teacher_id(id,full_name)');
      if (filters?.classId) q = q.eq('class_id', filters.classId);
      if (filters?.teacherId) q = q.eq('teacher_id', filters.teacherId);
      if (filters?.type) q = q.eq('type', filters.type);
      q = q.order('created_at', { ascending: false });
      const { data, error } = await q;
      if (error) throw error;
      return data as Assessment[];
    },
  });
}
export function useCreateAssessment() {
  return makeMutation(
    async (input: { title: string; type: string; subject_id: string; class_id: string; academic_year_id: string; teacher_id: string; max_score?: number; due_date?: string | null; description?: string | null; status?: string }) => {
      const { data, error } = await supabase.from('assessments').insert(input).select().single();
      if (error) throw error;
      return data as Assessment;
    },
    QK.assessments,
    'Assessment created',
  );
}
export function useUpdateAssessment() {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async ({ id, input }: { id: string; input: Record<string, unknown> }) => {
      const { data, error } = await supabase.from('assessments').update(input).eq('id', id).select().single();
      if (error) throw error;
      return data as Assessment;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: QK.assessments }); toast({ title: 'Assessment updated' }); },
    onError: (e: Error) => toast({ title: 'Failed', description: e.message, variant: 'destructive' }),
  });
}
export function useDeleteAssessment() {
  return makeDeleteMutation(
    async (id: string) => { const { error } = await supabase.from('assessments').delete().eq('id', id); if (error) throw error; },
    QK.assessments,
    'Assessment deleted',
  );
}

// ── Grades ──
export function useGrades(assessmentId?: string) {
  return useQuery({
    queryKey: [...QK.grades, assessmentId],
    queryFn: async () => {
      let q = supabase.from('grades')
        .select('*, student:student_id(id,full_name,email,avatar_url), assessment:assessment_id(id,title,type,max_score,subject:subject_id(name))');
      if (assessmentId) q = q.eq('assessment_id', assessmentId);
      q = q.order('created_at', { ascending: false });
      const { data, error } = await q;
      if (error) throw error;
      return data as Grade[];
    },
  });
}
export function useBulkUpsertGrades() {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async (records: { assessment_id: string; student_id: string; score: number; remarks?: string | null; graded_by: string }[]) => {
      const { data, error } = await supabase.from('grades').upsert(records, { onConflict: 'assessment_id,student_id' }).select();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QK.grades });
      toast({ title: 'Grades saved' });
    },
    onError: (e: Error) => toast({ title: 'Failed', description: e.message, variant: 'destructive' }),
  });
}

// ── Remarks ──
export function useRemarks(studentId?: string) {
  return useQuery({
    queryKey: [...QK.remarks, studentId],
    queryFn: async () => {
      let q = supabase.from('student_remarks')
        .select('*, student:student_id(id,full_name), teacher:teacher_id(id,full_name)');
      if (studentId) q = q.eq('student_id', studentId);
      q = q.order('created_at', { ascending: false });
      const { data, error } = await q;
      if (error) throw error;
      return data as StudentRemark[];
    },
  });
}
export function useCreateRemark() {
  return makeMutation(
    async (input: { student_id: string; class_id: string; academic_year_id: string; teacher_id: string; remark: string; category?: string; term_id?: string | null }) => {
      const { data, error } = await supabase.from('student_remarks').insert(input).select().single();
      if (error) throw error;
      return data as StudentRemark;
    },
    QK.remarks,
    'Remark added',
  );
}
export function useDeleteRemark() {
  return makeDeleteMutation(
    async (id: string) => { const { error } = await supabase.from('student_remarks').delete().eq('id', id); if (error) throw error; },
    QK.remarks,
    'Remark removed',
  );
}

// ── Discipline ──
export function useDisciplineRecords(filters?: { studentId?: string; status?: string; type?: string }) {
  return useQuery({
    queryKey: [...QK.discipline, filters],
    queryFn: async () => {
      let q = supabase.from('discipline_records')
        .select('*, student:student_id(id,full_name,email), class:class_id(id,name), reporter:reported_by(id,full_name)');
      if (filters?.studentId) q = q.eq('student_id', filters.studentId);
      if (filters?.status) q = q.eq('status', filters.status);
      if (filters?.type) q = q.eq('type', filters.type);
      q = q.order('incident_date', { ascending: false });
      const { data, error } = await q;
      if (error) throw error;
      return data as DisciplineRecord[];
    },
  });
}
export function useCreateDiscipline() {
  return makeMutation(
    async (input: { student_id: string; class_id?: string | null; incident_date: string; type: string; description: string; action_taken?: string | null; status?: string; reported_by?: string | null }) => {
      const { data, error } = await supabase.from('discipline_records').insert(input).select().single();
      if (error) throw error;
      return data as DisciplineRecord;
    },
    QK.discipline,
    'Discipline record created',
  );
}
export function useUpdateDiscipline() {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async ({ id, input }: { id: string; input: Record<string, unknown> }) => {
      const { data, error } = await supabase.from('discipline_records').update(input).eq('id', id).select().single();
      if (error) throw error;
      return data as DisciplineRecord;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: QK.discipline }); toast({ title: 'Record updated' }); },
    onError: (e: Error) => toast({ title: 'Failed', description: e.message, variant: 'destructive' }),
  });
}
export function useDeleteDiscipline() {
  return makeDeleteMutation(
    async (id: string) => { const { error } = await supabase.from('discipline_records').delete().eq('id', id); if (error) throw error; },
    QK.discipline,
    'Record deleted',
  );
}

// ── Medical ──
export function useMedicalVisits(studentId?: string) {
  return useQuery({
    queryKey: [...QK.medical, studentId],
    queryFn: async () => {
      let q = supabase.from('medical_visits')
        .select('*, student:student_id(id,full_name,email)');
      if (studentId) q = q.eq('student_id', studentId);
      q = q.order('visit_date', { ascending: false });
      const { data, error } = await q;
      if (error) throw error;
      return data as MedicalVisit[];
    },
  });
}
export function useCreateMedicalVisit() {
  return makeMutation(
    async (input: { student_id: string; visit_date: string; diagnosis?: string | null; treatment?: string | null; medication?: string | null; severity?: string; notes?: string | null; recorded_by?: string | null }) => {
      const { data, error } = await supabase.from('medical_visits').insert(input).select().single();
      if (error) throw error;
      return data as MedicalVisit;
    },
    QK.medical,
    'Medical visit logged',
  );
}
export function useDeleteMedicalVisit() {
  return makeDeleteMutation(
    async (id: string) => { const { error } = await supabase.from('medical_visits').delete().eq('id', id); if (error) throw error; },
    QK.medical,
    'Visit deleted',
  );
}

// ── Emergency Contacts ──
export function useEmergencyContacts(studentId?: string) {
  return useQuery({
    queryKey: [...QK.contacts, studentId],
    queryFn: async () => {
      let q = supabase.from('emergency_contacts')
        .select('*, student:student_id(id,full_name)');
      if (studentId) q = q.eq('student_id', studentId);
      const { data, error } = await q;
      if (error) throw error;
      return data as EmergencyContact[];
    },
  });
}
export function useCreateEmergencyContact() {
  return makeMutation(
    async (input: { student_id: string; name: string; relationship: string; phone: string; email?: string | null; is_primary?: boolean }) => {
      const { data, error } = await supabase.from('emergency_contacts').insert(input).select().single();
      if (error) throw error;
      return data as EmergencyContact;
    },
    QK.contacts,
    'Contact added',
  );
}
export function useDeleteEmergencyContact() {
  return makeDeleteMutation(
    async (id: string) => { const { error } = await supabase.from('emergency_contacts').delete().eq('id', id); if (error) throw error; },
    QK.contacts,
    'Contact removed',
  );
}

// ── Fee Structures ──
export function useFeeStructures() {
  return useQuery({
    queryKey: QK.feeStructures,
    queryFn: async () => {
      const { data, error } = await supabase.from('fee_structures')
        .select('*, academic_year:academic_year_id(id,name)').order('created_at', { ascending: false });
      if (error) throw error;
      return data as FeeStructure[];
    },
  });
}
export function useCreateFeeStructure() {
  return makeMutation(
    async (input: { name: string; academic_year_id: string; term_id?: string | null; grade_level?: number | null; amount: number; fee_type: string; description?: string | null }) => {
      const { data, error } = await supabase.from('fee_structures').insert(input).select().single();
      if (error) throw error;
      return data as FeeStructure;
    },
    QK.feeStructures,
    'Fee structure created',
  );
}
export function useDeleteFeeStructure() {
  return makeDeleteMutation(
    async (id: string) => { const { error } = await supabase.from('fee_structures').delete().eq('id', id); if (error) throw error; },
    QK.feeStructures,
    'Fee structure deleted',
  );
}

// ── Invoices ──
export function useInvoices(filters?: { studentId?: string; status?: string }) {
  return useQuery({
    queryKey: [...QK.invoices, filters],
    queryFn: async () => {
      let q = supabase.from('invoices')
        .select('*, student:student_id(id,full_name,email), academic_year:academic_year_id(id,name)');
      if (filters?.studentId) q = q.eq('student_id', filters.studentId);
      if (filters?.status) q = q.eq('status', filters.status);
      q = q.order('issued_date', { ascending: false });
      const { data, error } = await q;
      if (error) throw error;
      return data as Invoice[];
    },
  });
}
export function useCreateInvoice() {
  return makeMutation(
    async (input: { invoice_number: string; student_id: string; fee_structure_id?: string | null; academic_year_id: string; amount: number; due_date?: string | null; notes?: string | null; created_by?: string | null }) => {
      const { data, error } = await supabase.from('invoices').insert(input).select().single();
      if (error) throw error;
      return data as Invoice;
    },
    QK.invoices,
    'Invoice created',
  );
}
export function useDeleteInvoice() {
  return makeDeleteMutation(
    async (id: string) => { const { error } = await supabase.from('invoices').delete().eq('id', id); if (error) throw error; },
    QK.invoices,
    'Invoice deleted',
  );
}

// ── Payments ──
export function usePayments(filters?: { invoiceId?: string; studentId?: string }) {
  return useQuery({
    queryKey: [...QK.payments, filters],
    queryFn: async () => {
      let q = supabase.from('payments')
        .select('*, student:student_id(id,full_name,email), invoice:invoice_id(id,invoice_number)');
      if (filters?.invoiceId) q = q.eq('invoice_id', filters.invoiceId);
      if (filters?.studentId) q = q.eq('student_id', filters.studentId);
      q = q.order('payment_date', { ascending: false });
      const { data, error } = await q;
      if (error) throw error;
      return data as Payment[];
    },
  });
}
export function useCreatePayment() {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async (input: { receipt_number: string; invoice_id: string; student_id: string; amount: number; payment_method?: string; payment_date?: string; recorded_by?: string | null; notes?: string | null }) => {
      const { data, error } = await supabase.from('payments').insert(input).select().single();
      if (error) throw error;
      // Update invoice paid_amount
      const { data: inv } = await supabase.from('invoices').select('amount,paid_amount').eq('id', input.invoice_id).single();
      if (inv) {
        const newPaid = Number(inv.paid_amount) + Number(input.amount);
        const status = newPaid >= Number(inv.amount) ? 'paid' : newPaid > 0 ? 'partial' : 'unpaid';
        await supabase.from('invoices').update({ paid_amount: newPaid, status }).eq('id', input.invoice_id);
      }
      return data as Payment;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QK.payments });
      qc.invalidateQueries({ queryKey: QK.invoices });
      toast({ title: 'Payment recorded' });
    },
    onError: (e: Error) => toast({ title: 'Failed', description: e.message, variant: 'destructive' }),
  });
}

// ── Expenses ──
export function useExpenses() {
  return useQuery({
    queryKey: QK.expenses,
    queryFn: async () => {
      const { data, error } = await supabase.from('expenses').select('*').order('expense_date', { ascending: false });
      if (error) throw error;
      return data as Expense[];
    },
  });
}
export function useCreateExpense() {
  return makeMutation(
    async (input: { category: string; description: string; amount: number; expense_date?: string; recorded_by?: string | null }) => {
      const { data, error } = await supabase.from('expenses').insert(input).select().single();
      if (error) throw error;
      return data as Expense;
    },
    QK.expenses,
    'Expense recorded',
  );
}
export function useDeleteExpense() {
  return makeDeleteMutation(
    async (id: string) => { const { error } = await supabase.from('expenses').delete().eq('id', id); if (error) throw error; },
    QK.expenses,
    'Expense deleted',
  );
}

// ── Inventory ──
export function useInventory() {
  return useQuery({
    queryKey: QK.inventory,
    queryFn: async () => {
      const { data, error } = await supabase.from('inventory_items').select('*').order('name');
      if (error) throw error;
      return data as InventoryItem[];
    },
  });
}
export function useCreateInventoryItem() {
  return makeMutation(
    async (input: { name: string; sku?: string | null; category?: string; unit?: string; quantity?: number; reorder_level?: number; unit_cost?: number; location?: string | null }) => {
      const { data, error } = await supabase.from('inventory_items').insert(input).select().single();
      if (error) throw error;
      return data as InventoryItem;
    },
    QK.inventory,
    'Item created',
  );
}
export function useUpdateInventoryItem() {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async ({ id, input }: { id: string; input: Record<string, unknown> }) => {
      const { data, error } = await supabase.from('inventory_items').update(input).eq('id', id).select().single();
      if (error) throw error;
      return data as InventoryItem;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: QK.inventory }); toast({ title: 'Item updated' }); },
    onError: (e: Error) => toast({ title: 'Failed', description: e.message, variant: 'destructive' }),
  });
}
export function useDeleteInventoryItem() {
  return makeDeleteMutation(
    async (id: string) => { const { error } = await supabase.from('inventory_items').delete().eq('id', id); if (error) throw error; },
    QK.inventory,
    'Item deleted',
  );
}

// ── Suppliers ──
export function useSuppliers() {
  return useQuery({
    queryKey: QK.suppliers,
    queryFn: async () => {
      const { data, error } = await supabase.from('suppliers').select('*').order('name');
      if (error) throw error;
      return data as Supplier[];
    },
  });
}
export function useCreateSupplier() {
  return makeMutation(
    async (input: { name: string; contact_person?: string | null; phone?: string | null; email?: string | null; address?: string | null }) => {
      const { data, error } = await supabase.from('suppliers').insert(input).select().single();
      if (error) throw error;
      return data as Supplier;
    },
    QK.suppliers,
    'Supplier created',
  );
}
export function useDeleteSupplier() {
  return makeDeleteMutation(
    async (id: string) => { const { error } = await supabase.from('suppliers').delete().eq('id', id); if (error) throw error; },
    QK.suppliers,
    'Supplier deleted',
  );
}

// ── Stock Movements ──
export function useStockMovements(itemId?: string) {
  return useQuery({
    queryKey: [...QK.stockMovements, itemId],
    queryFn: async () => {
      let q = supabase.from('stock_movements')
        .select('*, item:item_id(id,name,unit), supplier:supplier_id(id,name)');
      if (itemId) q = q.eq('item_id', itemId);
      q = q.order('created_at', { ascending: false });
      const { data, error } = await q;
      if (error) throw error;
      return data as StockMovement[];
    },
  });
}
export function useCreateStockMovement() {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async (input: { item_id: string; supplier_id?: string | null; type: string; quantity: number; reason?: string | null; recorded_by?: string | null }) => {
      const { data, error } = await supabase.from('stock_movements').insert(input).select().single();
      if (error) throw error;
      // Update inventory quantity
      const { data: item } = await supabase.from('inventory_items').select('quantity').eq('id', input.item_id).single();
      if (item) {
        const delta = input.type === 'in' ? input.quantity : input.type === 'out' ? -input.quantity : 0;
        if (input.type === 'adjustment') {
          await supabase.from('inventory_items').update({ quantity: input.quantity }).eq('id', input.item_id);
        } else {
          await supabase.from('inventory_items').update({ quantity: item.quantity + delta }).eq('id', input.item_id);
        }
      }
      return data as StockMovement;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QK.stockMovements });
      qc.invalidateQueries({ queryKey: QK.inventory });
      toast({ title: 'Stock movement recorded' });
    },
    onError: (e: Error) => toast({ title: 'Failed', description: e.message, variant: 'destructive' }),
  });
}

// ── Announcements ──
export function useAnnouncements(audience?: string) {
  return useQuery({
    queryKey: [...QK.announcements, audience],
    queryFn: async () => {
      let q = supabase.from('announcements')
        .select('*, author:published_by(id,full_name), class:class_id(id,name)');
      if (audience) q = q.eq('audience', audience);
      q = q.order('published_at', { ascending: false });
      const { data, error } = await q;
      if (error) throw error;
      return data as Announcement[];
    },
  });
}
export function useCreateAnnouncement() {
  return makeMutation(
    async (input: { title: string; content: string; audience?: string; class_id?: string | null; priority?: string; published_by: string }) => {
      const { data, error } = await supabase.from('announcements').insert(input).select().single();
      if (error) throw error;
      return data as Announcement;
    },
    QK.announcements,
    'Announcement published',
  );
}
export function useDeleteAnnouncement() {
  return makeDeleteMutation(
    async (id: string) => { const { error } = await supabase.from('announcements').delete().eq('id', id); if (error) throw error; },
    QK.announcements,
    'Announcement deleted',
  );
}

// ── Audit Logs ──
export function useAuditLogs() {
  return useQuery({
    queryKey: QK.auditLogs,
    queryFn: async () => {
      const { data, error } = await supabase.from('audit_logs')
        .select('*, user:user_id(id,full_name,email)').order('created_at', { ascending: false }).limit(100);
      if (error) throw error;
      return data as AuditLog[];
    },
  });
}
