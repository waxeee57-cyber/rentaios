// scripts/secret-guard.test.mjs
//
// Proves the secret-guard works: it must go RED on planted leaks and GREEN on
// the real repository. Also proves it does NOT false-positive on type-only
// imports (which Next.js erases and never bundles to the client).
//
// Run:  node scripts/secret-guard.test.mjs
// Exit: 0 if all assertions pass, 1 otherwise.

import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs'
import { join, dirname, resolve } from 'node:path'
import { tmpdir } from 'node:os'
import { fileURLToPath } from 'node:url'
import { analyzeProject } from './secret-guard.mjs'

const REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')

let passed = 0
let failed = 0
function check(name, cond) {
  if (cond) {
    passed++
    console.log(`  PASS  ${name}`)
  } else {
    failed++
    console.error(`  FAIL  ${name}`)
  }
}

function fixture(files) {
  const dir = mkdtempSync(join(tmpdir(), 'secret-guard-'))
  for (const [rel, content] of Object.entries(files)) {
    const full = join(dir, rel)
    mkdirSync(dirname(full), { recursive: true })
    writeFileSync(full, content)
  }
  return dir
}

function rules(dir) {
  return new Set(analyzeProject(dir).violations.map((v) => v.rule))
}

const tmpDirs = []
function run() {
  // --- Fixture A: secret reaches client bundle via value import (RULE2) ----
  const a = fixture({
    'lib/secret-helper.ts': `export const k = process.env.SUPABASE_SERVICE_ROLE_KEY\n`,
    'components/Leaky.tsx': `'use client'\nimport { k } from '@/lib/secret-helper'\nexport default function C() { return null }\n`,
  })
  tmpDirs.push(a)
  check('A: planted client->secret leak is RED (RULE2)', rules(a).has('RULE2'))

  // --- Fixture B: server-only module reachable from client (RULE2) ---------
  const b = fixture({
    'lib/srv.ts': `import 'server-only'\nexport const x = 1\n`,
    'components/UsesSrv.tsx': `'use client'\nimport { x } from '@/lib/srv'\nexport default function C() { return x }\n`,
  })
  tmpDirs.push(b)
  check('B: server-only reachable from client is RED (RULE2)', rules(b).has('RULE2'))

  // --- Fixture C: unguarded shared secret module (RULE1) -------------------
  const c = fixture({
    'lib/stripe-bad.ts': `export const s = process.env.STRIPE_SECRET_KEY\n`,
  })
  tmpDirs.push(c)
  check('C: unguarded shared secret module is RED (RULE1)', rules(c).has('RULE1'))

  // --- Fixture D: anon + admin mixed in one module (RULE3) -----------------
  const d = fixture({
    'lib/supabase.ts': `export const supabase = {}\n`,
    'lib/supabase-admin.ts': `import 'server-only'\nexport const supabaseAdmin = {}\n`,
    'app/api/bad/route.ts': `import { supabase } from '@/lib/supabase'\nimport { supabaseAdmin } from '@/lib/supabase-admin'\nexport function GET() { return Response.json({}) }\n`,
  })
  tmpDirs.push(d)
  check('D: anon+admin client mix is RED (RULE3)', rules(d).has('RULE3'))

  // --- Fixture E: type-only import of a server-only module is SAFE ----------
  const e = fixture({
    'lib/srv.ts': `import 'server-only'\nexport type Cfg = { a: number }\nexport const x = 1\n`,
    'components/TypeOnly.tsx': `'use client'\nimport type { Cfg } from '@/lib/srv'\nexport default function C(p: { c: Cfg }) { return null }\n`,
  })
  tmpDirs.push(e)
  check('E: type-only import of server-only module is GREEN', rules(e).size === 0)

  // --- Fixture F: NEXT_PUBLIC_ env var in client is SAFE -------------------
  const f = fixture({
    'components/Pub.tsx': `'use client'\nexport default function C() { return process.env.NEXT_PUBLIC_SITE_URL }\n`,
  })
  tmpDirs.push(f)
  check('F: NEXT_PUBLIC_ env in client is GREEN', rules(f).size === 0)

  // --- The real repository must be clean -----------------------------------
  const real = analyzeProject(REPO_ROOT)
  if (real.violations.length) {
    console.error('  real-repo violations:')
    for (const v of real.violations) console.error(`    [${v.rule}] ${v.file} — ${v.message}`)
  }
  check(`G: real repo is GREEN (scanned ${real.files.length} files)`, real.violations.length === 0)
}

try {
  run()
} finally {
  for (const d of tmpDirs) {
    try { rmSync(d, { recursive: true, force: true }) } catch {}
  }
}

console.log(`\nsecret-guard.test: ${passed} passed, ${failed} failed`)
process.exit(failed === 0 ? 0 : 1)
