export type Bookmark = {
  id: string;
  phrase: string;
  meaning: string;
  example: string;
  exampleTranslation: string;
  trendId: string;
  trendTitle: string;
  savedAt: string;
};

const STORAGE_KEY = "catchy.bookmarks.v1";

export function readBookmarks(): Bookmark[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function writeBookmarks(bookmarks: Bookmark[]): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(bookmarks));
  } catch {
    // localStorage may be unavailable (private browsing, storage full, etc.)
  }
}
