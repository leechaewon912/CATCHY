import type { GoogleTrendItem } from "@/lib/server/local-test/google-trends-types";

// LOCAL TEST ONLY — not imported by any production route/page/DB code.
// A frozen snapshot of 16 unique terms collected via several real,
// read-only polls of the live Google Trends RSS feed
// (trends.google.com/trending/rss?geo=US) between 2026-10-15 19:58 and
// 20:06 local time — not fabricated, not hand-picked by topic. Polling
// stopped once the user asked not to keep polling just to fill out the
// candidate count (see conversation). The live endpoint only ever
// returns a rolling ~10-item snapshot (see google-trends-fetch.ts's doc
// comment), so this file exists to make the preview page's result
// reproducible across reloads without re-polling Google's endpoint
// every time someone opens the page — build-google-trends-content.ts's
// preFetchedItems parameter accepts this directly in place of a fresh
// live fetch.
export const GOOGLE_TRENDS_SNAPSHOT_2026_10_15: GoogleTrendItem[] = [
  { term: "spacex stocks", approxTraffic: "200+", pubDate: "Thu, 15 Oct 2026 03:40:00 -0700" },
  { term: "ronald acuña jr. trade rumors", approxTraffic: "100+", pubDate: "Thu, 15 Oct 2026 03:40:00 -0700" },
  { term: "الطقس", approxTraffic: "200+", pubDate: "Thu, 15 Oct 2026 03:40:00 -0700" },
  { term: "smh stock", approxTraffic: "100+", pubDate: "Thu, 15 Oct 2026 03:40:00 -0700" },
  { term: "alexander zverev", approxTraffic: "1000+", pubDate: "Thu, 15 Oct 2026 03:30:00 -0700" },
  { term: "ashley hinson", approxTraffic: "200+", pubDate: "Thu, 15 Oct 2026 03:30:00 -0700" },
  { term: "black friday 2026", approxTraffic: "100+", pubDate: "Thu, 15 Oct 2026 03:30:00 -0700" },
  { term: "local weather", approxTraffic: "100+", pubDate: "Thu, 15 Oct 2026 03:30:00 -0700" },
  { term: "south richmond hill", approxTraffic: "200+", pubDate: "Thu, 15 Oct 2026 03:20:00 -0700" },
  { term: "dc weather", approxTraffic: "500+", pubDate: "Thu, 15 Oct 2026 03:20:00 -0700" },
  { term: "hasan piker", approxTraffic: "200+", pubDate: "Thu, 15 Oct 2026 03:50:00 -0700" },
  { term: "nfl start em sit em week 6", approxTraffic: "2000+", pubDate: "Thu, 15 Oct 2026 03:50:00 -0700" },
  { term: "cleveland weather", approxTraffic: "100+", pubDate: "Thu, 15 Oct 2026 03:50:00 -0700" },
  { term: "be stock", approxTraffic: "100+", pubDate: "Thu, 15 Oct 2026 03:50:00 -0700" },
  { term: "nikumaroro", approxTraffic: "100+", pubDate: "Thu, 15 Oct 2026 03:40:00 -0700" },
  { term: "did anyone win the powerball last night", approxTraffic: "1000+", pubDate: "Thu, 15 Oct 2026 03:50:00 -0700" },
];
