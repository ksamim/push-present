create extension if not exists pgcrypto with schema extensions;

create schema if not exists private;

revoke all on schema private from public, anon, authenticated;

create table private.shortlists (
  id uuid primary key default gen_random_uuid(),
  access_token_hash bytea not null unique,
  created_at timestamptz not null default now()
);

create table private.shortlist_choices (
  shortlist_id uuid not null references private.shortlists (id) on delete cascade,
  idea_id text not null check (
    char_length(idea_id) between 1 and 80
    and idea_id ~ '^[a-z0-9-]+$'
  ),
  selected_at timestamptz not null default now(),
  primary key (shortlist_id, idea_id)
);

alter table private.shortlists enable row level security;
alter table private.shortlist_choices enable row level security;

revoke all on all tables in schema private from public, anon, authenticated;

create or replace function private.create_shortlist(p_access_token text)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  new_shortlist_id uuid;
begin
  if char_length(p_access_token) < 32 or char_length(p_access_token) > 256 then
    raise exception 'Access token must contain between 32 and 256 characters.';
  end if;

  insert into private.shortlists (access_token_hash)
  values (extensions.digest(p_access_token, 'sha256'))
  returning id into new_shortlist_id;

  return new_shortlist_id;
end;
$$;

revoke all on function private.create_shortlist(text) from public, anon, authenticated;

create or replace function public.create_shortlist(p_access_token text)
returns uuid
language sql
security definer
set search_path = ''
as $$
  select private.create_shortlist(p_access_token);
$$;

create or replace function public.get_shortlist(
  p_list_id uuid,
  p_access_token text
)
returns table (idea_id text)
language sql
stable
security definer
set search_path = ''
as $$
  select choices.idea_id
  from private.shortlist_choices as choices
  inner join private.shortlists as shortlists
    on shortlists.id = choices.shortlist_id
  where shortlists.id = p_list_id
    and shortlists.access_token_hash = extensions.digest(p_access_token, 'sha256')
  order by choices.selected_at;
$$;

create or replace function public.set_shortlist_choice(
  p_list_id uuid,
  p_access_token text,
  p_idea_id text,
  p_selected boolean
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if p_idea_id is null
    or char_length(p_idea_id) not between 1 and 80
    or p_idea_id !~ '^[a-z0-9-]+$'
  then
    raise exception 'Invalid idea identifier.';
  end if;

  if not exists (
    select 1
    from private.shortlists as shortlists
    where shortlists.id = p_list_id
      and shortlists.access_token_hash = extensions.digest(p_access_token, 'sha256')
  ) then
    raise exception 'Invalid shortlist credentials.' using errcode = '42501';
  end if;

  if p_selected then
    insert into private.shortlist_choices (shortlist_id, idea_id)
    values (p_list_id, p_idea_id)
    on conflict (shortlist_id, idea_id) do nothing;
  else
    delete from private.shortlist_choices
    where shortlist_id = p_list_id
      and idea_id = p_idea_id;
  end if;
end;
$$;

revoke all on function public.get_shortlist(uuid, text) from public;
revoke all on function public.set_shortlist_choice(uuid, text, text, boolean) from public;
revoke all on function public.create_shortlist(text) from public;

grant execute on function public.create_shortlist(text) to anon, authenticated;
grant execute on function public.get_shortlist(uuid, text) to anon, authenticated;
grant execute on function public.set_shortlist_choice(uuid, text, text, boolean) to anon, authenticated;
