// front3/src/types/customer.ts

import type { Machine } from "./machine";
import type { Warranty } from "./warranty";
import type { ServiceRecord } from "./serviceRecord";

export interface Customer {
  id: number;
  customer_type: string;
  first_name: string | null;
  last_name: string | null;
  business_name: string | null;
  email: string | null;
  phone: string | null;
  address_line_1: string | null;
  address_line_2: string | null;
  city: string | null;
  state: string | null;
  postal_code: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface CustomerSaleDetail {
  id: number;
  customer_id: number;
  machine_id: number;

  asking_price: number | null;
  sale_price: number;
  status: string;

  sold_at: string | null;
  delivered_at: string | null;
  notes: string | null;

  created_at: string;
  updated_at: string;

  machine: Machine;
  warranty: Warranty | null;
  service_records: ServiceRecord[];
}

export interface CustomerDetail extends Customer {
  sales: CustomerSaleDetail[];
}