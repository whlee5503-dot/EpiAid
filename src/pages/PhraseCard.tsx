import { useState, useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Languages, Copy, Check, Maximize2, X,
  ChevronLeft, ChevronRight, Volume2,
} from 'lucide-react';
import phrasesData from '../data/phrases.json';
import { useDarkModeContext } from '../context/DarkModeContext';

// ── Types ──────────────────────────────────────────────────────────

type LangCode = 'en' | 'ko' | 'fr' | 'sw';

interface Phrase {
  id: string;
  category: string;
  en: string;
  ko: string;
  fr: string;
  sw: string;
  pron: Partial<Record<LangCode, string>>;
}

interface Category {
  id: string;
  icon: string;
}

const { categories, phrases } = phrasesData as { categories: Category[]; phrases: Phrase[] };

// ── Constants ──────────────────────────────────────────────────────

const LANGS: { code: LangCode; label: string; flag: string; short: string }[] = [
  { code: 'en', label: 'English',   flag: '🇬🇧', short: 'EN' },
  { code: 'ko', label: '한국어',    flag: '🇰🇷', short: '한' },
  { code: 'fr', label: 'Français',  flag: '🇫🇷', short: 'FR' },
  { code: 'sw', label: 'Kiswahili', flag: '🇰🇪', short: 'SW' },
];

const LANG_NAME: Record<LangCode, string> = {
  en: 'English', ko: '한국어', fr: 'Français', sw: 'Kiswahili',
};

const LANG_TO_BCP47: Record<LangCode, string> = {
  en: 'en-US', ko: 'ko-KR', fr: 'fr-FR', sw: 'sw-KE',
};

const hasTTS = typeof window !== 'undefined' && 'speechSynthesis' in window;

function speakText(text: string, lang: LangCode) {
  if (!hasTTS) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  if (lang === 'sw') {
    const voices = window.speechSynthesis.getVoices();
    const swVoice = voices.find((v) => v.lang.startsWith('sw'));
    utterance.lang = swVoice ? 'sw-KE' : 'en-US';
  } else {
    utterance.lang = LANG_TO_BCP47[lang];
  }
  window.speechSynthesis.speak(utterance);
}

// ── Patient-mode overlay ──────────────────────────────────────────

interface PatientOverlayProps {
  phrase: Phrase;
  patientLang: LangCode;
  workerLang: LangCode;
  index: number;
  total: number;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
}

function PatientOverlay({
  phrase,
  patientLang,
  workerLang,
  index,
  total,
  onClose,
  onPrev,
  onNext,
}: PatientOverlayProps) {
  const { t } = useTranslation();
  const { isDark } = useDarkModeContext();
  const pron = phrase.pron?.[patientLang];

  // Swipe support
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const handleTouchStart = (e: React.TouchEvent) => setTouchStart(e.touches[0].clientX);
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStart === null) return;
    const dx = touchStart - e.changedTouches[0].clientX;
    if (Math.abs(dx) > 50) { dx > 0 ? onNext() : onPrev(); }
    setTouchStart(null);
  };

  // Keyboard navigation
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') onNext();
      if (e.key === 'ArrowLeft') onPrev();
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onNext, onPrev, onClose]);

  const bg = isDark ? '#0f1f1a' : '#ffffff';
  const textPrimary = isDark ? '#f1f5f9' : '#1e293b';
  const textMuted = isDark ? '#94a3b8' : '#94a3b8';
  const cardBg = isDark ? '#1a2e28' : '#f8fafc';
  const border = isDark ? '#2a4a40' : '#e2e8f0';

  return (
    <div
      className="fixed inset-0 z-[100] flex flex-col"
      style={{ backgroundColor: bg }}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 py-3 shrink-0">
        <button
          onClick={onClose}
          className="w-10 h-10 rounded-full flex items-center justify-center transition-colors"
          style={{ backgroundColor: cardBg, color: textMuted }}
        >
          <X size={20} />
        </button>

        <span
          className="text-xs font-bold uppercase tracking-widest px-3 py-1.5 rounded-full"
          style={{ backgroundColor: 'var(--brand-bg)', color: 'var(--brand)' }}
        >
          {t('phrases.patientMode')}
        </span>

        {/* Counter */}
        <span className="text-xs font-semibold" style={{ color: textMuted }}>
          {index + 1} / {total}
        </span>
      </div>

      {/* Worker phrase (top, small) */}
      <div className="px-6 pb-3 shrink-0 border-b" style={{ borderColor: border }}>
        <p className="text-xs uppercase font-bold tracking-wider mb-1" style={{ color: 'var(--brand)' }}>
          {LANG_NAME[workerLang]}
        </p>
        <p className="text-sm leading-snug" style={{ color: textMuted }}>
          {phrase[workerLang]}
        </p>
      </div>

      {/* Patient phrase (main, centered, fills available space) */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 gap-5">
        {/* Language label */}
        <span
          className="text-xs font-bold uppercase tracking-widest px-4 py-1 rounded-full"
          style={{ backgroundColor: cardBg, color: textMuted }}
        >
          {LANG_NAME[patientLang]}
        </span>

        {/* Main phrase text */}
        <p
          className="text-center font-bold leading-tight w-full"
          style={{
            fontSize: 'clamp(1.6rem, 6vw, 2.8rem)',
            color: textPrimary,
            lineHeight: 1.25,
          }}
        >
          {phrase[patientLang]}
        </p>

        {/* TTS button */}
        {hasTTS && (
          <button
            onClick={() => speakText(phrase[patientLang], patientLang)}
            title="Speak"
            className="w-12 h-12 rounded-full flex items-center justify-center transition-colors active:scale-95"
            style={{ backgroundColor: 'var(--brand-bg)', color: 'var(--brand)' }}
          >
            <Volume2 size={22} />
          </button>
        )}

        {/* Pronunciation guide */}
        {pron && (
          <div
            className="flex items-start gap-2 px-4 py-3 rounded-2xl w-full max-w-md"
            style={{ backgroundColor: cardBg, border: `1px solid ${border}` }}
          >
            <Volume2 size={14} className="shrink-0 mt-0.5" style={{ color: 'var(--brand)' }} />
            <p
              className="text-sm italic leading-snug"
              style={{ color: textMuted }}
            >
              {pron}
            </p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between px-6 py-4 shrink-0">
        <button
          onClick={onPrev}
          disabled={index === 0}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-colors disabled:opacity-30"
          style={{ backgroundColor: cardBg, color: textPrimary }}
        >
          <ChevronLeft size={18} />
          {t('phrases.prevPhrase')}
        </button>

        {/* Dots */}
        <div className="flex gap-1.5">
          {Array.from({ length: Math.min(total, 7) }).map((_, i) => {
            const dotIdx = total <= 7 ? i : Math.round((i / 6) * (total - 1));
            const isActive = total <= 7 ? i === index : Math.abs(dotIdx - index) < (total / 7 / 2);
            return (
              <div
                key={i}
                className="rounded-full transition-all"
                style={{
                  width: isActive ? 20 : 6,
                  height: 6,
                  backgroundColor: isActive ? 'var(--brand)' : border,
                }}
              />
            );
          })}
        </div>

        <button
          onClick={onNext}
          disabled={index === total - 1}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-colors disabled:opacity-30"
          style={{ backgroundColor: cardBg, color: textPrimary }}
        >
          {t('phrases.nextPhrase')}
          <ChevronRight size={18} />
        </button>
      </div>
    </div>
  );
}

// ── Language selector button ───────────────────────────────────────

function LangBtn({
  flag, label, active, color, onClick,
}: {
  flag: string; label: string;
  active: boolean; color: 'violet' | 'green'; onClick: () => void;
}) {
  const activeStyle = color === 'violet'
    ? { backgroundColor: '#7c3aed', borderColor: '#7c3aed', color: '#ffffff' }
    : { backgroundColor: 'var(--brand)', borderColor: 'var(--brand)', color: 'var(--bg-page)' };

  return (
    <button
      onClick={onClick}
      className={`flex-1 py-2 px-1 rounded-xl text-xs font-medium border transition-colors text-center ${
        active
          ? ''
          : 'bg-slate-50 dark:bg-[#243d36] text-slate-600 dark:text-slate-300 border-slate-200 dark:border-[#2a4a40]'
      }`}
      style={active ? activeStyle : undefined}
      aria-pressed={active}
    >
      <span className="block text-base mb-0.5">{flag}</span>
      {label.split(' ')[0]}
    </button>
  );
}

// ── Main component ─────────────────────────────────────────────────

export default function PhraseCard() {
  const { t } = useTranslation();
  const [workerLang, setWorkerLang] = useState<LangCode>('ko');
  const [patientLang, setPatientLang] = useState<LangCode>('sw');
  const [category, setCategory] = useState(categories[0].id);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [patientIdx, setPatientIdx] = useState<number | null>(null);

  const filtered = phrases.filter((p) => p.category === category);

  const handleCopy = useCallback(async (phrase: Phrase) => {
    const text = `${phrase[workerLang]}\n${phrase[patientLang]}`;
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(phrase.id);
      setTimeout(() => setCopiedId(null), 1500);
    } catch { /* clipboard unavailable in some field contexts */ }
  }, [workerLang, patientLang]);

  const openPatient = (idx: number) => setPatientIdx(idx);
  const closePatient = () => setPatientIdx(null);
  const prevPatient = () => setPatientIdx((i) => (i !== null && i > 0 ? i - 1 : i));
  const nextPatient = () => setPatientIdx((i) => (i !== null && i < filtered.length - 1 ? i + 1 : i));

  // Reset overlay index when category changes
  const handleCategoryChange = (id: string) => {
    setCategory(id);
    setPatientIdx(null);
  };

  return (
    <>
      {/* ── Patient mode overlay ── */}
      {patientIdx !== null && filtered[patientIdx] && (
        <PatientOverlay
          phrase={filtered[patientIdx]}
          patientLang={patientLang}
          workerLang={workerLang}
          index={patientIdx}
          total={filtered.length}
          onClose={closePatient}
          onPrev={prevPatient}
          onNext={nextPatient}
        />
      )}

      <div className="p-4 pb-8">
        {/* Header */}
        <header className="mb-5 pt-2">
          <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <Languages size={20} className="text-violet-600 dark:text-violet-400" />
            {t('phrases.title')}
          </h1>
        </header>

        {/* Language selectors */}
        <div className="bg-white dark:bg-[#1a2e28] rounded-2xl border border-slate-100 dark:border-[#2a4a40] shadow-sm p-4 mb-4 space-y-4">
          {/* Worker language */}
          <div>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2">
              {t('phrases.workerLang')}
            </p>
            <div className="flex gap-2">
              {LANGS.map(({ code, flag, label }) => (
                <LangBtn
                  key={code}
                  flag={flag}
                  label={label}
                  active={workerLang === code}
                  color="violet"
                  onClick={() => setWorkerLang(code)}
                />
              ))}
            </div>
          </div>

          {/* Patient language */}
          <div>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2">
              {t('phrases.patientLang')}
            </p>
            <div className="flex gap-2">
              {LANGS.map(({ code, flag, label }) => (
                <LangBtn
                  key={code}
                  flag={flag}
                  label={label}
                  active={patientLang === code}
                  color="green"
                  onClick={() => setPatientLang(code)}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Category tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-4 no-scrollbar">
          {categories.map(({ id }) => (
            <button
              key={id}
              onClick={() => handleCategoryChange(id)}
              className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
                category === id
                  ? 'bg-violet-600 text-white border-violet-600'
                  : 'bg-white dark:bg-[#1a2e28] text-slate-600 dark:text-slate-300 border-slate-200 dark:border-[#2a4a40] hover:border-violet-300 dark:hover:border-violet-500'
              }`}
            >
              {t(`phrases.categories.${id}`)}
            </button>
          ))}
        </div>

        {/* Hint text */}
        <p className="text-xs text-slate-400 dark:text-slate-500 mb-3 text-center">
          {t('phrases.tapToCopy')}
        </p>

        {/* Phrase cards */}
        <div className="space-y-3">
          {filtered.map((phrase, idx) => {
            const isCopied = copiedId === phrase.id;
            const pron = phrase.pron?.[patientLang];

            return (
              <div
                key={phrase.id}
                className="bg-white dark:bg-[#1a2e28] rounded-2xl border border-slate-100 dark:border-[#2a4a40] shadow-sm overflow-hidden"
              >
                {/* Worker language row */}
                <div className="px-4 pt-3 pb-2 flex items-start gap-2">
                  <span
                    className="shrink-0 text-[10px] font-bold uppercase tracking-wider mt-0.5 px-1.5 py-0.5 rounded"
                    style={{ backgroundColor: 'var(--brand-bg)', color: 'var(--brand)' }}
                  >
                    {LANGS.find(l => l.code === workerLang)?.short}
                  </span>
                  <p className="text-sm text-slate-500 dark:text-slate-400 leading-snug">
                    {phrase[workerLang]}
                  </p>
                </div>

                {/* Divider */}
                <div className="mx-4 border-t border-slate-100 dark:border-[#2a4a40]" />

                {/* Patient language row */}
                <div className="px-4 pt-3 pb-3">
                  <div className="flex items-start gap-3">
                    {/* Patient text + pronunciation */}
                    <div className="flex-1 min-w-0">
                      <p className="text-base font-bold text-violet-700 dark:text-violet-300 leading-snug">
                        {phrase[patientLang]}
                      </p>
                      {pron && (
                        <div className="flex items-start gap-1.5 mt-1.5">
                          <Volume2 size={11} className="shrink-0 mt-0.5 text-slate-400 dark:text-slate-500" />
                          <p className="text-xs italic text-slate-400 dark:text-slate-500 leading-snug">
                            {pron}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Action buttons */}
                    <div className="flex gap-1.5 shrink-0">
                      {/* Show to patient */}
                      <button
                        onClick={() => openPatient(idx)}
                        title={t('phrases.showToPatient')}
                        className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors bg-violet-50 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400 hover:bg-violet-100 dark:hover:bg-violet-900/50 active:scale-95"
                      >
                        <Maximize2 size={14} />
                      </button>

                      {/* TTS */}
                      {hasTTS && (
                        <button
                          onClick={() => speakText(phrase[patientLang], patientLang)}
                          title="Speak"
                          className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/50 active:scale-95"
                        >
                          <Volume2 size={14} />
                        </button>
                      )}

                      {/* Copy */}
                      <button
                        onClick={() => handleCopy(phrase)}
                        title={t('phrases.copy')}
                        className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors active:scale-95 ${
                          isCopied
                            ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'
                            : 'bg-slate-100 dark:bg-[#243d36] text-slate-400 dark:text-slate-500 hover:bg-slate-200 dark:hover:bg-[#2a4a40]'
                        }`}
                      >
                        {isCopied ? <Check size={14} /> : <Copy size={14} />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}
