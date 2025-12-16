import { useMemo, useState } from 'react';
import { BrowserRouter, Navigate, Outlet, Route, Routes, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import Toast from '@/components/common/Toast';
import Dashboard from '@/routes/Dashboard';
import Extract from '@/routes/Extract';
import Convert from '@/routes/Convert';
import BatchJobs from '@/routes/BatchJobs';
import History from '@/routes/History';
import Settings from '@/routes/Settings';
import Help from '@/routes/Help';
import NotFound from '@/pages/NotFound';
import { useToastQueue } from '@/hooks/useToastQueue';
import type { ToastMessage } from '@/types';

export type AppOutletContext = {
  searchQuery: string;
  setSearchQuery: (value: string) => void;
  pushToast: (toast: Omit<ToastMessage, 'id'>) => void;
};

const AppLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { toasts, pushToast, removeToast } = useToastQueue();
  const location = useLocation();

  const layoutContext: AppOutletContext = useMemo(
    () => ({
      searchQuery,
      setSearchQuery,
      pushToast,
    }),
    [pushToast, searchQuery]
  );

  const toggleTheme = () => {
    document.documentElement.classList.toggle('dark');
  };

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed((prev) => !prev)} />
      <div className="flex min-h-screen flex-1 flex-col">
        <Header searchQuery={searchQuery} onSearchChange={setSearchQuery} onToggleTheme={toggleTheme} />
        <main className="flex-1 overflow-y-auto bg-gradient-to-b from-background via-background to-muted/40">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
              className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8"
            >
              <Outlet context={layoutContext} />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
      <Toast toasts={toasts} removeToast={removeToast} />
    </div>
  );
};

const App = () => (
  <BrowserRouter>
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/extract" element={<Extract />} />
        <Route path="/convert" element={<Convert />} />
        <Route path="/batch" element={<BatchJobs />} />
        <Route path="/history" element={<History />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/help" element={<Help />} />
      </Route>
      <Route path="*" element={<NotFound />} />
    </Routes>
  </BrowserRouter>
);

export default App;
