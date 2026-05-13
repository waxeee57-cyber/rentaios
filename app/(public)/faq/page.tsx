import type { Metadata } from 'next'
import { FAQAccordion } from './FAQAccordion'

export const metadata: Metadata = {
  title: 'FAQ',
  description: 'Frequently asked questions about RentalOS — setup, features, billing, and technical details.',
  alternates: { canonical: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://localhost:3000'}/faq` },
}

export const revalidate = 3600

const FAQ_CATEGORIES = [
  {
    title: 'Getting started',
    items: [
      {
        q: 'What do I need to get started?',
        a: 'A Node.js environment, a Supabase account, and a Vercel account. Everything else is included. Deployment takes about 1-2 hours following the guide. Or choose the done-for-you option.',
      },
      {
        q: 'How long does setup take?',
        a: 'Self-hosted: 1-2 hours. Done-for-you: we configure and deploy within 24-48 hours.',
      },
      {
        q: 'Can I use my own domain?',
        a: 'Yes. You connect your domain in Vercel after deploying. The process takes about 10 minutes.',
      },
      {
        q: "What if I'm not technical?",
        a: "Choose the done-for-you plan (€699 one-time). We handle everything — database, domain, email, configuration. You receive your login details within 48 hours.",
      },
      {
        q: 'Is there a free trial?',
        a: 'Yes. 14 days, no credit card required.',
      },
      {
        q: 'What if I set it up and don\'t use it?',
        a: 'The 14-day trial is exactly for this. Set it up, run a test booking, decide if it fits. You pay nothing until day 15. If you don\'t upgrade, you walk away with nothing owed and nothing lost.',
      },
    ],
  },
  {
    title: 'Features',
    items: [
      {
        q: 'Can I manage multiple item types?',
        a: 'Yes. Add cars, yachts, villas, bikes, equipment — any type of rental unit. Each has its own pricing, availability, and photo gallery.',
      },
      {
        q: 'How does the booking flow work?',
        a: 'Customer submits an inquiry with dates and contact details. You receive an email alert. You review and confirm personally. The customer receives a confirmation email with their booking details.',
      },
      {
        q: 'What emails are sent automatically?',
        a: 'Inquiry confirmation to the customer, inquiry alert to you, booking confirmation to the customer, and cancellation notice. All in your brand.',
      },
      {
        q: 'Can customers pay online?',
        a: 'Not by default. Payment is collected in person at pickup — most rental businesses prefer this for high-value transactions. Stripe integration is available for those who want online payment.',
      },
      {
        q: 'How does the transfer and delivery feature work?',
        a: 'Customers can request delivery to a custom address at the time of inquiry. You set the transfer fee in the admin panel before confirming the booking.',
      },
      {
        q: 'Can I set my own cancellation policy?',
        a: 'Yes. Configure your cancellation tiers in Admin → Settings. Choose from flexible, moderate, strict, or define custom terms.',
      },
      {
        q: 'Does it work on mobile?',
        a: 'Yes. The admin panel and the customer-facing site are both designed mobile-first. You can manage your entire business from your phone.',
      },
      {
        q: 'How is this different from generic booking software?',
        a: 'Generic booking platforms are built for any product that can be rented — furniture, equipment, cars, rooms. RentalOS is built specifically for rental businesses where a human confirms every booking: cars, yachts, villas, bikes, equipment, and more. The booking flow, confirmation emails, and admin panel are designed around how these businesses actually operate. You use it as-is.',
      },
      {
        q: 'What if I need a feature that isn\'t included?',
        a: 'Template buyers have the full source code — add whatever you need. SaaS subscribers: email us. We\'re a small team and we build what customers actually use. If multiple people ask for the same thing, it ships.',
      },
    ],
  },
  {
    title: 'Billing',
    items: [
      {
        q: 'How much does it cost?',
        a: 'From €79/month (Starter), or buy the template outright for €499. Done-for-you setup is €699 one-time. See /pricing for full details.',
      },
      {
        q: 'Can I cancel anytime?',
        a: 'Yes. Cancel from Admin → Billing. No questions asked, no notice period.',
      },
      {
        q: 'Do you offer refunds?',
        a: '30-day money-back guarantee on subscriptions. Template sales are final.',
      },
      {
        q: 'What happens when my trial ends?',
        a: "You choose a plan to continue. If you don't, your admin panel is locked but your data is kept for 30 days.",
      },
      {
        q: 'Can I upgrade or downgrade?',
        a: 'Yes, anytime from Admin → Billing. Changes take effect on your next billing cycle.',
      },
    ],
  },
  {
    title: 'Technical',
    items: [
      {
        q: 'What tech stack is it built on?',
        a: 'Next.js App Router, Supabase (PostgreSQL), Resend (email), Vercel (hosting). All open source. No vendor lock-in.',
      },
      {
        q: 'Where is my data stored?',
        a: 'In your own Supabase database. EU region by default. You own the database, not us.',
      },
      {
        q: 'Is it GDPR compliant?',
        a: 'The system is built with GDPR in mind. You are the data controller for your customers. See our Privacy Policy for details.',
      },
      {
        q: 'Can I self-host it?',
        a: 'Yes. Buy the template and deploy wherever you want. The Commercial licence allows commercial use.',
      },
      {
        q: 'Can I buy the source code?',
        a: 'Yes. See /sell. Commercial licence — use it commercially, modify it, resell your work.',
      },
      {
        q: 'Do you offer white-label for agencies?',
        a: 'Yes. The template licence allows you to build and deploy for clients. Contact us for agency pricing on multiple deployments.',
      },
      {
        q: 'Can I see the code before buying?',
        a: 'The demo at /demo runs the exact codebase. For template buyers who want to review the source before purchase, contact us — we\'ll provide read-only GitHub access within 24 hours.',
      },
      {
        q: 'Is my customer data private and secure?',
        a: 'Your customer data lives in your own Supabase database project. We do not have access to it. You are the data controller under GDPR — not us. The system uses Row Level Security on every table, rate limiting on every public endpoint, and no credentials are ever stored in client-side code.',
      },
    ],
  },
]

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: FAQ_CATEGORIES.flatMap(cat =>
    cat.items.map(item => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: { '@type': 'Answer', text: item.a },
    }))
  ),
}

export default function FAQPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <div className="min-h-screen bg-white">
        <section className="bg-white py-24">
          <div className="mx-auto max-w-3xl px-6">
            <p className="font-sans text-xs uppercase tracking-[0.2em] text-gold mb-3">Support</p>
            <h1 className="font-display text-5xl font-bold text-gray-900 tracking-tight">Frequently asked questions.</h1>
          </div>
        </section>
        <section className="bg-gray-50 py-12 pb-24">
          <div className="mx-auto max-w-3xl px-6">
            <FAQAccordion categories={FAQ_CATEGORIES} />
          </div>
        </section>
      </div>
    </>
  )
}
