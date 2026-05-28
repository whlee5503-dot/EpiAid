import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Home, Pill, Scale, Stethoscope, Languages, Users } from 'lucide-react';

const NAV_ITEMS = [
  { path: '/', icon: Home, labelKey: 'nav.home' },
  { path: '/dosage', icon: Pill, labelKey: 'nav.dosage' },
  { path: '/nutrition', icon: Scale, labelKey: 'nav.nutrition' },
  { path: '/diagnose', icon: Stethoscope, labelKey: 'nav.diagnose' },
  { path: '/phrases', icon: Languages, labelKey: 'nav.phrases' },
  { path: '/patients', icon: Users, labelKey: 'nav.patients' },
] as const;

export function NavBar() {
  const { t } = useTranslation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-[#1a2e28] border-t border-slate-200 dark:border-[#2a4a40] z-50 safe-area-bottom">
      <div className="flex items-stretch h-16 max-w-2xl mx-auto">
        {NAV_ITEMS.map(({ path, icon: Icon, labelKey }) => (
          <NavLink
            key={path}
            to={path}
            end={path === '/'}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center flex-1 gap-0.5 text-[10px] font-medium transition-colors ${
                isActive
                  ? 'text-[#1a6b4a] dark:text-[#4ade80]'
                  : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <Icon size={20} strokeWidth={isActive ? 2.2 : 1.8} />
                <span>{t(labelKey)}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
