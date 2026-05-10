export default function DemoFleetLoading() {
  return (
    <div className="mx-auto max-w-5xl px-6 py-16">
      <div className="mb-12">
        <div className="h-3 w-20 rounded bg-white/5 mb-3" />
        <div className="h-10 w-56 rounded bg-white/5" />
        <div className="h-4 w-72 rounded bg-white/5 mt-3" />
      </div>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="rounded-md border border-white/5 bg-white/[0.02] overflow-hidden animate-pulse">
            <div className="aspect-[4/3] bg-white/5" />
            <div className="p-5 space-y-3">
              <div className="h-5 w-36 rounded bg-white/5" />
              <div className="h-3 w-24 rounded bg-white/5" />
              <div className="flex items-center justify-between pt-1">
                <div className="h-4 w-16 rounded bg-white/5" />
                <div className="h-3 w-20 rounded bg-white/5" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
