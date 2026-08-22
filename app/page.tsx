export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col items-center justify-center gap-4 px-6 text-center">
      <h1 className="text-3xl font-semibold text-brand-800">DheySa</h1>
      <p className="text-brand-600">
        Curated stays &amp; experiences in Gelephu Mindfulness City. Guest-facing pages, the
        search flow, and the booking UI land in Phase 1 once the data schema below is confirmed.
      </p>
      <p className="text-sm text-brand-400">
        Scaffold status: Supabase client wired (browser, server, middleware) — no data yet.
      </p>
    </main>
  );
}
