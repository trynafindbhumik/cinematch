import { toastVariants } from './constants';
import { useToastContext } from './ToastContext';

export function useToast() {
  const { toast, dismiss, dismissAll } = useToastContext();

  const showSuccess = (title, message) => toast({ variant: toastVariants.SUCCESS, title, message });
  const showError = (title, message) => toast({ variant: toastVariants.ERROR, title, message });
  const showWarning = (title, message) => toast({ variant: toastVariants.WARNING, title, message });
  const showInfo = (title, message) => toast({ variant: toastVariants.INFO, title, message });
  const showLoading = (title, message) => toast({ variant: toastVariants.LOADING, title, message });

  return {
    toast,
    dismiss,
    dismissAll,
    success: showSuccess,
    error: showError,
    warning: showWarning,
    info: showInfo,
    loading: showLoading,
  };
}
