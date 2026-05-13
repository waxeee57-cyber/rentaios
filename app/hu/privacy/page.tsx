import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Adatvédelmi Tájékoztató',
  description: 'A RentalOS platform adatvédelmi tájékoztatója — hogyan kezeljük személyes adatait.',
  alternates: {
    canonical: '/hu/privacy',
    languages: { en: '/privacy' },
  },
}

export default function HuPrivacyPage() {
  return (
    <div className="min-h-screen bg-white py-16">
      <div className="mx-auto max-w-3xl px-6">
        <p className="mb-3 font-sans text-xs uppercase tracking-[0.2em] text-gold">Jogi dokumentum</p>
        <h1 className="mb-2 font-display text-4xl font-bold text-gray-900">Adatvédelmi Tájékoztató</h1>
        <p className="mb-12 font-sans text-sm text-muted">Hatályos: 2026. január 1-jétől · GDPR-kompatibilis</p>

        <div className="prose prose-sm max-w-none font-sans text-muted leading-relaxed space-y-8">

          <section>
            <h2 className="font-display text-xl font-semibold text-gray-900 mb-3">1. Az adatkezelő</h2>
            <p>
              Az adatkezelő a RentalOS szoftverszolgáltatás üzemeltetője (továbbiakban: Adatkezelő). Elérhetőség:{' '}
              <a href="mailto:info@domrol.com" className="text-gold hover:underline underline-offset-4">info@domrol.com</a>
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold text-gray-900 mb-3">2. Kezelt adatok köre</h2>
            <p>Az Adatkezelő az alábbi személyes adatokat kezeli:</p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li><strong className="text-gray-700">Regisztrációs adatok:</strong> e-mail cím, cégnév, kapcsolattartó neve;</li>
              <li><strong className="text-gray-700">Számlázási adatok:</strong> számlázási név, cím (a fizetési szolgáltatón keresztül);</li>
              <li><strong className="text-gray-700">Foglalási adatok:</strong> a platform végfelhasználóinak adatai, amelyeket az Ügyfél (adatfeldolgozóként) az Adatkezelő infrastruktúráján tárol;</li>
              <li><strong className="text-gray-700">Technikai adatok:</strong> IP-cím, böngészőtípus, munkamenet-azonosítók, a szolgáltatás igénybevételének naplói.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold text-gray-900 mb-3">3. Az adatkezelés célja és jogalapja</h2>
            <div className="space-y-3">
              <div>
                <p className="font-medium text-gray-700">Szerződés teljesítése (GDPR 6. cikk (1) b) pont):</p>
                <p>A regisztrációs és számlázási adatok kezelése az előfizetési szerződés teljesítéséhez szükséges.</p>
              </div>
              <div>
                <p className="font-medium text-gray-700">Jogos érdek (GDPR 6. cikk (1) f) pont):</p>
                <p>Technikai naplók és biztonsági adatok kezelése a rendszer biztonságos üzemeltetéséhez.</p>
              </div>
              <div>
                <p className="font-medium text-gray-700">Hozzájárulás (GDPR 6. cikk (1) a) pont):</p>
                <p>Hírlevelek és marketing kommunikáció küldése kizárólag az érintett hozzájárulása alapján.</p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold text-gray-900 mb-3">4. Adattárolás és biztonság</h2>
            <p>
              A személyes adatok tárolása a Supabase felhőszolgáltatón keresztül, az Európai Unió területén belül, titkosított formában történik. Az Adatkezelő megfelelő technikai és szervezési intézkedéseket alkalmaz az adatok jogosulatlan hozzáférése, módosítása vagy megsemmisítése ellen.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold text-gray-900 mb-3">5. Adatmegőrzési idő</h2>
            <p>
              A regisztrációs és szerződéses adatokat az előfizetés megszűnésétől számított 5 évig, a számlázási adatokat a számviteli törvény által előírt 8 évig, a technikai naplókat legfeljebb 90 napig őrizzük meg.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold text-gray-900 mb-3">6. Az érintett jogai</h2>
            <p>Az érintett az alábbi jogokat gyakorolhatja:</p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li><strong className="text-gray-700">Hozzáférés joga:</strong> tájékoztatást kérhet a kezelt adatairól;</li>
              <li><strong className="text-gray-700">Helyesbítés joga:</strong> kérheti a pontatlan adatok javítását;</li>
              <li><strong className="text-gray-700">Törlés joga (&quot;elfeledtetéshez való jog&quot;):</strong> kérheti adatai törlését;</li>
              <li><strong className="text-gray-700">Adathordozhatóság joga:</strong> kérheti adatai gépelhető formátumban való kiadását;</li>
              <li><strong className="text-gray-700">Tiltakozás joga:</strong> tiltakozhat jogos érdeken alapuló adatkezelés ellen.</li>
            </ul>
            <p className="mt-3">
              Kérelmeit az{' '}
              <a href="mailto:info@domrol.com" className="text-gold hover:underline underline-offset-4">info@domrol.com</a>
              {' '}e-mail-címre küldheti. A kérelemre 30 napon belül válaszolunk.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold text-gray-900 mb-3">7. Sütik (cookie-k)</h2>
            <p>
              A weboldal sütiket használ a munkamenet-kezeléshez és az analitikához. A nem szükséges sütik csak az Ön hozzájárulásával kerülnek elhelyezésre. Részletek a süti-kezelési tájékoztatóban találhatók.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold text-gray-900 mb-3">8. Panasz benyújtása</h2>
            <p>
              Ha úgy véli, hogy adatait jogszerűtlenül kezeljük, panaszt nyújthat be a Nemzeti Adatvédelmi és Információszabadság Hatósághoz (NAIH), postacím: 1363 Budapest, Pf.: 9., weboldal:{' '}
              <a href="https://www.naih.hu" target="_blank" rel="noopener noreferrer" className="text-gold hover:underline underline-offset-4">naih.hu</a>
            </p>
          </section>

        </div>

        <div className="mt-12 pt-8 border-t border-gray-100 flex gap-4">
          <Link href="/hu" className="font-sans text-xs text-muted hover:text-gold transition-colors">← Vissza a főoldalra</Link>
          <Link href="/hu/terms" className="font-sans text-xs text-muted hover:text-gold transition-colors">Általános Szerződési Feltételek →</Link>
        </div>
      </div>
    </div>
  )
}
