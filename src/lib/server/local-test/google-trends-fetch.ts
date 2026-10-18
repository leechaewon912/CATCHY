import "server-only";

import type { GoogleTrendItem } from "@/lib/server/local-test/google-trends-types";

// LOCAL TEST ONLY — not imported by any production route/page/DB code.
// Google's own official Trends data-reuse policy (support.google.com/
// trends/answer/4365538): "You can use any information from Google
// Trends, subject to the Google Terms of Service" + "If you reuse
// Trends data, attribute the information to Google with a citation."
// No commercial-use prohibition, no automated-access prohibition for
// this specific endpoint — robots.txt (trends.google.com/robots.txt)
// disallows only /explore? and /trends/explore?, not /trending/rss.
// This is the ONLY data source wired into this file: no RSS/GDELT/web
// search/Wikipedia/other API calls happen anywhere in this pipeline.
const GOOGLE_TRENDS_RSS_URL = "https://trends.google.com/trending/rss?geo=US";
const REQUEST_TIMEOUT_MS = 10_000;

// Deliberately a narrow regex extraction, not a general XML parser —
// this ONLY captures <title>/<ht:approx_traffic>/<pubDate> inside each
// <item>. <ht:news_item> (related article title/url/snippet/thumbnail,
// each article's own separate copyright, not covered by Google's Trends
// data policy) and <ht:picture>/<ht:picture_source> are never captured
// by this function at all — there's no code path here that could read
// them even by mistake.
function parseItems(xml: string): GoogleTrendItem[] {
  const itemBlocks = xml.match(/<item>[\s\S]*?<\/item>/g) ?? [];
  const items: GoogleTrendItem[] = [];

  for (const block of itemBlocks) {
    const titleMatch = /<title>([\s\S]*?)<\/title>/.exec(block);
    const trafficMatch = /<ht:approx_traffic>([\s\S]*?)<\/ht:approx_traffic>/.exec(block);
    const pubDateMatch = /<pubDate>([\s\S]*?)<\/pubDate>/.exec(block);

    if (!titleMatch) continue;

    const term = titleMatch[1]
      .replace(/<!\[CDATA\[|\]\]>/g, "")
      .trim();
    if (!term) continue;

    items.push({
      term,
      approxTraffic: trafficMatch ? trafficMatch[1].trim() : "unknown",
      pubDate: pubDateMatch ? pubDateMatch[1].trim() : new Date().toUTCString(),
    });
  }

  return items;
}

// Single attempt, no retry, non-fatal on failure (returns []) — same
// posture as every other local-test adapter in this project.
export async function fetchGoogleTrendsUS(): Promise<GoogleTrendItem[]> {
  try {
    const response = await fetch(GOOGLE_TRENDS_RSS_URL, {
      cache: "no-store",
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      headers: { "User-Agent": "Mozilla/5.0 (compatible; CatchyLocalTest/1.0)" },
    });
    if (!response.ok) {
      console.error(`[local-test/google-trends] HTTP ${response.status}`);
      return [];
    }
    const xml = await response.text();
    return parseItems(xml);
  } catch (error) {
    console.error("[local-test/google-trends] fetch failed", error);
    return [];
  }
}
