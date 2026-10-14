import type { Category } from "@/lib/mock-data";

// public/images/mock/<prefix>-0{1..4}.{png,...} — 4 Midjourney mock photos
// per category, 28 files total. Not tracked by any DB column yet; this
// is purely a client-side stand-in until trends have a real image field.
const CATEGORY_IMAGE_PREFIX: Record<Category, string> = {
  "음악": "music",
  "영화·시리즈": "film",
  "밈·인터넷": "meme",
  "라이프스타일": "lifestyle",
  "테크·게임": "tech",
  "스포츠": "sports",
  "글로벌 이슈": "global",
};

const IMAGES_PER_CATEGORY = 4;

// Deterministic (not Math.random) so the same trend always resolves to
// the same file — across reloads, across the home grid and the detail
// page, and regardless of where the trend sits in a filtered/reordered
// list. FNV-1a (not a plain `hash*31+c`) specifically because trend ids
// share a lot of structure — same word-hyphenated shape, same trailing
// "-YYYYMMDD" date stamp for every trend generated on a given day — and
// a weaker hash's low bits clustered hard on those shared characters
// (observed 4 of 6 cards landing on the same image in testing). The
// `hash ^= hash >>> 16` step folds FNV-1a's high bits down before the
// modulo, since FNV-1a's low bits alone still aren't uniform enough for
// a small modulus like 4.
function hashToIndex(id: string, count: number): number {
  let hash = 0x811c9dc5;
  for (let i = 0; i < id.length; i++) {
    hash ^= id.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  hash ^= hash >>> 16;
  return (hash >>> 0) % count;
}

// `imageUrl` is this function's hook for a future real per-trend image:
// once Trend/the DB actually has one, pass it as the second argument and
// it wins over the mock photo. No caller does that yet — mock-data.ts
// has no such field — so today every call falls through to the mock.
export function resolveTrendImage(
  trend: { id: string; category: Category },
  imageUrl?: string | null,
): string {
  if (imageUrl) return imageUrl;
  const prefix = CATEGORY_IMAGE_PREFIX[trend.category];
  const index = hashToIndex(trend.id, IMAGES_PER_CATEGORY) + 1;
  return `/images/mock/${prefix}-0${index}.png`;
}
