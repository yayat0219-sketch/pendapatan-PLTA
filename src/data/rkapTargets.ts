export interface RkapTargetSet {
  bruto: number;
  proyeksi: number;
  netto: number;
  plnRevenue: number;
  psRevenue: number;
  production: number;
  proyeksiProduction: number;
  plnProduction: number;
  psProduction: number;
  pltaProduction: number;
  miniHydroProduction: number;
}

export const INITIAL_RKAP_2026_TARGETS: Record<string, RkapTargetSet> = {
  'Januari': {
    bruto: 47398527512,
    proyeksi: 47406315640,
    netto: 44544125744,
    plnRevenue: 9300421752,
    psRevenue: 38098105760,
    production: 71676831,
    proyeksiProduction: 90150000,
    plnProduction: 24901125,
    psProduction: 46775606,
    pltaProduction: 70784031,
    miniHydroProduction: 892800,
  },
  'Februari': {
    bruto: 43286142622,
    proyeksi: 56570865039,
    netto: 40656190144,
    plnRevenue: 8823146979,
    psRevenue: 34462995643,
    production: 65639968,
    proyeksiProduction: 72490000,
    plnProduction: 23628302,
    psProduction: 42011566,
    pltaProduction: 64833568,
    miniHydroProduction: 806400,
  },
  'Maret': {
    bruto: 50442815905,
    proyeksi: 56411811048,
    netto: 47802197174,
    plnRevenue: 12558493182,
    psRevenue: 37884322723,
    production: 80018022,
    proyeksiProduction: 96330000,
    plnProduction: 33489315,
    psProduction: 46528706,
    pltaProduction: 79125222,
    miniHydroProduction: 892800,
  },
  'April': {
    bruto: 48664516310,
    proyeksi: 56822787006,
    netto: 46202169017,
    plnRevenue: 12095351961,
    psRevenue: 36569164348,
    production: 77174932,
    proyeksiProduction: 88860000,
    plnProduction: 32254272,
    psProduction: 44920660,
    pltaProduction: 76310932,
    miniHydroProduction: 864000,
  },
  'Mei': {
    bruto: 50212100580,
    proyeksi: 62183165116,
    netto: 47458507072,
    plnRevenue: 12214803081,
    psRevenue: 37997297500,
    production: 79231515,
    proyeksiProduction: 100340000,
    plnProduction: 32472009,
    psProduction: 46758706,
    pltaProduction: 78338715,
    miniHydroProduction: 892800,
  },
  'Juni': {
    bruto: 55031863882,
    proyeksi: 61432607458,
    netto: 52064606244,
    plnRevenue: 17957789188,
    psRevenue: 37074074693,
    production: 93389097,
    proyeksiProduction: 99630000,
    plnProduction: 47887438,
    psProduction: 45501660,
    pltaProduction: 92525097,
    miniHydroProduction: 864000,
  },
  'Juli': {
    bruto: 56168931157,
    proyeksi: 56430000000,
    netto: 52926939004,
    plnRevenue: 17683235012,
    psRevenue: 38485696145,
    production: 94376000,
    proyeksiProduction: 95060000,
    plnProduction: 47155293,
    psProduction: 47220706,
    pltaProduction: 93483200,
    miniHydroProduction: 892800,
  },
  'Agustus': {
    bruto: 57675933404,
    proyeksi: 55020000000,
    netto: 54289681153,
    plnRevenue: 19045977160,
    psRevenue: 38629956244,
    production: 98175979,
    proyeksiProduction: 91100000,
    plnProduction: 50789272,
    psProduction: 47386706,
    pltaProduction: 97283179,
    miniHydroProduction: 892800,
  },
  'September': {
    bruto: 52016888266,
    proyeksi: 48770000000,
    netto: 48782636349,
    plnRevenue: 14676019294,
    psRevenue: 37340868971,
    production: 84944711,
    proyeksiProduction: 76290000,
    plnProduction: 39136051,
    psProduction: 45808660,
    pltaProduction: 84080711,
    miniHydroProduction: 864000,
  },
  'Oktober': {
    bruto: 54663406023,
    proyeksi: 49840000000,
    netto: 51375367078,
    plnRevenue: 16131663085,
    psRevenue: 38551742937,
    production: 90314478,
    proyeksiProduction: 77390000,
    plnProduction: 43017768,
    psProduction: 47296706,
    pltaProduction: 89421678,
    miniHydroProduction: 892800,
  },
  'November': {
    bruto: 46649243469,
    proyeksi: 47480000000,
    netto: 43845364737,
    plnRevenue: 9738547682,
    psRevenue: 36910695786,
    production: 71283120,
    proyeksiProduction: 73500000,
    plnProduction: 25969456,
    psProduction: 45313660,
    pltaProduction: 70419120,
    miniHydroProduction: 864000,
  },
  'Desember': {
    bruto: 49944131516,
    proyeksi: 49630000000,
    netto: 46995004744,
    plnRevenue: 11751300751,
    psRevenue: 38192830764,
    production: 78220508,
    proyeksiProduction: 77390000,
    plnProduction: 31336602,
    psProduction: 46883706,
    pltaProduction: 77327708,
    miniHydroProduction: 892800,
  }
};

const STORAGE_KEY = 'rkap_2026_targets_custom_v1';

const getInitialMonthlyData = (): Record<string, RkapTargetSet> => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return { ...INITIAL_RKAP_2026_TARGETS, ...parsed };
    }
  } catch (e) {
    console.error('Failed to load custom RKAP targets from localStorage', e);
  }
  return { ...INITIAL_RKAP_2026_TARGETS };
};

let currentMonthlyTargets: Record<string, RkapTargetSet> = getInitialMonthlyData();

const sumMonthlyGroup = (months: string[]): RkapTargetSet => {
  const result: RkapTargetSet = {
    bruto: 0, proyeksi: 0, netto: 0,
    plnRevenue: 0, psRevenue: 0,
    production: 0, proyeksiProduction: 0,
    plnProduction: 0, psProduction: 0,
    pltaProduction: 0, miniHydroProduction: 0
  };

  months.forEach(m => {
    const t = currentMonthlyTargets[m];
    if (t) {
      result.bruto += t.bruto || 0;
      result.proyeksi += t.proyeksi || 0;
      result.netto += t.netto || 0;
      result.plnRevenue += t.plnRevenue || 0;
      result.psRevenue += t.psRevenue || 0;
      result.production += t.production || 0;
      result.proyeksiProduction += t.proyeksiProduction || 0;
      result.plnProduction += t.plnProduction || 0;
      result.psProduction += t.psProduction || 0;
      result.pltaProduction += t.pltaProduction || 0;
      result.miniHydroProduction += t.miniHydroProduction || 0;
    }
  });

  return result;
};

export const recomputeAllRkapTargets = (): Record<string, RkapTargetSet> => {
  const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
  
  const q1Months = ['Januari', 'Februari', 'Maret'];
  const q2Months = ['April', 'Mei', 'Juni'];
  const q3Months = ['Juli', 'Agustus', 'September'];
  const q4Months = ['Oktober', 'November', 'Desember'];

  const q1 = sumMonthlyGroup(q1Months);
  const q2 = sumMonthlyGroup(q2Months);
  const q3 = sumMonthlyGroup(q3Months);
  const q4 = sumMonthlyGroup(q4Months);
  const semua = sumMonthlyGroup(months);

  return {
    ...currentMonthlyTargets,
    'Q1': q1,
    'Q2': q2,
    'Q3': q3,
    'Q4': q4,
    'Semua': semua
  };
};

export function getRkapTarget(period: string): RkapTargetSet {
  const all = recomputeAllRkapTargets();
  if (all[period]) {
    return all[period];
  }
  return all['Semua'];
}

export function updateRkapTarget(month: string, updatedTarget: Partial<RkapTargetSet>): void {
  const current = currentMonthlyTargets[month] || {
    bruto: 0, proyeksi: 0, netto: 0,
    plnRevenue: 0, psRevenue: 0,
    production: 0, proyeksiProduction: 0,
    plnProduction: 0, psProduction: 0,
    pltaProduction: 0, miniHydroProduction: 0
  };

  currentMonthlyTargets[month] = {
    ...current,
    ...updatedTarget
  };

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(currentMonthlyTargets));
  } catch (e) {
    console.error('Failed to save RKAP targets to localStorage', e);
  }

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('rkap-targets-updated'));
  }
}

export function deleteRkapTarget(month: string): void {
  currentMonthlyTargets[month] = {
    bruto: 0,
    proyeksi: 0,
    netto: 0,
    plnRevenue: 0,
    psRevenue: 0,
    production: 0,
    proyeksiProduction: 0,
    plnProduction: 0,
    psProduction: 0,
    pltaProduction: 0,
    miniHydroProduction: 0
  };

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(currentMonthlyTargets));
  } catch (e) {
    console.error('Failed to save RKAP targets to localStorage', e);
  }

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('rkap-targets-updated'));
  }
}

export function resetRkapTargetsToDefault(): void {
  currentMonthlyTargets = { ...INITIAL_RKAP_2026_TARGETS };
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (e) {
    console.error('Failed to clear RKAP targets from localStorage', e);
  }

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('rkap-targets-updated'));
  }
}

export const RKAP_2026_TARGETS = recomputeAllRkapTargets();

