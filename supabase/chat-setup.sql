-- Run this once in Supabase Dashboard → SQL Editor.
create table if not exists public.chat_messages (
  id bigint generated always as identity primary key,
  name text not null check (char_length(name) between 1 and 32),
  content text not null check (char_length(content) between 1 and 500),
  created_at timestamptz not null default now()
);

alter table public.chat_messages enable row level security;

drop policy if exists "Anyone can read public chat messages" on public.chat_messages;
create policy "Anyone can read public chat messages"
  on public.chat_messages for select
  to anon, authenticated
  using (true);

drop policy if exists "Anyone can post public chat messages" on public.chat_messages;
create policy "Anyone can post public chat messages"
  on public.chat_messages for insert
  to anon, authenticated
  with check (char_length(name) between 1 and 32 and char_length(content) between 1 and 500);

grant select, insert on public.chat_messages to anon, authenticated;
grant usage, select on sequence public.chat_messages_id_seq to anon, authenticated;

do $$
begin
  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'chat_messages'
  ) then
    execute 'alter publication supabase_realtime add table public.chat_messages';
  end if;
end $$;
