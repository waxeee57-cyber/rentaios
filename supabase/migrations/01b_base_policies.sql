-- ============================================================
-- 01b_base_policies — RLS + base policies for the base tables
-- 2026-05-31
--
-- Mirrors supabase/policies.sql, made idempotent (ENABLE RLS is naturally a
-- no-op when already on; each policy is DROP IF EXISTS + CREATE so re-running on
-- an existing DB reproduces the identical policy atomically inside the migration
-- transaction). Runs after 01_base_schema.sql.
--
-- NOTE: chat / business_config / subscriptions / referrals RLS is handled by
-- 16_security_rls_p0.sql, not here.
-- ============================================================

ALTER TABLE cars        ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings    ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers   ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- CARS — public read of non-hidden cars; all writes via service role (bypasses RLS)
DROP POLICY IF EXISTS "Public can view available cars" ON cars;
CREATE POLICY "Public can view available cars"
  ON cars FOR SELECT
  USING (status != 'hidden');

-- BOOKINGS / CUSTOMERS — no public policy: service-role-only (all server routes
-- use supabaseAdmin). Deny-by-default is intentional.

-- ADMIN USERS — an authenticated user may see only their own record.
DROP POLICY IF EXISTS "Admin can view own record" ON admin_users;
CREATE POLICY "Admin can view own record"
  ON admin_users FOR SELECT
  USING (auth.uid() = id);
