-- Chat auto-close: closed_at timestamp, system-sender for "Chat closed" line,
-- and a partial unique index that enforces "one open conversation per visitor".

ALTER TABLE chat_conversations
  ADD COLUMN IF NOT EXISTS closed_at timestamptz;

-- Allow 'system' sender for events like "Chat closed".
ALTER TABLE chat_messages
  DROP CONSTRAINT IF EXISTS chat_messages_sender_check;

ALTER TABLE chat_messages
  ADD CONSTRAINT chat_messages_sender_check
    CHECK (sender IN ('visitor', 'admin', 'system'));

-- Race-safe: at most one open conversation per visitor_short_id.
-- NULL visitor_short_id (legacy fallback rows pre-PR-#5) is exempt.
CREATE UNIQUE INDEX IF NOT EXISTS one_open_per_visitor
  ON chat_conversations(visitor_short_id)
  WHERE status = 'open' AND visitor_short_id IS NOT NULL;

-- Closed-tab sort: closed_at DESC.
CREATE INDEX IF NOT EXISTS idx_chat_conversations_closed_at
  ON chat_conversations(closed_at DESC)
  WHERE status = 'closed';

-- Backfill closed_at for any existing closed conversations.
UPDATE chat_conversations
SET closed_at = updated_at
WHERE status = 'closed' AND closed_at IS NULL;
