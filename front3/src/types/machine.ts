// front3/src/types/machine.ts

import type { EquipmentProfile } from "./equipmentProfiles";

export interface MachineImage {
  id: number;
  url: string;
  description?: string | null;
  machine_id: number;
}

export interface Machine {
  id: number;
  name: string;
  price: number;
  condition: string;
  description?: string | null;
  hours_used?: number | null;
  created_at: string;
  status: "listed" | "sold" | "delivered";

  equipment_profile_id?: number | null;
  equipment_profile?: EquipmentProfile | null;

  slug?: string | null;

  has_warranty?: boolean;
  warranty_duration?: number | null;
  warranty_duration_unit?: string | null;
  warranty_notes?: string | null;

  seo_title?: string | null;
  seo_description?: string | null;
  best_for?: string | null;
  not_for?: string | null;
  key_benefits?: string | null;
  common_uses?: string | null;
  faq?: string | null;
  comparison_notes?: string | null;

  images?: MachineImage[];
}
