import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Általános Szerződési Feltételek',
  description: 'A RentalOS platform általános szerződési feltételei.',
  alternates: {
    canonical: '/hu/terms',
    languages: { en: '/terms' },
  },
}

export default function HuTermsPage() {
  return (
    <div className="min-h-screen bg-white py-16">
      <div className="mx-auto max-w-3xl px-6">
        <p className="mb-3 font-sans text-xs uppercase tracking-[0.2em] text-gold">Jogi dokumentum</p>
        <h1 className="mb-2 font-display text-4xl font-bold text-gray-900">Általános Szerződési Feltételek</h1>
        <p className="mb-12 font-sans text-sm text-muted">Hatályos: 2026. január 1-jétől</p>

        <div className="prose prose-sm max-w-none font-sans text-muted leading-relaxed space-y-8">

          <section>
            <h2 className="font-display text-xl font-semibold text-gray-900 mb-3">1. A szerződés tárgya</h2>
            <p>
              Jelen Általános Szerződési Feltételek (ÁSZF) a RentalOS szoftverszolgáltatás igénybevételére vonatkoznak. A szolgáltatást a RentalOS (továbbiakban: Szolgáltató) nyújtja. A szolgáltatás igénybevételével az Ügyfél elfogadja jelen feltételeket.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold text-gray-900 mb-3">2. A szolgáltatás leírása</h2>
            <p>
              A RentalOS egy felhőalapú bérléskezelő szoftver, amely lehetővé teszi bérlési vállalkozások számára a foglalások, ügyféladatok, flotta és értesítések kezelését. A szolgáltatás előfizetéses modellben, havi vagy éves díjfizetés mellett érhető el.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold text-gray-900 mb-3">3. Előfizetés és fizetés</h2>
            <p>
              Az előfizetési díjak a mindenkori árlistának megfelelően kerülnek számlázásra. Az előfizetés automatikusan megújul, kivéve, ha az Ügyfél azt az aktuális számlázási időszak vége előtt legalább 7 nappal felmondja. A díjak euróban kerülnek megjelölésre; magyar forintban (HUF) feltüntetett árak tájékoztató jellegűek, az árfolyam-változásoknak megfelelően módosulhatnak.
            </p>
            <p className="mt-3">
              Az ingyenes próbaidőszak 14 napig tart. A próbaidőszak alatt a bankkártya-adatok megadása nem szükséges. A próbaidőszak letelte után a fizetős előfizetésre való áttérés csak az Ügyfél aktív hozzájárulásával lehetséges.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold text-gray-900 mb-3">4. Felmondás</h2>
            <p>
              Az Ügyfél bármikor felmondhatja előfizetését az adminisztrációs felületen keresztül. A felmondás az aktuális számlázási időszak végén lép hatályba. A már kifizetett díjak nem kerülnek visszatérítésre, kivéve, ha a Szolgáltató hibájából bekövetkező szolgáltatáskiesés indokolja azt.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold text-gray-900 mb-3">5. Az Ügyfél kötelezettségei</h2>
            <p>Az Ügyfél kötelezettséget vállal arra, hogy:</p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>pontos és naprakész adatokat ad meg a regisztráció során;</li>
              <li>a szolgáltatást kizárólag jogszerű célra használja;</li>
              <li>nem kíséreli meg a rendszer megkerülését, feltörését vagy a biztonsági intézkedések kijátszását;</li>
              <li>az ügyféladatokat a hatályos adatvédelmi jogszabályoknak megfelelően kezeli.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold text-gray-900 mb-3">6. Felelősség korlátozása</h2>
            <p>
              A Szolgáltató a szolgáltatást &quot;ahogy van&quot; alapon nyújtja. A Szolgáltató nem vállal felelősséget az elmaradt haszonért, a közvetett károkért vagy az adatvesztésért, amennyiben az nem a Szolgáltató szándékos mulasztásából ered. A Szolgáltató maximális felelőssége az adott számlázási időszakban az Ügyfél által ténylegesen kifizetett összeggel egyező.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold text-gray-900 mb-3">7. Szellemi tulajdon</h2>
            <p>
              A RentalOS platform, annak forráskódja, designja és dokumentációja a Szolgáltató szellemi tulajdona. A sablon (template) licenc külön megállapodás alapján biztosít kereskedelmi felhasználási jogot egyetlen telepítés erejéig. Az engedélyezett felhasználás részletes feltételei a sablon értékesítési oldalán találhatók.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold text-gray-900 mb-3">8. Alkalmazandó jog</h2>
            <p>
              Jelen szerződésre a magyar jog az irányadó. A felek jogvitáikat elsősorban tárgyalásos úton rendezik. Ennek sikertelensége esetén a peres eljárásra a Szolgáltató székhelye szerint illetékes bíróság rendelkezik hatáskörrel.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold text-gray-900 mb-3">9. Kapcsolat</h2>
            <p>
              Az ÁSZF-fel kapcsolatos kérdésekkel forduljon hozzánk:{' '}
              <a href="mailto:info@domrol.com" className="text-gold hover:underline underline-offset-4">info@domrol.com</a>
            </p>
          </section>

        </div>

        <div className="mt-12 pt-8 border-t border-gray-100 flex gap-4">
          <Link href="/hu" className="font-sans text-xs text-muted hover:text-gold transition-colors">← Vissza a főoldalra</Link>
          <Link href="/hu/privacy" className="font-sans text-xs text-muted hover:text-gold transition-colors">Adatvédelmi tájékoztató →</Link>
        </div>
      </div>
    </div>
  )
}
