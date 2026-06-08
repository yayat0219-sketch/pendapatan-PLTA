export interface RevenueRecord {
  id: string;
  month: string;
  year: number;
  category: string;
  amount: number;
  notes?: string;
  dateAdded: string;
}

export interface ProductionRecord {
  id: string;
  month: string;
  year: number;
  plta: number;
  miniHydro: number;
  pln: number;
  dateAdded: string;
}

export type ViewState = 'dashboard' | 'management' | 'settings';

export const MONTHS = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

export const DEFAULT_CATEGORIES = [
  'PLN (Persero)',
  'PS Penugasan',
  'PS Usaha',
  'Non PLN (Swasta) + Penduduk'
];
