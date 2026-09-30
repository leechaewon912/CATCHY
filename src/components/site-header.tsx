import { BookmarkIcon } from "@/components/icons";

const NAV_ITEMS = [
  { label: "트렌드 피드", active: true },
  { label: "표현 학습", active: false },
  { label: "퀴즈", active: false },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[#0a0a0b]/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-4 sm:px-8">
        <div className="flex items-center gap-8">
          <span className="text-2xl font-black tracking-tight text-white">
            CATCHY<span className="text-lime-300">.</span>
          </span>
          <nav className="hidden items-center gap-6 md:flex">
            {NAV_ITEMS.map((item) => (
              <a
                key={item.label}
                href="#"
                className={
                  item.active
                    ? "text-sm font-semibold text-white"
                    : "text-sm font-medium text-white/45 transition-colors hover:text-white/80"
                }
              >
                {item.label}
              </a>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <span className="hidden rounded-full border border-white/15 px-3 py-1 font-mono text-xs uppercase tracking-widest text-white/60 sm:inline">
            Lv.2 · 캐주얼
          </span>
          <button
            type="button"
            aria-label="저장한 트렌드"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 text-white/70 transition-colors hover:border-white/40 hover:text-white"
          >
            <BookmarkIcon className="h-4 w-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
