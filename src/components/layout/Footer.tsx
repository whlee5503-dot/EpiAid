// src/components/layout/Footer.tsx — PHT Lab family footer (ported from EpiLog)
import { useTranslation } from 'react-i18next';
import { SIBLING_APPS } from '../../data/siblingApps';

const CURRENT_APP_ID = 'epiaid';

export function Footer() {
  const { t } = useTranslation();
  const year = new Date().getFullYear();

  return (
    <footer className="mt-8 px-4 py-6 border-t border-slate-200 dark:border-slate-800 flex flex-col gap-3">
      <div className="flex flex-wrap items-baseline gap-3">
        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
          {t('footer.siblingsHeading')}
        </span>
        <nav className="flex flex-wrap gap-3">
          {SIBLING_APPS.map((app) =>
            app.id === CURRENT_APP_ID ? (
              <span key={app.id} className="text-sm font-bold" style={{ color: 'var(--brand)' }}>
                {app.name}
              </span>
            ) : (
              <a
                key={app.id}
                href={app.url}
                className="text-sm text-slate-500 dark:text-slate-400 hover:underline"
              >
                {app.name}
              </a>
            )
          )}
        </nav>
      </div>

      <div className="flex flex-wrap items-center gap-2 text-[13px] text-slate-400 dark:text-slate-500">
        <a href="https://phtlab.org" target="_blank" rel="noopener noreferrer" className="hover:underline">
          {t('footer.hub')}
        </a>
        <span className="text-slate-300 dark:text-slate-700">&middot;</span>
        <a href="https://orcid.org/0009-0005-1866-8257" target="_blank" rel="noopener noreferrer" className="hover:underline">
          {t('footer.orcid')}
        </a>
        <span className="text-slate-300 dark:text-slate-700">&middot;</span>
        <span>&copy; {year} Won Ho Lee &middot; PHT Lab</span>
      </div>

      <p className="text-[11px] italic leading-relaxed text-slate-400 dark:text-slate-500">
        {t('footer.disclaimer')}
      </p>
    </footer>
  );
}

export default Footer;
