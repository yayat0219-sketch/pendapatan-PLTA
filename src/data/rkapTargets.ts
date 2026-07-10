export interface RkapTargetSet {
  bruto: number;
  netto: number;
  plnRevenue: number;
  psRevenue: number;
  production: number;
  plnProduction: number;
  psProduction: number;
}

export const RKAP_2026_TARGETS: Record<string, RkapTargetSet> = {
  'Januari': {
    bruto: 47398527512,
    netto: 44544125744,
    plnRevenue: 9300421752,
    psRevenue: 38098105760,
    production: 71676831,
    plnProduction: 24901125,
    psProduction: 46775606,
  },
  'Februari': {
    bruto: 43286142622,
    netto: 40656190144,
    plnRevenue: 8823146979,
    psRevenue: 34462995643,
    production: 65639968,
    plnProduction: 23628302,
    psProduction: 42011566,
  },
  'Maret': {
    bruto: 50442815905,
    netto: 47802197174,
    plnRevenue: 12558493182,
    psRevenue: 37884322723,
    production: 80018022,
    plnProduction: 33489315,
    psProduction: 46528706,
  },
  'April': {
    bruto: 48664516310,
    netto: 46202169017,
    plnRevenue: 12095351961,
    psRevenue: 36569164348,
    production: 77174932,
    plnProduction: 32254272,
    psProduction: 44920660,
  },
  'Mei': {
    bruto: 50212100580,
    netto: 47458507072,
    plnRevenue: 12214803081,
    psRevenue: 37997297500,
    production: 79231515,
    plnProduction: 32472009,
    psProduction: 46758706,
  },
  'Juni': {
    bruto: 55031863882,
    netto: 52064606244,
    plnRevenue: 17957789188,
    psRevenue: 37074074693,
    production: 93389097,
    plnProduction: 47887438,
    psProduction: 45501660,
  },
  'Juli': {
    bruto: 56168931157,
    netto: 52926939004,
    plnRevenue: 17683235012,
    psRevenue: 38485696145,
    production: 94376000,
    plnProduction: 47155293,
    psProduction: 47220706,
  },
  'Agustus': {
    bruto: 57675933404,
    netto: 54289681153,
    plnRevenue: 19045977160,
    psRevenue: 38629956244,
    production: 98175979,
    plnProduction: 50789272,
    psProduction: 47386706,
  },
  'September': {
    bruto: 52016888266,
    netto: 48782636349,
    plnRevenue: 14676019294,
    psRevenue: 37340868971,
    production: 84944711,
    plnProduction: 39136051,
    psProduction: 45808660,
  },
  'Oktober': {
    bruto: 54663406023,
    netto: 51375367078,
    plnRevenue: 16131663085,
    psRevenue: 38551742937,
    production: 90314478,
    plnProduction: 43017768,
    psProduction: 47296706,
  },
  'November': {
    bruto: 46649243469,
    netto: 43845364737,
    plnRevenue: 9738547682,
    psRevenue: 36910695786,
    production: 71283120,
    plnProduction: 25969456,
    psProduction: 45313660,
  },
  'Desember': {
    bruto: 49944131516,
    netto: 46995004744,
    plnRevenue: 11751300751,
    psRevenue: 38192830764,
    production: 78220508,
    plnProduction: 31336602,
    psProduction: 46883706,
  },
  'Q1': {
    bruto: 141127486038,
    netto: 133002513062,
    plnRevenue: 30682061912,
    psRevenue: 110445424126,
    production: 217433811,
    plnProduction: 81018832,
    psProduction: 135315779,
  },
  'Q2': {
    bruto: 153908480771,
    netto: 145725282334,
    plnRevenue: 42267944231,
    psRevenue: 111640536541,
    production: 249795544,
    plnProduction: 112714618,
    psProduction: 137081026,
  },
  'Q3': {
    bruto: 165861752827,
    netto: 155999456506,
    plnRevenue: 51405231466,
    psRevenue: 114456521361,
    production: 277496690,
    plnProduction: 127080617,
    psProduction: 140416072,
  },
  'Q4': {
    bruto: 151276781007,
    netto: 142215736559,
    plnRevenue: 37621511519,
    psRevenue: 113655269489,
    production: 239818103,
    plnProduction: 100324031,
    psProduction: 139494072,
  },
  'Semua': {
    bruto: 612174500644,
    netto: 576942988460,
    plnRevenue: 161976749128,
    psRevenue: 450197751516,
    production: 984544147,
    plnProduction: 431937998,
    psProduction: 552606149,
  }
};

export function getRkapTarget(period: string): RkapTargetSet {
  // If we have a direct match for the selected option, return it
  if (RKAP_2026_TARGETS[period]) {
    return RKAP_2026_TARGETS[period];
  }
  
  // Default fallback if some other period is passed
  return RKAP_2026_TARGETS['Semua'];
}
