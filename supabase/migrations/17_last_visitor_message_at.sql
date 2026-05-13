-- Source of truth for visitor inactivity (used by lazy auto-close).
-- Separate from updated_at, which is touched by admin replies and metadata changes.

ALTER TABLE chat_conversations
  ADD COLUMN IF NOT EXISTS last_visitor_message_at TIMESTAMPTZ;

-- Backfill: the latest VISITOR-sender message timestamp per conversation.
-- We deliberately do NOT fall back to updated_at, because admin replies may have moved it.
UPDATE chat_conversations c
SET last_visitor_message_at = (
  SELECT MAX(m.created_at)
  FROM chat_messages m
  WHERE m.conversation_id = c.id AND m.sender = 'visitor'
)
WHERE last_visitor_message_at IS NULL;

-- For conversations with no visitor messages yet (edge case), use created_at.
UPDATE chat_conversations
SET last_visitor_message_at = created_at
WHERE last_visitor_message_at IS NULL;

-- Defaults + NOT NULL going forward.
ALTER TABLE chat_conversations
  ALTER COLUMN last_visitor_message_at SET DEFAULT now(),
  ALTER COLUMN last_visitor_message_at SET NOT NULL;

-- Index for fast stale lookup by visitor on incoming message.
CREATE INDEX IF NOT EXISTS idx_chat_conversations_last_visitor_msg
  ON chat_conversations(visitor_short_id, last_visitor_message_at DESC)
  WHERE status = 'open';
