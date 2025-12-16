import { AnimatePresence, motion } from 'framer-motion';
import type { ToastMessage } from '@/types';

interface ToastProps {
  toasts: ToastMessage[];
  removeToast: (id: string) => void;
}

const tone: Record<ToastMessage['type'], string> = {
  success: 'bg-emerald-500 text-white',
  error: 'bg-rose-500 text-white',
  info: 'bg-slate-900 text-white',
};

const icon: Record<ToastMessage['type'], string> = {
  success: '✓',
  error: '✕',
  info: 'ℹ',
};

const Toast = ({ toasts, removeToast }: ToastProps) => {
  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.97 }}
            transition={{ duration: 0.18 }}
            className={`flex max-w-sm items-start gap-3 rounded-xl px-4 py-3 shadow-lg ${tone[toast.type]}`}
          >
            <div className="text-lg leading-none">{icon[toast.type]}</div>
            <div className="flex-1">
              {toast.title && <div className="text-sm font-semibold">{toast.title}</div>}
              <div className="text-sm">{toast.message}</div>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="ml-2 text-sm opacity-70 transition hover:opacity-100"
              aria-label="Close toast"
            >
              ×
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default Toast;
