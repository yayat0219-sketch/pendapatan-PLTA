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
  ps?: number;
  dateAdded: string;
}

export interface PSTerjualRecord {
  id: string;
  month: string;
  year: number;
  category: 'INDUSTRI / PERUSAHAAN' | 'PERUMAHAN & WARUNG';
  customerName: string;
  kwhValue: number;
  rupiahValue: number;
  dateAdded: string;
}

export interface TransmissionRecord {
  id: string;
  month: string;
  year: number;
  curugKirim: number;
  curugTerima: number;
  pdlrg1Kirim: number;
  pdlrg1Terima: number;
  pdlrg2Kirim: number;
  pdlrg2Terima: number;
  tatajabar1Kirim: number;
  tatajabar1Terima: number;
  tatajabar2Kirim: number;
  tatajabar2Terima: number;
  lineIndustriKirim: number;
  lineIndustriTerima: number;
  pupukKujangKirim: number;
  pupukKujangTerima: number;
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
