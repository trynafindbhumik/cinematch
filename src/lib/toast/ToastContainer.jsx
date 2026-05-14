'use client';

import styles from './ToastContainer.module.css';
import { useToastContext } from './ToastContext';
import ToastItem from './ToastItem';

export default function ToastContainer() {
  const { toasts } = useToastContext();

  return (
    <div className={styles.container}>
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} />
      ))}
    </div>
  );
}
