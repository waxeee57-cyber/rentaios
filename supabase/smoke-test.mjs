#!/usr/bin/env node
// ============================================================
// P0 SECURITY SMOKE TEST  —  run:  npm run smoke
//
// CI acceptance test for the P0 RLS lockdown (16_security_rls_p0.sql) +
// admin_users reconcile (17_admin_users_reconcile.sql).
//
// Intended target: a FRESH DB built in CI, e.g.
//     # base bootstrap (schema.sql + policies.sql are NOT auto-run by db reset):
//     psql "$DATABASE_URL" -f supabase/schema.sql
//     psql "$DATABASE_URL" -f supabase/policies.sql
//     for f in supabase/migrations/*.sql; do psql "$DATABASE_URL" -f "$f"; done
//     psql "$DATABASE_URL" -f supabase/seed.sql
//     npm run smoke
//
// Required env:
//   NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY
//
// Assertions (exit 0 = all green, 1 = any red):
//   a) admin_users.user_id + .email and subscriptions.access_locked resolve  (schema drift)
//   b) a visitor's own conversation + message store and read back            (service path)
//   c) the anon key CANNOT read chat conversations or messages               (PII leak)
//   d) the anon key CANNOT read subscriptions or referrals
//   e) migrations 16 + 17 exist on disk
//
// RED before fix / GREEN after: on the pre-fix schema (a) and (c) fail by
// construction (missing user_id/email; anon-readable chat).
//
// ⚠️ This test WRITES (and cleans up) a test conversation. Do NOT run it against
//    production — point it at a disposable CI / local database.
// ============================================================
import { createClient } from '@supabase/supabase-js'
import { readdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const __dir = dirname(fileURLToPath(import.meta.url))
const MARK = `smoke-${Date.now()}`
const SESSION = crypto.randomUUID()

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const SERVICE = process.env.SUPABASE_SERVICE_ROLE_KEY
if (!URL || !ANON || !SERVICE) {
  console.error('✗ Missing env: NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY / SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const admin = createClient(URL, SERVICE, { auth: { persistSession: false } })
const anon = createClient(URL, ANON, { auth: { persistSession: false } })

let failures = 0
const ok = (n) => console.log(`  ✓ ${n}`)
const bad = (n, d) => { failures++; console.log(`  ✗ ${n}${d ? ` — ${d}` : ''}`) }
const isUndefinedColumn = (e) => e && (e.code === '42703' || /column .* does not exist/i.test(e.message || ''))

async function testSchema() {
  console.log('\n[a] admin_users / subscriptions schema (drift)')
  {
    // Exactly requireAdmin's query shape.
    const { error } = await admin
      .from('admin_users').select('id, email')
      .eq('user_id', '00000000-0000-0000-0000-000000000000').maybeSingle()
    if (isUndefinedColumn(error)) bad('admin_users.user_id/email queryable', error.message)
    else if (error) bad('admin_users query', error.message)
    else ok('admin_users.user_id + email resolve (requireAdmin query shape)')
  }
  {
    const { error } = await admin.from('subscriptions').select('access_locked').limit(1)
    if (isUndefinedColumn(error)) bad('subscriptions.access_locked exists', error.message)
    else if (error) bad('subscriptions query', error.message)
    else ok('subscriptions.access_locked resolves (admin layout query)')
  }
}

async function testVisitorOwnThread() {
  console.log('\n[b] visitor stores + reads back their own conversation (service path)')
  const { data: convo, error: cErr } = await admin
    .from('chat_conversations')
    .insert({ session_id: SESSION, visitor_name: MARK, visitor_email: `${MARK}@example.com` })
    .select('id').single()
  if (cErr || !convo) return bad('seed conversation', cErr?.message)

  const { error: mErr } = await admin
    .from('chat_messages')
    .insert({ conversation_id: convo.id, sender: 'visitor', body: `${MARK} hello` })
  if (mErr) return bad('seed message', mErr.message)

  const { data: own } = await admin
    .from('chat_conversations').select('id').eq('session_id', SESSION).maybeSingle()
  const { data: msgs } = await admin
    .from('chat_messages').select('id').eq('conversation_id', convo.id)
  if (own?.id === convo.id && (msgs?.length ?? 0) === 1) ok('own conversation + message stored and retrievable by session')
  else bad('own thread readable via session', `convo=${own?.id} msgs=${msgs?.length}`)
}

async function testAnonCannotReadChat() {
  console.log('\n[c] anon key CANNOT read chat (PII leak closed)')
  const { data: convs, error: cErr } = await anon.from('chat_conversations').select('id, visitor_email')
  if (cErr || (convs?.length ?? 0) === 0) ok('anon chat_conversations → blocked / 0 rows')
  else bad('anon read chat_conversations', `leaked ${convs.length} rows`)

  const { data: msgs, error: mErr } = await anon.from('chat_messages').select('id, body')
  if (mErr || (msgs?.length ?? 0) === 0) ok('anon chat_messages → blocked / 0 rows')
  else bad('anon read chat_messages', `leaked ${msgs.length} rows`)
}

async function testAnonCannotReadBilling() {
  console.log('\n[d] anon key CANNOT read subscriptions / referrals')
  const { data: subs, error: sErr } = await anon.from('subscriptions').select('id, stripe_customer_id')
  if (sErr || (subs?.length ?? 0) === 0) ok('anon subscriptions → blocked / 0 rows')
  else bad('anon read subscriptions', `leaked ${subs.length} rows`)

  const { data: refs, error: rErr } = await anon.from('referrals').select('id, referrer_email')
  if (rErr || (refs?.length ?? 0) === 0) ok('anon referrals → blocked / 0 rows')
  else bad('anon read referrals', `leaked ${refs.length} rows`)
}

function testMigrationsExist() {
  console.log('\n[e] P0 migrations exist on disk')
  const files = readdirSync(join(__dir, 'migrations'))
  for (const f of ['16_security_rls_p0.sql', '17_admin_users_reconcile.sql']) {
    if (files.includes(f)) ok(`migration ${f} present`)
    else bad(`migration ${f} present`)
  }
}

async function cleanup() {
  const { data: c } = await admin.from('chat_conversations').select('id').eq('session_id', SESSION)
  for (const row of c ?? []) {
    await admin.from('chat_messages').delete().eq('conversation_id', row.id)
    await admin.from('chat_conversations').delete().eq('id', row.id)
  }
}

async function main() {
  console.log('P0 security smoke test →', URL)
  try {
    await testSchema()
    await testVisitorOwnThread()
    await testAnonCannotReadChat()
    await testAnonCannotReadBilling()
    testMigrationsExist()
  } finally {
    await cleanup().catch(() => {})
  }
  console.log(`\n${failures === 0 ? '✓ ALL GREEN' : `✗ ${failures} RED`}`)
  process.exit(failures === 0 ? 0 : 1)
}
main().catch((e) => { console.error('smoke test crashed:', e); process.exit(1) })
