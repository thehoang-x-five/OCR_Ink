import React, { useMemo, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { twMerge } from 'tailwind-merge';

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

type NavKey = 'dashboard' | 'extract' | 'convert' | 'batch' | 'history' | 'settings' | 'help';

const navLinks: { to: string; label: string; key: NavKey; icon: () => JSX.Element }[] = [
  {
    to: '/dashboard',
    label: 'Tổng quan',
    key: 'dashboard',
    icon: () => (
      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none">
        <path d="M4 11h16M4 17h10M10 5h10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    to: '/extract',
    label: 'Extract OCR',
    key: 'extract',
    icon: () => (
      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none">
        <rect x="4" y="4" width="16" height="16" rx="3" stroke="currentColor" strokeWidth="1.8" />
        <path d="M9 12h6M12 9v6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    to: '/convert',
    label: 'Convert Text',
    key: 'convert',
    icon: () => (
      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none">
        <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        <path d="M16 6 12 2 8 6m4-4v13" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    to: '/batch',
    label: 'Batch Jobs',
    key: 'batch',
    icon: () => (
      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none">
        <path d="M4 11h6V4H4v7Zm10 9h6v-7h-6v7Zm0-9h6V4h-6v7Zm-10 9h6v-7H4v7Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    to: '/history',
    label: 'History',
    key: 'history',
    icon: () => (
      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none">
        <path d="M4.5 12a7.5 7.5 0 1 1 3 5.94" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        <path d="M4 4v4h4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M12 8v4l3 2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    to: '/settings',
    label: 'Cấu hình',
    key: 'settings',
    icon: () => (
      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none">
        <path
          d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33H15a1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.6 15 1.65 1.65 0 0 0 3 14H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9 1.65 1.65 0 0 0 4.27 7.18l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.6V4.5A1.65 1.65 0 0 0 10 3V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9H19.5A1.65 1.65 0 0 0 21 10.65V11a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z"
          stroke="currentColor"
          strokeWidth="1.6"
        />
        <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.6" />
      </svg>
    ),
  },
  {
    to: '/help',
    label: 'Hỗ trợ',
    key: 'help',
    icon: () => (
      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none">
        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8" />
        <path d="M9.5 9.5a2.5 2.5 0 1 1 3.8 2.1c-.7.4-1.3 1-1.3 1.9v.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="12" cy="16.5" r=".85" fill="currentColor" />
      </svg>
    ),
  },
];

const quickActions = [
  { to: '/extract', label: 'New OCR Job' },
  { to: '/convert', label: 'New Convert Job' },
];

const Sidebar = ({ collapsed, onToggle }: SidebarProps) => {
  const { pathname } = useLocation();
  const [hovered, setHovered] = useState<string | null>(null);

  const activeKey = useMemo(() => navLinks.find((l) => pathname.startsWith(l.to))?.to ?? null, [pathname]);

  return (
    <motion.aside
      animate={{ width: collapsed ? 84 : 270 }}
      style={{ minWidth: collapsed ? 84 : 270, maxWidth: collapsed ? 84 : 270 }}
      transition={{ duration: 0.18 }}
      className="sticky top-0 left-0 z-30 flex h-screen flex-col border-r border-border/70 bg-background/80 backdrop-blur-xl shadow-xl shadow-primary/5"
      aria-label="Sidebar điều hướng"
    >
      <div className="flex items-center justify-between px-3 pt-3 pb-2">
        {!collapsed && (
          <div className="flex items-center gap-3 px-1">
            <div className="relative">
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-primary/60 via-accent/60 to-primary/40 blur-md opacity-70" />
              <div className="relative flex h-10 w-10 items-center justify-center rounded-2xl bg-foreground text-background font-semibold">
                DT
              </div>
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <b className="text-xs tracking-tight">DocText</b>
                <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200/70 bg-emerald-50 px-2 py-0.5 text-[9px] font-medium text-emerald-700">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Live
                </span>
              </div>
              <div className="text-[10px] text-muted-foreground">OCR & Converter</div>
            </div>
          </div>
        )}

        <button
          aria-label={collapsed ? 'Mở menu' : 'Thu gọn menu'}
          title={collapsed ? 'Mở menu' : 'Thu gọn menu'}
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-border text-muted-foreground transition hover:bg-muted/80 hover:text-foreground"
          onClick={onToggle}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" className={`${collapsed ? '' : 'rotate-180'} transition`}>
            <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      {!collapsed && (
        <div className="flex items-center justify-between px-3 pb-1 text-[11px] font-medium text-muted-foreground">
          <span>Menu</span>
          <span className="inline-flex items-center gap-1 rounded-full border border-primary/15 bg-primary/10 px-2 py-0.5 text-[10px] text-primary">
            <span className="h-1 w-1 rounded-full bg-primary" />
            Today flow
          </span>
        </div>
      )}

      <nav className="scrollbar-none flex-1 overflow-y-auto px-2 pt-1" role="navigation">
        <ul className="flex flex-col gap-2">
          {navLinks.map(({ to, label, key, icon: Icon }) => {
            const isActive = activeKey === to;
            const isHover = hovered === to;
            return (
              <li
                key={to}
                className="relative"
                onMouseEnter={() => setHovered(to)}
                onMouseLeave={() => setHovered(null)}
              >
                {isActive && (
                  <motion.span
                    layoutId="nav-active"
                    className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-tr from-primary/95 via-primary/70 to-accent/70 shadow-[0_18px_45px_rgba(56,189,248,0.35)]"
                    transition={{ type: 'spring', stiffness: 520, damping: 36, mass: 0.6 }}
                  />
                )}
                {isHover && !isActive && (
                  <motion.span
                    layoutId="nav-hover"
                    className="pointer-events-none absolute inset-0 rounded-2xl bg-muted/70 ring-1 ring-border/70"
                    transition={{ type: 'spring', stiffness: 640, damping: 28, mass: 0.5 }}
                  />
                )}

                <NavLink
                  to={to}
                  end
                  className={({ isActive: active }) =>
                    twMerge(
                      'relative z-20 flex w-full items-center gap-3 rounded-2xl border border-border/60 bg-card/70 px-3 py-2 transition-all duration-150 text-[13px]',
                      active || isHover ? 'bg-transparent !border-transparent' : 'hover:bg-muted/90',
                      active ? 'text-white' : isHover ? 'text-primary' : 'text-foreground'
                    )
                  }
                >
                  <span
                    className={twMerge(
                      'flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[11px] transition-all',
                      isActive ? 'bg-white/95 text-primary shadow-md shadow-primary/30' : isHover ? 'bg-white text-primary shadow-sm' : 'bg-muted text-muted-foreground'
                    )}
                  >
                    <Icon />
                  </span>

                  {!collapsed && (
                    <div className="flex min-w-0 flex-1 flex-col">
                      <span className={twMerge('text-[13px] font-medium truncate', isActive && 'text-white')}>{label}</span>
                      <span className="text-[10px] text-muted-foreground/80">{key}</span>
                    </div>
                  )}

                  <motion.span
                    initial={{ opacity: 0, x: -4 }}
                    animate={{ opacity: isActive || isHover ? 1 : 0, x: isActive || isHover ? 0 : -4 }}
                    transition={{ duration: 0.18 }}
                    className="flex-shrink-0"
                  >
                    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none">
                      <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </motion.span>
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>

      {!collapsed && (
        <div className="space-y-3 px-3 pb-4">
          <div className="rounded-2xl border border-border/70 bg-muted/50 px-3 py-2.5 shadow-sm">
            <p className="text-[11px] text-muted-foreground">Quick actions</p>
            <div className="mt-2 flex flex-col gap-2">
              {quickActions.map((qa) => (
                <NavLink
                  key={qa.to}
                  to={qa.to}
                  className="flex items-center justify-between rounded-xl border border-dashed border-primary/30 bg-primary/5 px-3 py-2 text-[11px] font-semibold text-primary transition hover:border-primary/60 hover:bg-primary/10"
                >
                  <span>{qa.label}</span>
                  <span className="text-lg leading-none">↗</span>
                </NavLink>
              ))}
            </div>
          </div>
          <div className="rounded-2xl border border-border/70 bg-muted/60 p-3 text-xs text-muted-foreground">
            OCR UI mock — swap <code className="font-mono">lib/api.ts</code> with real backend easily.
          </div>
        </div>
      )}
    </motion.aside>
  );
};

export default Sidebar;
