-- ============================================================
-- SCHEMA RECONCILE — admin_users
-- Migration 20 (originally 17) — 2026-05-31
-- ALREADY APPLIED TO PROD — never re-run via db push
--
-- Forward-only fix for deploy-blocking schema drift: the admin auth code reads
-- admin_users columns the canonical schema (supabase/schema.sql) never defined,
-- so on a fresh repo-build DB every admin request fails closed.
--
--   lib/auth.ts (requireAdmin):       admin_users.select('id, email').eq('user_id', uid).single()
--   app/(admin)/.../layout.tsx:        admin_users.select('id').eq('user_id', uid).maybeSingle()
--
-- schema.sql defines admin_users(id PK = auth.users, role, full_name, created_at)
-- — NO `user_id`, NO `email` → PostgREST 42703 "column does not exist" → 403 /
-- redirect to login for everyone. This migration adds both, backfills, indexes.
--
-- NOTE: subscriptions.access_locked is NOT drift — it already exists
-- (13_automation.sql:49). Intentionally untouched here.
--
-- Idempotent (ADD COLUMN IF NOT EXISTS, guarded), no data loss.
-- ============================================================

DO $$
BEGIN
  IF to_regclass('public.admin_users') IS NULL THEN
    RAISE EXCEPTION 'admin_users table missing — base schema (schema.sql) not applied before migration 20';
  END IF;
END $$;

-- ── admin_users.user_id : the auth.users link the code filters on ───────────
-- admin_users.id already references auth.users(id), so user_id mirrors id.
ALTER TABLE admin_users
  ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;

UPDATE admin_users SET user_id = id WHERE user_id IS NULL;

-- One admin row per auth user; makes .eq('user_id', …).single() well-defined.
CREATE UNIQUE INDEX IF NOT EXISTS admin_users_user_id_key ON admin_users(user_id);

COMMENT ON COLUMN admin_users.user_id IS
  'auth.users.id of the admin. Mirrors PK id (also an auth.users FK) for '
  'compatibility with lib/auth.ts / admin layout queries that filter by user_id.';

-- ── admin_users.email : selected by requireAdmin ────────────────────────────
ALTER TABLE admin_users
  ADD COLUMN IF NOT EXISTS email text;

-- Backfill from auth.users (admin_users.id = auth.users.id).
UPDATE admin_users a
  SET email = u.email
  FROM auth.users u
  WHERE a.email IS NULL AND u.id = a.id;

COMMENT ON COLUMN admin_users.email IS
  'Admin email, backfilled from auth.users. Selected by lib/auth.ts requireAdmin.';
