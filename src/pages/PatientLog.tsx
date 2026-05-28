import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Users, Plus, Search, Trash2, ChevronRight, X } from 'lucide-react';
import { usePatients } from '../hooks/usePatients';
import type { PatientRecord } from '../lib/storage';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';

type FormData = Omit<PatientRecord, 'id' | 'createdAt' | 'updatedAt'>;

const EMPTY_FORM: FormData = {
  name: '',
  ageValue: 0,
  ageUnit: 'months',
  sex: 'M',
  weight: undefined,
  height: undefined,
  muac: undefined,
  diagnosis: '',
  notes: '',
};

export default function PatientLog() {
  const { t } = useTranslation();
  const { patients, add, remove } = usePatients();
  const [query, setQuery] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<FormData>(EMPTY_FORM);
  const [selected, setSelected] = useState<PatientRecord | null>(null);

  const filtered = patients.filter((p) =>
    p.name.toLowerCase().includes(query.toLowerCase()) ||
    (p.diagnosis ?? '').toLowerCase().includes(query.toLowerCase())
  );

  function handleSave() {
    if (!form.name.trim()) return;
    add(form);
    setForm(EMPTY_FORM);
    setShowForm(false);
  }

  function handleDelete(id: string) {
    if (window.confirm(t('patients.confirmDelete'))) {
      remove(id);
      if (selected?.id === id) setSelected(null);
    }
  }

  function formatAge(p: PatientRecord) {
    return `${p.ageValue} ${t(p.ageUnit === 'months' ? 'patients.ageMonths' : 'patients.ageYears')}`;
  }

  function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString();
  }

  if (selected) {
    return (
      <div className="p-4">
        <header className="mb-5 pt-2 flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => setSelected(null)}>
            <X size={16} />
          </Button>
          <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">{selected.name}</h1>
        </header>

        <Card className="p-4 mb-3">
          <div className="grid grid-cols-2 gap-y-3 text-sm">
            {[
              [t('patients.age'), formatAge(selected)],
              [t('patients.sex'), selected.sex === 'M' ? t('patients.male') : t('patients.female')],
              selected.weight ? [t('patients.weight'), `${selected.weight} kg`] : null,
              selected.height ? [t('patients.height'), `${selected.height} cm`] : null,
              selected.muac ? [t('patients.muac'), `${selected.muac} mm`] : null,
              [t('patients.recorded'), formatDate(selected.createdAt)],
            ].filter((x): x is string[] => x !== null).map(([label, value]) => (
              <div key={String(label)}>
                <p className="text-xs text-slate-400 dark:text-slate-500 mb-0.5">{label}</p>
                <p className="font-medium text-slate-800 dark:text-slate-100">{value}</p>
              </div>
            ))}
          </div>
        </Card>

        {selected.diagnosis && (
          <Card className="p-4 mb-3">
            <p className="text-xs text-slate-400 dark:text-slate-500 mb-1">{t('patients.diagnosis')}</p>
            <p className="text-sm text-slate-800 dark:text-slate-100">{selected.diagnosis}</p>
          </Card>
        )}

        {selected.notes && (
          <Card className="p-4 mb-3">
            <p className="text-xs text-slate-400 dark:text-slate-500 mb-1">{t('patients.notes')}</p>
            <p className="text-sm text-slate-800 dark:text-slate-100 whitespace-pre-wrap">{selected.notes}</p>
          </Card>
        )}

        <Button variant="danger" fullWidth onClick={() => handleDelete(selected.id)}>
          <Trash2 size={14} className="mr-1.5" /> {t('patients.delete')}
        </Button>
      </div>
    );
  }

  if (showForm) {
    return (
      <div className="p-4">
        <header className="mb-5 pt-2 flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => { setShowForm(false); setForm(EMPTY_FORM); }}>
            <X size={16} />
          </Button>
          <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">{t('patients.newPatient')}</h1>
        </header>

        <Card className="p-4 mb-4">
          <div className="space-y-4">
            <Field label={t('patients.name')}>
              <input
                type="text" placeholder="Patient name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="input"
              />
            </Field>

            <div className="grid grid-cols-2 gap-3">
              <Field label={t('patients.age')}>
                <input type="number" min="0" value={form.ageValue || ''}
                  onChange={(e) => setForm({ ...form, ageValue: parseFloat(e.target.value) || 0 })}
                  className="input" />
              </Field>
              <Field label=" ">
                <div className="flex gap-2 mt-0.5">
                  {(['months', 'years'] as const).map((u) => (
                    <button key={u} onClick={() => setForm({ ...form, ageUnit: u })}
                      className={`flex-1 py-2.5 rounded-xl text-xs font-semibold border ${form.ageUnit === u ? 'text-white dark:text-[#0f1f1a]' : 'bg-slate-50 dark:bg-[#243d36] text-slate-600 dark:text-slate-300 border-slate-200 dark:border-[#2a4a40]'}`}
                      style={form.ageUnit === u ? { backgroundColor: 'var(--brand)', borderColor: 'var(--brand)' } : undefined}>
                      {t(`patients.age${u === 'months' ? 'Months' : 'Years'}`)}
                    </button>
                  ))}
                </div>
              </Field>
            </div>

            <Field label={t('patients.sex')}>
              <div className="flex gap-2">
                {(['M', 'F'] as const).map((s) => (
                  <button key={s} onClick={() => setForm({ ...form, sex: s })}
                    className={`flex-1 py-2.5 rounded-xl text-sm font-semibold border ${form.sex === s ? 'text-white dark:text-[#0f1f1a]' : 'bg-slate-50 dark:bg-[#243d36] text-slate-600 dark:text-slate-300 border-slate-200 dark:border-[#2a4a40]'}`}
                    style={form.sex === s ? { backgroundColor: 'var(--brand)', borderColor: 'var(--brand)' } : undefined}>
                    {s === 'M' ? t('patients.male') : t('patients.female')}
                  </button>
                ))}
              </div>
            </Field>

            <div className="grid grid-cols-3 gap-3">
              {[
                { key: 'weight', label: t('patients.weight'), placeholder: 'kg' },
                { key: 'height', label: t('patients.height'), placeholder: 'cm' },
                { key: 'muac', label: t('patients.muac'), placeholder: 'mm' },
              ].map(({ key, label, placeholder }) => (
                <Field key={key} label={label}>
                  <input type="number" min="0" step="0.1" placeholder={placeholder}
                    value={(form[key as keyof FormData] as number | undefined) ?? ''}
                    onChange={(e) => setForm({ ...form, [key]: e.target.value ? parseFloat(e.target.value) : undefined })}
                    className="input" />
                </Field>
              ))}
            </div>

            <Field label={t('patients.diagnosis')}>
              <input type="text" placeholder="e.g. SAM, malaria…"
                value={form.diagnosis ?? ''}
                onChange={(e) => setForm({ ...form, diagnosis: e.target.value })}
                className="input" />
            </Field>

            <Field label={t('patients.notes')}>
              <textarea rows={3} placeholder="Additional notes…"
                value={form.notes ?? ''}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                className="input resize-none" />
            </Field>

            <Button fullWidth onClick={handleSave} disabled={!form.name.trim()}>
              {t('patients.save')}
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-4">
      <header className="mb-5 pt-2 flex items-center justify-between">
        <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
          <Users size={20} className="text-orange-600 dark:text-orange-400" />
          {t('patients.title')}
        </h1>
        <Button size="sm" onClick={() => setShowForm(true)}>
          <Plus size={14} className="mr-1" /> {t('patients.newPatient')}
        </Button>
      </header>

      <div className="relative mb-4">
        <Search size={15} className="absolute left-3 top-3 text-slate-400" />
        <input
          type="text" placeholder={t('patients.search')}
          value={query} onChange={(e) => setQuery(e.target.value)}
          className="w-full bg-white dark:bg-[#243d36] border border-slate-200 dark:border-[#2a4a40] rounded-xl pl-9 pr-3 py-2.5 text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#1a6b4a] dark:focus:ring-[#4ade80]"
        />
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-12">
          <Users size={40} className="text-slate-200 dark:text-slate-700 mx-auto mb-3" />
          <p className="text-slate-400 dark:text-slate-500 text-sm">{t('patients.noPatients')}</p>
          <Button className="mt-4" onClick={() => setShowForm(true)}>
            <Plus size={14} className="mr-1" /> {t('patients.newPatient')}
          </Button>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((p) => (
            <Card key={p.id} className="p-4 flex items-center gap-3" onClick={() => setSelected(p)}>
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 font-bold text-sm ${
                p.sex === 'M' ? 'bg-blue-100 text-blue-700' : 'bg-pink-100 text-pink-700'
              }`}>
                {p.sex}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-slate-800 dark:text-slate-100 text-sm truncate">{p.name}</p>
                <p className="text-xs text-slate-400 dark:text-slate-500">
                  {formatAge(p)}{p.diagnosis ? ` · ${p.diagnosis}` : ''}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={(e) => { e.stopPropagation(); handleDelete(p.id); }}
                  className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-slate-300 dark:text-slate-600 hover:text-red-400 transition-colors"
                >
                  <Trash2 size={14} />
                </button>
                <ChevronRight size={16} className="text-slate-300 dark:text-slate-600" />
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wide">
        {label}
      </label>
      {children}
    </div>
  );
}
