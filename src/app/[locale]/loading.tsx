export default function LocaleLoading() {
  return (
    <div
      aria-busy="true"
      aria-live="polite"
      className="bg-background relative min-h-dvh overflow-hidden"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_600px_400px_at_0%_0%,color-mix(in_oklab,var(--foreground)_5%,transparent),transparent_60%),radial-gradient(ellipse_500px_350px_at_100%_100%,color-mix(in_oklab,var(--foreground)_3%,transparent),transparent_60%)]"
      />
      <header className="border-border/40 relative z-10 flex h-16 items-center justify-between border-b px-6 lg:px-10">
        <div className="admin-shimmer h-7 w-40 rounded-md" />
        <div className="admin-shimmer h-8 w-28 rounded-md" />
      </header>
      <section className="relative z-10 mx-auto max-w-7xl px-6 py-24 lg:px-10">
        <div className="admin-shimmer mb-8 h-3 w-24 rounded-md" />
        <div className="admin-shimmer mb-6 h-16 w-3/4 rounded-md" />
        <div className="admin-shimmer mb-3 h-12 w-2/3 rounded-md" />
        <div className="max-w-2xl space-y-2">
          <div className="admin-shimmer h-3 w-full rounded-md" />
          <div className="admin-shimmer h-3 w-5/6 rounded-md" />
        </div>
      </section>
    </div>
  );
}
