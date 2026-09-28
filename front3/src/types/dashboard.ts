// front3/src/types/dashboard.ts

export interface InventorySummary {
  available: number;
  awaiting_delivery: number;
}

export interface BusinessSummary {
  customers: number;
  completed_sales: number;
  total_revenue: number;
}

export interface WarrantySummary {
  active: number;
  expiring_soon: number;
}

export interface ServiceSummary {
  total_records: number;
  warranty_covered: number;
  non_warranty: number;
  total_cost: number;
}

export type AttentionType =
  | "awaiting_delivery"
  | "warranty_expiring";

export interface AttentionItem {
  type: AttentionType;
  sale_id: number;
  machine_id: number;
  customer_id: number;
  machine_name: string;
  customer_name: string;
  date: string;
}

export type RecentActivityType =
  | "sale"
  | "delivery"
  | "service";

export interface RecentActivityItem {
  type: RecentActivityType;
  sale_id: number | null;
  service_record_id: number | null;
  machine_id: number;
  customer_id: number;
  machine_name: string;
  customer_name: string;
  date: string;
}

export interface DashboardData {
  inventory: InventorySummary;
  business: BusinessSummary;
  warranties: WarrantySummary;
  service: ServiceSummary;
  needs_attention: AttentionItem[];
  recent_activity: RecentActivityItem[];
}