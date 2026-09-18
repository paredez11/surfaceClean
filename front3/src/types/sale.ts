// front3/src/types/sale.ts

import type { Customer } from "./customer";
import type { Machine } from "./machine";

export interface Sale {
  id: number;
  customer_id: number;
  machine_id: number;

  asking_price: number | null;
  sale_price: number;

  status: "sold" | "delivered" | "cancelled";

  sold_at: string | null;
  delivered_at: string | null;

  billing_address_line_1: string | null;
  billing_address_line_2: string | null;
  billing_city: string | null;
  billing_state: string | null;
  billing_postal_code: string | null;

  delivery_same_as_billing: boolean;

  delivery_address_line_1: string | null;
  delivery_address_line_2: string | null;
  delivery_city: string | null;
  delivery_state: string | null;
  delivery_postal_code: string | null;

  notes: string | null;

  created_at: string;
  updated_at: string;
}

export interface SaleDetail extends Sale {
  customer: Customer;
  machine: Machine;
}