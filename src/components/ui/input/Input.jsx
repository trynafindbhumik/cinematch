'use client';

import clsx from 'clsx';
import { X, CircleX } from 'lucide-react';
import { useId } from 'react';

import styles from './Input.module.css';

/**
 *
 * Variants:
 *  - "default"   → bordered box style
 *  - "underline" → borderless underline style (CineMatch auth forms)
 *  - "filled"    → warm-background filled box (modals, profile forms, search)
 *
 * Props:
 *  - variant     : 'default' | 'underline' | 'filled'
 *  - type        : text | email | password | number | …
 *  - value       : controlled value
 *  - onChange    : (value: string) => void
 *  - label       : field label string
 *  - actionLabel : JSX node — rendered to the right of the label row (underline only)
 *  - prefixIcon  : JSX node — icon shown before the input
 *  - showClear   : show X clear button when value is non-empty (default variant)
 *  - disabled    : boolean
 *  - errorMessage: string — shows error text with icon
 *  - required    : boolean — appends * to label
 */
export default function Input({
  type = 'text',
  value = '',
  onChange,
  label,
  actionLabel,
  showClear = true,
  disabled = false,
  errorMessage = '',
  required = false,
  name,
  id,
  prefixIcon,
  variant = 'default',
  ...props
}) {
  const generatedId = useId();
  const inputId = id || generatedId;
  const errorId = `${inputId}-error`;

  const hasValue = value?.length > 0;
  const hasError = Boolean(errorMessage);

  const handleChange = (e) => {
    let val = e.target.value;
    if (type === 'number' && !/^\d*$/.test(val)) return;
    onChange?.(val);
  };

  const handleClear = () => {
    if (!disabled) onChange?.('');
  };

  /* ── Underline ── */
  if (variant === 'underline') {
    return (
      <div className={clsx(styles.inputWrapper, styles.underlineWrapper)}>
        {(label || actionLabel) && (
          <div className={styles.underlineLabelRow}>
            {label && (
              <label htmlFor={inputId} className={styles.underlineLabel}>
                {label}
                {required && <span className={styles.required}> *</span>}
              </label>
            )}
            {actionLabel && <span className={styles.actionLabel}>{actionLabel}</span>}
          </div>
        )}

        <div className={styles.underlineContainer}>
          {prefixIcon && <span className={styles.underlinePrefixIcon}>{prefixIcon}</span>}
          <input
            id={inputId}
            name={name}
            type={type}
            value={value}
            onChange={handleChange}
            disabled={disabled}
            aria-invalid={hasError}
            aria-describedby={hasError ? errorId : undefined}
            className={clsx(styles.underlineInput, disabled && styles.underlineDisabled)}
            {...props}
          />
        </div>

        {hasError && (
          <span id={errorId} className={styles.errorText}>
            <CircleX /> {errorMessage}
          </span>
        )}
      </div>
    );
  }

  /* ── Filled ── */
  if (variant === 'filled') {
    return (
      <div className={clsx(styles.inputWrapper, styles.filledWrapper)}>
        {label && (
          <label htmlFor={inputId} className={styles.filledLabel}>
            {label}
            {required && <span className={styles.required}> *</span>}
          </label>
        )}

        <div className={styles.filledContainer}>
          {prefixIcon && <span className={styles.filledPrefixIcon}>{prefixIcon}</span>}
          <input
            id={inputId}
            name={name}
            type={type}
            value={value}
            onChange={handleChange}
            disabled={disabled}
            aria-invalid={hasError}
            aria-describedby={hasError ? errorId : undefined}
            className={clsx(
              styles.filledInput,
              !prefixIcon && styles['filledInput--noIcon'],
              disabled && styles.disabled
            )}
            {...props}
          />
        </div>

        {hasError && (
          <span id={errorId} className={styles.errorText}>
            <CircleX /> {errorMessage}
          </span>
        )}
      </div>
    );
  }

  /* ── Default ── */
  return (
    <div className={styles.inputWrapper}>
      {label && (
        <label htmlFor={inputId} className={styles.label}>
          {label}
          {required && <span className={styles.required}> *</span>}
        </label>
      )}

      <div className={styles.inputContainer}>
        {prefixIcon && <span className={styles.prefixIcon}>{prefixIcon}</span>}

        <input
          id={inputId}
          name={name}
          type={type}
          value={value}
          onChange={handleChange}
          disabled={disabled}
          aria-invalid={hasError}
          aria-describedby={hasError ? errorId : undefined}
          className={clsx(
            styles.input,
            prefixIcon && styles['input--withPrefix'],
            showClear && hasValue && styles['input--withIcon'],
            disabled && styles.disabled,
            hasError && styles.error
          )}
          {...props}
        />

        {showClear && hasValue && !disabled && (
          <X className={styles.crossIcon} onClick={handleClear} />
        )}
      </div>

      {hasError && (
        <span id={errorId} className={styles.errorText}>
          <CircleX /> {errorMessage}
        </span>
      )}
    </div>
  );
}
