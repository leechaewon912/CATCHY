// LOCAL TEST ONLY — not imported by any API route, page, or DB code.
// Defines the 7-category taxonomy being evaluated as a replacement for
// the production Category type (src/lib/mock-data.ts), which this file
// never touches. "global" is a scope value, not a category, per this
// test's explicit design — region is a separate tag, not a category.

export type NewCategory =
  | "국제정치·외교"
  | "경제·산업"
  | "기후·환경"
  | "과학·기술"
  | "보건·사회"
  | "안보·인도주의"
  | "문화·교육";

export const NEW_CATEGORIES: NewCategory[] = [
  "국제정치·외교",
  "경제·산업",
  "기후·환경",
  "과학·기술",
  "보건·사회",
  "안보·인도주의",
  "문화·교육",
];

export type Scope = "global";

export type RegionTag = "korea" | "europe";

// Fixed 1:1 mapping onto existing mock assets only (public/images/mock/)
// — no new images. Each new category gets exactly one representative
// image, shown as a category illustration, never as "the article's own
// photo" (see run-local-test.ts's attribution handling).
export const NEW_CATEGORY_IMAGE: Record<NewCategory, string> = {
  "국제정치·외교": "/images/mock/global-01.jpg",
  "경제·산업": "/images/mock/tech-02.jpg",
  "기후·환경": "/images/mock/global-02.jpg",
  "과학·기술": "/images/mock/tech-01.jpg",
  "보건·사회": "/images/mock/lifestyle-01.jpg",
  "안보·인도주의": "/images/mock/global-03.jpg",
  "문화·교육": "/images/mock/film-01.jpg",
};

// Keyword-only, not LLM — deliberately simple and deterministic so test
// runs are reproducible. Checked against the lowercased title only
// (never body text, which this pipeline never fetches in the first
// place).
const KOREA_KEYWORDS = [
  "한국",
  "korea",
  "korean",
  "seoul",
  "서울",
  "k-pop",
  "kpop",
];

// EU Press Corner articles are tagged "europe" by source (the publisher
// itself is an EU institution) regardless of title content — a title
// keyword check isn't needed for that one case the way it is for Korea.
export function inferRegionTags(title: string, sourceId: string): RegionTag[] {
  const tags: RegionTag[] = [];
  if (sourceId === "eu-press-corner") {
    tags.push("europe");
  }
  const lower = title.toLowerCase();
  if (KOREA_KEYWORDS.some((keyword) => lower.includes(keyword))) {
    tags.push("korea");
  }
  return tags;
}
