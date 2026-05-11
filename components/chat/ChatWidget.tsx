'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@supabase/supabase-js'
import { MessageCircle, X, Send, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

type Message = {
  id: string
  sender: 'visitor' | 'admin'
  body: string
  created_at: string
}

const SESSION_KEY = 'chat_session_id'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export function ChatWidget() {
  const [open, setOpen] = useState(false)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [conversationId, setConversationId] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const [loading, setLoading] = useState(false)
  const [unread, setUnread] = useState(0)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const loadedRef = useRef(false)

  useEffect(() => {
    const stored = localStorage.getItem(SESSION_KEY)
    if (stored) setSessionId(stored)
  }, [])

  useEffect(() => {
    const handler = () => setOpen(true)
    window.addEventListener('open-chat', handler)
    return () => window.removeEventListener('open-chat', handler)
  }, [])

  useEffect(() => {
    if (open && sessionId && !loadedRef.current) {
      loadedRef.current = true
      loadConversation(sessionId)
    }
    if (open) {
      setUnread(0)
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [open, sessionId])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    if (!conversationId) return
    const channel = supabase
      .channel(`chat:${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          const msg = payload.new as Message
          if (msg.sender === 'admin') {
            setMessages((prev) => [...prev, msg])
            if (!open) setUnread((n) => n + 1)
          }
        }
      )
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [conversationId, open])

  async function loadConversation(sid: string) {
    setLoading(true)
    try {
      const res = await fetch(`/api/chat/conversation/${sid}`)
      if (res.ok) {
        const data = await res.json()
        setConversationId(data.conversation_id)
        setMessages(data.messages ?? [])
      }
    } finally {
      setLoading(false)
    }
  }

  async function sendMessage() {
    const text = input.trim()
    if (!text || sending) return
    setSending(true)
    setInput('')

    try {
      let sid = sessionId
      let cid = conversationId

      if (!sid) {
        const res = await fetch('/api/chat/conversation', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({}),
        })
        if (!res.ok) { setSending(false); return }
        const data = await res.json()
        sid = data.session_id as string
        cid = data.conversation_id as string
        localStorage.setItem(SESSION_KEY, sid)
        setSessionId(sid)
        setConversationId(cid)
        loadedRef.current = true
      }

      const optimistic: Message = {
        id: `temp-${Date.now()}`,
        sender: 'visitor',
        body: text,
        created_at: new Date().toISOString(),
      }
      setMessages((prev) => [...prev, optimistic])

      await fetch('/api/chat/message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session_id: sid, body: text }),
      })
    } finally {
      setSending(false)
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      void sendMessage()
    }
  }

  return (
    <>
      {open && (
        <div className="fixed bottom-20 right-4 z-50 flex w-[360px] max-w-[calc(100vw-2rem)] flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-2xl">
          <div className="flex items-center justify-between bg-gray-900 px-4 py-3">
            <div className="flex items-center gap-2.5">
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              <span className="font-sans text-sm font-medium text-white">Chat with us</span>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="text-white/50 transition-colors hover:text-white"
              aria-label="Close chat"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="flex min-h-[320px] max-h-[400px] flex-col gap-2 overflow-y-auto bg-gray-50 p-4">
            {loading && (
              <p className="py-8 text-center font-sans text-xs text-muted">Loading…</p>
            )}
            {!loading && messages.length === 0 && (
              <div className="flex h-full flex-col items-center justify-center gap-3 py-10">
                <MessageCircle className="h-8 w-8 text-gray-300" />
                <p className="text-center font-sans text-xs text-muted">
                  Send us a message and we&apos;ll reply shortly.
                </p>
              </div>
            )}
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={cn('flex', msg.sender === 'visitor' ? 'justify-end' : 'justify-start')}
              >
                <div
                  className={cn(
                    'max-w-[80%] rounded-lg px-3 py-2 font-sans text-sm leading-relaxed',
                    msg.sender === 'visitor'
                      ? 'bg-gray-900 text-white'
                      : 'border border-gray-200 bg-white text-gray-800'
                  )}
                >
                  {msg.body}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          <div className="flex items-end gap-2 border-t border-gray-200 bg-white px-3 py-2">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              rows={1}
              placeholder="Type a message…"
              className="max-h-24 flex-1 resize-none py-2 font-sans text-sm leading-relaxed outline-none placeholder:text-gray-400"
            />
            <button
              onClick={() => void sendMessage()}
              disabled={!input.trim() || sending}
              className="mb-1.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-gray-900 text-white transition-opacity disabled:opacity-40"
              aria-label="Send"
            >
              <Send className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}

      <button
        onClick={() => setOpen((o) => !o)}
        className="fixed bottom-4 right-4 z-50 flex h-12 w-12 items-center justify-center rounded-full bg-gray-900 text-white shadow-lg transition-transform hover:scale-105 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-900 focus-visible:ring-offset-2"
        aria-label={open ? 'Close chat' : 'Open chat'}
      >
        {open ? (
          <ChevronDown className="h-5 w-5" />
        ) : (
          <span className="relative">
            <MessageCircle className="h-5 w-5" />
            {unread > 0 && (
              <span className="absolute -right-1.5 -top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-gold text-[10px] font-bold text-white">
                {unread > 9 ? '9+' : unread}
              </span>
            )}
          </span>
        )}
      </button>
    </>
  )
}
