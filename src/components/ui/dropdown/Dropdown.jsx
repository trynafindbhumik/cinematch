'use client';

import clsx from 'clsx';
import { ChevronDown, Check } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

import styles from './Dropdown.module.css';

/**
 *
 * Props:
 *  - options     : string[] | { value: string; label: string }[]
 *  - value       : currently selected value (string | null)
 *  - onChange    : (value: string | null) => void
 *  - placeholder : text shown when nothing selected
 *  - label       : optional label above the trigger
 *  - icon        : optional JSX prefix icon
 *  - allowClear  : show "clear" option when something is selected (default true)
 *  - className   : extra class on wrapper
 */
export default function Dropdown({
  options = [],
  value = null,
  onChange,
  placeholder = 'Select...',
  label,
  icon,
  allowClear = true,
  className,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef(null);

  const normalised = options.map((o) => (typeof o === 'string' ? { value: o, label: o } : o));

  const selected = normalised.find((o) => o.value === value) ?? null;

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (optionValue) => {
    onChange?.(optionValue === value ? null : optionValue);
    setIsOpen(false);
  };

  const handleClear = () => {
    onChange?.(null);
    setIsOpen(false);
  };

  return (
    <div className={clsx(styles.wrapper, className)} ref={wrapperRef}>
      {label && <span className={clsx('text-xs', styles.label)}>{label}</span>}

      <button
        type="button"
        className={clsx(styles.trigger, isOpen && styles.triggerOpen)}
        onClick={() => setIsOpen((prev) => !prev)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        {icon && <span className={styles.triggerIcon}>{icon}</span>}
        <span className={clsx(styles.triggerText, !selected && styles.placeholder)}>
          {selected ? selected.label : placeholder}
        </span>
        <ChevronDown className={clsx(styles.chevron, isOpen && styles.chevronOpen)} />
      </button>

      {isOpen && (
        <div className={styles.panel} role="listbox">
          {allowClear && selected && (
            <>
              <button
                type="button"
                className={clsx('text-xs', styles.option, styles.clearOption)}
                onClick={handleClear}
                role="option"
                aria-selected={false}
              >
                <span className={styles.optionLabel}>Clear selection</span>
              </button>
              <div className={styles.divider} />
            </>
          )}

          <div className={styles.panelScroll}>
            {normalised.map((option) => {
              const isSelected = option.value === value;
              return (
                <button
                  key={option.value}
                  type="button"
                  className={clsx(styles.option, isSelected && styles.optionSelected)}
                  onClick={() => handleSelect(option.value)}
                  role="option"
                  aria-selected={isSelected}
                >
                  <span className={styles.optionLabel}>{option.label}</span>
                  {isSelected && <Check className={styles.checkmark} />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
