import { Platform } from 'react-native';
import type { WaitlistEntry } from '@/types';

const COLUMNS = [
  'id',
  'full_name',
  'email',
  'country',
  'business_type',
  'works_internationally',
  'monthly_income_range',
  'current_tools',
  'referral_source',
  'onboarding_status',
  'early_access_priority',
  'created_at',
  'updated_at',
] as const;

function csvCell(value: unknown): string {
  if (value === null || value === undefined) return '""';
  const s = Array.isArray(value) ? value.join('|') : String(value);
  // Double any embedded double quotes per RFC 4180
  return `"${s.replace(/"/g, '""')}"`;
}

export function entriesToCsv(entries: WaitlistEntry[]): string {
  const header = COLUMNS.join(',');
  const rows = entries.map((e) =>
    COLUMNS.map((c) => csvCell((e as Record<string, unknown>)[c])).join(','),
  );
  return [header, ...rows].join('\n');
}

/** Returns { ok, reason }. On web, triggers a download. On native,
 *  returns ok=false with a "use web to export" reason. */
export function downloadWaitlistCsv(entries: WaitlistEntry[]): {
  ok: boolean;
  reason?: string;
} {
  const csv = entriesToCsv(entries);
  if (Platform.OS !== 'web' || typeof window === 'undefined' || typeof document === 'undefined') {
    return { ok: false, reason: 'web-only' };
  }
  try {
    // Add BOM so Excel reads UTF-8 (Hebrew) correctly
    const blob = new Blob(['﻿', csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `waitlist-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    return { ok: true };
  } catch (err) {
    console.warn('[csv] download failed', err);
    return { ok: false, reason: err instanceof Error ? err.message : 'unknown' };
  }
}
