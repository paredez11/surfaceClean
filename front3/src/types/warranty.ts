// front3/src/types/warranty.ts

export interface Warranty {
  id: number;
  sale_id: number;
  start_date: string;
  end_date: string;
  duration: number;
  duration_unit: string;
  status: string;
  coverage_terms: string | null;
  exclusions: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface WarrantyCustomerSummary {
  id: number;
  customer_type: string;
  first_name: string | null;
  last_name: string | null;
  business_name: string | null;
}

export interface WarrantyMachineSummary {
  id: number;
  name: string;
  status: string;
}

export interface WarrantyListItem extends Warranty {
  customer: WarrantyCustomerSummary;
  machine: WarrantyMachineSummary;
}