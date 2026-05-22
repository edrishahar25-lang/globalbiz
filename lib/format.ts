import type { CurrencyCode } from '@/types';
import { currencies } from '@/data/mockData';
import i18n from '@/lib/i18n';

export function formatCurrency(amount: number, currency: CurrencyCode): string {
  const c = currencies[currency];
  const isWhole = Math.abs(amount - Math.round(amount)) < 0.005;
  const decimals = currency === 'ILS' || isWhole ? 0 : 2;
  const num = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(amount);
  return currency === 'ILS' ? `${num} ${c.symbol}` : `${c.symbol}${num}`;
}

export function formatIls(amount: number, opts?: { compact?: boolean }): string {
  if (opts?.compact && Math.abs(amount) >= 1000) {
    return `${(amount / 1000).toFixed(1)}K ₪`;
  }
  return `${new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(amount)} ₪`;
}

export function formatRelativeDate(iso: string, now: Date = new Date()): string {
  const date = new Date(iso);
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffHr = Math.floor(diffMs / 3600000);
  const diffDay = Math.floor(diffMs / 86400000);

  if (diffMs < 0) return formatShortDate(date);
  if (diffMin < 1) return i18n.t('date.now');
  if (diffMin < 60) return i18n.t('date.minutesAgo', { n: diffMin });
  if (diffHr < 24) return i18n.t('date.hoursAgo', { n: diffHr });
  if (diffDay === 1) return i18n.t('date.yesterday');
  if (diffDay < 7) return i18n.t('date.daysAgo', { n: diffDay });
  return formatShortDate(date);
}

const MONTH_KEYS = [
  'jan',
  'feb',
  'mar',
  'apr',
  'may',
  'jun',
  'jul',
  'aug',
  'sep',
  'oct',
  'nov',
  'dec',
] as const;

export function formatShortDate(date: Date): string {
  const monthKey = MONTH_KEYS[date.getMonth()]!;
  return `${date.getDate()} ${i18n.t(`months.${monthKey}`)}`;
}

export function formatFullDateTime(iso: string): string {
  const date = new Date(iso);
  const monthKey = MONTH_KEYS[date.getMonth()]!;
  const month = i18n.t(`months.${monthKey}`);
  const hh = String(date.getHours()).padStart(2, '0');
  const mm = String(date.getMinutes()).padStart(2, '0');
  return `${date.getDate()} ${month} ${date.getFullYear()}, ${hh}:${mm}`;
}

export function formatDaysUntil(iso: string, now: Date = new Date()): {
  label: string;
  isOverdue: boolean;
} {
  const date = new Date(iso);
  const diffDay = Math.ceil((date.getTime() - now.getTime()) / 86400000);
  if (diffDay < 0) {
    return { label: i18n.t('date.overdueDays', { n: Math.abs(diffDay) }), isOverdue: true };
  }
  if (diffDay === 0) return { label: i18n.t('date.today'), isOverdue: false };
  if (diffDay === 1) return { label: i18n.t('date.tomorrow'), isOverdue: false };
  return { label: i18n.t('date.inDays', { n: diffDay }), isOverdue: false };
}
