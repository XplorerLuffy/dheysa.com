export function SiteFooter() {
  return (
    <footer className="border-t border-brand-950/5 bg-brand-950 text-brand-200">
      <div className="mx-auto max-w-6xl px-6 py-12">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-lg font-bold text-white">DheySa</p>
            <p className="mt-2 max-w-xs text-sm text-brand-300">
              Curated stays &amp; experiences in Gelephu Mindfulness City, Bhutan.
            </p>
          </div>
          <div className="flex gap-10 text-sm">
            <div>
              <p className="font-semibold text-white">Explore</p>
              <ul className="mt-3 space-y-2 text-brand-300">
                <li>Hotels</li>
                <li>Homestays</li>
                <li>Tours &amp; experiences</li>
                <li>Transport</li>
              </ul>
            </div>
          </div>
        </div>
        <p className="mt-10 border-t border-white/10 pt-6 text-xs text-brand-400">
          Every listing on DheySa is reviewed by our team before it goes live.
        </p>
      </div>
    </footer>
  );
}
