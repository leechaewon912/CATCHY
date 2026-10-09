const STORAGE_KEY = "catchy:recentTrendIds";
const MAX_RECENT_TRENDS = 5;

export function readRecentTrendIds(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((id) => typeof id === "string") : [];
  } catch {
    return [];
  }
}

// Most-recent-first, deduplicated — viewing a trend again just moves it
// back to the front instead of adding a second entry.
export function recordTrendView(trendId: string): void {
  if (typeof window === "undefined") return;
  try {
    const existing = readRecentTrendIds().filter((id) => id !== trendId);
    const next = [trendId, ...existing].slice(0, MAX_RECENT_TRENDS);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // localStorage may be unavailable (private browsing, storage full, etc.)
  }
}
