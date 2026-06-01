import type { Metadata } from 'next'
import Link from 'next/link'
import { Check, ArrowRight, ExternalLink, Car, Bike, Ship, Home, Sailboat, Waves, Mountain, TentTree, Music, Lightbulb, Plane, Zap, Camera, Wrench } from 'lucide-react'
import { HeroStage } from '@/components/marketing/HeroStage'
import { HuLandingClient } from './HuLandingClient'

export const metadata: Metadata = {
  title: {
    absolute: 'RentalOS — Bérlési Foglalórendszer Autó-, Jacht- és Villabérlőknek',
  },
  description:
    'Hagyd el a WhatsApp-os foglaláskezelést. A RentalOS automatizál minden érdeklődést, visszaigazolást és utókövetést. Havi €79-tól.',
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

const FOR_WHO = [
  {
    scale: '1–5 tétel',
    label: 'Egyéni üzemeltetők',
    body: 'Mindent te kezelsz. A RentalOS adminisztrál, te a bérlésre koncentrálhatsz. Az érdeklődések 0–24 rögzítve, visszaigazolások automatikusan elküldve.',
    cta: 'Ingyenes próba →',
    href: '/hu/pricing',
  },
  {
    scale: '5–20 tétel',
    label: 'Növekvő vállalkozások',
    body: 'A csapatodnak rendszerre van szüksége, amit nélküled is követni tudnak. Minden foglalás, minden tétel, minden ügyfél — bármely eszközről látható.',
    cta: 'Ingyenes próba →',
    href: '/hu/pricing',
  },
  {
    scale: 'Prémium készlet',
    label: 'Prémium bérlők',
    body: 'Az inventory prémiumot képvisel. Automatikus visszaigazolások, professzionális dokumentumkezelés — olyan foglalási élmény, ami méltó a vállalkozásodhoz.',
    cta: 'Írj nekünk →',
    href: '/contact',
  },
  {
    scale: 'Bicikli és sport',
    label: 'Sport- és szabadidőbérlés',
    body: 'Biciklik, kajakok, szörfdeszkák, síléc. Gyors forgású bérlések, ahol minden óra számít. Soha ne veszítsd szem elől, mi van kint és mikor jön vissza.',
    cta: 'Ingyenes próba →',
    href: '/hu/pricing',
  },
  {
    scale: 'Gépek és eszközök',
    label: 'Eszközbérlés',
    body: 'Kamerák, generátorok, építőipari eszközök, hangberendezések. Értékes felszerelések, amelyek egyértelmű nyilvántartást, aláírt megállapodásokat igényelnek.',
    cta: 'Ingyenes próba →',
    href: '/hu/pricing',
  },
  {
    scale: 'Villák és lakások',
    label: 'Szállásbérlés',
    body: 'Villák, apartmanok, nyaralók. Automatikus érdeklődés-kezelés és professzionális visszaigazolások — minden vendég pontosan azt kapja, amit ígértél.',
    cta: 'Ingyenes próba →',
    href: '/hu/pricing',
  },
  {
    scale: 'Ügyfeleknek',
    label: 'Fejlesztők és ügynökségek',
    body: 'Ne építsd újra minden bérlési ügyfélnek ugyanazt a rendszert. Vedd meg egyszer, telepítsd sokszor. Teljes forráskód, kereskedelmi licenc, dokumentálva.',
    cta: 'Sablon megvásárlása — €499',
    href: '/sell',
  },
  {
    scale: 'Több helyszín',
    label: 'Több helyszínes üzemeltetők',
    body: 'Egy admin panel. Az összes helyszíned. Minden foglalás látható bárhonnan. Beállítsd egyszer, kezelj mindent centrálisan.',
    cta: 'Írj nekünk →',
    href: '/contact',
  },
]

const FAQ_ITEMS = [
  {
    q: 'Milyen technológia szükséges?',
    a: 'Node.js 18+, egy ingyenes Supabase fiók és egy ingyenes Vercel fiók. Az ingyenes csomagok bőven elegendők az induláshoz és a korai forgalom kezeléséhez.',
  },
  {
    q: 'Viszonteladhatok ügyfeleknek?',
    a: 'Igen. A kereskedelmi licenc egyetlen telepítésre vonatkozik. Ügynökségi/több ügyfél esetén a sablon értékesítési oldalán találod a teljes feltételeket.',
  },
  {
    q: 'Van demo?',
    a: 'Igen. Látogass el a /demo oldalra, ahol egy élő autóbérlő vállalkozás fut ezen az exact kódtáron.',
  },
  {
    q: 'Mennyi ideig tart a telepítés?',
    a: 'Körülbelül 1–2 óra a mellékelt útmutatóval. Fork, Supabase és Vercel összekötés, környezeti változók beállítása, push. Kész.',
  },
  {
    q: 'Van támogatás?',
    a: 'Igen — lásd a Csináljuk helyetted csomagot. Mi telepítünk és konfigurálunk mindent, majd 30 napos supportot biztosítunk az átadás után.',
  },
]

const CATEGORIES = [
  { Icon: Car, label: 'Autók' },
  { Icon: Bike, label: 'Motorok' },
  { Icon: Ship, label: 'Jachtok' },
  { Icon: Home, label: 'Villák' },
  { Icon: Bike, label: 'Kerékpárok' },
  { Icon: Sailboat, label: 'Kajakok' },
  { Icon: Waves, label: 'Szörfdeszkák' },
  { Icon: Mountain, label: 'Síléc' },
  { Icon: TentTree, label: 'Sátrak' },
  { Icon: Music, label: 'Hangberendezések' },
  { Icon: Lightbulb, label: 'Fényberendezések' },
  { Icon: Plane, label: 'Drónok' },
  { Icon: Wrench, label: 'Építőeszközök' },
  { Icon: Zap, label: 'Generátorok' },
  { Icon: Camera, label: 'Kamerák' },
  { Icon: Bike, label: 'E-rollák' },
]

export default function HuHomePage() {
  return (
    <div className="min-h-screen bg-white">

      {/* ── Hero (dark) ── */}
      <section className="hero-dark text-white flex min-h-[calc(100vh-4rem)] flex-col justify-center px-6 py-16">
        <div className="mx-auto w-full max-w-7xl">
          <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-[2fr_3fr] xl:gap-10">
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
                  className="btn-3d inline-flex items-center justify-center min-h-[44px] rounded-md bg-gold px-7 py-3 font-sans text-sm font-medium text-white transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/70 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900"
                >
                  Élő bemutató →
                </Link>
                <Link
                  href="/hu/pricing"
                  className="inline-flex items-center justify-center min-h-[44px] rounded-md border border-white/20 px-7 py-3 font-sans text-sm font-medium text-white transition-colors hover:border-white/40 hover:bg-white/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900"
                >
                  Megnézem az árakat
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
            <a href="#problema" aria-label="Görgetés a problémákhoz" className="text-white/20 transition-colors hover:text-white/50 focus-visible:outline-none focus-visible:text-white/50">
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
            <h2 className="font-display text-4xl font-bold tracking-tight text-gray-900 md:text-5xl">Ismerős?</h2>
          </div>
          <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
            {PAIN_ITEMS.map(({ tag, headline, copy }) => (
              <div key={tag} className="flex flex-col gap-5 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                <span className="self-start rounded-sm border border-gold/20 bg-gold/5 px-2.5 py-0.5 font-sans text-[10px] uppercase tracking-[0.15em] text-gold/80">{tag}</span>
                <div>
                  <h3 className="mb-2 font-display text-xl font-bold text-gray-900">{headline}</h3>
                  <p className="font-sans text-sm leading-relaxed text-muted">{copy}</p>
                </div>
              </div>
            ))}
          </div>
          <p className="mt-14 text-center font-display text-2xl font-bold text-gold md:text-3xl">
            A RentalOS megoldja mindezt.
          </p>
        </div>
      </section>

      {/* ── Mit kapsz ── */}
      <section className="bg-white py-16 md:py-20">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mb-14">
            <p className="mb-3 font-sans text-xs uppercase tracking-[0.2em] text-gold">Amit kapsz</p>
            <h2 className="font-display text-4xl font-bold tracking-tight text-gray-900 md:text-5xl">
              Minden, ami kell egy napon belüli induláshoz
            </h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {FEATURES_LIST.map((f) => (
              <div key={f} className="flex items-start gap-3">
                <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-sm border border-gold/30 bg-gold/10">
                  <Check className="h-3 w-3 text-gold" />
                </div>
                <span className="font-sans text-sm leading-relaxed text-muted">{f}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA csík ── */}
      <section className="bg-slate-900 py-12">
        <div className="mx-auto max-w-6xl px-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-display text-xl font-bold text-white">Készen állsz az indulásra?</p>
            <p className="font-sans text-sm text-slate-400 mt-1">14 napos ingyenes próba. Nem kell bankkártya.</p>
          </div>
          <Link
            href="/hu/pricing"
            className="btn-3d shrink-0 inline-flex items-center justify-center min-h-[44px] rounded-md bg-gold px-6 py-3 font-sans text-sm font-medium text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/70 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900"
          >
            Megnézem az árakat →
          </Link>
        </div>
      </section>

      {/* ── Éles demo ── */}
      <section className="bg-slate-900 text-white py-16 md:py-20">
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid grid-cols-1 gap-12 md:grid-cols-2 md:items-center">
            <div>
              <p className="mb-3 font-sans text-xs uppercase tracking-[0.2em] text-gold">Lásd élőben</p>
              <h2 className="mb-6 font-display text-4xl font-bold tracking-tight text-white md:text-5xl">
                Valós vállalkozáshoz építve
              </h2>
              <p className="font-sans text-sm leading-relaxed text-slate-300">
                Egy marbellai autóbérlő vállalkozás élesben futtatja ezt a kódbázist. Ugyanaz az admin panel. Ugyanaz a foglalási folyamat. A te arculatoddal.
              </p>
            </div>
            <a
              href="https://drivecostasol.com"
              target="_blank"
              rel="noopener noreferrer"
              className="scroll-tilt group flex min-h-[200px] aspect-video items-center justify-center rounded-xl border border-slate-700 bg-slate-800 transition-all hover:border-gold/40 hover:shadow-lg focus-visible:outline-none focus-visible:border-gold/50"
            >
              <div className="flex flex-col items-center gap-2 text-center">
                <span className="font-display text-3xl font-bold text-slate-400 transition-colors group-hover:text-white">
                  drivecostasol.com →
                </span>
                <span className="font-sans text-xs uppercase tracking-[0.15em] text-slate-600">
                  Élesben Marbellában
                </span>
              </div>
            </a>
          </div>
        </div>
      </section>

      {/* ── Kiknek való ── */}
      <section className="bg-gray-50 py-16 md:py-20">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mb-14">
            <p className="mb-3 font-sans text-xs uppercase tracking-[0.2em] text-gold">Kiknek készült</p>
            <h2 className="font-display text-4xl font-bold tracking-tight text-gray-900 md:text-5xl">
              Kiknek való
            </h2>
          </div>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {FOR_WHO.map(({ scale, label, body, cta, href }) => (
              <div key={label} className="flex flex-col gap-3 rounded-xl border border-gray-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
                <p className="font-sans text-[10px] uppercase tracking-[0.2em] text-gold/60">{scale}</p>
                <h3 className="font-display text-xl font-semibold text-gray-900">{label}</h3>
                <p className="font-sans text-sm leading-relaxed text-muted flex-1">{body}</p>
                <Link href={href} className="mt-2 inline-flex items-center gap-1 font-sans text-xs text-gold underline-offset-4 hover:underline">
                  {cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CostaSol social proof ── */}
      <section className="bg-white py-16 md:py-20">
        <div className="mx-auto max-w-2xl px-6">
          <div className="rounded-xl border border-gold/20 bg-white px-8 py-10 shadow-lg ring-1 ring-gold/8">
            <p className="font-sans text-xs uppercase tracking-[0.2em] text-gold mb-6">Valós vállalkozáson tesztelve</p>
            <blockquote className="mb-6 font-display text-2xl font-bold leading-relaxed text-gray-900">
              Before RentalOS, we managed everything on WhatsApp and a shared spreadsheet. Now every inquiry gets a confirmation email within seconds. Our customers think we&apos;re a much bigger operation than we are.
            </blockquote>
            <div className="flex items-end justify-between gap-6 mb-8">
              <div>
                <p className="font-sans text-sm font-medium text-gray-900">CostaSol Car Rent</p>
                <p className="mt-0.5 font-sans text-xs text-muted">Marbella, Spanyolország — 2026 óta</p>
              </div>
              <a
                href="https://drivecostasol.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 font-sans text-xs text-muted hover:text-gold transition-colors"
              >
                drivecostasol.com <ExternalLink className="h-3 w-3" />
              </a>
            </div>
            <div className="grid grid-cols-3 gap-px bg-gold/10 rounded-lg overflow-hidden mb-6">
              {[
                { value: '0', label: 'Dupla foglalás az indulás óta' },
                { value: '48h', label: 'Az élesítés ideje' },
                { value: '100%', label: 'Rögzített érdeklődések' },
              ].map(({ value, label }) => (
                <div key={label} className="bg-white py-6 text-center">
                  <p className="font-display text-3xl font-bold text-gold">{value}</p>
                  <p className="mt-1 px-2 font-sans text-xs leading-snug text-muted">{label}</p>
                </div>
              ))}
            </div>
            <a
              href="https://drivecostasol.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 font-sans text-sm text-gold hover:underline underline-offset-4"
            >
              drivecostasol.com megtekintése →
            </a>
          </div>
        </div>
      </section>

      {/* ── Mit bérelhetsz ── */}
      <section className="bg-gray-50 py-16 md:py-20">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mb-14 text-center">
            <p className="mb-3 font-sans text-xs uppercase tracking-[0.2em] text-gold">Bármilyen kategória</p>
            <h2 className="font-display text-4xl font-bold tracking-tight text-gray-900 md:text-5xl">
              Mit bérelhetsz
            </h2>
          </div>
          <div className="mb-14 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {CATEGORIES.map(({ Icon, label }) => (
              <div key={label} className="flex flex-col items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-5 text-center">
                <Icon className="h-8 w-8 text-gold" aria-hidden="true" strokeWidth={1.5} />
                <span className="font-sans text-xs text-muted">{label}</span>
              </div>
            ))}
          </div>
          <p className="text-center font-display text-xl font-semibold text-gray-700 md:text-2xl">
            A RentalOS nem törődik azzal, mit bérelsz.{' '}
            <span className="text-gold">Csak azzal, hogy minden ügyfél visszaigazolást kapjon.</span>
          </p>
        </div>
      </section>

      {/* ── Sablon fejlesztőknek ── */}
      <section className="bg-slate-900 py-16 md:py-20">
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid grid-cols-1 gap-12 md:grid-cols-[3fr_2fr] md:items-center">
            <div>
              <p className="mb-3 font-sans text-xs uppercase tracking-[0.2em] text-gold">Forráskód</p>
              <h3 className="mb-6 font-display text-4xl font-extrabold tracking-tight text-white md:text-5xl">
                Vagy építsd meg magad.
              </h3>
              <p className="mb-8 max-w-lg font-sans text-base leading-relaxed text-slate-300">
                Teljes forráskód. Telepítsd a saját szervereidre. Használd a vállalkozásodhoz — vagy építsd ügyfeleidnek.
              </p>
              <Link
                href="/sell"
                className="btn-3d inline-flex items-center justify-center min-h-[44px] rounded-md bg-gold px-7 py-3 font-sans text-sm font-medium text-white transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/70 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900"
              >
                Sablon megvásárlása — €499 →
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

      {/* ── Pricing teaser + ROI kalkulátor (client) ── */}
      <HuLandingClient />

      {/* ── FAQ ── */}
      <section className="bg-gray-50 py-16 md:py-20">
        <div className="mx-auto max-w-3xl px-6">
          <div className="mb-14">
            <p className="mb-3 font-sans text-xs uppercase tracking-[0.2em] text-gold">Kérdések</p>
            <h2 className="font-display text-4xl font-bold tracking-tight text-gray-900 md:text-5xl">GYIK</h2>
          </div>
          <div className="divide-y divide-border">
            {FAQ_ITEMS.map(({ q, a }) => (
              <details key={q} className="faq-item group">
                <summary className="flex items-center justify-between gap-4 py-7 font-sans text-sm font-medium text-gray-900 transition-colors hover:text-gold focus-visible:outline-none focus-visible:text-gold">
                  {q}
                  <span className="faq-icon text-gold text-lg">+</span>
                </summary>
                <div className="faq-body">
                  <div>
                    <p className="pb-7 font-sans text-sm leading-relaxed text-muted">{a}</p>
                  </div>
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ── Záró CTA ── */}
      <section className="bg-slate-900 py-20">
        <div className="mx-auto max-w-2xl px-6 text-center">
          <h2 className="mb-8 font-display text-3xl font-bold tracking-tight text-white md:text-4xl">
            Készen állsz a bérlési vállalkozásod elindítására?
          </h2>
          <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Link
              href="/hu/pricing"
              className="btn-3d inline-flex items-center justify-center min-h-[44px] rounded-md bg-gold px-8 py-4 font-sans text-sm font-medium text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/70 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900"
            >
              Ingyenes próba →
            </Link>
            <Link
              href="/contact"
              className="btn-3d inline-flex items-center justify-center min-h-[44px] rounded-md border border-white/20 px-8 py-4 font-sans text-sm font-medium text-white hover:border-white/40 hover:bg-white/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900"
            >
              Írj nekünk →
            </Link>
          </div>
        </div>
      </section>

    </div>
  )
}
