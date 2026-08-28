alter table private.shortlist_choices
add column category_id text;

update private.shortlist_choices
set category_id = 'legacy-' || idea_id;

alter table private.shortlist_choices
alter column category_id set not null;

alter table private.shortlist_choices
add constraint shortlist_choices_one_per_category
unique (shortlist_id, category_id);

drop function public.set_shortlist_choice(uuid, text, text, boolean);

create function public.set_shortlist_choice(
  p_list_id uuid,
  p_access_token text,
  p_category_id text,
  p_idea_id text,
  p_selected boolean
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if p_category_id is null
    or char_length(p_category_id) not between 1 and 80
    or p_category_id !~ '^[a-z0-9-]+$'
  then
    raise exception 'Invalid category identifier.';
  end if;

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
    insert into private.shortlist_choices (shortlist_id, category_id, idea_id)
    values (p_list_id, p_category_id, p_idea_id)
    on conflict (shortlist_id, category_id)
    do update set
      idea_id = excluded.idea_id,
      selected_at = now();
  else
    delete from private.shortlist_choices
    where shortlist_id = p_list_id
      and category_id = p_category_id
      and idea_id = p_idea_id;
  end if;
end;
$$;

revoke all on function public.set_shortlist_choice(uuid, text, text, text, boolean)
from public;

grant execute on function public.set_shortlist_choice(uuid, text, text, text, boolean)
to anon, authenticated;