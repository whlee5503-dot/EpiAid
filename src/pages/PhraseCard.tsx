import { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Languages, Copy, Check } from 'lucide-react';
import phrasesData from '../data/phrases.json';

type LangCode = 'en' | 'ko' | 'fr' | 'sw';

interface Phrase {
  id: string;
  category: string;
  en: string;
  ko: string;
  fr: string;
  sw: string;
}

interface Category {
  id: string;
  icon: string;
}

const { categories, phrases } = phrasesData as { categories: Category[]; phrases: Phrase[] };

const LANGS: { code: LangCode; label: string; flag: string }[] = [
  { code: 'en', label: 'English', flag: '🇬🇧' },
  { code: 'ko', label: '한국어', flag: '🇰🇷' },
  { code: 'fr', label: 'Français', flag: '🇫🇷' },
  { code: 'sw', label: 'Kiswahili', flag: '🇰🇪' },
];

export default function PhraseCard() {
  const { t } = useTranslation();
  const [workerLang, setWorkerLang] = useState<LangCode>('ko');
  const [patientLang, setPatientLang] = useState<LangCode>('en');
  const [category, setCategory] = useState(categories[0].id);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const filtered = phrases.filter((p) => p.category === category);

  const handleCopy = useCallback(async (phrase: Phrase) => {
    const text = `${phrase[workerLang]}\n${phrase[patientLang]}`;
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(phrase.id);
      setTimeout(() => setCopiedId(null), 1500);
    } catch {
      /* clipboard not available in all field contexts */
    }
  }, [workerLang, patientLang]);

  return (
    <div className="p-4">
      <header className="mb-5 pt-2">
        <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
          <Languages size={20} className="text-violet-600" />
          {t('phrases.title')}
        </h1>
      </header>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 mb-4 space-y-4">
        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">{t('phrases.workerLang')}</p>
          <div className="flex gap-2">
            {LANGS.map(({ code, label, flag }) => (
              <button
                key={code}
                onClick={() => setWorkerLang(code)}
                className={`flex-1 py-2 px-1 rounded-xl text-xs font-medium border transition-colors text-center ${
                  workerLang === code
                    ? 'bg-violet-600 text-white border-violet-600'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:border-violet-300'
                }`}
              >
                <span className="block text-base mb-0.5">{flag}</span>
                {label.split(' ')[0]}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">{t('phrases.patientLang')}</p>
          <div className="flex gap-2">
            {LANGS.map(({ code, label, flag }) => (
              <button
                key={code}
                onClick={() => setPatientLang(code)}
                className={`flex-1 py-2 px-1 rounded-xl text-xs font-medium border transition-colors text-center ${
                  patientLang === code
                    ? 'bg-[#1a6b4a] text-white border-[#1a6b4a]'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:border-[#a8d5be]'
                }`}
              >
                <span className="block text-base mb-0.5">{flag}</span>
                {label.split(' ')[0]}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2 mb-4 no-scrollbar">
        {categories.map(({ id }) => (
          <button
            key={id}
            onClick={() => setCategory(id)}
            className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
              category === id
                ? 'bg-violet-600 text-white border-violet-600'
                : 'bg-white text-slate-600 border-slate-200 hover:border-violet-300'
            }`}
          >
            {t(`phrases.categories.${id}`)}
          </button>
        ))}
      </div>

      <p className="text-xs text-slate-400 mb-3 text-center">{t('phrases.tapToCopy')}</p>

      <div className="space-y-3">
        {filtered.map((phrase) => {
          const isCopied = copiedId === phrase.id;
          return (
            <button
              key={phrase.id}
              onClick={() => handleCopy(phrase)}
              className="w-full bg-white rounded-2xl border border-slate-100 shadow-sm p-4 text-left active:scale-[0.98] transition-transform"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <p className="text-sm font-semibold text-violet-700 mb-1">
                    {phrase[workerLang]}
                  </p>
                  <p className="text-sm text-slate-600">
                    {phrase[patientLang]}
                  </p>
                </div>
                <div className={`shrink-0 w-7 h-7 rounded-lg flex items-center justify-center transition-colors ${
                  isCopied ? 'bg-green-100' : 'bg-slate-100'
                }`}>
                  {isCopied
                    ? <Check size={14} className="text-green-600" />
                    : <Copy size={14} className="text-slate-400" />
                  }
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
