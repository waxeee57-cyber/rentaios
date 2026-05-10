export default function DemoCarDetailLoading() {
  return (
    <div className="mx-auto max-w-5xl px-6 py-12 animate-pulse">
      <div className="h-3 w-32 rounded bg-white/5 mb-10" />
      <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
        <div>
          <div className="aspect-[4/3] rounded-md bg-white/5 mb-3" />
          <div className="grid grid-cols-3 gap-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="aspect-[4/3] rounded-md bg-white/5" />
            ))}
          </div>
        </div>
        <div className="space-y-4">
          <div className="h-3 w-24 rounded bg-white/5" />
          <div className="h-10 w-48 rounded bg-white/5" />
          <div className="h-6 w-28 rounded bg-white/5" />
          <div className="h-3 w-36 rounded bg-white/5" />
          <div className="h-20 w-full rounded bg-white/5 mt-4" />
          <div className="h-24 w-full rounded bg-white/5 mt-4" />
        </div>
      </div>
    </div>
  )
}
