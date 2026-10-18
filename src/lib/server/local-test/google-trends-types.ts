// LOCAL TEST ONLY — not imported by any production route/page/DB code.
export type PreferredCategory =
  | "Entertainment"
  | "Fashion & Beauty"
  | "Internet Culture"
  | "Lifestyle"
  | "Technology";

export const PREFERRED_CATEGORIES: PreferredCategory[] = [
  "Entertainment",
  "Fashion & Beauty",
  "Internet Culture",
  "Lifestyle",
  "Technology",
];

// Fixed 1:1 mapping onto existing mock assets only (public/images/mock/)
// — no new images, category image is always the representative icon,
// never the original trend's own photo (Google Trends' ht:picture /
// news_item thumbnails are never read by this pipeline at all — see
// google-trends-fetch.ts).
export const PREFERRED_CATEGORY_IMAGE: Record<PreferredCategory, string> = {
  Entertainment: "/images/mock/film-02.jpg",
  "Fashion & Beauty": "/images/mock/lifestyle-03.jpg",
  "Internet Culture": "/images/mock/meme-01.jpg",
  Lifestyle: "/images/mock/lifestyle-01.jpg",
  Technology: "/images/mock/tech-03.jpg",
};

// Raw term parsed from the Google Trends RSS feed — deliberately only
// the fields covered by Google's own data-reuse policy (term, interest
// level, timestamp). ht:news_item (related article title/url/snippet/
// thumbnail) and ht:picture/ht:picture_source are never parsed into
// this type at all — see google-trends-fetch.ts's regex, which doesn't
// even capture those fields — so there is no field here to accidentally
// read into a prompt or render on screen.
export type GoogleTrendItem = {
  term: string;
  approxTraffic: string;
  pubDate: string;
};
