// Production "empty" state — no demo records.
//
// The only data exported from this module now is REFERENCE DATA that the
// app needs regardless of whether the user has any activity:
//   - currencies      : FX symbols + indicative ILS conversion rates
//   - toIls           : helper used by formatters
//   - ALLOCATION_THRESHOLD_ILS : the regulatory threshold for Israeli
//                       Tax Authority invoice allocation (₪10K → ₪5K)
//   - quickActions    : the 4 navigation actions on Home
//
// All previously-demoed records (user persona, balances, transactions,
// contacts, invoices, tax report, AI insights) are removed. Screens
// now render proper empty-state UIs until real data is wired in.

import type {
  Balance,
  Contact,
  Currency,
  CurrencyCode,
  Invoice,
  QuickAction,
  TaxReport,
  Transaction,
} from '@/types';

export const currencies: Record<CurrencyCode, Currency> = {
  ILS: { code: 'ILS', symbol: '₪', name: 'שקל ישראלי', flag: '🇮🇱', rateToIls: 1 },
  USD: { code: 'USD', symbol: '$', name: 'דולר אמריקאי', flag: '🇺🇸', rateToIls: 3.68 },
  EUR: { code: 'EUR', symbol: '€', name: 'יורו', flag: '🇪🇺', rateToIls: 3.95 },
  GBP: { code: 'GBP', symbol: '£', name: 'ליש"ט', flag: '🇬🇧', rateToIls: 4.62 },
};

export const toIls = (amount: number, currency: CurrencyCode): number =>
  amount * currencies[currency].rateToIls;

export const ALLOCATION_THRESHOLD_ILS = 10000;

// ---------- Empty data sets — real values come from Supabase ----------

export const balances: Balance[] = [];
export const totalBalanceIls: number = 0;
export const transactions: Transaction[] = [];
export const contacts: Contact[] = [];
export const invoices: Invoice[] = [];
export const taxReport: TaxReport | null = null;

// ---------- Navigation actions (not user data) ----------

export const quickActions: QuickAction[] = [
  { id: 'qa-send', labelHe: 'שליחה', icon: 'send', route: '/send' },
  { id: 'qa-receive', labelHe: 'קבלה', icon: 'receive', route: '/receive' },
  { id: 'qa-invoice', labelHe: 'חשבונית', icon: 'invoice', route: '/receive' },
  { id: 'qa-convert', labelHe: 'המרה', icon: 'convert', route: '/' },
];
