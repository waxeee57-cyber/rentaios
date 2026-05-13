import type { Metadata } from 'next'
import Link from 'next/link'
import { Check, ArrowRight } from 'lucide-react'
import { HeroStage } from '@/components/marketing/HeroStage'

export const metadata: Metadata = {
  title: {
    absolute: 'RentalOS — Bérlési Foglalórendszer Autó-, Jacht- és Villabérlőknek',
  },
  description:
    'Hagyd el a WhatsApp-os foglaláskezelést. A RentalOS automatizál minden érdeklődést, visszaigazolást és utókövetést. Havi 29 000 Ft-tól.',
  alternates: {
    canonical: '/hu',
    languages: { en: '/' },
  },
}

const PAIN_ITEMS = [
  {
    tag: 'Egyéni üzemeltetők',
    headline: 'Érdeklődések elveszve a WhatsApp-ban',
    copy: 'Egy ügyfél éjjel ír, hogy érdekli a bérlés. Reggelre már a konkurensed foglalta le. Te észre sem vetted az üzenetet.',
  },
  {
    tag: 'Növekvő vállalkozások',
    headline: 'Nem tudod delegálni, mert nincs rendszer',
    copy: 'Minden a fejedben van. A csapatod nem tud visszaigazolni egy foglalást anélkül, hogy felhívjon. Te vagy a saját vállalkozásod szűk keresztmetszete.',
  },
  {
    tag: 'Prémium bérlők',
    headline: 'A bérlőid prémiumot fizetnek. A foglalási folyamatod nem képviseli azt.',
    copy: 'Az ügyfeleid elvárnak egy professzionális választ. Megérdemelnek egy visszaigazolást másodperceken belül — nem egy WhatsApp hangüzenetet másnap reggel.',
  },
]

const FEATURES_LIST = [
  'Teljes Next.js App Router forráskód',
  'Supabase séma, RLS szabályok, seed adat',
  'Admin panel (foglalások, flotta, irányítópult)',
  'E-mail rendszer (5 sablon, Resend)',
  'Érdeklődés → Visszaigazolás → Átvétel → Visszaadás folyamat',
  'Átadás/szállítás funkció',
  'Rate limiting + biztonsági megerősítés',
  'SEO optimalizált (sitemap, séma, robots)',
  'Vercel deploy ready',
  'Teljes dokumentáció',
]

export default function HuHomePage() {
  return (
    <div className="min-h-screen bg-white">

      {/* ── Hero (dark) ── */}
      <section className="hero-dark text-white flex min-h-[calc(100vh-4rem)] flex-col justify-center px-6 py-16">
        <div className="mx-auto w-full max-w-7xl">
          <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-[2fr_3fr]">
            <div className="flex flex-col gap-6">
              <div className="flex items-center gap-2.5">
                <span className="animate-pulse-dot h-1.5 w-1.5 rounded-full bg-gold" />
                <span className="font-sans text-[11px] uppercase tracking-[0.2em] text-white/50">RentalOS</span>
              </div>
              <h1 className="font-display text-4xl font-extrabold leading-[1.06] tracking-[-0.025em] text-white sm:text-5xl">
                Minden foglalás, rögzítve.{' '}
                <span className="text-white/75">Minden ügyfél, visszaigazolva.</span>
              </h1>
              <p className="max-w-[30rem] font-sans text-base leading-relaxed text-white/65">
                Az érdeklődéstől a visszaigazolásig másodpercek alatt — automatikusan.
              </p>
              <div className="flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/demo/fleet"
                  className="btn-3d inline-flex items-center justify-center min-h-[44px] rounded-md bg-gold px-7 py-3 font-sans text-sm font-medium text-white transition-opacity hover:opacity-90"
                >
                  Élőben megnézem →
                </Link>
                <Link
                  href="/hu/pricing"
                  className="inline-flex items-center justify-center min-h-[44px] rounded-md border border-white/20 px-7 py-3 font-sans text-sm font-medium text-white transition-colors hover:border-white/40 hover:bg-white/5"
                >
                  Árak megtekintése
                </Link>
              </div>
              <a
                href="https://drivecostasol.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex w-fit items-center gap-1.5 font-sans text-xs text-white/30 underline-offset-2 transition-colors hover:text-white/60"
              >
                ↗ Élőben: drivecostasol.com · Marbella, Spanyolország
              </a>
            </div>
            <HeroStage />
          </div>
          <div className="mt-10 flex justify-center lg:justify-start">
            <a href="#problema" aria-label="Görgetés a megoldott problémákhoz" className="text-white/20 transition-colors hover:text-white/50">
              <ArrowRight className="h-5 w-5 rotate-90" />
            </a>
          </div>
        </div>
      </section>

      {/* ── A probléma ── */}
      <section id="problema" className="bg-gray-50 py-16 md:py-20">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mb-14">
            <p className="mb-3 font-sans text-xs uppercase tracking-[0.2em] text-gold">A probléma</p>
            <h2 className="font-display text-4xl font-bold tracking-tight text-gray-900 md:text-5xl">
              Ismerős?
            </h2>
          </div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {PAIN_ITEMS.map((item) => (
              <div key={item.tag} className="rounded-xl border border-gray-200 bg-white p-7 shadow-sm">
                <p className="mb-3 font-sans text-[10px] uppercase tracking-[0.2em] text-gold">{item.tag}</p>
                <h3 className="mb-3 font-display text-lg font-semibold leading-snug text-gray-900">{item.headline}</h3>
                <p className="font-sans text-sm leading-relaxed text-muted">{item.copy}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── A megoldás ── */}
      <section className="py-16 md:py-20">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <p className="mb-3 font-sans text-xs uppercase tracking-[0.2em] text-gold">A megoldás</p>
          <h2 className="mb-6 font-display text-4xl font-bold tracking-tight text-gray-900 md:text-5xl">
            A bérlési vállalkozásod, teljesen automatizálva.
          </h2>
          <p className="mx-auto mb-10 max-w-2xl font-sans text-base leading-relaxed text-muted">
            A RentalOS kezeli a foglalásokat, visszaigazolásokat és utókövetéseket — te a bérlésre koncentrálhatsz.
          </p>
          <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Link
              href="/hu/pricing"
              className="inline-flex min-h-[44px] items-center rounded-md bg-gold px-8 py-3 font-sans text-sm font-medium text-white transition-opacity hover:opacity-90"
            >
              Kezdés — 14 napos ingyenes próba
            </Link>
            <Link
              href="/demo/fleet"
              className="inline-flex min-h-[44px] items-center rounded-md border border-border px-8 py-3 font-sans text-sm font-medium text-muted transition-colors hover:border-gold/40 hover:text-gray-900"
            >
              Demo megtekintése →
            </Link>
          </div>
        </div>
      </section>

      {/* ── Sablon fejlesztőknek ── */}
      <section className="border-t border-gray-100 bg-gray-950 py-16 md:py-20">
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:items-center">
            <div>
              <p className="mb-3 font-sans text-[10px] uppercase tracking-[0.2em] text-gold">Fejlesztőknek és ügynökségeknek</p>
              <h2 className="mb-4 font-display text-3xl font-bold text-white">
                Ne építsd újra ugyanazt. Vedd meg egyszer, telepítsd sokszor.
              </h2>
              <p className="mb-6 font-sans text-base leading-relaxed text-white/60">
                Teljes forráskód, kereskedelmi licenc, dokumentálva és produkció-kész. Minden bérlési ügyfeled ugyanazt az alapot igényli.
              </p>
              <ul className="mb-8 grid grid-cols-1 gap-2 sm:grid-cols-2">
                {FEATURES_LIST.map((f) => (
                  <li key={f} className="flex items-start gap-2">
                    <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-gold" />
                    <span className="font-sans text-sm text-white/70">{f}</span>
                  </li>
                ))}
              </ul>
              <Link
                href="/sell"
                className="inline-flex min-h-[44px] items-center rounded-md bg-gold px-8 py-3 font-sans text-sm font-medium text-white transition-opacity hover:opacity-90"
              >
                Sablon megvásárlása — €499
              </Link>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/5 p-8">
              <p className="mb-4 font-sans text-xs uppercase tracking-[0.2em] text-white/40">Tartalmazza</p>
              <ul className="flex flex-col gap-3">
                {FEATURES_LIST.map((f) => (
                  <li key={f} className="flex items-center gap-2.5">
                    <Check className="h-3.5 w-3.5 shrink-0 text-gold" />
                    <span className="font-sans text-sm text-white/70">{f}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ── Zöldfészek testimonial ── */}
      <section className="py-16 md:py-20">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <blockquote>
            <p className="mb-6 font-display text-xl font-light leading-relaxed text-gray-900 md:text-2xl">
              &ldquo;Korábban minden foglalást kézzel kezeltünk Messengeren. A RentalOS bevezetése után az érdeklődések 90%-a automatikusan visszaigazolódik. Ez nekem hetente 6-8 óra megtakarítást jelent.&rdquo;
            </p>
            <footer>
              <p className="font-sans text-sm font-medium text-gray-900">Varga Péter</p>
              <p className="font-sans text-xs text-muted">Zöldfészek Autókölcsönző, Budapest</p>
            </footer>
          </blockquote>
        </div>
      </section>

      {/* ── CTA vége ── */}
      <section className="border-t border-gray-100 bg-gray-50 py-16 md:py-20">
        <div className="mx-auto max-w-2xl px-6 text-center">
          <h2 className="mb-4 font-display text-3xl font-bold text-gray-900">
            Készen állsz az automatizálásra?
          </h2>
          <p className="mb-8 font-sans text-base leading-relaxed text-muted">
            14 napos ingyenes próba. Nem kell bankkártya. Megállíthatsz bármikor.
          </p>
          <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Link
              href="/hu/pricing"
              className="inline-flex min-h-[44px] items-center rounded-md bg-gold px-8 py-3 font-sans text-sm font-medium text-white transition-opacity hover:opacity-90"
            >
              Árak megtekintése →
            </Link>
            <Link
              href="/contact"
              className="inline-flex min-h-[44px] items-center rounded-md border border-border px-8 py-3 font-sans text-sm font-medium text-muted transition-colors hover:border-gold/40 hover:text-gray-900"
            >
              Kérdésem van
            </Link>
          </div>
        </div>
      </section>

    </div>
  )
}
