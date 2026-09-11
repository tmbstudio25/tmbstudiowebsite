-- ============================================================
-- TMB STUDIO — Supabase schema v2
-- Run this in Supabase SQL Editor (Dashboard → SQL Editor → New query)
--
-- This REPLACES the projects table from the original schema.
-- The old version had "chapters" and "exhibition" columns — the
-- new template drops both in favor of a simpler, streamlined
-- layout: hero, about, supporting images, scope table, tools.
--
-- WARNING: This drops and recreates the projects table, which
-- deletes any project rows you already have. It reseeds NGILAI
-- and Life Gacha! with their current content (minus chapters/
-- exhibition, which the new template no longer shows).
-- site_settings (home page video + about images) is untouched.
-- ============================================================

drop table if exists projects cascade;

create table projects (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  sort_order int not null default 0,
  published boolean not null default true,

  title text not null default '',
  tagline text not null default '',

  -- Controlled status instead of free text, plus an optional note
  -- for extra detail (e.g. "Expected Q3 2026").
  status text not null default 'in_development'
    check (status in ('in_development', 'published', 'cancelled')),
  status_note text not null default '',

  genre text not null default '',
  platform text not null default '',

  -- What shows on the home page card
  card_media_type text not null default 'image', -- 'image' | 'video'
  card_media_url text not null default '',
  card_media_key text not null default '',        -- R2 object key, for delete

  -- Hero section (full-screen background on the project page)
  hero_background text not null default '',
  hero_background_key text not null default '',

  -- About section
  cover_image text not null default '',
  cover_image_key text not null default '',
  description jsonb not null default '[]',         -- array of paragraph strings

  -- Supporting images gallery (replaces the old exhibition section)
  supporting_images jsonb not null default '[]',    -- array of {url, key, caption}

  -- Scope table
  scope jsonb not null default '[]',                -- array of {label, value}

  -- Tools & software used (same tag style as the home page marquee)
  tools jsonb not null default '[]',                -- array of strings

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index projects_sort_order_idx on projects (sort_order);

create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_projects_updated_at on projects;
create trigger trg_projects_updated_at
  before update on projects
  for each row execute function set_updated_at();

-- ---------- RLS ----------
alter table projects enable row level security;

create policy "public read published projects"
  on projects for select
  to anon
  using (published = true);

create policy "admin full access projects"
  on projects for all
  to authenticated
  using (true)
  with check (true);

-- ---------- Seed data ----------
insert into projects (
  slug, sort_order, published, title, tagline, status, status_note,
  genre, platform, card_media_type, card_media_url,
  hero_background, cover_image, description, supporting_images, scope, tools
) values (
  'ngilai', 0, true, 'NGILAI', 'One Deal, No Salvation', 'in_development', 'Expected Q3 2026',
  'Horror / Narrative', 'TBA', 'video', './assets/ngilai/ngilai WITH BLOOD.mp4',
  './assets/cms-placeholder-bg.svg',
  './assets/ngilai/ngilai poster empty landscape.jpg',
  '[
    "The game is a narrative-driven psychological horror experience set across isolated and abandoned locations. The story follows a lone protagonist who awakens in an unfamiliar hospital with fragmented memories and a growing sense of unease.",
    "As the protagonist escapes and journeys deeper into a forgotten village hidden within the forest, the environment gradually reveals traces of a forbidden ritual performed in the past.",
    "The tone of the game is tense, unsettling, and introspective — emphasizing psychological fear, moral consequence, and atmosphere over direct confrontation."
  ]'::jsonb,
  '[
    {"url": "./assets/ngilai/ngilai chapter 1.jpg", "key": "", "caption": ""},
    {"url": "./assets/ngilai/ngilai chapter 2.jpg", "key": "", "caption": ""},
    {"url": "./assets/ngilai/ngilai chapter 3.jpg", "key": "", "caption": ""},
    {"url": "./assets/ngilai/ngilai chapter 4.jpg", "key": "", "caption": ""},
    {"url": "./assets/imine/imine poster.jpg", "key": "", "caption": ""},
    {"url": "./assets/imine/imine-group.jpg", "key": "", "caption": ""}
  ]'::jsonb,
  '[
    {"label": "Game Mode", "value": "Single Player (4 Levels) · Multiplayer (Coming Soon)"},
    {"label": "Pricing", "value": "TBD"},
    {"label": "Avg. Playtime", "value": "Under 2 hours"},
    {"label": "Unique Value", "value": "Local Malaysian folklore · 4th wall breaking mechanics"},
    {"label": "Genre", "value": "Horror"},
    {"label": "Expected Release", "value": "Q3 2026 (September 2026)"}
  ]'::jsonb,
  '["Unreal Engine", "Blender", "Audacity", "Sketchfab", "Polyhaven"]'::jsonb
);

insert into projects (
  slug, sort_order, published, title, tagline, status, status_note,
  genre, platform, card_media_type, card_media_url,
  hero_background, cover_image, description, supporting_images, scope, tools
) values (
  'lifegacha', 1, true, 'Life Gacha!', 'Gacha With Life As Currency', 'in_development', '',
  'Turn-Based, Rogue-like', 'PC', 'image', './assets/life gacha/Life Gacha Art.png',
  './assets/cms-placeholder-bg.svg',
  './assets/life gacha/Life Gacha Art.png',
  '[
    "Life Gacha! is a turn-based, rogue-like game where players spend their own lifespan to roll a gacha in exchange for weapons and survival. Every roll is a gamble — pulling stronger items brings the player closer to victory, but also closer to death.",
    "The player takes turns fighting enemies using items gained from gacha rolls. Every roll costs the player a piece of their own life. Their appearance changes according to their remaining life — the more they spend, the more visibly they age.",
    "Players can rest to recover HP, but doing so costs them life in return — there is no safe way to recover without paying a price."
  ]'::jsonb,
  '[
    {"url": "./assets/GDGoC IIUM game fest 2026/game-fest-2026-poster.jpg", "key": "", "caption": ""},
    {"url": "./assets/GDGoC IIUM game fest 2026/game-fest-2026-group.jpg", "key": "", "caption": ""}
  ]'::jsonb,
  '[
    {"label": "Genre", "value": "Turn-Based, Rogue-like"},
    {"label": "Dimension", "value": "2D"},
    {"label": "Resolution", "value": "1920 × 1080p"},
    {"label": "Platform", "value": "PC"},
    {"label": "Game Engine", "value": "Unreal Engine"},
    {"label": "Expected Playtime", "value": "8 – 15 minutes"}
  ]'::jsonb,
  '["Unreal Engine", "Illustrator", "Clip Studio Paint", "Capcut", "Filmora", "BandLab"]'::jsonb
);
