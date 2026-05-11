-- In-app chat: conversations and messages
CREATE TABLE IF NOT EXISTS chat_conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id text NOT NULL UNIQUE,
  visitor_name text,
  visitor_email text,
  status text DEFAULT 'open' CHECK (status IN ('open', 'closed')),
  unread_admin integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS chat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL REFERENCES chat_conversations(id) ON DELETE CASCADE,
  sender text NOT NULL CHECK (sender IN ('visitor', 'admin')),
  body text NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_chat_messages_conversation ON chat_messages(conversation_id, created_at);
CREATE INDEX IF NOT EXISTS idx_chat_conversations_updated ON chat_conversations(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_chat_conversations_session ON chat_conversations(session_id);

-- Enable Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE chat_conversations;
ALTER PUBLICATION supabase_realtime ADD TABLE chat_messages;

-- RLS
ALTER TABLE chat_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- Anon can SELECT (UUIDs are unguessable; all writes go through API routes using service role)
CREATE POLICY "anon_select_conversations" ON chat_conversations FOR SELECT TO anon USING (true);
CREATE POLICY "anon_select_messages" ON chat_messages FOR SELECT TO anon USING (true);

-- Authenticated users (admins logged into Supabase Auth) have full access
CREATE POLICY "auth_all_conversations" ON chat_conversations FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth_all_messages" ON chat_messages FOR ALL TO authenticated USING (true) WITH CHECK (true);
