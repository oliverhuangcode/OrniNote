import { useState, useCallback } from 'react';
// export { useToast, toast };


export interface ToastItem {
  id?: string;
  title?: string;
  description?: string;
  action?: React.ReactNode;
}

export function useToast() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const addToast = useCallback((toast: ToastItem) => {
    setToasts((prev) => [...prev, toast]);
  }, []);
  return { toasts, addToast };
}
