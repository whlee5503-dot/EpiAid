import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Pill, Scale, Stethoscope, Languages, Users, Wifi } from 'lucide-react';

const FEATURES = [
  {
    path: '/dosage',
    icon: Pill,
    iconBg: '#1a6b4a',
    descKey: 'home.dosageDesc',
    titleKey: 'nav.dosage',
  },
  {
    path: '/nutrition',
    icon: Scale,
    iconBg: '#1a6b4a',
    descKey: 'home.nutritionDesc',
    titleKey: 'nav.nutrition',
  },
  {
    path: '/diagnose',
    icon: Stethoscope,
    iconBg: '#e67e22',
    descKey: 'home.diagnoseDesc',
    titleKey: 'nav.diagnose',
  },
  {
    path: '/phrases',
    icon: Languages,
    iconBg: '#2980b9',
    descKey: 'home.phrasesDesc',
    titleKey: 'nav.phrases',
  },
  {
    path: '/patients',
    icon: Users,
    iconBg: '#1a6b4a',
    descKey: 'home.patientsDesc',
    titleKey: 'nav.patients',
  },
] as const;

const LANGS = [
  { code: 'en', label: 'EN' },
  { code: 'ko', label: '한' },
  { code: 'fr', label: 'FR' },
  { code: 'sw', label: 'SW' },
];

export default function Home() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();

  return (
    <div className="p-4">
      <header className="flex items-start justify-between mb-6 pt-2">
        <div>
          <h1 className="text-3xl font-bold tracking-tight" style={{ color: '#1a6b4a' }}>
            {t('app.name')}
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">{t('app.tagline')}</p>
          <span
            className="inline-flex items-center gap-1 mt-2 px-2 py-0.5 rounded-full text-xs font-medium"
            style={{ backgroundColor: '#eaf4ee', color: '#1a6b4a' }}
          >
            <Wifi size={11} />
            {t('home.offlineReady')}
          </span>
        </div>
        <div className="flex gap-1 mt-1">
          {LANGS.map(({ code, label }) => (
            <button
              key={code}
              onClick={() => i18n.changeLanguage(code)}
              className={`w-8 h-8 rounded-lg text-xs font-semibold transition-colors ${
                i18n.resolvedLanguage === code
                  ? 'text-white'
                  : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
              }`}
              style={i18n.resolvedLanguage === code ? { backgroundColor: '#1a6b4a' } : undefined}
            >
              {label}
            </button>
          ))}
        </div>
      </header>

      <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3 px-1">
        {t('home.tools')}
      </p>

      <div className="grid grid-cols-2 gap-3">
        {FEATURES.map(({ path, icon: Icon, iconBg, titleKey, descKey }) => (
          <button
            key={path}
            onClick={() => navigate(path)}
            className="bg-white rounded-2xl p-4 text-left flex items-center gap-3 active:scale-95 transition-transform border border-slate-100 shadow-sm hover:shadow-md"
          >
            <div
              className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
              style={{ backgroundColor: iconBg }}
            >
              <Icon size={20} className="text-white" strokeWidth={2} />
            </div>
            <div>
              <p className="font-semibold text-slate-800 text-sm">{t(titleKey)}</p>
              <p className="text-xs text-slate-500 mt-0.5 leading-snug">{t(descKey)}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
