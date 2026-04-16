'use client';

import clsx from 'clsx';

import styles from './Button.module.css';

/**
 *
 * Variants:  primary | secondary | cinema | ghost | danger
 * Sizes:     sm | md | lg
 *
 * Props:
 *  variant    : 'primary' | 'secondary' | 'cinema' | 'ghost' | 'danger'
 *  size       : 'sm' | 'md' | 'lg'
 *  fullWidth  : boolean — set true for 100% width (e.g. form submit buttons)
 *  leftIcon   : JSX element rendered left of label
 *  rightIcon  : JSX element rendered right of label
 *  disabled   : boolean
 *  onClick    : click handler
 *  className  : extra class overrides
 *  type       : 'button' | 'submit' | 'reset'
 */
export default function Button({
  variant = 'primary',
  type = 'button',
  size = 'md',
  fullWidth = false,
  children,
  className,
  disabled = false,
  onClick,
  rightIcon,
  leftIcon,
  ...props
}) {
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={clsx(
        styles.button,
        styles[variant],
        styles[`size--${size}`],
        fullWidth && styles.fullWidth,
        disabled && styles.disabled,
        className
      )}
      {...props}
    >
      {/* Sliding accent overlay — cinema variant only */}
      {variant === 'cinema' && <span className={styles.overlay} aria-hidden="true" />}

      {leftIcon && <span className={clsx(styles.iconWrap, styles.iconLeft)}>{leftIcon}</span>}

      <span className={styles.label}>{children}</span>

      {rightIcon && (
        <span
          className={clsx(
            styles.iconWrap,
            styles.iconRight,
            variant === 'cinema' && styles.cinemaIcon
          )}
        >
          {rightIcon}
        </span>
      )}
    </button>
  );
}
