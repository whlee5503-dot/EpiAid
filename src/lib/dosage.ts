export interface DrugFormulation {
  label: string;
  mgPerUnit: number | null;
  mlPerUnit: number | null;
  type: 'tab' | 'cap' | 'susp' | 'vial' | 'sachet';
}

export interface Drug {
  id: string;
  name: string;
  category: string;
  route: string[];
  forms: string[];
  formulations: DrugFormulation[];
  adultDose: string;
  adultSingleDoseMg: number | null;
  adultFreqPerDay: number | null;
  adultMaxDaily: string;
  adultMaxDailyMg: number | null;
  pediatricMgPerKg: number | null;
  pediatricFreq: string;
  pediatricFreqPerDay: number | null;
  pediatricMaxMg: number | null;
  pediatricUnit: string;
  pediatricNote?: string;
  duration: string;
  indications: string[];
  contraindications: string[];
  notes: string;
}

export interface DosageResult {
  hasCalculation: boolean;
  isAdult: boolean;
  singleDoseMg: number | null;
  singleDoseMgCapped: number | null;
  isOverMax: boolean;
  maxMg: number | null;
  volumePerDose: string | null;
  dailyDoseMg: number | null;
  freqPerDay: number | null;
  displayDose: string;
  duration: string;
  indications: string[];
  contraindications: string[];
  notes: string;
}

function formatVolume(doseMg: number, f: DrugFormulation): string | null {
  if (f.mgPerUnit === null) return null;
  if (f.mlPerUnit !== null) {
    const ml = (doseMg / f.mgPerUnit) * f.mlPerUnit;
    return `${Math.round(ml * 10) / 10} ml`;
  }
  const count = doseMg / f.mgPerUnit;
  const rounded = Math.round(count * 2) / 2;
  const fractionMap: Record<string, string> = {
    '0.5': '½', '1.5': '1½', '2.5': '2½', '3.5': '3½',
  };
  const str = fractionMap[rounded.toString()] ?? rounded.toString();
  return `${str} ${f.type}`;
}

export function calculateDose(
  drug: Drug,
  weightKg: number,
  isAdult: boolean,
  formulation: DrugFormulation | null,
): DosageResult {
  const meta = {
    isAdult,
    duration: drug.duration,
    indications: drug.indications,
    contraindications: drug.contraindications,
    notes: drug.notes,
  };

  if (isAdult && drug.adultSingleDoseMg !== null) {
    const doseMg = drug.adultSingleDoseMg;
    const freqPerDay = drug.adultFreqPerDay;
    const dailyMg = freqPerDay !== null ? Math.round(doseMg * freqPerDay) : null;
    return {
      ...meta,
      hasCalculation: true,
      singleDoseMg: doseMg,
      singleDoseMgCapped: doseMg,
      isOverMax: false,
      maxMg: drug.adultMaxDailyMg,
      volumePerDose: formulation ? formatVolume(doseMg, formulation) : null,
      dailyDoseMg: dailyMg,
      freqPerDay,
      displayDose: drug.adultDose,
    };
  }

  if (!isAdult && drug.pediatricMgPerKg !== null) {
    const rawMg = weightKg * drug.pediatricMgPerKg;
    const maxMg = drug.pediatricMaxMg;
    const isOverMax = maxMg !== null && rawMg > maxMg;
    const cappedMg = maxMg !== null ? Math.min(rawMg, maxMg) : rawMg;
    const freqPerDay = drug.pediatricFreqPerDay;
    const dailyMg = freqPerDay !== null ? Math.round(cappedMg * freqPerDay) : null;
    return {
      ...meta,
      hasCalculation: true,
      singleDoseMg: Math.round(rawMg),
      singleDoseMgCapped: Math.round(cappedMg),
      isOverMax,
      maxMg,
      volumePerDose: formulation ? formatVolume(Math.round(cappedMg), formulation) : null,
      dailyDoseMg: dailyMg,
      freqPerDay,
      displayDose: drug.pediatricNote ?? `${cappedMg.toFixed(0)} ${drug.pediatricUnit}`,
    };
  }

  return {
    ...meta,
    hasCalculation: false,
    singleDoseMg: null,
    singleDoseMgCapped: null,
    isOverMax: false,
    maxMg: null,
    volumePerDose: null,
    dailyDoseMg: null,
    freqPerDay: null,
    displayDose: isAdult
      ? drug.adultDose
      : (drug.pediatricNote ?? drug.adultDose),
  };
}
