import { getSupabaseServerClient } from "@/lib/server/supabase-client";

// Server-side validation mirrors the modal's own constraints
// (src/components/feedback-modal.tsx) — never trust the client. Writes
// go through the service-role client (bypasses RLS), so this route is
// the only gate; the SQL check constraints in supabase/schema.sql are a
// second line of defense, not the primary one.
const VALID_SOURCES = new Set(["auto", "header"]);
const MAX_COMMENT_LENGTH = 500;

type FeedbackPayload = {
  rating: number;
  comment: string | null;
  source: "auto" | "header";
};

function parsePayload(body: unknown): FeedbackPayload | null {
  if (typeof body !== "object" || body === null) return null;
  const { rating, comment, source } = body as Record<string, unknown>;

  if (typeof rating !== "number" || !Number.isInteger(rating) || rating < 1 || rating > 5) {
    return null;
  }

  if (typeof source !== "string" || !VALID_SOURCES.has(source)) {
    return null;
  }

  if (comment !== undefined && comment !== null && typeof comment !== "string") {
    return null;
  }

  const trimmedComment = typeof comment === "string" ? comment.trim() : null;
  if (trimmedComment && trimmedComment.length > MAX_COMMENT_LENGTH) {
    return null;
  }

  return {
    rating,
    comment: trimmedComment || null,
    source: source as "auto" | "header",
  };
}

// Basic in-memory, per-IP rate limit against anonymous abuse. This is
// intentionally lightweight ("기본적인 Rate Limiting" in the spec, not a
// durable one) — state is per serverless instance and resets on cold
// start/redeploy, so it won't hold under high scale or multiple
// concurrent instances. A shared store (e.g. Upstash Redis) would be
// needed for a real guarantee; flagged here rather than silently
// shipped as if it were bulletproof.
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000;
const RATE_LIMIT_MAX_REQUESTS = 10;
const requestLog = new Map<string, number[]>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const timestamps = (requestLog.get(ip) ?? []).filter(
    (t) => now - t < RATE_LIMIT_WINDOW_MS,
  );
  if (timestamps.length >= RATE_LIMIT_MAX_REQUESTS) {
    requestLog.set(ip, timestamps);
    return true;
  }
  timestamps.push(now);
  requestLog.set(ip, timestamps);
  return false;
}

function getClientIp(request: Request): string {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) return forwardedFor.split(",")[0].trim();
  return request.headers.get("x-real-ip") ?? "unknown";
}

export async function POST(request: Request) {
  const ip = getClientIp(request);
  if (isRateLimited(ip)) {
    return Response.json(
      { ok: false, error: "너무 많은 요청입니다. 잠시 후 다시 시도해 주세요." },
      { status: 429 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json(
      { ok: false, error: "잘못된 요청입니다." },
      { status: 400 },
    );
  }

  const payload = parsePayload(body);
  if (!payload) {
    return Response.json(
      { ok: false, error: "잘못된 요청입니다." },
      { status: 400 },
    );
  }

  const supabase = getSupabaseServerClient();
  if (!supabase) {
    console.error("[feedback] Supabase client unavailable — missing env vars");
    return Response.json(
      { ok: false, error: "일시적인 오류가 발생했습니다. 다시 시도해 주세요." },
      { status: 500 },
    );
  }

  const { error } = await supabase.from("feedback").insert({
    rating: payload.rating,
    comment: payload.comment,
    source: payload.source,
  });

  if (error) {
    console.error("[feedback] insert failed", error);
    return Response.json(
      { ok: false, error: "일시적인 오류가 발생했습니다. 다시 시도해 주세요." },
      { status: 500 },
    );
  }

  return Response.json({ ok: true });
}
