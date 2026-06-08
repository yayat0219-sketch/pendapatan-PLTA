import { RevenueRecord, ProductionRecord } from '../types';
import { generateId } from '../lib/utils';

export const MOCK_DATA: RevenueRecord[] = [
  { id: generateId(), month: 'Januari', year: 2026, category: 'PLN (Persero)', amount: 14239518750, dateAdded: new Date('2026-01-31').toISOString() },
  { id: generateId(), month: 'Januari', year: 2026, category: 'PS Penugasan', amount: 1436214274, dateAdded: new Date('2026-01-31').toISOString() },
  { id: generateId(), month: 'Januari', year: 2026, category: 'PS Usaha', amount: 1899145882, dateAdded: new Date('2026-01-31').toISOString() },
  { id: generateId(), month: 'Januari', year: 2026, category: 'Non PLN (Swasta) + Penduduk', amount: 38996153077, dateAdded: new Date('2026-01-31').toISOString() },
  
  { id: generateId(), month: 'Februari', year: 2026, category: 'PLN (Persero)', amount: 9796821375, dateAdded: new Date('2026-02-28').toISOString() },
  { id: generateId(), month: 'Februari', year: 2026, category: 'PS Penugasan', amount: 979578182, dateAdded: new Date('2026-02-28').toISOString() },
  { id: generateId(), month: 'Februari', year: 2026, category: 'PS Usaha', amount: 1510162201, dateAdded: new Date('2026-02-28').toISOString() },
  { id: generateId(), month: 'Februari', year: 2026, category: 'Non PLN (Swasta) + Penduduk', amount: 35127759056, dateAdded: new Date('2026-02-28').toISOString() },
  
  { id: generateId(), month: 'Maret', year: 2026, category: 'PLN (Persero)', amount: 18897818625, dateAdded: new Date('2026-03-31').toISOString() },
  { id: generateId(), month: 'Maret', year: 2026, category: 'PS Penugasan', amount: 1272287258, dateAdded: new Date('2026-03-31').toISOString() },
  { id: generateId(), month: 'Maret', year: 2026, category: 'PS Usaha', amount: 1712452019, dateAdded: new Date('2026-03-31').toISOString() },
  { id: generateId(), month: 'Maret', year: 2026, category: 'Non PLN (Swasta) + Penduduk', amount: 34528588178, dateAdded: new Date('2026-03-31').toISOString() },
  
  { id: generateId(), month: 'April', year: 2026, category: 'PLN (Persero)', amount: 13168407750, dateAdded: new Date('2026-04-30').toISOString() },
  { id: generateId(), month: 'April', year: 2026, category: 'PS Penugasan', amount: 1511748029, dateAdded: new Date('2026-04-30').toISOString() },
  { id: generateId(), month: 'April', year: 2026, category: 'PS Usaha', amount: 1084825272, dateAdded: new Date('2026-04-30').toISOString() },
  { id: generateId(), month: 'April', year: 2026, category: 'Non PLN (Swasta) + Penduduk', amount: 41059965911, dateAdded: new Date('2026-04-30').toISOString() },
  
  { id: generateId(), month: 'Mei', year: 2026, category: 'PLN (Persero)', amount: 16569487125, dateAdded: new Date('2026-05-31').toISOString() },
  { id: generateId(), month: 'Mei', year: 2026, category: 'PS Penugasan', amount: 1627526637, dateAdded: new Date('2026-05-31').toISOString() },
  { id: generateId(), month: 'Mei', year: 2026, category: 'PS Usaha', amount: 2159284246, dateAdded: new Date('2026-05-31').toISOString() },
  { id: generateId(), month: 'Mei', year: 2026, category: 'Non PLN (Swasta) + Penduduk', amount: 41819677841, dateAdded: new Date('2026-05-31').toISOString() },
];

export const MOCK_PRODUCTION_DATA: ProductionRecord[] = [
  { id: generateId(), month: 'Januari', year: 2026, plta: 89804820, miniHydro: 350000, pln: 37972050, dateAdded: new Date('2026-01-31').toISOString() },
  { id: generateId(), month: 'Februari', year: 2026, plta: 72335810, miniHydro: 155000, pln: 26124857, dateAdded: new Date('2026-02-28').toISOString() },
  { id: generateId(), month: 'Maret', year: 2026, plta: 96332720, miniHydro: 0, pln: 50394183, dateAdded: new Date('2026-03-31').toISOString() },
  { id: generateId(), month: 'April', year: 2026, plta: 88572820, miniHydro: 283000, pln: 35115754, dateAdded: new Date('2026-04-30').toISOString() },
  { id: generateId(), month: 'Mei', year: 2026, plta: 99621130, miniHydro: 720000, pln: 44185299, dateAdded: new Date('2026-05-31').toISOString() },
];

