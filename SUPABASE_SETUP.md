# Supabase setup — GlobalBiz Auth

GlobalBiz uses Supabase Auth for email/password sign-up, sign-in, password reset,
and a `profiles` table for user metadata.

This guide takes ~10 minutes the first time. After that, all the client code
is wired up — you only need to wire env vars.

---

## 1) Create a Supabase project

1. Go to [https://supabase.com](https://supabase.com) → New Project
2. Name: `globalbiz` (or anything)
3. Region: nearest to Israel (Europe Frankfurt is fine)
4. Database password: save it in a password manager
5. Wait ~2 minutes for provisioning

## 2) Run the schema

Open **Dashboard → SQL Editor → New query**, paste the entire contents of
`supabase/schema.sql` from this repo, and click **Run**.

You should see "Success. No rows returned" — that means the
`profiles` table, RLS policies, and the new-user trigger are all in place.

## 3) Configure email auth + redirect URLs

1. **Dashboard → Authentication → Providers → Email** → make sure it's enabled
2. **Dashboard → Authentication → URL Configuration**:
   - Site URL: `https://<your-netlify-subdomain>.netlify.app`
   - Redirect URLs: add **both**:
     - `https://<your-netlify-subdomain>.netlify.app/reset-password`
     - `globalbiz://reset-password`  (native deep link)
     - `http://localhost:8081/reset-password`  (local web dev)

3. **Dashboard → Authentication → Email Templates** (optional but
   recommended for the demo): translate the "Reset Password" + "Confirm
   Signup" templates to Hebrew/English/whatever feels right.

## 4) Grab the API keys

**Dashboard → Project Settings → API**:
- Copy **Project URL** (e.g., `https://abc123.supabase.co`)
- Copy **anon public** key (long JWT)

## 5) Set environment variables

### Local development (`.env.local` in repo root)

Create `.env.local` (gitignored — never commit):

```env
EXPO_PUBLIC_SUPABASE_URL=https://abc123.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9....
```

Restart Metro after changing: `npx expo start --clear`

### Netlify production

**Site → Site configuration → Environment variables → Add a variable**:

| Key | Value |
|---|---|
| `EXPO_PUBLIC_SUPABASE_URL` | `https://abc123.supabase.co` |
| `EXPO_PUBLIC_SUPABASE_ANON_KEY` | `eyJ...` (the anon public key) |

After adding, trigger a new deploy:
**Site → Deploys → Trigger deploy → Clear cache and deploy site**

## 6) Test the flow

1. Open the deployed site / local dev URL
2. App redirects to `/login`
3. Tap "Sign up" → fill name, email, password (≥8 chars)
4. Submit → Supabase emails a confirmation link
5. Click link in email → user is confirmed
6. Return to app → log in with email + password
7. App shows Home screen with your real name in the header
8. Profile tab shows your real email + name
9. Tap "Sign out" → returns to login screen
10. Tap "Forgot password" → enter email → reset link in mailbox →
    click it → opens app at `/reset-password` → set new password → log in

---

## Why `anon` key is safe to ship to the client

Supabase's `anon` key is **designed** to be public — it's the
unauthenticated API key. Row Level Security (RLS) on the `profiles`
table ensures users can only access their own row. Never ship the
`service_role` key (which bypasses RLS).

---

## Optional next steps

- Add a `transactions` table with RLS and migrate `mockData.transactions`
- Add a `contacts` table for the Send flow
- Add Google / Apple OAuth via Supabase Auth Providers
- Set up email branding (logo, custom domain `auth@globalbiz.me`)
