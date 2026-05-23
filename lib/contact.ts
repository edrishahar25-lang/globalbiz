import { Linking, Platform } from 'react-native';

/** Digits only, with a best-effort Israeli normalization for wa.me:
 *  a leading 0 (local Israeli format) becomes the 972 country code. */
function intlDigits(phone: string): string {
  const d = phone.replace(/\D/g, '');
  if (d.startsWith('0')) return '972' + d.slice(1);
  return d;
}

export function telUrl(phone: string): string {
  return `tel:${phone.replace(/[^\d+]/g, '')}`;
}

export function mailtoUrl(email: string): string {
  return `mailto:${email}`;
}

export function whatsappUrl(phone: string, text?: string): string {
  const q = text ? `?text=${encodeURIComponent(text)}` : '';
  return `https://wa.me/${intlDigits(phone)}${q}`;
}

export async function openExternal(url: string): Promise<boolean> {
  try {
    await Linking.openURL(url);
    return true;
  } catch (err) {
    console.warn('[contact] openURL failed', url, err);
    return false;
  }
}

/** Copy to clipboard. Works on web (navigator.clipboard, requires HTTPS —
 *  Netlify is HTTPS). Returns false on native where no clipboard module is
 *  bundled, so callers can fall back to showing the raw value. */
export async function copyText(text: string): Promise<boolean> {
  try {
    if (Platform.OS === 'web' && typeof navigator !== 'undefined' && navigator.clipboard) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch (err) {
    console.warn('[contact] copy failed', err);
  }
  return false;
}
