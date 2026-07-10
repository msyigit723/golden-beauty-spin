// Campaign domain types

export interface Campaign {
  id: string;
  title: string;
  description: string | null;
  probability: number;
  displayOrder: number;
  active: boolean;
  createdAt: string;
}

export interface CampaignSegment {
  id: string;
  title: string;
  displayOrder: number;
  color: string;
  textColor: string;
}

export interface CampaignRow {
  id: string;
  title: string;
  description: string | null;
  probability: number;
  display_order: number;
  active: boolean;
  created_at: string;
}

// Luxury wheel segment colors — no casino/gaming colors
export const SEGMENT_COLORS: Array<{ bg: string; text: string }> = [
  { bg: '#1A1A1A', text: '#D4AF37' },  // Rich Black / Gold
  { bg: '#FFFFFF', text: '#1A1A1A' },  // White / Black
  { bg: '#D4AF37', text: '#1A1A1A' },  // Gold / Black
  { bg: '#F5F5F0', text: '#1A1A1A' },  // Cream / Black
  { bg: '#2C2C2C', text: '#D4AF37' },  // Charcoal / Gold
  { bg: '#E8E0D0', text: '#1A1A1A' },  // Champagne / Black
];
