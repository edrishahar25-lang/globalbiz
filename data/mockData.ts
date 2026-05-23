// Reference data only. No user records, no demo personas, no balances.
//
// Kept here because format.ts + CurrencyFlag still need the currency
// table (symbols + flags + indicative ILS rates) to render UI labels
// for future locked features. None of these values are user-specific
// and none are persisted; they're constants of the financial UI shell.

import type { Currency, CurrencyCode } from '@/types';

export const currencies: Record<CurrencyCode, Currency> = {
  ILS: { code: 'ILS', symbol: '₪', name: 'שקל ישראלי', flag: '🇮🇱', rateToIls: 1 },
  USD: { code: 'USD', symbol: '$', name: 'דולר אמריקאי', flag: '🇺🇸', rateToIls: 3.68 },
  EUR: { code: 'EUR', symbol: '€', name: 'יורו', flag: '🇪🇺', rateToIls: 3.95 },
  GBP: { code: 'GBP', symbol: '£', name: 'ליש"ט', flag: '🇬🇧', rateToIls: 4.62 },
};

export const toIls = (amount: number, currency: CurrencyCode): number =>
  amount * currencies[currency].rateToIls;
