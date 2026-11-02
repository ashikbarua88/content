-- Accounts, discussion and private reflections for the Abhidhamma reading website.
-- Run once in the Supabase dashboard: SQL Editor → New query → paste this file → Run.
-- Safe to re-run: every statement checks before it creates.
--
-- Who can do what (enforced by row-level security, not by the website):
--   anyone            reads profiles and visible comments
--   a signed-in user  writes comments as themself, edits or deletes only their own,
--                     and reads and writes only their own reflections
--   an admin          hides or unhides any comment (set is_admin by hand, see the end)

-- ---------- profiles: one per account, created automatically at sign-up ----------
create table if not exists public.profiles (
  id           uuid primary key references auth.users (id) on delete cascade,
  display_name text not null default 'Reader' check (char_length(display_name) between 1 and 60),
  avatar_url   text,
  is_admin     boolean not null default false,
  created_at   timestamptz not null default now()
);
alter table public.profiles enable row level security;

drop policy if exists "profiles are public" on public.profiles;
create policy "profiles are public" on public.profiles for select using (true);
drop policy if exists "users update their own profile" on public.profiles;
create policy "users update their own profile" on public.profiles for update
  using (auth.uid() = id) with check (auth.uid() = id);
-- Users may change their name and picture, never their admin flag.
revoke update on public.profiles from authenticated, anon;
grant update (display_name, avatar_url) on public.profiles to authenticated;

create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, display_name, avatar_url)
  values (
    new.id,
    left(coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name',
                  new.raw_user_meta_data ->> 'user_name', split_part(new.email, '@', 1), 'Reader'), 60),
    new.raw_user_meta_data ->> 'avatar_url'
  )
  on conflict (id) do nothing;
  return new;
end $$;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

create or replace function public.is_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select coalesce((select is_admin from public.profiles where id = auth.uid()), false)
$$;

-- ---------- comments: one thread per page, replies one level deep ----------
create table if not exists public.comments (
  id         bigint generated always as identity primary key,
  page       text not null check (char_length(page) between 1 and 200),      -- e.g. concept:javana
  parent_id  bigint references public.comments (id) on delete cascade,
  user_id    uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  body       text not null check (char_length(body) between 1 and 5000),
  deleted    boolean not null default false,   -- the author removed it; kept so replies stay in place
  hidden     boolean not null default false,   -- an admin hid it
  created_at timestamptz not null default now(),
  edited_at  timestamptz
);
create index if not exists comments_page_idx on public.comments (page, created_at);
alter table public.comments enable row level security;

drop policy if exists "visible comments are public" on public.comments;
create policy "visible comments are public" on public.comments for select
  using (not hidden or auth.uid() = user_id or public.is_admin());
drop policy if exists "signed-in users comment as themselves" on public.comments;
create policy "signed-in users comment as themselves" on public.comments for insert to authenticated
  with check (auth.uid() = user_id and not hidden and not deleted);
drop policy if exists "authors edit their own comments" on public.comments;
create policy "authors edit their own comments" on public.comments for update to authenticated
  using (auth.uid() = user_id or public.is_admin())
  with check (auth.uid() = user_id or public.is_admin());

-- Authors may change only the text and the deleted flag; admins only the hidden flag.
create or replace function public.guard_comment_update() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if new.page <> old.page or new.user_id <> old.user_id or new.parent_id is distinct from old.parent_id
     or new.created_at <> old.created_at then
    raise exception 'only the text of a comment can change';
  end if;
  if new.hidden <> old.hidden and not public.is_admin() then
    raise exception 'only an admin can hide a comment';
  end if;
  if (new.body <> old.body or new.deleted <> old.deleted) and auth.uid() <> old.user_id then
    raise exception 'only the author can edit or delete a comment';
  end if;
  if new.body <> old.body then new.edited_at := now(); end if;
  return new;
end $$;
drop trigger if exists guard_comment_update on public.comments;
create trigger guard_comment_update before update on public.comments
  for each row execute function public.guard_comment_update();

-- ---------- reflections: each reader's private answers, one per page ----------
create table if not exists public.reflections (
  user_id    uuid not null default auth.uid() references auth.users (id) on delete cascade,
  page       text not null check (char_length(page) between 1 and 200),
  title      text not null default '' check (char_length(title) <= 300),
  url        text not null default '' check (char_length(url) <= 500),
  question   text not null default '' check (char_length(question) <= 2000),
  body       text not null default '' check (char_length(body) <= 20000),
  updated_at timestamptz not null default now(),
  primary key (user_id, page)
);
alter table public.reflections enable row level security;
drop policy if exists "reflections are private" on public.reflections;
create policy "reflections are private" on public.reflections for all to authenticated
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ---------- a reader may delete everything they wrote, and their account ----------
create or replace function public.delete_my_account() returns void
language plpgsql security definer set search_path = public, auth as $$
begin
  delete from auth.users where id = auth.uid();   -- cascades to profile, comments, reflections
end $$;
revoke all on function public.delete_my_account() from public, anon;
grant execute on function public.delete_my_account() to authenticated;

-- ---------- making yourself an admin (run once, with your own email) ----------
-- update public.profiles set is_admin = true
--   where id = (select id from auth.users where email = 'you@example.com');
