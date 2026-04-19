'use client';

import clsx from 'clsx';
import { ChevronLeft, ChevronRight, Calendar, X } from 'lucide-react';
import { useState, useRef, useEffect, useCallback } from 'react';

import styles from './DateRangePicker.module.css';

const WEEKDAYS = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];
const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

function isSameDay(a, b) {
  if (!a || !b) return false;
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function isInRange(date, from, to) {
  if (!date || !from || !to) return false;
  const d = date.getTime();
  const a = from.getTime();
  const b = to.getTime();
  const [lo, hi] = a <= b ? [a, b] : [b, a];
  return d > lo && d < hi;
}

function getMonthStartOffset(year, month) {
  const dow = new Date(year, month, 1).getDay();
  return dow === 0 ? 6 : dow - 1;
}

function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}

function formatDate(date) {
  if (!date) return '';
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function toMidnight(date) {
  if (!date) return null;
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function toEndOfDay(date) {
  if (!date) return null;
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
}

function MonthCalendar({ year, month, from, to, hoverDate, onDayClick, onDayHover }) {
  const today = toMidnight(new Date());
  const offset = getMonthStartOffset(year, month);
  const daysCount = getDaysInMonth(year, month);

  const rangeEnd = to ?? hoverDate;

  const lo = from && rangeEnd ? (from <= rangeEnd ? from : rangeEnd) : null;
  const hi = from && rangeEnd ? (from <= rangeEnd ? rangeEnd : from) : null;

  const cells = [
    ...Array.from({ length: offset }, (_, i) => ({
      type: 'empty',
      key: `empty-${year}-${month}-${i + 1}`,
    })),
    ...Array.from({ length: daysCount }, (_, i) => {
      const date = new Date(year, month, i + 1);
      return {
        type: 'day',
        key: date.toISOString(),
        date,
      };
    }),
  ];
  return (
    <div className={styles.calendarGrid}>
      {WEEKDAYS.map((wd) => (
        <span key={wd} className={styles.weekday}>
          {wd}
        </span>
      ))}

      {cells.map((cell) => {
        if (cell.type === 'empty') {
          return <span key={cell.key} className={styles.dayEmpty} aria-hidden="true" />;
        }

        const date = cell.date;
        const midnight = toMidnight(date);
        const isToday = isSameDay(midnight, today);
        const isFrom = isSameDay(midnight, from);
        const isTo = isSameDay(midnight, to);
        const isSelected = isFrom || isTo;
        const inRange = isInRange(midnight, lo, hi);
        const isRangeStart = lo && isSameDay(midnight, lo);
        const isRangeEnd = hi && isSameDay(midnight, hi);

        return (
          <button
            key={date.toISOString()}
            type="button"
            className={clsx(
              styles.day,
              isToday && styles.dayToday,
              isSelected && styles.daySelected,
              inRange && styles.dayInRange,
              isRangeStart && !isRangeEnd && styles.dayRangeStart,
              isRangeEnd && !isRangeStart && styles.dayRangeEnd,
              isRangeStart && isRangeEnd && styles.dayRangeSingle
            )}
            onClick={() => onDayClick(midnight)}
            onMouseEnter={() => onDayHover(midnight)}
            onMouseLeave={() => onDayHover(null)}
            aria-label={date.toLocaleDateString('en-US', {
              weekday: 'long',
              month: 'long',
              day: 'numeric',
              year: 'numeric',
            })}
            aria-pressed={isSelected}
          >
            {date.getDate()}
          </button>
        );
      })}
    </div>
  );
}

/**
 * @param {Object} props
 * @param {Date|null} props.from     - Start of selected range
 * @param {Date|null} props.to       - End of selected range
 * @param {Function} props.onChange  - Called with { from, to } when selection changes
 * @param {Function} props.onClear   - Called when the user clears the filter
 */
export default function DateRangePicker({ from, to, onChange, onClear }) {
  const [open, setOpen] = useState(false);
  const [picking, setPicking] = useState('from');
  const [hoverDate, setHoverDate] = useState(null);

  const [viewYear, setViewYear] = useState(() => (from ?? new Date()).getFullYear());
  const [viewMonth, setViewMonth] = useState(() => (from ?? new Date()).getMonth());

  const wrapRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) {
        setOpen(false);
      }
    };

    if (open) {
      document.addEventListener('mousedown', handler);
    }

    return () => {
      if (open) {
        document.removeEventListener('mousedown', handler);
      }
    };
  }, [open]);

  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'Escape') {
        setOpen(false);
      }
    };

    if (open) {
      document.addEventListener('keydown', handler);
    }

    return () => {
      if (open) {
        document.removeEventListener('keydown', handler);
      }
    };
  }, [open]);

  const prevMonth = useCallback(() => {
    setViewMonth((m) => {
      if (m === 0) {
        setViewYear((y) => y - 1);
        return 11;
      }
      return m - 1;
    });
  }, []);

  const nextMonth = useCallback(() => {
    setViewMonth((m) => {
      if (m === 11) {
        setViewYear((y) => y + 1);
        return 0;
      }
      return m + 1;
    });
  }, []);

  const openFor = useCallback(
    (end) => {
      setPicking(end);
      setHoverDate(null);
      const base = end === 'from' ? (from ?? new Date()) : (to ?? from ?? new Date());
      setViewYear(base.getFullYear());
      setViewMonth(base.getMonth());
      setOpen(true);
    },
    [from, to]
  );

  const handleDayClick = useCallback(
    (date) => {
      if (picking === 'from') {
        const newTo = to && date > to ? null : to;
        onChange?.({ from: date, to: newTo });
        setPicking('to');
        setViewYear(date.getFullYear());
        setViewMonth(date.getMonth());
      } else {
        if (from && date < from) {
          onChange?.({ from: date, to: from });
        } else if (isSameDay(date, from)) {
          onChange?.({ from: date, to: toEndOfDay(date) });
        } else {
          onChange?.({ from, to: date });
        }
        setOpen(false);
        setPicking('from');
      }
    },
    [picking, from, to, onChange]
  );

  const handleDayHover = useCallback(
    (date) => {
      if (picking === 'to' && from) {
        setHoverDate(date);
      }
    },
    [picking, from]
  );

  const hasFilter = from || to;

  return (
    <div className={styles.wrap} ref={wrapRef}>
      <div className={styles.triggers}>
        <button
          type="button"
          className={clsx(
            styles.trigger,
            open && picking === 'from' && styles.triggerActive,
            from && styles.triggerFilled
          )}
          onClick={() => openFor('from')}
          aria-label="Select start date"
          aria-haspopup="dialog"
          aria-expanded={open && picking === 'from'}
        >
          <Calendar size={11} className={styles.triggerIcon} aria-hidden="true" />
          <span className={from ? styles.triggerValue : styles.triggerPlaceholder}>
            {from ? formatDate(from) : 'From'}
          </span>
        </button>

        <span className={styles.sep} aria-hidden="true">
          →
        </span>

        <button
          type="button"
          className={clsx(
            styles.trigger,
            open && picking === 'to' && styles.triggerActive,
            to && styles.triggerFilled
          )}
          onClick={() => openFor('to')}
          aria-label="Select end date"
          aria-haspopup="dialog"
          aria-expanded={open && picking === 'to'}
        >
          <Calendar size={11} className={styles.triggerIcon} aria-hidden="true" />
          <span className={to ? styles.triggerValue : styles.triggerPlaceholder}>
            {to ? formatDate(to) : 'To'}
          </span>
        </button>

        {hasFilter && (
          <button
            type="button"
            className={styles.clearBtn}
            onClick={() => {
              onClear?.();
              setOpen(false);
              setPicking('from');
              setHoverDate(null);
            }}
            aria-label="Clear date filter"
          >
            <X size={11} aria-hidden="true" />
          </button>
        )}
      </div>

      {open && (
        <div
          className={styles.dropdown}
          role="dialog"
          aria-modal="true"
          aria-label="Pick a date range"
        >
          <div className={styles.hint} aria-live="polite">
            <span className={clsx(styles.hintStep, picking === 'from' && styles.hintStepActive)}>
              Start date
            </span>
            <span className={styles.hintArrow} aria-hidden="true">
              →
            </span>
            <span className={clsx(styles.hintStep, picking === 'to' && styles.hintStepActive)}>
              End date
            </span>
          </div>

          <div className={styles.monthHeader}>
            <button
              type="button"
              className={styles.navBtn}
              onClick={prevMonth}
              aria-label="Previous month"
            >
              <ChevronLeft size={13} aria-hidden="true" />
            </button>
            <span className={styles.monthTitle}>
              {MONTHS[viewMonth]} {viewYear}
            </span>
            <button
              type="button"
              className={styles.navBtn}
              onClick={nextMonth}
              aria-label="Next month"
            >
              <ChevronRight size={13} aria-hidden="true" />
            </button>
          </div>

          <MonthCalendar
            year={viewYear}
            month={viewMonth}
            from={from}
            to={to}
            hoverDate={picking === 'to' ? hoverDate : null}
            onDayClick={handleDayClick}
            onDayHover={handleDayHover}
          />

          {(from || to) && (
            <div className={styles.summary}>
              <span className={styles.summaryFrom}>{from ? formatDate(from) : '—'}</span>
              <span className={styles.summaryArrow} aria-hidden="true">
                →
              </span>
              <span className={styles.summaryTo}>{to ? formatDate(to) : '—'}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
