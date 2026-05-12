-- Visitor identity (display name + short ID) and last-sender tracking for admin filters

ALTER TABLE chat_conversations
  ADD COLUMN IF NOT EXISTS visitor_short_id text,
  ADD COLUMN IF NOT EXISTS last_message_sender text;

ALTER TABLE chat_conversations
  DROP CONSTRAINT IF EXISTS chat_conversations_last_message_sender_check;

ALTER TABLE chat_conversations
  ADD CONSTRAINT chat_conversations_last_message_sender_check
    CHECK (last_message_sender IN ('visitor', 'admin') OR last_message_sender IS NULL);

CREATE INDEX IF NOT EXISTS idx_chat_conversations_last_sender
  ON chat_conversations(last_message_sender);

CREATE INDEX IF NOT EXISTS idx_chat_conversations_short_id
  ON chat_conversations(visitor_short_id);

-- Backfill last_message_sender for existing conversations
UPDATE chat_conversations c
SET last_message_sender = sub.sender
FROM (
  SELECT DISTINCT ON (conversation_id) conversation_id, sender
  FROM chat_messages
  ORDER BY conversation_id, created_at DESC
) sub
WHERE c.id = sub.conversation_id
  AND c.last_message_sender IS NULL;
