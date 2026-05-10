export const dynamic = 'force-dynamic'

import { supabaseAdmin } from '@/lib/supabase'
import { AddonsSection } from './AddonsSection'

const STRIPE_CONFIGURED = !!process.env.STRIPE_SECRET_KEY
const TWILIO_CONFIGURED = !!process.env.TWILIO_ACCOUNT_SID

type Subscription = {
  id: string
  plan: string | null
  status: string
  trial_ends_at: string | null
  current_period_end: string | null
  stripe_customer_id: string | null
  stripe_subscription_id: string | null
}

async function getSubscription(): Promise<Subscription | null> {
  const { data } = await supabaseAdmin
    .from('subscriptions')
    .select('*')
    .single()
  return data ?? null
}

async function getInvoices(customerId: string | null): Promise<Array<{
  id: string
  amount: number
  status: string
  date: string
  url: string | null
}>> {
  if (!customerId || !STRIPE_CONFIGURED) return []
  try {
    const Stripe = (await import('stripe')).default
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)
    const invoices = await stripe.invoices.list({ customer: customerId, limit: 5 })
    return invoices.data.map((inv) => ({
      id: inv.id,
      amount: inv.amount_paid / 100,
      status: inv.status ?? 'unknown',
      date: new Date(inv.created * 1000).toLocaleDateString('en-GB', {
        day: 'numeric', month: 'short', year: 'numeric',
      }),
      url: inv.hosted_invoice_url ?? null,
    }))
  } catch {
    return []
  }
}

function daysUntil(isoDate: string | null): number | null {
  if (!isoDate) return null
  const diff = new Date(isoDate).getTime() - Date.now()
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)))
}

function PlanBadge({ plan, status }: { plan: string | null; status: string }) {
  const label = plan
    ? `${plan.replace('_', ' ')} — ${status}`
    : status
  return (
    <span className="rounded-sm border border-gold/30 bg-gold/10 px-2.5 py-1 font-sans text-xs uppercase tracking-[0.1em] text-gold">
      {label}
    </span>
  )
}

export default async function BillingPage() {
  if (!STRIPE_CONFIGURED) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-6">
        <h1 className="font-display text-2xl font-medium text-white mb-6">Billing</h1>
        <div className="rounded-md border border-border bg-graphite/30 p-6">
          <p className="font-sans text-sm font-medium text-white mb-2">Billing not configured yet</p>
          <p className="font-sans text-sm leading-relaxed text-muted mb-4">
            Add your Stripe keys to enable subscription billing. All features remain available while unconfigured.
          </p>
          <div className="rounded-md border border-border bg-black/40 p-4 font-mono text-xs text-muted space-y-1">
            <p>STRIPE_SECRET_KEY — from Stripe Dashboard → API keys</p>
            <p>STRIPE_WEBHOOK_SECRET — from Stripe Dashboard → Webhooks</p>
            <p>STRIPE_STARTER_PRICE_ID — price_...</p>
            <p>STRIPE_PRO_PRICE_ID — price_...</p>
            <p>NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY — from Stripe Dashboard → API keys</p>
          </div>
          <p className="mt-4 font-sans text-xs text-muted">
            Set these in Vercel → Project → Settings → Environment Variables, then redeploy.
          </p>
        </div>
      </div>
    )
  }

  const subscription = await getSubscription()
  const invoices = await getInvoices(subscription?.stripe_customer_id ?? null)
  const trialDays = daysUntil(subscription?.trial_ends_at ?? null)
  const isTrialing = subscription?.status === 'trialing'
  const isActive = subscription?.status === 'active'
  const hasStripeSubscription = !!subscription?.stripe_subscription_id

  const { data: activeAddons } = await supabaseAdmin
    .from('subscription_addons')
    .select('id, addon_key, status, activated_at')
    .eq('status', 'active')

  const plan = subscription?.plan ?? null
  const addonPlanEligible = plan === 'growth' || plan === 'pro' || plan === 'agency'

  return (
    <div className="mx-auto max-w-5xl px-4 py-6">
      <h1 className="font-display text-2xl font-medium text-white mb-6">Billing</h1>

      {/* Current plan */}
      <div className="rounded-md border border-border bg-graphite/30 p-5 mb-6">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <p className="font-sans text-[10px] uppercase tracking-[0.2em] text-muted mb-2">Current plan</p>
            <PlanBadge plan={subscription?.plan ?? null} status={subscription?.status ?? 'trialing'} />
          </div>
          {hasStripeSubscription && (
            <ManageButton />
          )}
        </div>

        {isTrialing && trialDays !== null && (
          <p className="font-sans text-sm text-muted">
            {trialDays > 0
              ? `Free trial: ${trialDays} day${trialDays !== 1 ? 's' : ''} remaining`
              : 'Free trial has ended. Choose a plan to continue.'}
          </p>
        )}

        {isActive && subscription?.current_period_end && (
          <p className="font-sans text-sm text-muted">
            Renews {new Date(subscription.current_period_end).toLocaleDateString('en-GB', {
              day: 'numeric', month: 'long', year: 'numeric',
            })}
          </p>
        )}
      </div>

      {/* Upgrade options */}
      {!isActive && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 mb-6">
          <UpgradeCard
            name="Starter"
            price="€99/mo"
            features={['Up to 50 bookings/month', '1 vehicle category', 'Email notifications', 'Admin panel']}
            plan="starter"
          />
          <UpgradeCard
            name="Pro"
            price="€199/mo"
            features={['Unlimited bookings', 'Unlimited vehicles', 'Transfer/delivery feature', 'Priority support']}
            plan="pro"
            highlight
          />
        </div>
      )}

      {/* Add-ons */}
      <AddonsSection
        activeAddons={activeAddons ?? []}
        stripeConfigured={STRIPE_CONFIGURED}
        twilioConfigured={TWILIO_CONFIGURED}
        planEligible={addonPlanEligible}
      />

      {/* Invoice history */}
      {invoices.length > 0 && (
        <div className="rounded-md border border-border bg-graphite/30 p-5">
          <p className="font-sans text-[10px] uppercase tracking-[0.2em] text-muted mb-4">
            Payment history
          </p>
          <div className="divide-y divide-border">
            {invoices.map((inv) => (
              <div key={inv.id} className="flex items-center justify-between py-3">
                <div>
                  <p className="font-sans text-sm text-white">€{inv.amount.toFixed(2)}</p>
                  <p className="font-sans text-xs text-muted">{inv.date}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-sans text-xs uppercase tracking-[0.1em] text-muted">
                    {inv.status}
                  </span>
                  {inv.url && (
                    <a
                      href={inv.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-sans text-xs text-gold hover:underline underline-offset-4"
                    >
                      View
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function UpgradeCard({
  name, price, features, plan, highlight,
}: {
  name: string
  price: string
  features: string[]
  plan: 'starter' | 'pro'
  highlight?: boolean
}) {
  return (
    <div className={`rounded-md border p-5 flex flex-col gap-4 ${highlight ? 'border-gold/40 bg-gold/5' : 'border-border bg-black/40'}`}>
      <div>
        <p className="font-sans text-xs uppercase tracking-[0.2em] text-muted">{name}</p>
        <p className="font-display text-2xl font-light text-white mt-1">{price}</p>
      </div>
      <ul className="flex flex-col gap-2">
        {features.map((f) => (
          <li key={f} className="font-sans text-xs text-muted">{f}</li>
        ))}
      </ul>
      <CheckoutButton plan={plan} highlight={highlight} />
    </div>
  )
}

function CheckoutButton({ plan, highlight }: { plan: 'starter' | 'pro'; highlight?: boolean }) {
  return (
    <form action={`/api/billing/create-checkout`} method="POST">
      <input type="hidden" name="plan" value={plan} />
      <button
        type="submit"
        className={`w-full min-h-[40px] rounded-md font-sans text-xs uppercase tracking-[0.1em] transition-colors ${
          highlight
            ? 'bg-gold text-black hover:opacity-90'
            : 'border border-gold/40 text-gold hover:bg-gold hover:text-black'
        }`}
      >
        Start 14-day free trial
      </button>
    </form>
  )
}

function ManageButton() {
  return (
    <a
      href="/api/billing/portal"
      className="min-h-[36px] rounded-md border border-border px-4 font-sans text-xs uppercase tracking-[0.15em] text-muted hover:border-gold/30 hover:text-white transition-colors inline-flex items-center"
    >
      Manage subscription
    </a>
  )
}
