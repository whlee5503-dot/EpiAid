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
    it('amoxicillin 20 kg: WHO weight band >=20 kg = 1000 mg every 12h', () => {
        const d = getDrug('amoxicillin');
        const r = calculateDose(d, 20, CHILD, getForm(d, 'Susp 125mg/5ml'));
        expect(r.singleDoseMgCapped).toBe(1000);
        expect(r.freqPerDay).toBe(2);
        expect(r.volumePerDose).toBe('40 ml');
    });

    it('amoxicillin 30 kg stays at the >=20 kg band dose of 1000 mg', () => {
        const r = calculateDose(getDrug('amoxicillin'), 30, CHILD, null);
        expect(r.singleDoseMg).toBe(1000);
        expect(r.singleDoseMgCapped).toBe(1000);
        expect(r.isOverMax).toBe(false);
    });

    it('ceftriaxone 20 kg: 80 mg/kg once daily = 1600 mg', () => {
        const r = calculateDose(getDrug('ceftriaxone'), 20, CHILD, null);
        expect(r.singleDoseMgCapped).toBe(1600);
        expect(r.freqPerDay).toBe(1);
    });

    it('ceftriaxone 35 kg: 80 mg/kg = 2800 mg, below the 3 g maximum', () => {
        const r = calculateDose(getDrug('ceftriaxone'), 35, CHILD, null);
        expect(r.singleDoseMgCapped).toBe(2800);
        expect(r.isOverMax).toBe(false);
    });

    it('ceftriaxone 40 kg is capped at 3000 mg (AWaRe maximum daily dose)', () => {
        const r = calculateDose(getDrug('ceftriaxone'), 40, CHILD, null);
        expect(r.singleDoseMgCapped).toBe(3000);
        expect(r.isOverMax).toBe(true);
    });

    it('ceftriaxone adult default is 1 g once daily', () => {
        const r = calculateDose(getDrug('ceftriaxone'), 60, ADULT, null);
        expect(r.singleDoseMgCapped).toBe(1000);
        expect(r.freqPerDay).toBe(1);
    });

    it('co-trimoxazole 10 kg: WHO weight band 10 to <30 kg = 480 mg every 12h', () => {
        const r = calculateDose(getDrug('cotrimoxazole'), 10, CHILD, null);
        expect(r.singleDoseMgCapped).toBe(480);
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
        const r = calculateDose(d, 8, INFANT_6_11, getForm(d, 'Tab 250mg'));
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

describe('amoxicillin WHO weight bands (AWaRe 2022, p.152)', () => {
    const dose = (kg: number) => calculateDose(getDrug('amoxicillin'), kg, CHILD, null);

    it.each([
        [3, 250], [5.9, 250],
        [6, 375], [9.9, 375],
        [10, 500], [14.9, 500],
        [15, 750], [19.9, 750],
        [20, 1000], [45, 1000],
    ])('%s kg gives %s mg every 12h', (kg, mg) => {
        const r = dose(kg);
        expect(r.singleDoseMgCapped).toBe(mg);
        expect(r.freqPerDay).toBe(2);
    });

    it('is blocked below 3 kg (outside the WHO table)', () => {
        const r = dose(2.9);
        expect(r.blocked).toBe(true);
        expect(r.hasCalculation).toBe(false);
    });
});

describe('amoxicillin adult dose (AWaRe 2022, Table 49.1, p.629)', () => {
    it('adult default is the higher dose: 1 g every 8h = 3 g/day', () => {
        const d = getDrug('amoxicillin');
        const r = calculateDose(d, 60, ADULT, getForm(d, 'Tab 500mg'));
        expect(r.singleDoseMgCapped).toBe(1000);
        expect(r.freqPerDay).toBe(3);
        expect(r.dailyDoseMg).toBe(3000);
        expect(r.volumePerDose).toBe('2 tab');
    });
});

describe('co-trimoxazole WHO weight bands (AWaRe 2022, p.651)', () => {
    const dose = (kg: number) => calculateDose(getDrug('cotrimoxazole'), kg, CHILD, null);

    it.each([
        [3, 120], [5.9, 120],
        [6, 240], [9.9, 240],
        [10, 480], [29.9, 480],
        [30, 960], [45, 960],
    ])('%s kg gives %s mg every 12h', (kg, mg) => {
        const r = dose(kg);
        expect(r.singleDoseMgCapped).toBe(mg);
        expect(r.freqPerDay).toBe(2);
    });

    it('is blocked below 3 kg (outside the WHO table)', () => {
        const r = dose(2.9);
        expect(r.blocked).toBe(true);
        expect(r.hasCalculation).toBe(false);
    });
});

describe('ciprofloxacin WHO weight bands (AWaRe 2022, p.646)', () => {
    const dose = (kg: number) => calculateDose(getDrug('ciprofloxacin'), kg, CHILD, null);

    it.each([
        [3, 50], [5.9, 50],
        [6, 100], [9.9, 100],
        [10, 150], [14.9, 150],
        [15, 200], [19.9, 200],
        [20, 300], [29.9, 300],
        [30, 500], [45, 500],
    ])('%s kg gives %s mg every 12h', (kg, mg) => {
        const r = dose(kg);
        expect(r.singleDoseMgCapped).toBe(mg);
        expect(r.freqPerDay).toBe(2);
    });

    it('is blocked below 3 kg (outside the WHO table)', () => {
        const r = dose(2.9);
        expect(r.blocked).toBe(true);
        expect(r.hasCalculation).toBe(false);
    });
});

describe('metronidazole WHO doses (AWaRe 2022, pp.636 and 649)', () => {
    const child = (kg: number) => calculateDose(getDrug('metronidazole'), kg, CHILD, null);

    it.each([
        [3, 30], [5.9, 30],
        [6, 50], [9.9, 50],
        [10, 100], [14.9, 100],
        [15, 150], [19.9, 150],
        [20, 200], [29.9, 200],
        [30, 500], [45, 500],
    ])('%s kg gives %s mg every 8h', (kg, mg) => {
        const r = child(kg);
        expect(r.singleDoseMgCapped).toBe(mg);
        expect(r.freqPerDay).toBe(3);
    });

    it('is blocked below 3 kg (outside the WHO table)', () => {
        const r = child(2.9);
        expect(r.blocked).toBe(true);
        expect(r.hasCalculation).toBe(false);
    });

    it('adult default is 500 mg every 8h = 1500 mg/day', () => {
        const d = getDrug('metronidazole');
        const r = calculateDose(d, 60, ADULT, getForm(d, 'Tab 500mg'));
        expect(r.singleDoseMgCapped).toBe(500);
        expect(r.freqPerDay).toBe(3);
        expect(r.dailyDoseMg).toBe(1500);
        expect(r.volumePerDose).toBe('1 tab');
    });
});

describe('tablet count is hidden when rounding changes the dose by more than 10%', () => {
    it('amoxicillin 375 mg on Tab 500mg shows no tablet count', () => {
        const d = getDrug('amoxicillin');
        const r = calculateDose(d, 8, CHILD, getForm(d, 'Tab 500mg'));
        expect(r.singleDoseMgCapped).toBe(375);
        expect(r.volumePerDose).toBeNull();
    });

    it('co-trimoxazole 120 mg on Tab 480mg shows no tablet count', () => {
        const d = getDrug('cotrimoxazole');
        const r = calculateDose(d, 5, CHILD, getForm(d, 'Tab 480mg'));
        expect(r.singleDoseMgCapped).toBe(120);
        expect(r.volumePerDose).toBeNull();
    });

    it('metronidazole 50 mg on Tab 200mg shows no tablet count', () => {
        const d = getDrug('metronidazole');
        const r = calculateDose(d, 8, CHILD, getForm(d, 'Tab 200mg'));
        expect(r.singleDoseMgCapped).toBe(50);
        expect(r.volumePerDose).toBeNull();
    });

    it('exact half tablet is still shown', () => {
        const d = getDrug('amoxicillin');
        const r = calculateDose(d, 8, CHILD, getForm(d, 'Tab 250mg'));
        expect(r.volumePerDose).toBe('1½ tab');
    });

    it('whole tablets are still shown (amoxicillin 1000 mg = 2 tab of 500 mg)', () => {
        const d = getDrug('amoxicillin');
        const r = calculateDose(d, 20, CHILD, getForm(d, 'Tab 500mg'));
        expect(r.volumePerDose).toBe('2 tab');
    });
});