-- ============================================================
-- P0 SECURITY HARDENING — RLS lockdown
-- Migration 19 (originally 16) — 2026-05-29
-- ALREADY APPLIED TO PROD — never re-run via db push
--
-- Closes the two P0 data-leak risks from MULTITENANCY_AUDIT.md §5:
--   1. Public (anon) read access to chat PII via `USING (true)` policies
--      (14_chat.sql:34-35) — anyone with the public anon key could read
--      every conversation (visitor_name / visitor_email) and message body.
--   2. RLS not enabled at all on business_config, subscriptions, referrals.
--
-- ACCESS MODEL AFTER THIS MIGRATION
--   - service_role (server routes via lib/supabase-admin.ts) has BYPASSRLS
--     and retains full read/write. Every chat / config / billing / referral
--     read and write in the app already goes through service_role — verified:
--       chat:    app/api/chat/*, app/api/admin/chat/*  (supabaseAdmin)
--       config:  lib/config.ts, app/api/admin/settings  (supabaseAdmin)
--       billing: app/api/billing/webhook, admin billing/layout pages (supabaseAdmin)
--       referr.: app/api/referrals/register, /refer, /r/[code]  (supabaseAdmin)
--   - anon (public NEXT_PUBLIC_SUPABASE_ANON_KEY) can NO LONGER read chat,
--     business_config, subscriptions, or referrals.
--   - authenticated (admin in Supabase Auth) keeps the existing chat ALL
--     policies from 14_chat.sql (auth_all_conversations / auth_all_messages).
--
-- KNOWN FUNCTIONAL CONSEQUENCE (see PR description / proposed follow-up)
--   The visitor ChatWidget and the admin Messages page open Realtime
--   `postgres_changes` subscriptions using a bare anon-key client with no
--   session, so those subscriptions ran as the anon role and depended on the
--   policies dropped below. After this migration, messages still LOAD and
--   SEND normally (all via service-role server routes), but live websocket
--   push of new messages stops until the Realtime clients are switched to an
--   authenticated session (admin) / scoped token (visitor). This migration
--   makes no application-code change.
-- ============================================================

-- ------------------------------------------------------------
-- 1. CHAT — remove public/anon read access (PII leak)
-- ------------------------------------------------------------
DROP POLICY IF EXISTS "anon_select_conversations" ON chat_conversations;
DROP POLICY IF EXISTS "anon_select_messages" ON chat_messages;

-- ------------------------------------------------------------
-- 2. BUSINESS_CONFIG — enable RLS, deny-by-default
-- ------------------------------------------------------------
-- No anon/authenticated policy added: all non-service-role access is denied.
ALTER TABLE business_config ENABLE ROW LEVEL SECURITY;

-- ------------------------------------------------------------
-- 3. SUBSCRIPTIONS — enable RLS, deny-by-default
-- ------------------------------------------------------------
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- ------------------------------------------------------------
-- 4. REFERRALS — enable RLS, deny-by-default
-- ------------------------------------------------------------
ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;
