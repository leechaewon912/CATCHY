-- CATCHY Supabase schema (AntigravityProjects/CATCHY)
--
-- This project shares a Supabase project with the earlier Desktop/CATCHY
-- scaffold, so `trends` / `trend_sources` / `expressions` already exist
-- with that project's column set (no `summary`, no `source_type`,
-- license_name/license_url instead). This file is written to be safe to
-- paste into the SQL Editor and run as-is on either a brand-new project
-- or that existing one — `create table if not exists` is a no-op where
-- tables already exist, and the `alter table ... add column if not
-- exists` / constraint-refresh statements below adapt it to this
-- project's shape (see src/lib/mock-data.ts's `Trend`/`TrendSource`).
--
-- Run this in the Supabase SQL Editor (or `supabase db push` if you keep
-- this file under supabase/migrations).

create extension if not exists "pgcrypto";

create table if not exists public.trends (
  id text primary key,
  title text not null,
  category text not null,
  english_summary text not null,
  korean_summary text not null,
  why_trending text not null,
  status text not null check (status in ('draft', 'published')) default 'draft',
  generated_at timestamptz not null default now(),
  reviewed_at timestamptz,
  created_at timestamptz not null default now()
);

-- `summary` is the short card/hero blurb (Trend["summary"] in this
-- project — distinct from englishSummary/koreanSummary).
-- `cluster_key` is the normalized topic key the daily collector used to
-- dedupe articles into this trend, kept for debugging/inspection.
alter table public.trends add column if not exists summary text not null default '';
alter table public.trends add column if not exists cluster_key text;

alter table public.trends drop constraint if exists trends_category_check;
alter table public.trends add constraint trends_category_check check (
  category in ('음악', '영화·시리즈', '밈·인터넷', '라이프스타일', '테크·게임', '스포츠', '글로벌 이슈')
);

create table if not exists public.trend_sources (
  id uuid primary key default gen_random_uuid(),
  trend_id text not null references public.trends (id) on delete cascade,
  source_name text not null,
  original_title text not null,
  original_url text not null,
  published_at text not null,
  usage_note text,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

-- `source_type` mirrors TrendSource["sourceType"] (official/platform/
-- media/reference) from src/lib/mock-data.ts, used by
-- hasOfficialOrPlatformSource() in src/lib/trend-validation.ts.
alter table public.trend_sources add column if not exists source_type text not null default 'media';

alter table public.trend_sources drop constraint if exists trend_sources_source_type_check;
alter table public.trend_sources add constraint trend_sources_source_type_check check (
  source_type in ('official', 'platform', 'media', 'reference')
);

-- This project's TrendSource type has no license_name/license_url
-- fields — relax them if they exist from the older schema so inserts
-- that omit them don't fail. (No-op if the columns were never created.)
do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'trend_sources' and column_name = 'license_name'
  ) then
    alter table public.trend_sources alter column license_name drop not null;
  end if;

  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'trend_sources' and column_name = 'license_url'
  ) then
    alter table public.trend_sources alter column license_url drop not null;
  end if;
end $$;

create table if not exists public.expressions (
  id uuid primary key default gen_random_uuid(),
  trend_id text not null references public.trends (id) on delete cascade,
  phrase text not null,
  meaning_ko text not null,
  nuance text not null,
  usage_situation text not null,
  example_en text not null,
  example_ko text not null,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

-- A single commonly-confused "similar but different" expression plus a
-- short explanation of the nuance difference (ExpressionComparison in
-- src/lib/mock-data.ts). Nullable/optional on purpose — existing rows
-- from before this field existed won't have it, and the app treats a
-- missing comparison as "don't show that section" rather than an error.
alter table public.expressions add column if not exists comparison_phrase text;
alter table public.expressions add column if not exists comparison_nuance_diff text;

-- Tables created via raw SQL (rather than the Table Editor UI) don't
-- always inherit Supabase's usual default grants, which shows up as
-- "permission denied for table trends" even when using the service role
-- key (service_role bypasses RLS, but RLS and GRANTs are separate — a
-- missing GRANT blocks access before RLS is ever evaluated). This makes
-- that explicit and safe to re-run.
grant usage on schema public to service_role, anon, authenticated;
grant select, insert, update, delete on public.trends, public.trend_sources, public.expressions
  to service_role;
grant select on public.trends, public.trend_sources, public.expressions to anon, authenticated;

create index if not exists trend_sources_trend_id_idx on public.trend_sources (trend_id);
create index if not exists expressions_trend_id_idx on public.expressions (trend_id);
create index if not exists trends_status_idx on public.trends (status);
create index if not exists trends_cluster_key_idx on public.trends (cluster_key);

-- RLS: the app currently only reads/writes through the service role key
-- from server-only code, which bypasses RLS entirely. These policies are
-- a defense-in-depth default for if an anon key is ever used
-- client-side — only published trends (and their children) are exposed.
alter table public.trends enable row level security;
alter table public.trend_sources enable row level security;
alter table public.expressions enable row level security;

drop policy if exists "Published trends are publicly readable" on public.trends;
create policy "Published trends are publicly readable"
  on public.trends for select
  using (status = 'published');

drop policy if exists "Sources of published trends are publicly readable" on public.trend_sources;
create policy "Sources of published trends are publicly readable"
  on public.trend_sources for select
  using (
    exists (
      select 1 from public.trends
      where trends.id = trend_sources.trend_id
        and trends.status = 'published'
    )
  );

drop policy if exists "Expressions of published trends are publicly readable" on public.expressions;
create policy "Expressions of published trends are publicly readable"
  on public.expressions for select
  using (
    exists (
      select 1 from public.trends
      where trends.id = expressions.trend_id
        and trends.status = 'published'
    )
  );
