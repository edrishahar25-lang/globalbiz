#!/usr/bin/env bash
# Netlify production build script.
# - Maps short SUPABASE_URL / SUPABASE_ANON_KEY → EXPO_PUBLIC_* if needed
#   (Metro only inlines env vars prefixed with EXPO_PUBLIC_ at build time)
# - Echoes presence + length so the Netlify deploy log shows exactly what
#   was visible to the build process
# - Runs the normal install + expo export pipeline
set -e

if [ -z "$EXPO_PUBLIC_SUPABASE_URL" ] && [ -n "$SUPABASE_URL" ]; then
  export EXPO_PUBLIC_SUPABASE_URL="$SUPABASE_URL"
fi
if [ -z "$EXPO_PUBLIC_SUPABASE_ANON_KEY" ] && [ -n "$SUPABASE_ANON_KEY" ]; then
  export EXPO_PUBLIC_SUPABASE_ANON_KEY="$SUPABASE_ANON_KEY"
fi

if [ -n "$EXPO_PUBLIC_SUPABASE_URL" ]; then
  echo "[netlify-build] EXPO_PUBLIC_SUPABASE_URL is set (length=${#EXPO_PUBLIC_SUPABASE_URL})"
else
  echo "[netlify-build] EXPO_PUBLIC_SUPABASE_URL is MISSING"
fi
if [ -n "$EXPO_PUBLIC_SUPABASE_ANON_KEY" ]; then
  echo "[netlify-build] EXPO_PUBLIC_SUPABASE_ANON_KEY is set (length=${#EXPO_PUBLIC_SUPABASE_ANON_KEY})"
else
  echo "[netlify-build] EXPO_PUBLIC_SUPABASE_ANON_KEY is MISSING"
fi

npm install --legacy-peer-deps
npm run build:web
