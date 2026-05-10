'use client'

import { useState } from 'react'

type Referral = {
  id: string
  referrer_code: string
  referee_email: string | null
  referee_business: string | null
  status: string
  credited_at: string | null
  created_at: string
}

export function ReferralAdminDashboard({
  referralLink,
  referrals,
  creditedCount,
}: {
  referralLink: string
  referrals: Referral[]
  creditedCount: number
}) {
  const [copied, setCopied] = useState(false)

  function copy() {
    navigator.clipboard.writeText(referralLink)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const waText = encodeURIComponent(
    `I manage my rental bookings with RentalOS — it's saved me hours every week. Try it free: ${referralLink}`
  )
  const mailtoLink = `mailto:?subject=Try RentalOS&body=${encodeURIComponent(
    `Hi,\n\nI manage my rental business with RentalOS — it handles all our bookings automatically.\n\nYou can start a free trial here: ${referralLink}\n\nWhen you subscribe, we both get one month free.`
  )}`

  const actualReferrals = referrals.filter(r => r.referee_email || r.referee_business)

  return (
    <div className="min-h-screen bg-black py-24">
      <div className="mx-auto max-w-2xl px-6">
        <p className="font-sans text-xs uppercase tracking-[0.2em] text-gold mb-3">Referral program</p>
        <h1 className="font-display text-4xl font-light text-white mb-4 tracking-tight">Your referral link.</h1>
        <p className="font-sans text-sm text-muted mb-10">
          Refer a rental business. When they subscribe, you both get one month free.
        </p>

        {/* Link display */}
        <div className="mb-8">
          <p className="font-sans text-[10px] uppercase tracking-[0.2em] text-muted mb-2">Your unique link</p>
          <div className="flex gap-2">
            <input
              readOnly
              value={referralLink}
              className="flex-1 min-h-[48px] rounded-md border border-white/10 bg-white/5 px-4
                font-sans text-sm text-gold font-mono focus:outline-none"
            />
            <button
              onClick={copy}
              className="min-h-[48px] px-5 rounded-md border border-gold/30 font-sans text-xs
                text-gold hover:bg-gold hover:text-black transition-colors whitespace-nowrap"
            >
              {copied ? 'Copied' : 'Copy link'}
            </button>
          </div>
        </div>

        {/* Share buttons */}
        <div className="flex flex-wrap gap-3 mb-12">
          <a
            href={`https://wa.me/?text=${waText}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 min-h-[40px] rounded-md bg-whatsapp px-5
              font-sans text-xs font-medium text-white hover:opacity-90 transition-opacity"
          >
            Share on WhatsApp
          </a>
          <a
            href={mailtoLink}
            className="inline-flex items-center gap-2 min-h-[40px] rounded-md border border-white/10 px-5
              font-sans text-xs text-white hover:border-white/20 transition-colors"
          >
            Share by email
          </a>
        </div>

        {/* Stats */}
        <div className="flex items-stretch divide-x divide-border mb-12">
          <div className="pr-8">
            <p className="font-sans text-[10px] uppercase tracking-[0.2em] text-muted mb-1.5">Referred</p>
            <p className="font-sans text-2xl font-medium text-white">{actualReferrals.length}</p>
          </div>
          <div className="pl-8">
            <p className="font-sans text-[10px] uppercase tracking-[0.2em] text-muted mb-1.5">Credits earned</p>
            <p className="font-sans text-2xl font-medium text-white">
              {creditedCount > 0 ? `${creditedCount} month${creditedCount !== 1 ? 's' : ''} free` : '—'}
            </p>
          </div>
        </div>

        {/* Referrals table */}
        {actualReferrals.length > 0 && (
          <div>
            <p className="font-sans text-[10px] uppercase tracking-[0.2em] text-muted mb-4">Referrals</p>
            <div className="divide-y divide-border">
              {actualReferrals.map(r => (
                <div key={r.id} className="flex items-center justify-between py-3 gap-4">
                  <div>
                    <p className="font-sans text-sm text-white">{r.referee_business ?? r.referee_email ?? 'Unknown'}</p>
                    <p className="font-sans text-xs text-muted mt-0.5">{r.referee_email}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className={`inline-block rounded-sm px-2 py-0.5 font-sans text-[10px] uppercase tracking-[0.1em] ${
                      r.status === 'credited'
                        ? 'border border-gold/30 bg-gold/10 text-gold'
                        : 'border border-border text-muted'
                    }`}>
                      {r.status === 'pending' ? 'Shared' : r.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {actualReferrals.length === 0 && (
          <div className="rounded-md border border-dashed border-border/40 p-8 text-center">
            <p className="font-sans text-sm text-muted">No referrals yet. Share your link above.</p>
          </div>
        )}
      </div>
    </div>
  )
}
