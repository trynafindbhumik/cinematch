'use client';

import clsx from 'clsx';

import styles from './Toggle.module.css';

/**
 *
 * A reusable toggle / switch component.
 *
 * Props:
 *  - checked      : boolean — controlled state
 *  - onChange     : (checked: boolean) => void
 *  - label        : string — visible label rendered next to the toggle
 *  - labelClass   : additional class for the label span
 *  - disabled     : boolean
 *  - className    : additional class for the toggle button wrapper
 *  - ...props     : forwarded to the native <button> element
 */
export default function Toggle({
  checked = false,
  onChange,
  label,
  labelClass,
  disabled = false,
  className,
  ...props
}) {
  return (
    <span className={clsx(styles.row, className)}>
      {label && <span className={clsx('text-micro', styles.label, labelClass)}>{label}</span>}
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onChange?.(!checked)}
        className={clsx(styles.toggle, checked && styles.toggleOn)}
        {...props}
      >
        <span className={styles.thumb} />
      </button>
    </span>
  );
}
