//front3/src/types/serviceRecord.ts

export interface ServiceRecord {
  id: number;
  machine_id: number;
  sale_id: number | null;
  warranty_id: number | null;
  service_type: string;
  reported_issue: string | null;
  diagnosis: string | null;
  work_performed: string | null;
  service_date: string;
  covered_by_warranty: boolean;
  labor_cost: number | null;
  parts_cost: number | null;
  total_cost: number | null;
  technician: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface ServiceRecordMachineSummary {
  id: number;
  name: string;
  status: string;
}

export interface ServiceRecordCustomerSummary {
  id: number;
  customer_type: string;
  first_name: string | null;
  last_name: string | null;
  business_name: string | null;
}

export interface ServiceRecordListItem extends ServiceRecord {
  machine: ServiceRecordMachineSummary;
  customer: ServiceRecordCustomerSummary | null;
}