// scripts/lint-mojibake.mjs
//
// Build-time guard against double-encoded UTF-8 (mojibake). Fails (exit 1) if
// any source/seed/config file contains a mojibake sequence — a Latin-1/cp125x
// "lead" char (Â Ã â Ă) immediately followed by a high/special "continuation"
// char. That combination never occurs in legitimate UTF-8 text (real accents
// like á/é and the real em-dash — are single chars surrounded by normal text),
// so this does not flag the repo's legitimate i18n/accented content.
//
// Also flags the Unicode replacement char U+FFFD, a sign of lossy decoding.
//
// Usage:
//   node scripts/lint-mojibake.mjs            # scan default app roots
//   node scripts/lint-mojibake.mjs <dir...>   # scan specific paths (for tests)

import { readdirSync, statSync, readFileSync, existsSync } from 'node:fs'
import { join, relative } from 'node:path'

const IGNORE = new Set(['node_modules', '.next', '.git', '.agents', '.claude', 'coverage', 'out', 'build'])
const EXT = /\.(ts|tsx|js|jsx|mjs|mts|json|sql|md|css|html)$/

// lead chars that begin a double-encoded sequence
const LEAD = '\\u00C2\\u00C3\\u00E2\\u0102'
// continuation chars: cp125x high bytes (0x80-0xBF) + the cp1252 punctuation
// block (smart quotes, dashes, euro, dagger, OE/oe, caron/breve, etc.)
const CONT = '\\u0080-\\u00BF\\u2013-\\u2122\\u20AC\\u0152-\\u017E\\u02C6-\\u02DC'
const MOJI = new RegExp(`[${LEAD}][${CONT}]|\\uFFFD`)
const MOJI_G = new RegExp(MOJI.source, 'g')

const DEFAULT_ROOTS = ['app', 'components', 'lib', 'supabase', 'scripts', 'messages', 'src']

function collect(root) {
  const out = []
  const st = existsSync(root) ? statSync(root) : null
  if (!st) return out
  if (st.isFile()) {
    if (EXT.test(root)) out.push(root)
    return out
  }
  for (const n of readdirSync(root)) {
    if (IGNORE.has(n)) continue
    const f = join(root, n)
    const s = statSync(f)
    if (s.isDirectory()) out.push(...collect(f))
    else if (EXT.test(n)) out.push(f)
  }
  return out
}

const argRoots = process.argv.slice(2)
const roots = argRoots.length ? argRoots : DEFAULT_ROOTS
const baseDir = process.cwd()

// also scan root-level config files when using defaults
const files = new Set()
for (const r of roots) for (const f of collect(r)) files.add(f)
if (!argRoots.length) {
  for (const f of ['.editorconfig', 'next.config.ts', 'package.json', 'vercel.json']) {
    if (existsSync(f)) files.add(f)
  }
}

const violations = []
for (const f of files) {
  const lines = readFileSync(f, 'utf8').split('\n')
  lines.forEach((line, i) => {
    if (MOJI.test(line)) {
      const seqs = [...new Set(line.match(MOJI_G))]
        .map((s) => [...s].map((c) => 'U+' + c.codePointAt(0).toString(16).toUpperCase().padStart(4, '0')).join(''))
      violations.push({ file: relative(baseDir, f).replace(/\\/g, '/'), line: i + 1, seqs })
    }
  })
}

if (violations.length === 0) {
  console.log(`lint:mojibake — OK, scanned ${files.size} files, no mojibake.`)
  process.exit(0)
}
console.error(`lint:mojibake — FAILED, ${violations.length} line(s) with mojibake:\n`)
for (const v of violations) {
  console.error(`  ${v.file}:${v.line}   [${v.seqs.join(', ')}]`)
}
console.error('\nA double-encoded (cp1252/cp1250-saved) character reached the source.')
console.error('Save the file as UTF-8 (no BOM) with the real € / — characters.')
process.exit(1)
