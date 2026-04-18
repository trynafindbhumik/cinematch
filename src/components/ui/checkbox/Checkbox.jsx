'use client';

import clsx from 'clsx';
import { Check } from 'lucide-react';

import styles from './Checkbox.module.css';

/**
 * Variants:
 *  - "square"   → rounded-square checkbox (default)
 *  - "rounded"  → more rounded checkbox
 *  - "danger"   → red checkbox for destructive actions (e.g., delete account)
 *
 * Props:
 *  - checked      : boolean — controlled state
 *  - onChange     : (checked: boolean) => void
 *  - label        : string | ReactNode — visible label rendered after the checkbox
 *  - disabled     : boolean
 *  - variant      : 'square' | 'rounded' | 'danger'
 *  - className    : additional class for the wrapper
 *  - labelClass   : additional class for the label text
 *  - alignItems   : 'center' | 'flex-start' — alignment of checkbox and label (default: 'flex-start')
 */
export default function Checkbox({
  checked = false,
  onChange,
  label,
  disabled = false,
  variant = 'square',
  className,
  labelClass,
  alignItems = 'flex-start',
  ...props
}) {
  return (
    <label
      className={clsx(styles.checkboxLabel, className)}
      style={{ alignItems }}
    >
      <span
        className={clsx(
          styles.checkbox,
          variant === 'rounded' && styles.checkboxRounded,
          variant === 'danger' && styles.checkboxDanger,
          checked && styles.checkboxChecked
        )}
        aria-hidden="true"
      >
        {checked && <Check size={12}/>}
      </span>
      <input
        type="checkbox"
        className={styles.checkboxInput}
        checked={checked}
        onChange={(e) => onChange?.(e.target.checked)}
        disabled={disabled}
        {...props}
      />
      {label && (
        <span className={clsx(styles.label, labelClass)}>{label}</span>
      )}
    </label>
  );
}