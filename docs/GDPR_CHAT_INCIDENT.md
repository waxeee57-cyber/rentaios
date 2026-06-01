# GDPR / Personal-data incident note — chat anon read exposure (DRAFT TEMPLATE)

> **Status: DRAFT — fields marked `<<FILL: …>>` must be completed by the data controller.**
> Do not treat estimates as confirmed. This template records a technical exposure found
> during the P0 security review; the controller decides reportability under GDPR Art. 33/34.

## 1. Summary
A Row-Level-Security misconfiguration on the in-app chat made visitor chat records
readable by anyone holding the project's **public anon key**. Two RLS policies
(`anon_select_conversations`, `anon_select_messages`, `USING (true)`) granted the
public `anon` role unconditional `SELECT` on `chat_conversations` and `chat_messages`.

- **System:** RentalOS production Supabase project `bnjnoofcyjldvygupvgp` (Zöldfészek / CostaSol deployment — `<<FILL: which live deployment(s) used this project>>`).
- **Discovered:** 2026-05-31, during the P0 security review (read-only diagnosis + dev-branch proof).
- **Status now:** **Closed.** Migration 16 (drops the anon chat policies) is already live on prod; verified the anon role reads 0 rows.

## 2. Personal data categories exposed
From `chat_conversations` and `chat_messages`:
- `visitor_name` (free text, may be a real name)
- `visitor_email` (visitor email address)
- `chat_messages.body` (free-text message content — may contain any PII a visitor typed: phone numbers, addresses, booking details, etc.)
- associated timestamps / session identifiers

No passwords, no payment card data stored in these tables (card data is handled by Stripe, not stored here). `<<FILL: confirm no special-category data was typed into free-text messages>>`.

## 3. Scope / volume
- **Affected records (as counted on prod 2026-05-31):** **18 conversations / 52 messages.**
- **Distinct data subjects:** `<<FILL: count of distinct visitor_email / visitor_name — run query below>>`
```sql
select count(distinct visitor_email) as distinct_emails,
       count(*) filter (where visitor_email is not null) as convos_with_email
from chat_conversations;
```

## 4. Exposure window
- **Opened:** when the anon `USING (true)` chat policies were applied to prod — i.e. when the `14_chat` schema went live. **`<<FILL: prod date the chat feature / 14_chat policies went live>>`** (prod migration history is empty, so confirm from deploy logs / dashboard, not from migration files).
- **Closed:** when migration 16 was applied to prod (anon chat policies dropped). Migration file is dated **2026-05-29**; **`<<FILL: confirm exact prod date/time 16 was applied>>`**.
- **Estimated duration:** `<<FILL: closed − opened>>`.

## 5. Likelihood of actual access (not just exposure)
The anon key is shipped in the public web bundle (it is designed to be public), so the
data was retrievable by anyone who (a) had the anon key and (b) queried the tables
directly via PostgREST. UUID primary keys are unguessable, but a `select *` with the
anon key returned **all** rows (no per-row filter) — so enumeration required no guessing.
- **Evidence of actual external access:** `<<FILL: review API/PostgREST logs for anon reads of chat_conversations/chat_messages during the window — unknown / none found / found>>`.
- The vulnerability was reproduced in a controlled dev branch (seeded dummy PII), not against real visitor data.

## 6. Remediation
- ✅ Anon chat read policies dropped (migration 16, live on prod).
- ✅ `business_config` / `subscriptions` / `referrals` RLS enabled deny-by-default.
- ✅ Verified post-fix: anon role reads 0 chat/subscription/referral rows.
- ⏳ Pending owner steps: migration 17 (admin reconcile) + advisor hardening (see `docs/PROD_EXECUTION.md`) — not related to the exposure itself.
- `<<FILL: rotate the anon key? optional — anon key is public by design; rotation only needed if combined with other concerns>>`.

## 7. GDPR assessment (controller to complete)
- **Is it a personal-data breach (Art. 4(12))?** `<<FILL: yes/no + reasoning>>` (a confidentiality breach via unauthorized-access *potential* typically qualifies).
- **Risk to data subjects (Art. 33(1)):** `<<FILL: low/medium/high — based on volume, data sensitivity, evidence of access>>`.
- **Notify supervisory authority within 72h (Art. 33)?** `<<FILL: yes/no + which authority (e.g. NAIH Hungary) + date>>`.
- **Notify data subjects (Art. 34)?** `<<FILL: yes/no + method>>`.
- **Decision maker / DPO:** `<<FILL: name>>` · **Date of assessment:** `<<FILL>>`.

## 8. Record (Art. 33(5) — internal log)
| Field | Value |
|---|---|
| Incident ID | `<<FILL>>` |
| Detected | 2026-05-31 (P0 review) |
| Reported internally to | `<<FILL>>` |
| Closed (technical) | migration 16 live — `<<FILL: confirm date>>` |
| Outcome / decision | `<<FILL>>` |
