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
