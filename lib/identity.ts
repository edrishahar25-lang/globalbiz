/** Derive 1-2 character initials from a name. Safe with Hebrew + Latin. */
export function computeInitials(name: string | null | undefined): string {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) {
    const p = parts[0]!;
    return (p.length >= 2 ? p.slice(0, 2) : p).toUpperCase();
  }
  return ((parts[0]?.[0] ?? '') + (parts[parts.length - 1]?.[0] ?? '')).toUpperCase();
}

/** Best-effort display name from auth user / profile. */
export function displayName(opts: {
  fullName?: string | null;
  email?: string | null;
}): string {
  if (opts.fullName && opts.fullName.trim()) return opts.fullName.trim();
  if (opts.email) return opts.email.split('@')[0] ?? opts.email;
  return '—';
}
