import { describe, it, expect } from 'vitest';
import drugsData from '../data/drugs.json';
import { calculateDose, NEONATE_MGKG_WARNING, type Drug, type PatientContext } from './dosage';

const drugs = drugsData as unknown as Drug[];

const getDrug = (id: string): Drug => {
    const d = drugs.find((x) => x.id === id);
    if (!d) throw new Error(`Drug not found: ${id}`);
    return d;
};

const getForm = (d: Drug, label: string) => {
    const f = d.formulations.find((x) => x.label === label);
    if (!f) throw new Error(`Formulation not found: ${label}`);
    return f;
};

const CHILD: PatientContext = { ageGroup: 'child1to11y', pregnancy: 'no' };
const ADULT: PatientContext = { ageGroup: 'adult12plus', pregnancy: 'no' };
const NEONATE: PatientContext = { ageGroup: 'neonate', pregnancy: 'no' };
const INFANT_1_5: PatientContext = { ageGroup: 'infant1to5m', pregnancy: 'no' };
const INFANT_6_11: PatientContext = { ageGroup: 'infant6to11m', pregnancy: 'no' };

describe('WHO pediatric doses (phase 1 data)', () => {
    it('amoxicillin 20 kg: 40 mg/kg every 12h = 800 mg', () => {
        const d = getDrug('amoxicillin');
        const r = calculateDose(d, 20, CHILD, getForm(d, 'Susp 125mg/5ml'));
        expect(r.singleDoseMgCapped).toBe(800);
        expect(r.freqPerDay).toBe(2);
        expect(r.volumePerDose).toBe('32 ml');
    });

    it('amoxicillin 30 kg is capped at 1000 mg/dose', () => {
        const r = calculateDose(getDrug('amoxicillin'), 30, CHILD, null);
        expect(r.singleDoseMg).toBe(1200);
        expect(r.singleDoseMgCapped).toBe(1000);
        expect(r.isOverMax).toBe(true);
    });

    it('ceftriaxone 20 kg: 80 mg/kg once daily = 1600 mg', () => {
        const r = calculateDose(getDrug('ceftriaxone'), 20, CHILD, null);
        expect(r.singleDoseMgCapped).toBe(1600);
        expect(r.freqPerDay).toBe(1);
    });

    it('ceftriaxone 30 kg is capped at 2000 mg (pneumonia/sepsis)', () => {
        const r = calculateDose(getDrug('ceftriaxone'), 30, CHILD, null);
        expect(r.singleDoseMgCapped).toBe(2000);
        expect(r.isOverMax).toBe(true);
    });

    it('co-trimoxazole 10 kg: 24 mg/kg every 12h = 240 mg', () => {
        const r = calculateDose(getDrug('cotrimoxazole'), 10, CHILD, null);
        expect(r.singleDoseMgCapped).toBe(240);
        expect(r.freqPerDay).toBe(2);
    });

    it('zinc has no adult calculation (not recommended by WHO)', () => {
        const r = calculateDose(getDrug('zinc'), 60, ADULT, null);
        expect(r.hasCalculation).toBe(false);
        expect(r.displayDose).toContain('Not recommended');
    });
});

describe('formatVolume (via calculateDose)', () => {
    it('rounds vials UP to whole vials', () => {
        const d = getDrug('ceftriaxone');
        const r = calculateDose(d, 20, CHILD, getForm(d, 'Vial 250mg'));
        expect(r.volumePerDose).toBe('7 × 250mg vial');
    });

    it('does not round up an exact vial multiple', () => {
        const d = getDrug('ceftriaxone');
        const r = calculateDose(d, 25, CHILD, getForm(d, 'Vial 500mg'));
        expect(r.volumePerDose).toBe('4 × 500mg vial');
    });

    it('rounds tablets to the nearest half tablet', () => {
        const d = getDrug('amoxicillin');
        const r = calculateDose(d, 20, CHILD, getForm(d, 'Tab 500mg'));
        expect(r.volumePerDose).toBe('1½ tab');
    });

    it('returns null instead of "0 tab" when the dose is too small', () => {
        const d = getDrug('metronidazole');
        const r = calculateDose(d, 3, INFANT_1_5, getForm(d, 'Tab 500mg'));
        expect(r.volumePerDose).toBeNull();
    });
});

describe('indication guidance is exposed with calculated doses', () => {
    it('ceftriaxone pediatric shows the meningitis dose', () => {
        const r = calculateDose(getDrug('ceftriaxone'), 20, CHILD, null);
        expect(r.hasCalculation).toBe(true);
        expect(r.guidance).toContain('Meningitis');
    });

    it('ceftriaxone adult shows the gonorrhea regimen', () => {
        const r = calculateDose(getDrug('ceftriaxone'), 60, ADULT, null);
        expect(r.guidance).toContain('gonorrhea');
    });

    it('co-trimoxazole pediatric shows HIV prophylaxis bands', () => {
        const r = calculateDose(getDrug('cotrimoxazole'), 10, CHILD, null);
        expect(r.guidance).toContain('HIV prophylaxis');
    });

    it('no guidance duplicated when there is no calculation', () => {
        const r = calculateDose(getDrug('zinc'), 60, ADULT, null);
        expect(r.guidance).toBeNull();
    });
});

describe('age-group doses', () => {
    it('zinc 1–5 months: 10 mg = 5 ml of 10mg/5ml syrup', () => {
        const d = getDrug('zinc');
        const r = calculateDose(d, 5, INFANT_1_5, getForm(d, 'Syrup 10mg/5ml'));
        expect(r.singleDoseMgCapped).toBe(10);
        expect(r.volumePerDose).toBe('5 ml');
    });

    it('zinc 6–11 months: 20 mg = 1 tablet of 20mg', () => {
        const d = getDrug('zinc');
        const r = calculateDose(d, 8, INFANT_6_11, getForm(d, 'Tab 20mg'));
        expect(r.singleDoseMgCapped).toBe(20);
        expect(r.volumePerDose).toBe('1 tab');
    });

    it('vitamin A 6–11 months: 100,000 IU', () => {
        const r = calculateDose(getDrug('vitamin-a'), 8, INFANT_6_11, null);
        expect(r.hasCalculation).toBe(false);
        expect(r.displayDose).toBe('100,000 IU');
    });

    it('vitamin A 1–11 years: 200,000 IU', () => {
        const r = calculateDose(getDrug('vitamin-a'), 12, CHILD, null);
        expect(r.displayDose).toBe('200,000 IU');
    });
});

describe('safety rules (hard stops and warnings)', () => {
    it('vitamin A is blocked when pregnancy status is unknown', () => {
        const r = calculateDose(getDrug('vitamin-a'), 55, { ageGroup: 'adult12plus', pregnancy: 'unknown' }, null);
        expect(r.blocked).toBe(true);
        expect(r.alerts[0].message).toContain('25,000 IU');
    });

    it('vitamin A is blocked in pregnancy', () => {
        const r = calculateDose(getDrug('vitamin-a'), 55, { ageGroup: 'adult12plus', pregnancy: 'yes' }, null);
        expect(r.blocked).toBe(true);
    });

    it('vitamin A is not blocked for a non-pregnant adult', () => {
        const r = calculateDose(getDrug('vitamin-a'), 55, ADULT, null);
        expect(r.blocked).toBe(false);
    });

    it('co-trimoxazole is blocked in neonates', () => {
        const r = calculateDose(getDrug('cotrimoxazole'), 3.5, NEONATE, null);
        expect(r.blocked).toBe(true);
        expect(r.hasCalculation).toBe(false);
    });

    it('ceftriaxone is blocked in neonates and shows the neonatal regimen', () => {
        const r = calculateDose(getDrug('ceftriaxone'), 3.5, NEONATE, null);
        expect(r.blocked).toBe(true);
        expect(r.alerts[0].message).toContain('50mg/kg every 12h');
    });

    it('mebendazole is blocked under 1 year', () => {
        const r = calculateDose(getDrug('mebendazole'), 8, INFANT_6_11, null);
        expect(r.blocked).toBe(true);
    });

    it('mebendazole is allowed from 1 year', () => {
        const r = calculateDose(getDrug('mebendazole'), 12, CHILD, null);
        expect(r.blocked).toBe(false);
    });

    it('artemether-lumefantrine is blocked under 5 kg', () => {
        const r = calculateDose(getDrug('al'), 4.2, INFANT_1_5, null);
        expect(r.blocked).toBe(true);
        expect(r.alerts[0].message).toContain('infant formulation');
    });

    it('ciprofloxacin in pregnancy warns but still calculates', () => {
        const r = calculateDose(getDrug('ciprofloxacin'), 60, { ageGroup: 'adult12plus', pregnancy: 'yes' }, null);
        expect(r.blocked).toBe(false);
        expect(r.hasCalculation).toBe(true);
        expect(r.alerts).toHaveLength(1);
    });

    it('mg/kg dosing in a neonate adds a neonatal warning', () => {
        const r = calculateDose(getDrug('amoxicillin'), 3.5, NEONATE, null);
        expect(r.hasCalculation).toBe(true);
        expect(r.alerts.map((a) => a.message)).toContain(NEONATE_MGKG_WARNING);
    });
});