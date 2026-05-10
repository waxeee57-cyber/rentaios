'use client'

import { useState } from 'react'

type FAQItem = { q: string; a: string }
type FAQCategory = { title: string; items: FAQItem[] }

function AccordionItem({ q, a }: FAQItem) {
  const [open, setOpen] = useState(false)
  return (
    <div className="border-b border-white/5">
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-start justify-between gap-4 py-5 text-left group"
        aria-expanded={open}
      >
        <span className="font-sans text-sm font-medium text-white group-hover:text-gold transition-colors">
          {q}
        </span>
        <span
          className={`font-sans text-lg text-gold shrink-0 mt-0.5 transition-transform duration-300 ${open ? 'rotate-45' : 'rotate-0'}`}
          aria-hidden
        >
          +
        </span>
      </button>
      {open && (
        <div className="pb-5">
          <p className="font-sans text-sm leading-relaxed text-muted">{a}</p>
        </div>
      )}
    </div>
  )
}

export function FAQAccordion({ categories }: { categories: FAQCategory[] }) {
  return (
    <div className="space-y-12">
      {categories.map(cat => (
        <section key={cat.title}>
          <h2 className="font-sans text-xs uppercase tracking-[0.2em] text-gold mb-4">{cat.title}</h2>
          <div>
            {cat.items.map(item => (
              <AccordionItem key={item.q} q={item.q} a={item.a} />
            ))}
          </div>
        </section>
      ))}
    </div>
  )
}
