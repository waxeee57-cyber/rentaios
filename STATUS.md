# STATUS.md — Current Work In Progress

This file tracks who is currently working on what in this repo.
READ THIS AT THE START OF EVERY SESSION.

---

## Active Work

### Roland
- **Branch:** [none]
- **Files:** [none]
- **Description:** [none]
- **Started:** [none]

### Dominik
- **Branch:** fix/admin-messages-clients
- **Files:** app/(admin)/admin/(protected)/messages/page.tsx, app/(admin)/admin/(protected)/clients/ClientsList.tsx, app/(admin)/admin/(protected)/layout.tsx
- **Description:** Fix messages realtime subscription + toast notifications; fix clients accordion one-at-a-time expand
- **Started:** 2026-05-12

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
