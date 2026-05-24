// Netlify Function — emails the founder on every new waitlist signup.
// Triggered by a Supabase Database Webhook (INSERT on public.waitlist_users).
// Zero deps: plain fetch -> Resend REST API (Netlify runs Node 20).
//
// Required env (Netlify -> Site config -> Environment variables):
//   RESEND_API_KEY   re_...           (required)
//   NOTIFY_EMAIL     edrishahar25@gmail.com   (optional; default below)
//   NOTIFY_FROM      "GlobalBiz <onboarding@resend.dev>" (optional)
//   WEBHOOK_SECRET   any string       (optional; if set, the webhook must
//                                      send header x-webhook-secret to match)

const RESEND_ENDPOINT = 'https://api.resend.com/emails';

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (c) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]),
  );
}

export const handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method not allowed' };
  }

  // Optional shared-secret check (defense against random POSTs to the URL).
  const secret = process.env.WEBHOOK_SECRET;
  if (secret) {
    const got = event.headers['x-webhook-secret'] || event.headers['X-Webhook-Secret'];
    if (got !== secret) return { statusCode: 401, body: 'Unauthorized' };
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error('[notify-signup] RESEND_API_KEY is not set');
    return { statusCode: 500, body: 'RESEND_API_KEY not configured' };
  }
  const to = process.env.NOTIFY_EMAIL || 'edrishahar25@gmail.com';
  const from = process.env.NOTIFY_FROM || 'GlobalBiz <onboarding@resend.dev>';

  let payload;
  try {
    payload = JSON.parse(event.body || '{}');
  } catch {
    return { statusCode: 400, body: 'Invalid JSON' };
  }

  // Supabase webhook shape: { type, table, record, old_record }. Only notify
  // on new rows — updates (same-email re-submit) must not fire.
  if (payload.type && payload.type !== 'INSERT') {
    return { statusCode: 200, body: 'ignored (not an insert)' };
  }
  const r = payload.record || payload;

  const fullName = r.full_name || '—';
  const email = r.email || '—';
  const phone = r.phone || '—';
  const country = r.country || '—';
  const when = (() => {
    const d = r.created_at ? new Date(r.created_at) : new Date();
    try {
      return d.toLocaleString('he-IL', { timeZone: 'Asia/Jerusalem' });
    } catch {
      return d.toISOString();
    }
  })();

  const rows = [
    ['Full name', fullName],
    ['Email', email],
    ['Phone', phone],
    ['Country', country],
    ['Signed up', when],
  ];
  const html =
    '<h2 style="font-family:sans-serif">New GlobalBiz Waitlist Signup</h2>' +
    '<table style="font-family:sans-serif;font-size:14px;border-collapse:collapse">' +
    rows
      .map(
        ([k, v]) =>
          `<tr><td style="padding:4px 12px 4px 0;color:#475569"><b>${k}</b></td>` +
          `<td style="padding:4px 0">${escapeHtml(v)}</td></tr>`,
      )
      .join('') +
    '</table>';
  const text =
    'New GlobalBiz Waitlist Signup\n\n' +
    rows.map(([k, v]) => `${k}: ${v}`).join('\n');

  const res = await fetch(RESEND_ENDPOINT, {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from, to, subject: 'New GlobalBiz Waitlist Signup', html, text }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => '');
    console.error('[notify-signup] Resend error', res.status, body);
    return { statusCode: 502, body: `Resend error ${res.status}: ${body}` };
  }
  return { statusCode: 200, body: 'sent' };
};
