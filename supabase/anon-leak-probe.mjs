#!/usr/bin/env node
// ============================================================
// ANON LEAK PROBE (read-only, count-only)  —  run:  npm run probe
//
// Safe, NON-destructive demonstration of the P0 RLS holes using ONLY the public
// anon key. Asks PostgREST for the ROW COUNT of each sensitive table with
// { head: true } so NO row data / PII is ever fetched — only a number.
//
//   RED  (hole open):  anon receives a real count > 0  → it can read the table
//   GREEN (locked):    anon blocked, or sees 0 rows
//
// Reads credentials from ../.env.local so secrets never touch the command line.
// Uses the anon key only — never the service role. Performs NO writes.
// ============================================================
import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const __dir = dirname(fileURLToPath(import.meta.url))

function loadEnv() {
  const env = { ...process.env }
  for (const name of ['.env.local', '.env']) {
    try {
      for (const line of readFileSync(join(__dir, '..', name), 'utf8').split(/\r?\n/)) {
        const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/)
        if (m && env[m[1]] === undefined) env[m[1]] = m[2].replace(/^["']|["']$/g, '')
      }
    } catch { /* optional */ }
  }
  return env
}

const env = loadEnv()
const URL = env.NEXT_PUBLIC_SUPABASE_URL
const ANON = env.NEXT_PUBLIC_SUPABASE_ANON_KEY
if (!URL || !ANON) {
  console.error('✗ Missing NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY')
  process.exit(1)
}

const anon = createClient(URL, ANON, { auth: { persistSession: false } })
const SENSITIVE = ['chat_conversations', 'chat_messages', 'subscriptions', 'referrals']

console.log('Anon leak probe (count-only, no PII) →', URL, '\n')
let leaks = 0
for (const table of SENSITIVE) {
  const { count, error } = await anon.from(table).select('*', { count: 'exact', head: true })
  if (error) {
    console.log(`  GREEN  ${table.padEnd(20)} blocked (${error.code || error.message})`)
  } else if ((count ?? 0) > 0) {
    leaks++
    console.log(`  RED    ${table.padEnd(20)} anon can read — ${count} rows visible`)
  } else {
    console.log(`  GREEN  ${table.padEnd(20)} anon sees 0 rows (locked or empty)`)
  }
}
console.log(`\n${leaks === 0 ? '✓ no anon-readable PII detected' : `✗ ${leaks} table(s) leak to anon`}`)
process.exit(leaks === 0 ? 0 : 1)
