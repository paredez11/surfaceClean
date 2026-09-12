// front3/src/types/equipmentProfiles.ts

export interface EquipmentProfile {
  id: number;
  manufacturer: string;
  model: string;
  category: string;
  description?: string | null;
  specifications?: string | null;
  best_for?: string | null;
  not_for?: string | null;
  key_benefits?: string | null;
  common_uses?: string | null;
  faq?: string | null;
  comparison_notes?: string | null;
  manufacturer_url?: string | null;
  source_notes?: string | null;
}

export interface EquipmentProfileCreate {
  manufacturer: string;
  model: string;
  category: string;
}

export interface EquipmentProfileUpdate {
  manufacturer?: string;
  model?: string;
  category?: string;
  description?: string | null;
  specifications?: string | null;
  best_for?: string | null;
  not_for?: string | null;
  key_benefits?: string | null;
  common_uses?: string | null;
  faq?: string | null;
  comparison_notes?: string | null;
  manufacturer_url?: string | null;
  source_notes?: string | null;
}