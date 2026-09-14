// front3/src/types/sale.ts

export interface Sale {
  id: number;
  customer_id: number;
  machine_id: number;
  asking_price: number | null;
  sale_price: number;
  status: "sold" | "delivered" | "cancelled";
  sold_at: string | null;
  delivered_at: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}