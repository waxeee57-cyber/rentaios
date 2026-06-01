# STATUS.md — Current Work In Progress

This file tracks who is currently working on what in this repo.
READ THIS AT THE START OF EVERY SESSION.

---

## Active Work

### Roland
- **Branch:** feature/complete-sprint-tasks
- **Files:** app/, components/, lib/ (teljes audit)
- **Description:** Full audit — TypeScript, build, live Supabase, UI/UX konzisztencia
- **Started:** 2026-05-16

### Dominik
- **Branch:** feature/auto-close-and-closed-tab
- **Files:** supabase/migrations/16_chat_auto_close.sql, supabase/migrations/17_last_visitor_message_at.sql, app/api/chat/message/route.ts, app/api/admin/chat/conversation/[id]/status/route.ts, app/api/admin/chat/conversations/route.ts, app/(admin)/admin/(protected)/messages/page.tsx, components/chat/ChatWidget.tsx
- **Description:** Chat: simplify auto-reply, lazy auto-close after 1h + admin manual close, admin Open/Closed tabs with search, widget closed-state handling. Bugfix: stale detection now uses last_visitor_message_at (admin replies no longer reset the inactivity window).
- **Started:** 2026-05-13

### Loki (autonomous — Roland-assigned)
- **Branch:** feat/phase1-prod-ready
- **Files:** lib/, app/api/health, app/api/ops, scripts/, supabase/, instrumentation
- **Description:** BLOKK 1 — production-ready alap: secret-guard CI, guest-flow
  error handling + idempotency, /api/health + Ops + alert-stub, Sentry
  (placeholder DSN), backup/restore scripts + runbook. PROD read-only.
- **Started:** 2026-06-01
- **Note:** Roland "feature/complete-sprint-tasks" entry above is stale
  (2026-05-16); P0 work has since continued on fix/p0-security-rls which this
  branch builds on. Flagged for Roland to confirm/clear.

---

## Rules

- Update your section when you start a task
- Clear your section when the PR is merged to main
- If you detect overlap with another active task, STOP and notify the user
- Never work on the same files at the same time without explicit coordination

## Conflict Resolution

If both Roland and Dominik need to touch overlapping files:
1. Whoever started first finishes and merges to main
2. The second pulls main, rebases their branch, then continues
3. If truly parallel work is needed, split by file boundary in advance
