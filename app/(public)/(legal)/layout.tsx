export default function LegalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-white py-24">
      <div className="mx-auto max-w-3xl px-6">
        {children}
      </div>
    </div>
  )
}
