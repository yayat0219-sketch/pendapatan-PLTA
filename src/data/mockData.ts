import { RevenueRecord, ProductionRecord, PSTerjualRecord, TransmissionRecord } from '../types';
import { generateId } from '../lib/utils';

const REAL_REVENUE_PART: RevenueRecord[] = [
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

const remainingMonths = ['Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
const categoriesList = ['PLN (Persero)', 'PS Penugasan', 'PS Usaha', 'Non PLN (Swasta) + Penduduk'];

const REMAINING_REVENUE: RevenueRecord[] = [];
remainingMonths.forEach((m, rIdx) => {
  const monthNum = 6 + rIdx;
  
  categoriesList.forEach((cat) => {
    REMAINING_REVENUE.push({
      id: `rev_2026_${m.toLowerCase()}_${cat.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase()}`,
      month: m,
      year: 2026,
      category: cat,
      amount: 0,
      dateAdded: new Date(`2026-${String(monthNum).padStart(2, '0')}-30`).toISOString()
    });
  });
});

export const MOCK_DATA: RevenueRecord[] = [
  ...REAL_REVENUE_PART,
  ...REMAINING_REVENUE
];

const REAL_PRODUCTION_PART: ProductionRecord[] = [
  { id: generateId(), month: 'Januari', year: 2026, plta: 89804820, miniHydro: 350000, pln: 37972050, dateAdded: new Date('2026-01-31').toISOString() },
  { id: generateId(), month: 'Februari', year: 2026, plta: 72335810, miniHydro: 155000, pln: 26124857, dateAdded: new Date('2026-02-28').toISOString() },
  { id: generateId(), month: 'Maret', year: 2026, plta: 96332720, miniHydro: 0, pln: 50394183, dateAdded: new Date('2026-03-31').toISOString() },
  { id: generateId(), month: 'April', year: 2026, plta: 88572820, miniHydro: 283000, pln: 35115754, dateAdded: new Date('2026-04-30').toISOString() },
  { id: generateId(), month: 'Mei', year: 2026, plta: 99621130, miniHydro: 720000, pln: 44185299, dateAdded: new Date('2026-05-31').toISOString() },
];

const REMAINING_PRODUCTION: ProductionRecord[] = remainingMonths.map((m, rIdx) => {
  const monthNum = 6 + rIdx;
  return {
    id: `prod_2026_${m.toLowerCase()}`,
    month: m,
    year: 2026,
    plta: 0,
    miniHydro: 0,
    pln: 0,
    ps: 0,
    dateAdded: new Date(`2026-${String(monthNum).padStart(2, '0')}-30`).toISOString()
  };
});

export const MOCK_PRODUCTION_DATA: ProductionRecord[] = [
  ...REAL_PRODUCTION_PART,
  ...REMAINING_PRODUCTION
];

const psRawData = [
  {
    category: 'INDUSTRI / PERUSAHAAN' as const,
    customerName: 'PT. INDOTAMA FERRO ALLOYS',
    months: {
      'Januari': { kwh: 29885655.93, rp: 23830523182.02 },
      'Februari': { kwh: 26544339.22, rp: 21166190651.00 },
      'Maret': { kwh: 26389479.07, rp: 21042706716.00 },
      'April': { kwh: 32588811.00, rp: 25985992003.00 },
      'Mei': { kwh: 33274723.70, rp: 26532931931.00 }
    }
  },
  {
    category: 'INDUSTRI / PERUSAHAAN' as const,
    customerName: 'PT. ELEGANT TEXTILE INDUSTRY',
    months: {
      'Januari': { kwh: 10503958.00, rp: 8703789677.96 },
      'Februari': { kwh: 9980919.00, rp: 8270389102.00 },
      'Maret': { kwh: 9621203.00, rp: 7972321230.00 },
      'April': { kwh: 10805622.00, rp: 8953754502.00 },
      'Mei': { kwh: 11044850.00, rp: 9151983607.00 }
    }
  },
  {
    category: 'INDUSTRI / PERUSAHAAN' as const,
    customerName: 'PT INDONESIA LIBOLON FIBER SYSTEM',
    months: {
      'Januari': { kwh: 2374623.00, rp: 1967660110.26 },
      'Februari': { kwh: 2098223.00, rp: 1738629542.00 },
      'Maret': { kwh: 1591510.00, rp: 1431855360.00 },
      'April': { kwh: 2017741.00, rp: 1671940547.00 },
      'Mei': { kwh: 2012710.00, rp: 1667771760.00 }
    }
  },
  {
    category: 'INDUSTRI / PERUSAHAAN' as const,
    customerName: 'PT. INDORAMA SYNTHETICS Tbk',
    months: {
      'Januari': { kwh: 2375182.00, rp: 1968123308.84 },
      'Februari': { kwh: 1789657.00, rp: 1482945583.00 },
      'Maret': { kwh: 2074882.00, rp: 1719288723.00 },
      'April': { kwh: 2155171.00, rp: 1785817794.00 },
      'Mei': { kwh: 2372766.00, rp: 1966121363.00 }
    }
  },
  {
    category: 'INDUSTRI / PERUSAHAAN' as const,
    customerName: 'PT. BANGUNPERKASA ADHITAMASENTRA',
    months: {
      'Januari': { kwh: 1321682.00, rp: 1095172138.84 },
      'Februari': { kwh: 1462167.00, rp: 1211580820.00 },
      'Maret': { kwh: 1265033.00, rp: 1048231644.00 },
      'April': { kwh: 1582713.00, rp: 1311467646.00 },
      'Mei': { kwh: 1345237.00, rp: 1114690283.00 }
    }
  },
  {
    category: 'INDUSTRI / PERUSAHAAN' as const,
    customerName: 'PT. STARONE MITRA TELEKOMUNIKASI',
    months: {
      'Januari': { kwh: 644348.56, rp: 574623602.32 },
      'Februari': { kwh: 590721.13, rp: 526799197.00 },
      'Maret': { kwh: 668615.72, rp: 596264813.00 },
      'April': { kwh: 650245.22, rp: 579882185.00 },
      'Mei': { kwh: 677658.72, rp: 604329270.00 }
    }
  },
  {
    category: 'INDUSTRI / PERUSAHAAN' as const,
    customerName: 'PT. URASE PRIMA',
    months: {
      'Januari': { kwh: 176913.00, rp: 161559355.88 },
      'Februari': { kwh: 164006.00, rp: 144846090.00 },
      'Maret': { kwh: 111267.00, rp: 139276107.00 },
      'April': { kwh: 160514.00, rp: 150417160.00 },
      'Mei': { kwh: 181793.00, rp: 150637316.00 }
    }
  },
  {
    category: 'INDUSTRI / PERUSAHAAN' as const,
    customerName: 'PERUMDA AIR MINUM GAPURA TIRTA RAHAYU PURWAKARTA',
    months: {
      'Januari': { kwh: 210057.00, rp: 174057431.34 },
      'Februari': { kwh: 184465.00, rp: 152851388.00 },
      'Maret': { kwh: 198836.00, rp: 164759486.00 },
      'April': { kwh: 194740.00, rp: 161365459.00 },
      'Mei': { kwh: 208509.00, rp: 172774728.00 }
    }
  },
  {
    category: 'INDUSTRI / PERUSAHAAN' as const,
    customerName: 'PT. WIN TEXTILE',
    months: {
      'Januari': { kwh: 26504.00, rp: 21961744.48 },
      'Februari': { kwh: 32414.00, rp: 26858889.00 },
      'Maret': { kwh: 23582.00, rp: 19540517.00 },
      'April': { kwh: 33024.00, rp: 27364347.00 },
      'Mei': { kwh: 25328.00, rp: 20987287.00 }
    }
  },
  {
    category: 'INDUSTRI / PERUSAHAAN' as const,
    customerName: 'PT. INDACHI PRIMA',
    months: {
      'Januari': { kwh: 115828.00, rp: 95977397.36 },
      'Februari': { kwh: 92410.00, rp: 78178971.00 },
      'Maret': { kwh: 83385.00, rp: 75172572.00 },
      'April': { kwh: 131632.00, rp: 109072908.00 },
      'Mei': { kwh: 129701.00, rp: 107472843.00 }
    }
  },
  {
    category: 'INDUSTRI / PERUSAHAAN' as const,
    customerName: 'PT. TEKSTIL BANGKIT KEMBALI',
    months: {
      'Januari': { kwh: 289159.96, rp: 239603726.06 },
      'Februari': { kwh: 214720.63, rp: 177921808.00 },
      'Maret': { kwh: 158071.00, rp: 130980792.00 },
      'April': { kwh: 174413.10, rp: 144522183.00 },
      'Mei': { kwh: 179016.58, rp: 148336719.00 }
    }
  },
  {
    category: 'INDUSTRI / PERUSAHAAN' as const,
    customerName: 'CV. 3 M ( Cilulumpang & Cinangka)',
    months: {
      'Januari': { kwh: 9074.00, rp: 8607953.15 },
      'Februari': { kwh: 9140.00, rp: 7993101.00 },
      'Maret': { kwh: 10382.00, rp: 8602733.00 },
      'April': { kwh: 5856.00, rp: 8300527.00 },
      'Mei': { kwh: 8878.00, rp: 8300527.00 }
    }
  },
  {
    category: 'INDUSTRI / PERUSAHAAN' as const,
    customerName: 'SATKER BALAI BESAR WILAYAH SUNGAI CITARUM',
    months: {
      'Januari': { kwh: 1538.00, rp: 2091095.56 },
      'Februari': { kwh: 1426.00, rp: 1938818.00 },
      'Maret': { kwh: 1558.00, rp: 2118288.05 },
      'April': { kwh: 2066.00, rp: 2808975.00 },
      'Mei': { kwh: 1596.00, rp: 2169954.00 }
    }
  },
  {
    category: 'INDUSTRI / PERUSAHAAN' as const,
    customerName: 'BALAI RISET PEMULIHAN SUMBER DAYA IKAN',
    months: {
      'Januari': { kwh: 1306.00, rp: 3746514.49 },
      'Februari': { kwh: 2210.00, rp: 3358941.00 },
      'Maret': { kwh: 2332.00, rp: 3229750.00 },
      'April': { kwh: 2810.00, rp: 3820532.00 },
      'Mei': { kwh: 2676.00, rp: 3638343.00 }
    }
  },
  {
    category: 'INDUSTRI / PERUSAHAAN' as const,
    customerName: 'PT RAHARJA PUTRA PERKASA',
    months: {
      'Januari': { kwh: 606.40, rp: 716016.44 },
      'Februari': { kwh: 594.60, rp: 687215.00 },
      'Maret': { kwh: 774.60, rp: 895252.00 },
      'April': { kwh: 958.30, rp: 1107565.00 },
      'Mei': { kwh: 792.60, rp: 916055.00 }
    }
  },
  {
    category: 'INDUSTRI / PERUSAHAAN' as const,
    customerName: 'PT. BANK TABUNGAN NEGARA (PERSERO) Tbk.',
    months: {
      'Januari': { kwh: 121.10, rp: 304832.00 },
      'Februari': { kwh: 144.30, rp: 273293.00 },
      'Maret': { kwh: 188.20, rp: 262812.00 },
      'April': { kwh: 179.20, rp: 283818.00 },
      'Mei': { kwh: 164.55, rp: 283826.00 }
    }
  },
  {
    category: 'INDUSTRI / PERUSAHAAN' as const,
    customerName: 'KOPERASI KARYA BHAKTI RAHARJA',
    months: {
      'Januari': { kwh: 72.00, rp: 305120.64 },
      'Februari': { kwh: 62.00, rp: 283323.00 },
      'Maret': { kwh: 69.00, rp: 272424.00 },
      'April': { kwh: 77.00, rp: 294222.00 },
      'Mei': { kwh: 72.50, rp: 294222.00 }
    }
  },
  {
    category: 'PERUMAHAN & WARUNG' as const,
    customerName: 'Penduduk (kWh Meter)',
    months: {
      'Januari': { kwh: 12408.00, rp: 7668470.00 },
      'Februari': { kwh: 12496.00, rp: 7867724.00 },
      'Maret': { kwh: 14459.00, rp: 9607759.00 },
      'April': { kwh: 14370.00, rp: 9544338.00 },
      'Mei': { kwh: 13843.00, rp: 9060198.00 }
    }
  },
  {
    category: 'PERUMAHAN & WARUNG' as const,
    customerName: 'Penduduk (Listrik Prabayar)',
    months: {
      'Januari': { kwh: 136239.00, rp: 139661400.00 },
      'Februari': { kwh: 127189.00, rp: 128164600.00 },
      'Maret': { kwh: 155079.00, rp: 163201200.00 },
      'April': { kwh: 146773.00, rp: 152209200.00 },
      'Mei': { kwh: 149959.00, rp: 156977609.00 }
    }
  }
];

export const MOCK_PS_TERJUAL_DATA: PSTerjualRecord[] = [];
psRawData.forEach((item, itemIdx) => {
  // Add Jan-Mei
  Object.entries(item.months).forEach(([month, val]) => {
    MOCK_PS_TERJUAL_DATA.push({
      id: `ps_${itemIdx}_${month.toLowerCase()}`,
      month,
      year: 2026,
      category: item.category,
      customerName: item.customerName,
      kwhValue: val.kwh,
      rupiahValue: val.rp,
      dateAdded: new Date('2026-05-31').toISOString()
    });
  });

  // Add Juni-Desember
  const remainingMonthsList = ['Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
  remainingMonthsList.forEach((month, rIdx) => {
    const monthNum = 6 + rIdx;
    MOCK_PS_TERJUAL_DATA.push({
      id: `ps_${itemIdx}_${month.toLowerCase()}`,
      month,
      year: 2026,
      category: item.category,
      customerName: item.customerName,
      kwhValue: 0,
      rupiahValue: 0,
      dateAdded: new Date(`2026-${String(monthNum).padStart(2, '0')}-30`).toISOString()
    });
  });
});

export const MOCK_TRANSMISSION_DATA: TransmissionRecord[] = [
  {
    id: 'tx_jan_2026',
    month: 'Januari',
    year: 2026,
    curugKirim: 0,
    curugTerima: 0,
    pdlrg1Kirim: 372,
    pdlrg1Terima: 53991,
    pdlrg2Kirim: 51429,
    pdlrg2Terima: 58,
    tatajabar1Kirim: 17894850,
    tatajabar1Terima: 1,
    tatajabar2Kirim: 19389146,
    tatajabar2Terima: 0,
    lineIndustriKirim: 292079,
    lineIndustriTerima: 0,
    pupukKujangKirim: 398224,
    pupukKujangTerima: 0,
    dateAdded: new Date('2026-01-31').toISOString(),
  },
  {
    id: 'tx_feb_2026',
    month: 'Februari',
    year: 2026,
    curugKirim: 0,
    curugTerima: 0,
    pdlrg1Kirim: 1758544,
    pdlrg1Terima: 11824,
    pdlrg2Kirim: 6959,
    pdlrg2Terima: 1746333,
    tatajabar1Kirim: 12287381,
    tatajabar1Terima: 38,
    tatajabar2Kirim: 13184334,
    tatajabar2Terima: 1,
    lineIndustriKirim: 268905,
    lineIndustriTerima: 0,
    pupukKujangKirim: 376930,
    pupukKujangTerima: 0,
    dateAdded: new Date('2026-02-28').toISOString(),
  },
  {
    id: 'tx_mar_2026',
    month: 'Maret',
    year: 2026,
    curugKirim: 0,
    curugTerima: 0,
    pdlrg1Kirim: 3041373,
    pdlrg1Terima: 0,
    pdlrg2Kirim: 0,
    pdlrg2Terima: 3040555,
    tatajabar1Kirim: 23946892,
    tatajabar1Terima: 1066,
    tatajabar2Kirim: 25666447,
    tatajabar2Terima: 0,
    lineIndustriKirim: 300283,
    lineIndustriTerima: 0,
    pupukKujangKirim: 480809,
    pupukKujangTerima: 0,
    dateAdded: new Date('2026-03-31').toISOString(),
  },
  {
    id: 'tx_apr_2026',
    month: 'April',
    year: 2026,
    curugKirim: 0,
    curugTerima: 0,
    pdlrg1Kirim: 3737004,
    pdlrg1Terima: 30,
    pdlrg2Kirim: 5909,
    pdlrg2Terima: 2787208,
    tatajabar1Kirim: 15926540,
    tatajabar1Terima: 206,
    tatajabar2Kirim: 17481116,
    tatajabar2Terima: 119,
    lineIndustriKirim: 282993,
    lineIndustriTerima: 0,
    pupukKujangKirim: 469755,
    pupukKujangTerima: 0,
    dateAdded: new Date('2026-04-30').toISOString(),
  },
  {
    id: 'tx_mei_2026',
    month: 'Mei',
    year: 2026,
    curugKirim: 0,
    curugTerima: 0,
    pdlrg1Kirim: 6957119,
    pdlrg1Terima: 0,
    pdlrg2Kirim: 930876,
    pdlrg2Terima: 3682146,
    tatajabar1Kirim: 18785470,
    tatajabar1Terima: 0,
    tatajabar2Kirim: 20401544,
    tatajabar2Terima: 0,
    lineIndustriKirim: 297190,
    lineIndustriTerima: 0,
    pupukKujangKirim: 495246,
    pupukKujangTerima: 0,
    dateAdded: new Date('2026-05-31').toISOString(),
  },
  ...['Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'].map(m => ({
    id: `tx_${m.toLowerCase()}_2026`,
    month: m,
    year: 2026,
    curugKirim: 0,
    curugTerima: 0,
    pdlrg1Kirim: 0,
    pdlrg1Terima: 0,
    pdlrg2Kirim: 0,
    pdlrg2Terima: 0,
    tatajabar1Kirim: 0,
    tatajabar1Terima: 0,
    tatajabar2Kirim: 0,
    tatajabar2Terima: 0,
    lineIndustriKirim: 0,
    lineIndustriTerima: 0,
    pupukKujangKirim: 0,
    pupukKujangTerima: 0,
    dateAdded: new Date('2026-06-30').toISOString(),
  }))
];


