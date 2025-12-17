import { useLocation } from 'react-router-dom';
import { useI18n } from '@/lib/i18n';
import type { Language } from '@/lib/i18n';

interface HeaderProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  onToggleTheme?: () => void;
}

const Header = ({ searchQuery, onSearchChange, onToggleTheme }: HeaderProps) => {
  useLocation();
  const { language, setLanguage, t } = useI18n();

  const toggleLanguage = () => {
    const newLang: Language = language === 'en' ? 'vi' : 'en';
    setLanguage(newLang);
  };

  return (
    <header className="sticky top-0 z-30 border-b border-border/70 bg-background/80 dark:bg-slate-950/70 backdrop-blur">
      <div className="flex w-full flex-wrap items-center gap-3 px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/15 text-sm font-semibold text-primary">
            AN
          </div>
          <div className="leading-tight min-w-0">
            <p className="truncate text-sm font-semibold text-foreground">Alex Nguyen</p>
            <p className="truncate text-[11px] text-muted-foreground">{t.header.workspaceAdmin}</p>
          </div>
          <div className="hidden flex-col gap-1 pl-3 sm:flex">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">DocText Suite</span>
              <span className="text-[10px] rounded-full bg-primary/10 px-2 py-1 text-primary">{t.header.ocrConverter}</span>
            </div>
          </div>
        </div>

        <div className="ml-auto flex-1 min-w-[220px] max-w-sm sm:max-w-md">
          <div className="flex items-center gap-2 rounded-lg border border-border bg-card/90 px-3 py-2 shadow-sm dark:bg-slate-900/70">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="text-muted-foreground">
              <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
              <path d="m16 16 4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
            <input
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder={t.header.searchPlaceholder}
              className="w-full bg-transparent text-xs sm:text-sm text-foreground placeholder:text-muted-foreground outline-none"
            />
          </div>
        </div>

        <div className="flex items-center gap-2 pl-2 text-sm flex-shrink-0">
          <button
            className="relative flex h-10 w-10 items-center justify-center rounded-full border border-border text-lg transition hover:bg-muted"
            aria-label={t.header.notifications}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path
                d="M6 10a6 6 0 0 1 12 0v4.5l1.5 2.5H4.5L6 14.5V10Z"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M10 19.5c.5.6 1.2 1 2 1s1.5-.4 2-1"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
              />
            </svg>
            <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-primary" />
          </button>
          {onToggleTheme && (
            <button
              onClick={onToggleTheme}
              className="hidden h-10 w-10 items-center justify-center rounded-full border border-border text-lg transition hover:bg-muted sm:flex"
              aria-label={t.header.toggleTheme}
            >
              ☼
            </button>
          )}
          <button 
            onClick={toggleLanguage}
            className="relative flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition"
            title={language === 'en' ? 'Switch to Vietnamese' : 'Chuyển sang Tiếng Anh'}
          >
            <span className="text-sm font-semibold">{language === 'en' ? 'EN' : 'VI'}</span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
