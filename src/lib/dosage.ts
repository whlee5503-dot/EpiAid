export type AgeGroup =
  | 'neonate'        // < 1 month
  | 'infant1to5m'    // 1–5 months
  | 'infant6to11m'   // 6–11 months
  | 'child1to11y'    // 1–11 years
  | 'adult12plus';   // ≥ 12 years (adult dosing)

export type PregnancyStatus = 'no' | 'yes' | 'unknown';

export interface PatientContext {
  ageGroup: AgeGroup;
  /** Only meaningful for adult12plus; use 'no' for males */
  pregnancy: PregnancyStatus;
}

export interface SafetyRule {
  /** 'block' stops the calculation; 'warn' shows an alert alongside it */
  level: 'block' | 'warn';
  ageGroups?: AgeGroup[];
  pregnancy?: PregnancyStatus[];
  weightBelowKg?: number;
  message: string;
}

export interface AgeDose {
  ageGroups: AgeGroup[];
  /** Human-readable dose, e.g. "10 mg once daily" or "100,000 IU" */
  dose: string;
  /** Set when the dose can be converted to a volume/tablet count */
  doseMg?: number;
}

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
  ageDoses?: AgeDose[];
  rules?: SafetyRule[];
  duration: string;
  indications: string[];
  contraindications: string[];
  notes: string;
}

export interface DosageAlert {
  level: 'block' | 'warn';
  message: string;
}

export interface DosageResult {
  hasCalculation: boolean;
  blocked: boolean;
  alerts: DosageAlert[];
  isAdult: boolean;
  singleDoseMg: number | null;
  singleDoseMgCapped: number | null;
  isOverMax: boolean;
  maxMg: number | null;
  volumePerDose: string | null;
  dailyDoseMg: number | null;
  freqPerDay: number | null;
  displayDose: string;
  /** Indication-specific dosing text shown alongside a calculated dose */
  guidance: string | null;
  duration: string;
  indications: string[];
  contraindications: string[];
  notes: string;
}

export const NEONATE_MGKG_WARNING =
  'Neonatal dosing often differs from the standard pediatric dose — confirm with neonatal guidelines before giving.';

function formatVolume(doseMg: number, f: DrugFormulation): string | null {
  if (f.mgPerUnit === null || doseMg <= 0) return null;

  // Liquid formulations: volume in ml
  if (f.mlPerUnit !== null) {
    const ml = (doseMg / f.mgPerUnit) * f.mlPerUnit;
    return `${Math.round(ml * 10) / 10} ml`;
  }

  // Avoid floating-point noise (e.g. 3.0000001 vials)
  const count = Math.round((doseMg / f.mgPerUnit) * 1000) / 1000;

  // Vials: round UP to whole vials that must be opened
  if (f.type === 'vial') {
    const vials = Math.ceil(count);
    return `${vials} × ${f.mgPerUnit}mg vial`;
  }

  // Tablets can be halved; capsules and sachets cannot
  const step = f.type === 'tab' ? 0.5 : 1;
  const rounded = Math.round(count / step) * step;

  // Dose too small for this solid form — caller should choose a liquid
  if (rounded === 0) return null;

  const whole = Math.floor(rounded);
  const hasHalf = rounded - whole === 0.5;
  const str = hasHalf ? (whole === 0 ? '½' : `${whole}½`) : `${whole}`;
  return `${str} ${f.type}`;
}

function ruleMatches(rule: SafetyRule, weightKg: number, patient: PatientContext): boolean {
  if (rule.ageGroups && !rule.ageGroups.includes(patient.ageGroup)) return false;
  if (rule.pregnancy && !rule.pregnancy.includes(patient.pregnancy)) return false;
  if (rule.weightBelowKg !== undefined && !(weightKg < rule.weightBelowKg)) return false;
  return true;
}

export function evaluateRules(
  drug: Drug,
  weightKg: number,
  patient: PatientContext,
): DosageAlert[] {
  return (drug.rules ?? [])
    .filter((r) => ruleMatches(r, weightKg, patient))
    .map((r) => ({ level: r.level, message: r.message }));
}

export function calculateDose(
  drug: Drug,
  weightKg: number,
  patient: PatientContext,
  formulation: DrugFormulation | null,
): DosageResult {
  const isAdult = patient.ageGroup === 'adult12plus';
  const alerts = evaluateRules(drug, weightKg, patient);
  const blocked = alerts.some((a) => a.level === 'block');

  const meta = {
    isAdult,
    alerts,
    blocked,
    duration: drug.duration,
    indications: drug.indications,
    contraindications: drug.contraindications,
    notes: drug.notes,
  };

  const noCalc = (displayDose: string): DosageResult => ({
    ...meta,
    hasCalculation: false,
    singleDoseMg: null,
    singleDoseMgCapped: null,
    isOverMax: false,
    maxMg: null,
    volumePerDose: null,
    dailyDoseMg: null,
    freqPerDay: null,
    displayDose,
    guidance: null,
  });

  // 1. Safety rules first: a blocking rule stops any calculation
  if (blocked) return noCalc('');

  // 2. Fixed dose by age group (e.g. zinc, vitamin A)
  const ageDose = drug.ageDoses?.find((a) => a.ageGroups.includes(patient.ageGroup));
  if (ageDose) {
    if (ageDose.doseMg === undefined) return noCalc(ageDose.dose);
    const freqPerDay = isAdult ? drug.adultFreqPerDay : drug.pediatricFreqPerDay;
    return {
      ...meta,
      hasCalculation: true,
      singleDoseMg: ageDose.doseMg,
      singleDoseMgCapped: ageDose.doseMg,
      isOverMax: false,
      maxMg: null,
      volumePerDose: formulation ? formatVolume(ageDose.doseMg, formulation) : null,
      dailyDoseMg: freqPerDay !== null ? ageDose.doseMg * freqPerDay : null,
      freqPerDay,
      displayDose: ageDose.dose,
      guidance: null,
    };
  }

  // 3. Adult fixed dose
  if (isAdult) {
    if (drug.adultSingleDoseMg === null) return noCalc(drug.adultDose);
    const doseMg = drug.adultSingleDoseMg;
    const freqPerDay = drug.adultFreqPerDay;
    return {
      ...meta,
      hasCalculation: true,
      singleDoseMg: doseMg,
      singleDoseMgCapped: doseMg,
      isOverMax: false,
      maxMg: drug.adultMaxDailyMg,
      volumePerDose: formulation ? formatVolume(doseMg, formulation) : null,
      dailyDoseMg: freqPerDay !== null ? Math.round(doseMg * freqPerDay) : null,
      freqPerDay,
      displayDose: drug.adultDose,
      guidance: drug.adultDose,
    };
  }

  // 4. Pediatric mg/kg
  if (drug.pediatricMgPerKg !== null) {
    const rawMg = weightKg * drug.pediatricMgPerKg;
    const maxMg = drug.pediatricMaxMg;
    const isOverMax = maxMg !== null && rawMg > maxMg;
    const cappedMg = maxMg !== null ? Math.min(rawMg, maxMg) : rawMg;
    const freqPerDay = drug.pediatricFreqPerDay;
    const neonateAlerts: DosageAlert[] =
      patient.ageGroup === 'neonate' ? [{ level: 'warn', message: NEONATE_MGKG_WARNING }] : [];
    return {
      ...meta,
      alerts: [...alerts, ...neonateAlerts],
      hasCalculation: true,
      singleDoseMg: Math.round(rawMg),
      singleDoseMgCapped: Math.round(cappedMg),
      isOverMax,
      maxMg,
      volumePerDose: formulation ? formatVolume(Math.round(cappedMg), formulation) : null,
      dailyDoseMg: freqPerDay !== null ? Math.round(cappedMg * freqPerDay) : null,
      freqPerDay,
      displayDose: drug.pediatricNote ?? `${cappedMg.toFixed(0)} ${drug.pediatricUnit}`,
      guidance: drug.pediatricNote ?? null,
    };
  }

  // 5. Pediatric text-only dosing (e.g. weight-band tables)
  return noCalc(drug.pediatricNote ?? drug.adultDose);
}