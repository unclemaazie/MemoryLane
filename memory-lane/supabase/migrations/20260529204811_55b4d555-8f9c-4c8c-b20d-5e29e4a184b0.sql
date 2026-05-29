
-- Profiles
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  display_name text,
  is_owner boolean not null default false,
  created_at timestamptz not null default now()
);
grant select, insert, update on public.profiles to authenticated;
grant all on public.profiles to service_role;
alter table public.profiles enable row level security;

create policy "profiles read for family" on public.profiles for select to authenticated using (true);
create policy "profiles update own" on public.profiles for update to authenticated using (auth.uid() = id);

-- Family invites (allowed emails)
create table public.family_invites (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  label text,
  invited_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);
grant select, insert, delete on public.family_invites to authenticated;
grant all on public.family_invites to service_role;
alter table public.family_invites enable row level security;

-- Helper functions (security definer)
create or replace function public.is_owner(_uid uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists(select 1 from public.profiles where id = _uid and is_owner = true)
$$;

create or replace function public.is_family(_uid uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists(
    select 1 from public.profiles p
    where p.id = _uid
      and (p.is_owner = true or exists(select 1 from public.family_invites fi where lower(fi.email) = lower(p.email)))
  )
$$;

create policy "invites readable by family" on public.family_invites for select to authenticated using (public.is_family(auth.uid()));
create policy "invites managed by owner" on public.family_invites for insert to authenticated with check (public.is_owner(auth.uid()));
create policy "invites deletable by owner" on public.family_invites for delete to authenticated using (public.is_owner(auth.uid()));

-- Memories
create table public.memories (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references auth.users(id) on delete cascade,
  kind text not null check (kind in ('photo','video','note')),
  title text,
  body text,
  media_path text,
  taken_at date not null default current_date,
  tags text[] not null default '{}',
  created_at timestamptz not null default now()
);
grant select, insert, update, delete on public.memories to authenticated;
grant all on public.memories to service_role;
alter table public.memories enable row level security;

create policy "memories read for family" on public.memories for select to authenticated using (public.is_family(auth.uid()));
create policy "memories insert by family" on public.memories for insert to authenticated with check (public.is_family(auth.uid()) and author_id = auth.uid());
create policy "memories update own or owner" on public.memories for update to authenticated using (author_id = auth.uid() or public.is_owner(auth.uid()));
create policy "memories delete own or owner" on public.memories for delete to authenticated using (author_id = auth.uid() or public.is_owner(auth.uid()));

-- Auto-create profile on signup; first user becomes owner
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  _is_first boolean;
begin
  select not exists(select 1 from public.profiles) into _is_first;
  insert into public.profiles (id, email, display_name, is_owner)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1)),
    _is_first
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Storage bucket (private)
insert into storage.buckets (id, name, public) values ('memories', 'memories', false)
on conflict (id) do nothing;

create policy "memories storage read for family"
  on storage.objects for select to authenticated
  using (bucket_id = 'memories' and public.is_family(auth.uid()));

create policy "memories storage insert for family"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'memories' and public.is_family(auth.uid()) and (storage.foldername(name))[1] = auth.uid()::text);

create policy "memories storage delete own or owner"
  on storage.objects for delete to authenticated
  using (bucket_id = 'memories' and ((storage.foldername(name))[1] = auth.uid()::text or public.is_owner(auth.uid())));
