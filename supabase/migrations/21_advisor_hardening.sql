-- ============================================================
-- 21_advisor_hardening (originally 18) — close get_advisors(security) findings
-- 2026-05-31
-- ALREADY APPLIED TO PROD — never re-run via db push
--
-- Branch-proven (dev branch p0-proof2): red→green captured in
-- docs/P0_GO_LIVE_REPORT.md (Phase 2). Forward-only, additive, idempotent.
--
-- ⚠️ PROD: history is empty and 16 is already live — do NOT `supabase db push`.
--   A human applies this block directly (dashboard SQL editor) after backup.
--   See docs/PROD_EXECUTION.md.
-- ============================================================

-- 1. rls_auto_enable(): SECURITY DEFINER event-trigger function. EXECUTE was
--    granted to anon/authenticated (via PUBLIC default) — callable unauthenticated
--    over /rest/v1/rpc. The event-trigger system runs it as owner regardless of
--    EXECUTE grants, so revoking EXECUTE does NOT affect auto-RLS behaviour.
--    Proof: pre = anon EXECUTE true; post = anon call → 42501 permission denied.
REVOKE EXECUTE ON FUNCTION public.rls_auto_enable() FROM anon, authenticated, PUBLIC;

-- 2. Pin search_path on the 4 mutable-search_path functions (lint 0011).
--    The pure now()-only trigger functions are safe with an empty path —
--    pg_catalog is always implicitly present, so now() still resolves.
ALTER FUNCTION public.set_updated_at()                    SET search_path = '';
ALTER FUNCTION public.update_business_config_updated_at() SET search_path = '';
ALTER FUNCTION public.set_client_leads_updated_at()       SET search_path = '';

-- upsert_customer references the customers table, so it must be schema-qualified
-- (public.customers) for an empty search_path. Body logic is identical to 01.
CREATE OR REPLACE FUNCTION public.upsert_customer(
  p_email text, p_phone text, p_full_name text, p_country text
) RETURNS uuid LANGUAGE plpgsql SET search_path = '' AS $$
DECLARE v_id uuid;
BEGIN
  INSERT INTO public.customers (email, phone, full_name, country)
  VALUES (p_email, p_phone, p_full_name, p_country)
  ON CONFLICT (email) DO UPDATE
    SET phone = excluded.phone, full_name = excluded.full_name,
        country = excluded.country, updated_at = now()
  RETURNING id INTO v_id;
  RETURN v_id;
END;
$$;

-- NOT fixed here (documented as owner steps in docs/PROD_EXECUTION.md):
--   * btree_gist in public schema (lint 0014) — moving an in-use extension is
--     risky; left as a documented manual step.
--   * Leaked-password protection (lint auth) — Auth dashboard toggle, not SQL.
--   * auth_all_* / page_events permissive policies — intentional (admin full
--     access / first-party analytics insert). Accepted.
