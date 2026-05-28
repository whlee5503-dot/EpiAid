import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pill, AlertTriangle, Info, ChevronDown, Copy, Check, BookOpen } from 'lucide-react';
import { calculateDose, type Drug, type DrugFormulation, type DosageResult } from '../lib/dosage';
import drugsData from '../data/drugs.json';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';

const drugs = drugsData as Drug[];

type TFunc = ReturnType<typeof useTranslation>['t'];

function freqText(freqPerDay: number | null, t: TFunc): string {
  if (freqPerDay === null) return t('dosage.freqSingle');
  const map: Record<number, string> = {
    1: t('dosage.freq1'),
    2: t('dosage.freq2'),
    3: t('dosage.freq3'),
    4: t('dosage.freq4'),
  };
  return map[freqPerDay] ?? `${freqPerDay}×/day`;
}

function StatBox({
  label,
  value,
  accent = false,
  small = false,
}: {
  label: string;
  value: string;
  accent?: boolean;
  small?: boolean;
}) {
  return (
    <div
      className="rounded-xl p-3"
      style={{ backgroundColor: accent ? 'var(--brand-bg)' : 'var(--bg-input)' }}
    >
      <p
        className="text-[10px] font-semibold uppercase tracking-wider mb-1.5 leading-none"
        style={{ color: accent ? 'var(--brand)' : 'var(--text-muted)' }}
      >
        {label}
      </p>
      <p
        className={`font-bold leading-tight ${small ? 'text-base' : 'text-2xl'}`}
        style={{ color: accent ? 'var(--brand-text)' : 'var(--text-primary)' }}
      >
        {value}
      </p>
    </div>
  );
}

function buildCopyText(
  drug: Drug,
  weight: string,
  formulation: DrugFormulation | null,
  result: DosageResult,
  fLabel: string,
  disclaimer: string,
): string {
  const lines: (string | null)[] = [
    'EpiAid — Dosage Result',
    `Drug: ${drug.name}`,
    `Weight: ${weight} kg`,
    formulation ? `Form: ${formulation.label}` : null,
    result.hasCalculation
      ? `Single dose: ${result.singleDoseMgCapped} mg`
      : `Dosing: ${result.displayDose}`,
    result.volumePerDose ? `Volume: ${result.volumePerDose}` : null,
    result.freqPerDay !== null ? `Frequency: ${fLabel}` : null,
    result.dailyDoseMg ? `Daily total: ${result.dailyDoseMg} mg` : null,
    `Duration: ${result.duration}`,
    `⚠ ${disclaimer}`,
  ];
  return lines.filter(Boolean).join('\n');
}

export default function DosageCalc() {
  const { t } = useTranslation();
  const [drugId, setDrugId] = useState('');
  const [formulationIdx, setFormulationIdx] = useState(0);
  const [weight, setWeight] = useState('');
  const [isAdult, setIsAdult] = useState(false);
  const [result, setResult] = useState<DosageResult | null>(null);
  const [copied, setCopied] = useState(false);

  const selectedDrug = drugs.find((d) => d.id === drugId) ?? null;
  const formulations = selectedDrug?.formulations ?? [];
  const selectedFormulation = formulations[formulationIdx] ?? null;

  const weightNum = parseFloat(weight);
  const weightValid = !isNaN(weightNum) && weightNum >= 0.5 && weightNum <= 150;
  const canCalculate = !!drugId && weightValid;

  function handleDrugChange(id: string) {
    setDrugId(id);
    setFormulationIdx(0);
    setResult(null);
  }

  function handleCalculate() {
    if (!selectedDrug || !weightValid) return;
    setResult(calculateDose(selectedDrug, weightNum, isAdult, selectedFormulation));
  }

  async function handleCopy() {
    if (!result || !selectedDrug) return;
    const fLabel = freqText(result.freqPerDay, t);
    const text = buildCopyText(
      selectedDrug, weight, selectedFormulation, result, fLabel, t('dosage.disclaimer'),
    );
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="p-4 pb-8">
      <header className="mb-5 pt-2">
        <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
          <Pill size={20} style={{ color: 'var(--brand)' }} />
          {t('dosage.title')}
        </h1>
      </header>

      {/* Input card */}
      <Card className="p-4 mb-4">
        <div className="space-y-4">

          {/* Drug select */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wide">
              {t('dosage.selectDrug')}
            </label>
            <div className="relative">
              <select
                className="w-full appearance-none bg-slate-50 dark:bg-[#243d36] border border-slate-200 dark:border-[#2a4a40] rounded-xl px-3 py-2.5 text-sm text-slate-800 dark:text-slate-100 pr-8 focus:outline-none focus:ring-2 focus:ring-[#1a6b4a] dark:focus:ring-[#4ade80]"
                value={drugId}
                onChange={(e) => handleDrugChange(e.target.value)}
              >
                <option value="">— {t('dosage.selectDrug')} —</option>
                {drugs.map((d) => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
              <ChevronDown size={15} className="absolute right-3 top-3 text-slate-400 pointer-events-none" />
            </div>
          </div>

          {/* Formulation select (only when > 1 option) */}
          {formulations.length > 1 && (
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wide">
                {t('dosage.concentration')}
              </label>
              <div className="relative">
                <select
                  className="w-full appearance-none bg-slate-50 dark:bg-[#243d36] border border-slate-200 dark:border-[#2a4a40] rounded-xl px-3 py-2.5 text-sm text-slate-800 dark:text-slate-100 pr-8 focus:outline-none focus:ring-2 focus:ring-[#1a6b4a] dark:focus:ring-[#4ade80]"
                  value={formulationIdx}
                  onChange={(e) => { setFormulationIdx(Number(e.target.value)); setResult(null); }}
                >
                  {formulations.map((f, i) => (
                    <option key={i} value={i}>{f.label}</option>
                  ))}
                </select>
                <ChevronDown size={15} className="absolute right-3 top-3 text-slate-400 pointer-events-none" />
              </div>
            </div>
          )}

          {/* Weight */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wide">
              {t('dosage.weight')}
            </label>
            <div className="relative">
              <input
                type="number"
                min="0.5"
                max="150"
                step="0.1"
                placeholder="e.g. 12.5"
                value={weight}
                onChange={(e) => { setWeight(e.target.value); setResult(null); }}
                className="w-full bg-slate-50 dark:bg-[#243d36] border border-slate-200 dark:border-[#2a4a40] rounded-xl px-3 py-2.5 text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#1a6b4a] dark:focus:ring-[#4ade80]"
              />
              <span className="absolute right-3 top-2.5 text-sm text-slate-400 pointer-events-none">kg</span>
            </div>
            {weight && !weightValid && (
              <p className="text-xs text-red-500 mt-1">{t('dosage.weightRange')}</p>
            )}
          </div>

          {/* Adult toggle */}
          <label className="flex items-center gap-3 cursor-pointer select-none">
            <div
              role="switch"
              aria-checked={isAdult}
              onClick={() => { setIsAdult((v) => !v); setResult(null); }}
              className="w-10 h-6 rounded-full transition-colors relative flex-shrink-0 cursor-pointer"
              style={{ backgroundColor: isAdult ? '#1a6b4a' : '#e2e8f0' }}
            >
              <span
                className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                  isAdult ? 'translate-x-4' : 'translate-x-0.5'
                }`}
              />
            </div>
            <span className="text-sm text-slate-700 dark:text-slate-300">{t('dosage.isAdult')}</span>
          </label>

          <Button fullWidth onClick={handleCalculate} disabled={!canCalculate}>
            {t('dosage.calculate')}
          </Button>
        </div>
      </Card>

      {/* Empty state */}
      {!result && (
        <p className="text-center text-sm text-slate-400 dark:text-slate-500 mt-6">{t('dosage.noSelection')}</p>
      )}

      {/* Results */}
      {result && selectedDrug && (
        <div className="space-y-3">

          {/* Max dose warning */}
          {result.isOverMax && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl p-3 flex items-start gap-2">
              <AlertTriangle size={16} className="text-red-500 dark:text-red-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-semibold text-red-700 dark:text-red-300">{t('dosage.maxCapApplied')}</p>
                <p className="text-xs text-red-600 dark:text-red-400 mt-0.5">
                  {t('dosage.maxCapDetail', {
                    calc: result.singleDoseMg,
                    max: result.maxMg,
                  })}
                </p>
              </div>
            </div>
          )}

          {/* Main result card */}
          <Card className="p-4">
            {/* Header row */}
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="font-bold text-slate-800 dark:text-slate-100 text-base">{selectedDrug.name}</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  {weight} kg
                  {selectedFormulation && ` · ${selectedFormulation.label}`}
                  {` · ${result.isAdult ? t('dosage.adultDose') : t('dosage.pediatricDose')}`}
                </p>
              </div>
              <button
                onClick={handleCopy}
                title={t('dosage.copy')}
                className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors"
                style={{ backgroundColor: copied ? 'var(--brand-bg)' : 'var(--bg-input)' }}
              >
                {copied
                  ? <Check size={15} style={{ color: 'var(--brand)' }} />
                  : <Copy size={15} className="text-slate-400" />
                }
              </button>
            </div>

            {result.hasCalculation ? (
              <div className="grid grid-cols-2 gap-2.5 mb-4">
                <StatBox
                  label={t('dosage.singleDose')}
                  value={`${result.singleDoseMgCapped} mg`}
                  accent
                />
                <StatBox
                  label={t('dosage.frequency')}
                  value={freqText(result.freqPerDay, t)}
                  small
                />
                <StatBox
                  label={t('dosage.volume')}
                  value={result.volumePerDose ?? '—'}
                  accent={!!result.volumePerDose}
                />
                <StatBox
                  label={t('dosage.dailyTotal')}
                  value={
                    result.dailyDoseMg
                      ? `${result.dailyDoseMg} mg`
                      : result.freqPerDay === null
                        ? t('dosage.freqSingle')
                        : '—'
                  }
                />
              </div>
            ) : (
              <div className="rounded-xl p-3 mb-4 bg-amber-50 dark:bg-amber-900/20">
                <p
                  className="text-xs font-semibold uppercase tracking-wide mb-1 flex items-center gap-1 text-amber-600 dark:text-amber-400"
                >
                  <BookOpen size={11} />
                  {t('dosage.dosingNote')}
                </p>
                <p className="text-sm leading-snug text-amber-800 dark:text-amber-300">
                  {result.displayDose}
                </p>
              </div>
            )}

            <div className="pt-3 border-t border-slate-100 dark:border-[#2a4a40]">
              <p className="text-xs text-slate-600 dark:text-slate-300">
                <span className="font-semibold">{t('dosage.duration')}:</span>{' '}
                {result.duration}
              </p>
            </div>
          </Card>

          {/* Indications */}
          {result.indications.length > 0 && (
            <Card className="p-4">
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2">
                {t('dosage.indications')}
              </p>
              <ul className="space-y-1">
                {result.indications.map((ind) => (
                  <li key={ind} className="text-sm text-slate-700 dark:text-slate-300 flex items-start gap-2">
                    <span className="flex-shrink-0 mt-0.5" style={{ color: 'var(--brand)' }}>•</span>
                    {ind}
                  </li>
                ))}
              </ul>
            </Card>
          )}

          {/* Contraindications */}
          {result.contraindications.length > 0 && (
            <Card className="p-4 border-red-100">
              <p className="text-xs font-semibold text-red-500 uppercase tracking-wide mb-2 flex items-center gap-1">
                <AlertTriangle size={12} /> {t('dosage.contraindications')}
              </p>
              <ul className="space-y-1">
                {result.contraindications.map((c) => (
                  <li key={c} className="text-sm text-red-700 flex items-start gap-2">
                    <span className="text-red-400 flex-shrink-0 mt-0.5">•</span>{c}
                  </li>
                ))}
              </ul>
            </Card>
          )}

          {/* Notes */}
          {result.notes && (
            <Card className="p-4 bg-amber-50 dark:bg-amber-900/20 border-amber-100 dark:border-amber-800">
              <p className="text-xs font-semibold text-amber-600 dark:text-amber-400 uppercase tracking-wide mb-1 flex items-center gap-1">
                <Info size={12} /> {t('dosage.notes')}
              </p>
              <p className="text-sm text-amber-800 dark:text-amber-300">{result.notes}</p>
            </Card>
          )}
        </div>
      )}

      {/* Disclaimer — always visible */}
      <div className="mt-6 flex items-start gap-2 px-1">
        <AlertTriangle size={13} className="text-amber-400 mt-0.5 flex-shrink-0" />
        <p className="text-xs text-slate-400 dark:text-slate-500 italic">{t('dosage.disclaimer')}</p>
      </div>
    </div>
  );
}
