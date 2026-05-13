'use client'

import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'
import { cn } from '@/lib/utils'
import { Send, XCircle, MessageCircle } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { toast } from 'sonner'

type Conversation = {
  id: string
  session_id: string
  visitor_name: string | null
  visitor_short_id: string | null
  visitor_email: string | null
  status: 'open' | 'closed'
  unread_admin: number
  last_message_sender: 'visitor' | 'admin' | null
  created_at: string
  updated_at: string
  closed_at: string | null
}

type Message = {
  id: string
  sender: 'visitor' | 'admin' | 'system'
  body: string
  created_at: string
}

type AnswerFilter = 'all' | 'unanswered' | 'answered'
type StatusTab = 'open' | 'closed'

const supabase = process.env.NEXT_PUBLIC_SUPABASE_URL
  ? createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
  : null

function visitorLabel(c: Pick<Conversation, 'visitor_name' | 'visitor_short_id'>): string {
  const name = c.visitor_name || 'Visitor'
  return c.visitor_short_id ? `${name} · #V-${c.visitor_short_id}` : name
}

export default function MessagesPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const statusTab: StatusTab = searchParams.get('status') === 'closed' ? 'closed' : 'open'

  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [reply, setReply] = useState('')
  const [sending, setSending] = useState(false)
  const [loadingMsgs, setLoadingMsgs] = useState(false)
  const [answerFilter, setAnswerFilter] = useState<AnswerFilter>('all')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [search, setSearch] = useState('')
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
            prev.map<Conversation>((c) => {
              if (c.id !== msg.conversation_id) return c
              if (msg.sender === 'visitor') {
                return {
                  ...c,
                  unread_admin: c.unread_admin + 1,
                  updated_at: msg.created_at,
                  last_message_sender: 'visitor',
                }
              }
              if (msg.sender === 'admin') {
                return { ...c, updated_at: msg.created_at, last_message_sender: 'admin' }
              }
              // system message: don't change last_message_sender (DB constraint
              // disallows it, and the admin filter ignores system events).
              return { ...c, updated_at: msg.created_at }
            }).sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
          )
          if (msg.conversation_id === selectedIdRef.current) {
            setMessages((prev) => (prev.some((m) => m.id === msg.id) ? prev : [...prev, msg]))
          }
          if (msg.sender === 'visitor') {
            const conv = conversationsRef.current.find((c) => c.id === msg.conversation_id)
            const label = conv ? visitorLabel(conv) : 'Visitor'
            toast(`${label}: ${msg.body.slice(0, 60)}`, { description: 'New chat message' })
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
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'chat_conversations' },
        (payload) => {
          const next = payload.new as Conversation
          setConversations((prev) => {
            const exists = prev.some((c) => c.id === next.id)
            if (!exists) return prev
            return prev
              .map((c) => (c.id === next.id ? { ...c, ...next } : c))
              .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
          })
        }
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [loadConversations])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'auto', block: 'end' })
  }, [messages])

  const openCount = useMemo(
    () => conversations.filter((c) => c.status === 'open').length,
    [conversations]
  )
  const closedCount = useMemo(
    () => conversations.filter((c) => c.status === 'closed').length,
    [conversations]
  )

  const filteredConversations = useMemo(() => {
    const fromTs = dateFrom ? new Date(dateFrom).getTime() : null
    const toTs = dateTo ? new Date(dateTo + 'T23:59:59').getTime() : null
    const q = search.trim().toLowerCase()

    const base = conversations.filter((c) => {
      if (c.status !== statusTab) return false
      if (answerFilter === 'unanswered' && c.last_message_sender !== 'visitor') return false
      if (answerFilter === 'answered' && c.last_message_sender !== 'admin') return false
      const ts = new Date(c.updated_at).getTime()
      if (fromTs !== null && ts < fromTs) return false
      if (toTs !== null && ts > toTs) return false
      if (q) {
        const name = (c.visitor_name ?? '').toLowerCase()
        const email = (c.visitor_email ?? '').toLowerCase()
        const sid = (c.visitor_short_id ?? '').toLowerCase()
        if (!name.includes(q) && !email.includes(q) && !sid.includes(q)) return false
      }
      return true
    })

    if (statusTab === 'closed') {
      return base.sort((a, b) => {
        const at = a.closed_at ? new Date(a.closed_at).getTime() : 0
        const bt = b.closed_at ? new Date(b.closed_at).getTime() : 0
        return bt - at
      })
    }
    return base
  }, [conversations, statusTab, answerFilter, dateFrom, dateTo, search])

  const unansweredCount = useMemo(
    () =>
      conversations.filter(
        (c) => c.status === 'open' && c.last_message_sender === 'visitor'
      ).length,
    [conversations]
  )

  function setStatusTab(next: StatusTab) {
    const params = new URLSearchParams(searchParams.toString())
    if (next === 'open') params.delete('status')
    else params.set('status', 'closed')
    router.replace(`?${params.toString()}`, { scroll: false })
    setSelectedId(null)
    setMessages([])
  }

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
        setMessages((prev) => (prev.some((m) => m.id === msg.id) ? prev : [...prev, msg]))
        setConversations((prev) =>
          prev.map<Conversation>((c) =>
            c.id === selectedId
              ? { ...c, last_message_sender: 'admin', updated_at: msg.created_at }
              : c
          )
        )
      }
    } finally {
      setSending(false)
    }
  }

  async function closeConversation() {
    if (!selectedId || !selectedConv || selectedConv.status !== 'open') return
    const res = await fetch(`/api/admin/chat/conversation/${selectedId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'closed' }),
    })
    if (!res.ok) {
      toast.error('Failed to close conversation')
      return
    }
    const closedAt = new Date().toISOString()
    setConversations((prev) =>
      prev.map((c) => (c.id === selectedId ? { ...c, status: 'closed', closed_at: closedAt } : c))
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

      {/* Status tabs */}
      <div className="mb-3 flex items-center gap-1 border-b border-border">
        {(['open', 'closed'] as const).map((tab) => {
          const count = tab === 'open' ? openCount : closedCount
          const active = statusTab === tab
          return (
            <button
              key={tab}
              onClick={() => setStatusTab(tab)}
              className={cn(
                '-mb-px border-b-2 px-4 py-2 font-sans text-sm capitalize transition-colors',
                active
                  ? 'border-gold text-white'
                  : 'border-transparent text-muted hover:text-white'
              )}
            >
              {tab}
              <span className="ml-1.5 font-sans text-[11px] opacity-70">({count})</span>
            </button>
          )
        })}
      </div>

      {/* Filter bar */}
      <div className="mb-3 flex flex-wrap items-center gap-3">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search name, email, or visitor ID"
          className="w-64 rounded-md border border-border bg-graphite/30 px-3 py-1.5 font-sans text-xs text-white outline-none placeholder:text-muted focus:border-gold/50"
        />
        <div className="flex items-center gap-1 rounded-md border border-border bg-graphite/30 p-0.5">
          {(['all', 'unanswered', 'answered'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setAnswerFilter(f)}
              className={cn(
                'rounded px-3 py-1 font-sans text-xs capitalize transition-colors',
                answerFilter === f
                  ? 'bg-gold text-white'
                  : 'text-muted hover:text-white'
              )}
            >
              {f}
              {f === 'unanswered' && unansweredCount > 0 && (
                <span className="ml-1.5 text-[10px] opacity-70">({unansweredCount})</span>
              )}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <label className="font-sans text-[10px] uppercase tracking-wide text-muted">From</label>
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="rounded-md border border-border bg-graphite/30 px-2 py-1 font-sans text-xs text-white outline-none focus:border-gold/50"
          />
          <label className="font-sans text-[10px] uppercase tracking-wide text-muted">To</label>
          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="rounded-md border border-border bg-graphite/30 px-2 py-1 font-sans text-xs text-white outline-none focus:border-gold/50"
          />
          {(dateFrom || dateTo) && (
            <button
              onClick={() => { setDateFrom(''); setDateTo('') }}
              className="font-sans text-[10px] text-muted hover:text-white"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      <div className="flex h-[calc(100vh-18rem)] overflow-hidden rounded-lg border border-border">
        {/* Conversation list */}
        <div className="w-72 flex-shrink-0 overflow-y-auto border-r border-border bg-graphite/50">
          {filteredConversations.length === 0 && (
            <div className="flex flex-col items-center justify-center gap-3 py-16 px-4">
              <MessageCircle className="h-8 w-8 text-muted/30" />
              <p className="text-center font-sans text-xs text-muted">
                {conversations.length === 0
                  ? 'No conversations yet'
                  : statusTab === 'closed'
                    ? 'No closed conversations match these filters'
                    : 'No conversations match these filters'}
              </p>
            </div>
          )}
          {filteredConversations.map((conv) => (
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
                  {conv.unread_admin > 0 && (
                    <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-gold px-1 font-sans text-[10px] font-bold text-white">
                      {conv.unread_admin}
                    </span>
                  )}
                </div>
              </div>
              {conv.visitor_short_id && (
                <p className="mt-0.5 font-mono text-[10px] text-gold/70">#V-{conv.visitor_short_id}</p>
              )}
              {conv.visitor_email && (
                <p className="mt-0.5 truncate font-sans text-xs text-muted">{conv.visitor_email}</p>
              )}
              <p className="mt-1 font-sans text-[10px] text-muted/50">
                {conv.status === 'closed' && conv.closed_at
                  ? `Closed ${formatDistanceToNow(new Date(conv.closed_at), { addSuffix: true })}`
                  : formatDistanceToNow(new Date(conv.updated_at), { addSuffix: true })}
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
                    {selectedConv?.visitor_short_id && (
                      <span className="ml-2 font-mono text-xs text-gold/70">#V-{selectedConv.visitor_short_id}</span>
                    )}
                  </p>
                  {selectedConv?.visitor_email && (
                    <p className="font-sans text-xs text-muted">{selectedConv.visitor_email}</p>
                  )}
                </div>
                {selectedConv?.status === 'open' && (
                  <button
                    onClick={() => void closeConversation()}
                    className="flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 font-sans text-xs text-muted transition-colors hover:border-red-500/40 hover:text-red-400"
                  >
                    <XCircle className="h-3.5 w-3.5" /> Close
                  </button>
                )}
              </div>

              {/* Messages */}
              <div className="flex flex-1 flex-col gap-3 overflow-y-auto p-4">
                {loadingMsgs && (
                  <p className="py-8 text-center font-sans text-xs text-muted">Loading…</p>
                )}
                {!loadingMsgs && messages.length === 0 && (
                  <p className="py-8 text-center font-sans text-xs text-muted">No messages yet</p>
                )}
                {messages.map((msg) => {
                  if (msg.sender === 'system') {
                    return (
                      <div key={msg.id} className="flex justify-center">
                        <p className="font-sans text-[10px] uppercase tracking-wide text-muted/60">
                          {msg.body}
                        </p>
                      </div>
                    )
                  }
                  return (
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
                  )
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Reply input — only when open */}
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
                    Conversation closed.
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
