-- Pathfinder schema: profiles, conversations, messages
-- Designed audience-agnostic: `segment` lets us support students, career switchers, etc.

create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  segment text not null default 'student',
  locale text not null default 'de',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.conversations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users on delete cascade,
  title text,
  locale text not null default 'de',
  archived boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index conversations_user_id_updated_at_idx
  on public.conversations (user_id, updated_at desc);

create table public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations on delete cascade,
  role text not null check (role in ('user', 'assistant')),
  content text not null,
  created_at timestamptz not null default now()
);

create index messages_conversation_id_created_at_idx
  on public.messages (conversation_id, created_at asc);

-- RLS: users can only see/modify their own data
alter table public.profiles enable row level security;
alter table public.conversations enable row level security;
alter table public.messages enable row level security;

create policy "Users manage own profile"
  on public.profiles for all
  using (auth.uid() = id)
  with check (auth.uid() = id);

create policy "Users manage own conversations"
  on public.conversations for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users manage messages in own conversations"
  on public.messages for all
  using (
    auth.uid() = (
      select user_id from public.conversations
      where conversations.id = messages.conversation_id
    )
  )
  with check (
    auth.uid() = (
      select user_id from public.conversations
      where conversations.id = messages.conversation_id
    )
  );

-- Auto-create profile row when a user signs up
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, locale)
  values (new.id, coalesce(new.raw_user_meta_data->>'locale', 'de'));
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Touch updated_at on conversation row when messages change
create or replace function public.touch_conversation()
returns trigger
language plpgsql
as $$
begin
  update public.conversations
  set updated_at = now()
  where id = new.conversation_id;
  return new;
end;
$$;

create trigger on_message_insert_touch_conversation
  after insert on public.messages
  for each row execute function public.touch_conversation();
