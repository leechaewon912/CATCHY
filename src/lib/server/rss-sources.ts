import "server-only";

import type { Category } from "@/lib/mock-data";
import { isCommerciallyUsable } from "@/lib/server/rss-source-policy";

// Curated, manually-vetted official/publisher RSS feeds per category —
// the default trend collection source (see src/lib/server/rss-collect.ts).
// Picked for two reasons: RSS feeds are a publisher's own explicit
// "take this and redistribute the headline/link" syndication format
// (unlike scraping an API without clear terms), and they're static,
// CDN-served XML files that don't get aggressively rate-limited the way
// a live search API does — see the GDELT rate-limit history in
// src/lib/server/gdelt.ts and the README for why that mattered.
//
// Each category lists 2-4 feeds from distinct domains so a single
// trending story corroborated by 2+ of them can clear the
// MIN_DISTINCT_DOMAINS gate in collect-trends.ts on its own. Re-verify
// these URLs occasionally — publishers do restructure feeds.
export const CATEGORY_RSS_FEEDS: Record<Category, string[]> = {
  "음악": [
    "https://www.billboard.com/feed/",
    "https://www.rollingstone.com/music/music-news/feed/",
    "https://pitchfork.com/feed/feed-news/rss",
    "https://www.nme.com/news/music/feed",
  ],
  "영화·시리즈": [
    "https://variety.com/feed/",
    "https://www.hollywoodreporter.com/feed/",
    "https://deadline.com/feed/",
    "https://www.indiewire.com/feed/",
    // Added for 2030 focus: the four above are trade press (industry/
    // business angle) — neither covers the celebrity/influencer-gossip
    // angle that's a huge share of what 20-30s actually read about
    // entertainment. Both verified live with healthy item counts.
    "https://pagesix.com/feed/",
    "https://www.eonline.com/syndication/feeds/rssfeeds/topstories.xml",
  ],
  "밈·인터넷": [
    "https://www.theverge.com/rss/index.xml",
    "https://mashable.com/feeds/rss/all",
    // Added for 2030 focus: Verge/Mashable lean tech-culture; Dazed adds
    // the youth/internet-culture voice (fashion, music, viral trends)
    // this category's name implies. Know Your Meme was evaluated and
    // rejected — its feed only carries ~3 items and is deep-dive meme
    // history rather than corroborated breaking topics, so it can't
    // clear the 2+-domain publish gate in practice.
    "https://www.dazeddigital.com/rss",
  ],
  "라이프스타일": [
    "https://www.vogue.com/feed/rss",
    "https://www.gq.com/feed/rss",
    // Added for 2030 focus: Vogue/GQ cover fashion well but not brand/
    // streetwear consumer-trend culture (Hypebeast) or a dedicated
    // beauty-trend feed (Allure) — both explicitly asked for.
    "https://hypebeast.com/feed",
    "https://www.allure.com/feed/rss",
  ],
  "테크·게임": [
    "https://techcrunch.com/feed/",
    "https://feeds.arstechnica.com/arstechnica/index",
    // Polygon's RSS endpoint (polygon.com/rss/index.xml) is dead as of
    // 2026-10 — every request times out or drops the connection, on
    // both HTTP/2 and HTTP/1.1. Replaced with Kotaku (verified live,
    // same gaming-news niche).
    "https://kotaku.com/feed",
    "https://www.ign.com/rss/articles/feed?tags=games",
  ],
  "스포츠": [
    "https://www.espn.com/espn/rss/news",
    "https://feeds.bbci.co.uk/sport/rss.xml",
    "https://www.skysports.com/rss/12040",
    // No change: evaluated Bleacher Report (athlete-culture angle,
    // closer to what 20-30s read) but its feed returns HTTP 403 — bot-
    // blocked. The three above already surface globally-viral athlete
    // stories (see sports-beats-claim-clayton-humphries, 49ers-edge),
    // so left as-is rather than add something unverified.
  ],
  "글로벌 이슈": [
    "https://feeds.bbci.co.uk/news/world/rss.xml",
    "https://www.theguardian.com/world/rss",
    "https://feeds.npr.org/1004/rss.xml",
    // Added for 2030 focus: BBC/Guardian/NPR are straight geopolitics.
    // Vox adds social/cultural/tech explainer journalism (its actual
    // beat) in a conversational, idiom-rich register; Rest of World
    // adds global tech/culture coverage outside the US/UK-centric
    // default. Both verified live.
    "https://www.vox.com/rss/index.xml",
    "https://restofworld.org/feed/latest/",
  ],
};

// true only outside production AND when explicitly opted into — set
// RSS_DEV_INCLUDE_ALL_FEEDS=true in .env.local to exercise the full
// curated list (including permission_required feeds) for local testing.
// The NODE_ENV check is not just a default: it makes the override
// physically inert in production even if the env var is ever set there
// by mistake (e.g. a copy-pasted .env), so production always falls
// through to the license-filtered path below regardless.
const DEV_INCLUDE_ALL_FEEDS =
  process.env.NODE_ENV !== "production" && process.env.RSS_DEV_INCLUDE_ALL_FEEDS === "true";

// The actual feed list collection should fetch for a category — licensed
// (src/lib/server/rss-source-policy.ts) feeds in production and by
// default everywhere, or the full curated list when explicitly running
// in dev-test mode (see DEV_INCLUDE_ALL_FEEDS above). A feed with no
// registry entry at all is excluded, never included, the same as an
// explicit "permission_required" verdict (see
// rss-source-policy.ts#isCommerciallyUsable).
export function getActiveRssFeedsForCategory(category: Category): string[] {
  const feeds = CATEGORY_RSS_FEEDS[category];
  if (DEV_INCLUDE_ALL_FEEDS) return feeds;
  return feeds.filter((feedUrl) => isCommerciallyUsable(feedUrl));
}

// The article-page domain for every feed above (not always identical to
// the feed URL's own host — e.g. BBC/NPR/Ars Technica serve their feed
// off a different subdomain than their articles live on). Hand-curated
// rather than parsed from the feed URLs because that host-vs-article-
// domain mismatch makes auto-derivation unreliable for a few of these.
//
// Each one was individually picked as a reputable official outlet/
// publisher for its category, so collect-trends.ts treats a cluster
// backed by 2+ of these the same as it would an official/platform
// GDELT source — the trust call already happened here, at curation
// time, rather than needing a second per-domain official/platform check.
export const CURATED_RSS_DOMAINS: ReadonlySet<string> = new Set([
  "billboard.com",
  "rollingstone.com",
  "pitchfork.com",
  "nme.com",
  "variety.com",
  "hollywoodreporter.com",
  "deadline.com",
  "indiewire.com",
  "pagesix.com",
  "eonline.com",
  "theverge.com",
  "mashable.com",
  "dazeddigital.com",
  "vogue.com",
  "gq.com",
  "hypebeast.com",
  "allure.com",
  "techcrunch.com",
  "arstechnica.com",
  "kotaku.com",
  "ign.com",
  "espn.com",
  "bbc.com",
  "bbc.co.uk",
  "skysports.com",
  "theguardian.com",
  "npr.org",
  "vox.com",
  "restofworld.org",
]);
