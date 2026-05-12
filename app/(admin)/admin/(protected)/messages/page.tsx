'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { createClient } from '@supabase/supabase-js'
import { cn } from '@/lib/utils'
import { Send, CheckCheck, XCircle, MessageCircle } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { toast } from 'sonner'

type Conversation = {
  id: string
  session_id: string
  visitor_name: string | null
  visitor_email: string | null
  status: 'open' | 'closed'
  unread_admin: number
  created_at: string
  updated_at: string
}

type Message = {
  id: string
  sender: 'visitor' | 'admin'
  body: string
  created_at: string
}

const supabase = process.env.NEXT_PUBLIC_SUPABASE_URL
  ? createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
  : null

export default function MessagesPage() {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [reply, setReply] = useState('')
  const [sending, setSending] = useState(false)
  const [loadingMsgs, setLoadingMsgs] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const replyRef = useRef<HTMLTextAreaElement>(null)
  const selectedIdRef = useRef<string | null>(null)
  const conversationsRef = useRef<Conversation[]>([])

  const selectedConv = conversations.find((c) => c.id === selectedId) ?? null

  useEffect(() => { selectedIdRef.current = selectedId }, [selectedId])
  useEffect(() => { conversationsRef.current = conversations }, [conversations])

  const loadConversations = useCallback(async () => {
    const res = await fetch('/api/admin/chat/conversations')
    if (res.ok) {
      const data = await res.json()
      setConversations(data.conversations ?? [])
    }
  }, [])

  useEffect(() => {
    loadConversations()

    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission()
    }

    if (!supabase) return

    const channel = supabase
      .channel('admin-chat')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'chat_messages' },
        (payload) => {
          const msg = payload.new as Message & { conversation_id: string }
          setConversations((prev) =>
            prev.map((c) =>
              c.id === msg.conversation_id && msg.sender === 'visitor'
                ? { ...c, unread_admin: c.unread_admin + 1, updated_at: msg.created_at }
                : c.id === msg.conversation_id
                ? { ...c, updated_at: msg.created_at }
                : c
            ).sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
          )
          if (msg.conversation_id === selectedIdRef.current) {
            setMessages((prev) => [...prev, msg])
          }
          if (msg.sender === 'visitor') {
            const conv = conversationsRef.current.find(c => c.id === msg.conversation_id)
            const name = conv?.visitor_name || 'Visitor'
            toast(`${name}: ${msg.body.slice(0, 60)}`, { description: 'New chat message' })
            if (
              document.hidden &&
              'Notification' in window &&
              Notification.permission === 'granted'
            ) {
              new Notification('New chat message', { body: msg.body.slice(0, 80) })
            }
          }
        }
      )
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'chat_conversations' },
        () => { loadConversations() }
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [loadConversations])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function selectConversation(conv: Conversation) {
    setSelectedId(conv.id)
    setMessages([])
    setLoadingMsgs(true)
    try {
      const res = await fetch(`/api/chat/conversation/${conv.session_id}`)
      if (res.ok) {
        const data = await res.json()
        setMessages(data.messages ?? [])
      }
    } finally {
      setLoadingMsgs(false)
    }
    if (conv.unread_admin > 0) {
      await fetch(`/api/admin/chat/conversation/${conv.id}/read`, { method: 'PATCH' })
      setConversations((prev) =>
        prev.map((c) => (c.id === conv.id ? { ...c, unread_admin: 0 } : c))
      )
    }
    setTimeout(() => replyRef.current?.focus(), 50)
  }

  async function sendReply() {
    const text = reply.trim()
    if (!text || !selectedId || sending) return
    setSending(true)
    setReply('')
    try {
      const res = await fetch('/api/admin/chat/message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ conversation_id: selectedId, body: text }),
      })
      if (res.ok) {
        const msg = await res.json() as Message
        setMessages((prev) => [...prev, msg])
      }
    } finally {
      setSending(false)
    }
  }

  async function toggleStatus() {
    if (!selectedId || !selectedConv) return
    const next = selectedConv.status === 'open' ? 'closed' : 'open'
    await fetch(`/api/admin/chat/conversation/${selectedId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: next }),
    })
    setConversations((prev) =>
      prev.map((c) => (c.id === selectedId ? { ...c, status: next } : c))
    )
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      void sendReply()
    }
  }

  const totalUnread = conversations.reduce((sum, c) => sum + (c.unread_admin ?? 0), 0)

  return (
    <div className="mx-auto max-w-5xl px-4 py-6">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="font-sans text-sm font-medium text-white">
          Messages
          {totalUnread > 0 && (
            <span className="ml-2 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-gold px-1 font-sans text-[10px] font-bold text-white">
              {totalUnread}
            </span>
          )}
        </h1>
      </div>

      <div className="flex h-[calc(100vh-13rem)] overflow-hidden rounded-lg border border-border">
        {/* Conversation list */}
        <div className="w-72 flex-shrink-0 overflow-y-auto border-r border-border bg-graphite/50">
          {conversations.length === 0 && (
            <div className="flex flex-col items-center justify-center gap-3 py-16 px-4">
              <MessageCircle className="h-8 w-8 text-muted/30" />
              <p className="text-center font-sans text-xs text-muted">No conversations yet</p>
            </div>
          )}
          {conversations.map((conv) => (
            <button
              key={conv.id}
              onClick={() => void selectConversation(conv)}
              className={cn(
                'w-full border-b border-border px-4 py-3.5 text-left transition-colors',
                selectedId === conv.id
                  ? 'bg-graphite text-white'
                  : 'hover:bg-graphite/80'
              )}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="truncate font-sans text-sm font-medium text-white">
                  {conv.visitor_name || 'Visitor'}
                </span>
                <div className="flex flex-shrink-0 items-center gap-1.5">
                  {conv.status === 'closed' && (
                    <span className="font-sans text-[10px] uppercase tracking-wide text-muted">closed</span>
                  )}
                  {conv.unread_admin > 0 && (
                    <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-gold px-1 font-sans text-[10px] font-bold text-white">
                      {conv.unread_admin}
                    </span>
                  )}
                </div>
              </div>
              {conv.visitor_email && (
                <p className="mt-0.5 truncate font-sans text-xs text-muted">{conv.visitor_email}</p>
              )}
              <p className="mt-1 font-sans text-[10px] text-muted/50">
                {formatDistanceToNow(new Date(conv.updated_at), { addSuffix: true })}
              </p>
            </button>
          ))}
        </div>

        {/* Message thread */}
        <div className="flex flex-1 flex-col overflow-hidden bg-black">
          {!selectedId && (
            <div className="flex flex-1 flex-col items-center justify-center gap-2">
              <MessageCircle className="h-10 w-10 text-muted/20" />
              <p className="font-sans text-sm text-muted">Select a conversation</p>
            </div>
          )}

          {selectedId && (
            <>
              {/* Thread header */}
              <div className="flex items-center justify-between border-b border-border px-4 py-3">
                <div>
                  <p className="font-sans text-sm font-medium text-white">
                    {selectedConv?.visitor_name || 'Visitor'}
                  </p>
                  {selectedConv?.visitor_email && (
                    <p className="font-sans text-xs text-muted">{selectedConv.visitor_email}</p>
                  )}
                </div>
                <button
                  onClick={() => void toggleStatus()}
                  className={cn(
                    'flex items-center gap-1.5 rounded-md border px-3 py-1.5 font-sans text-xs transition-colors',
                    selectedConv?.status === 'open'
                      ? 'border-border text-muted hover:border-red-500/40 hover:text-red-400'
                      : 'border-border text-muted hover:border-gold/40 hover:text-gold'
                  )}
                >
                  {selectedConv?.status === 'open' ? (
                    <><XCircle className="h-3.5 w-3.5" /> Close</>
                  ) : (
                    <><CheckCheck className="h-3.5 w-3.5" /> Reopen</>
                  )}
                </button>
              </div>

              {/* Messages */}
              <div className="flex flex-1 flex-col gap-3 overflow-y-auto p-4">
                {loadingMsgs && (
                  <p className="py-8 text-center font-sans text-xs text-muted">Loading…</p>
                )}
                {!loadingMsgs && messages.length === 0 && (
                  <p className="py-8 text-center font-sans text-xs text-muted">No messages yet</p>
                )}
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={cn('flex', msg.sender === 'admin' ? 'justify-end' : 'justify-start')}
                  >
                    <div className="flex flex-col gap-1">
                      <div
                        className={cn(
                          'max-w-[75%] rounded-lg px-3 py-2 font-sans text-sm leading-relaxed',
                          msg.sender === 'admin'
                            ? 'bg-gold text-white'
                            : 'border border-border bg-graphite text-white'
                        )}
                      >
                        {msg.body}
                      </div>
                      <p className={cn(
                        'font-sans text-[10px] text-muted/50',
                        msg.sender === 'admin' ? 'text-right' : 'text-left'
                      )}>
                        {formatDistanceToNow(new Date(msg.created_at), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Reply input */}
              {selectedConv?.status === 'open' && (
                <div className="flex items-end gap-2 border-t border-border px-4 py-3">
                  <textarea
                    ref={replyRef}
                    value={reply}
                    onChange={(e) => setReply(e.target.value)}
                    onKeyDown={handleKeyDown}
                    rows={1}
                    placeholder="Reply…"
                    className="max-h-32 flex-1 resize-none rounded-md border border-border bg-graphite/50 px-3 py-2 font-sans text-sm text-white outline-none placeholder:text-muted focus:border-gold/50"
                  />
                  <button
                    onClick={() => void sendReply()}
                    disabled={!reply.trim() || sending}
                    className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-md bg-gold text-white disabled:opacity-40 transition-opacity"
                    aria-label="Send reply"
                  >
                    <Send className="h-4 w-4" />
                  </button>
                </div>
              )}
              {selectedConv?.status === 'closed' && (
                <div className="border-t border-border px-4 py-3">
                  <p className="font-sans text-xs text-muted text-center">
                    Conversation closed.{' '}
                    <button onClick={() => void toggleStatus()} className="text-gold hover:underline">
                      Reopen
                    </button>
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
