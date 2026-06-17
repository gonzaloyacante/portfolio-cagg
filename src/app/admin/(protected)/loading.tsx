export default function AdminLoading() {
  return (
    <div className="space-y-6" aria-busy="true" aria-live="polite">
      <div className="flex items-end justify-between gap-4">
        <div className="space-y-3">
          <div className="bg-muted/40 h-3 w-32 animate-pulse rounded-md" />
          <div className="bg-muted/60 h-7 w-48 animate-pulse rounded-md" />
          <div className="bg-muted/30 h-3 w-64 animate-pulse rounded-md" />
        </div>
        <div className="bg-muted/40 h-9 w-28 animate-pulse rounded-md" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="admin-hairline bg-card/40 space-y-4 rounded-[var(--admin-radius-lg)] p-5"
          >
            <div className="flex items-start justify-between gap-3">
              <div
                className="admin-shimmer h-7 w-7 rounded-md"
                style={{ animationDelay: `${i * 40}ms` }}
              />
              <div
                className="admin-shimmer h-5 w-12 rounded-md"
                style={{ animationDelay: `${i * 40 + 20}ms` }}
              />
            </div>
            <div className="space-y-2">
              <div
                className="admin-shimmer h-4 w-3/4 rounded-md"
                style={{ animationDelay: `${i * 40 + 40}ms` }}
              />
              <div
                className="admin-shimmer h-3 w-full rounded-md"
                style={{ animationDelay: `${i * 40 + 60}ms` }}
              />
              <div
                className="admin-shimmer h-3 w-5/6 rounded-md"
                style={{ animationDelay: `${i * 40 + 80}ms` }}
              />
            </div>
            <div className="flex justify-between pt-2">
              <div
                className="admin-shimmer h-3 w-16 rounded-md"
                style={{ animationDelay: `${i * 40 + 100}ms` }}
              />
              <div
                className="admin-shimmer h-3 w-12 rounded-md"
                style={{ animationDelay: `${i * 40 + 120}ms` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
