import { useCallback, useState } from 'react';
import type { ToastMessage } from '@/types';
import { generateId } from '@/utils/file';

export function useToastQueue() {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const pushToast = useCallback((toast: Omit<ToastMessage, 'id'>) => {
    const id = generateId('toast');
    setToasts((prev) => [...prev, { ...toast, id }]);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return { toasts, pushToast, removeToast };
}
