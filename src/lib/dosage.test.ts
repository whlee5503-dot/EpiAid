import { describe, it, expect } from 'vitest';
import drugsData from '../data/drugs.json';
import { calculateDose, type Drug } from './dosage';

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

describe('WHO pediatric doses (phase 1 data)', () => {
    it('amoxicillin 20 kg: 40 mg/kg every 12h = 800 mg', () => {
        const d = getDrug('amoxicillin');
        const r = calculateDose(d, 20, false, getForm(d, 'Susp 125mg/5ml'));
        expect(r.singleDoseMgCapped).toBe(800);
        expect(r.freqPerDay).toBe(2);
        expect(r.volumePerDose).toBe('32 ml');
    });

    it('amoxicillin 30 kg is capped at 1000 mg/dose', () => {
        const r = calculateDose(getDrug('amoxicillin'), 30, false, null);
        expect(r.singleDoseMg).toBe(1200);
        expect(r.singleDoseMgCapped).toBe(1000);
        expect(r.isOverMax).toBe(true);
    });

    it('ceftriaxone 20 kg: 80 mg/kg once daily = 1600 mg', () => {
        const r = calculateDose(getDrug('ceftriaxone'), 20, false, null);
        expect(r.singleDoseMgCapped).toBe(1600);
        expect(r.freqPerDay).toBe(1);
    });

    it('ceftriaxone 30 kg is capped at 2000 mg (pneumonia/sepsis)', () => {
        const r = calculateDose(getDrug('ceftriaxone'), 30, false, null);
        expect(r.singleDoseMgCapped).toBe(2000);
        expect(r.isOverMax).toBe(true);
    });

    it('co-trimoxazole 10 kg: 24 mg/kg every 12h = 240 mg', () => {
        const r = calculateDose(getDrug('cotrimoxazole'), 10, false, null);
        expect(r.singleDoseMgCapped).toBe(240);
        expect(r.freqPerDay).toBe(2);
    });

    it('zinc has no adult calculation (not recommended by WHO)', () => {
        const r = calculateDose(getDrug('zinc'), 60, true, null);
        expect(r.hasCalculation).toBe(false);
        expect(r.displayDose).toContain('Not recommended');
    });
});

describe('formatVolume (via calculateDose)', () => {
    it('rounds vials UP to whole vials', () => {
        const d = getDrug('ceftriaxone');
        const r = calculateDose(d, 20, false, getForm(d, 'Vial 250mg'));
        expect(r.volumePerDose).toBe('7 × 250mg vial');
    });

    it('does not round up an exact vial multiple', () => {
        const d = getDrug('ceftriaxone');
        const r = calculateDose(d, 25, false, getForm(d, 'Vial 500mg'));
        expect(r.volumePerDose).toBe('4 × 500mg vial');
    });

    it('rounds tablets to the nearest half tablet', () => {
        const d = getDrug('amoxicillin');
        const r = calculateDose(d, 20, false, getForm(d, 'Tab 500mg'));
        expect(r.volumePerDose).toBe('1½ tab');
    });

    it('returns null instead of "0 tab" when the dose is too small', () => {
        const d = getDrug('metronidazole');
        const r = calculateDose(d, 3, false, getForm(d, 'Tab 500mg'));
        expect(r.volumePerDose).toBeNull();
    });
});