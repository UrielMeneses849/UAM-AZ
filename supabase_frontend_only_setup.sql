-- Portal Academico Simulacion: frontend + Supabase only.
-- Run this in Supabase SQL Editor AFTER creating these Auth users:
--   faroos952@gmail.com
--   2262139202@simulacion.local

begin;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique not null,
  role text not null check (role in ('ADMIN', 'STUDENT')),
  student_id integer references public.students(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.students alter column created_at set default now();
alter table public.students alter column updated_at set default now();
alter table public.academic_records alter column created_at set default now();
alter table public.academic_records alter column updated_at set default now();
alter table public.notices alter column published_at set default now();

alter table public.subjects
add column if not exists curriculum_term integer not null default 1
check (curriculum_term between 1 and 12);

alter table public.students
add column if not exists current_curriculum_term integer not null default 1
check (current_curriculum_term between 1 and 12);

alter table public.students
add column if not exists current_term_id integer references public.terms(id) on delete set null;

insert into public.terms (codigo, nombre, fecha_inicio, fecha_fin, activo)
values
  ('24P', 'Primavera 2024', '2024-04-01', '2024-07-19', true),
  ('24O', 'Otoño 2024', '2024-09-02', '2024-12-13', true),
  ('25I', 'Invierno 2025', '2025-01-06', '2025-03-28', true),
  ('25P', 'Primavera 2025', '2025-04-07', '2025-07-18', true),
  ('25O', 'Otoño 2025', '2025-09-01', '2025-12-12', true),
  ('26I', 'Invierno 2026', '2026-01-05', '2026-03-27', true),
  ('26O', 'Otoño 2026', '2026-09-07', '2026-12-18', true)
on conflict (codigo) do update set
  nombre = excluded.nombre,
  fecha_inicio = excluded.fecha_inicio,
  fecha_fin = excluded.fecha_fin,
  activo = excluded.activo;

insert into public.subjects (clave, nombre, creditos, curriculum_term, activo)
values
  ('1100037', 'INTRODUCCION A LA INGENIERIA', 6, 1, true),
  ('1111078', 'INTRODUCCION A LA FISICA', 4, 1, true),
  ('1112013', 'COMPLEMENTOS DE MATEMATICAS', 9, 1, true),
  ('1112042', 'INTRODUCCION AL CALCULO', 11, 1, true),
  ('1113084', 'ESTRUCTURA ATOMICA Y ENLACE QUIMICO', 9, 1, true),
  ('1113085', 'LABORATORIO DE REACCIONES QUIMICAS', 3, 1, true)
on conflict (clave) do update set
  nombre = excluded.nombre,
  creditos = excluded.creditos,
  curriculum_term = excluded.curriculum_term,
  activo = excluded.activo;

insert into public.students (
  account_number,
  name,
  first_last_name,
  second_last_name,
  email,
  campus,
  career,
  status
)
values (
  '2262139202',
  'ALUMNO',
  'PENDIENTE',
  '',
  '2262139202@simulacion.local',
  'Azcapotzalco',
  'Licenciatura pendiente de configurar',
  'ACTIVO'
)
on conflict (account_number) do update set
  name = excluded.name,
  first_last_name = excluded.first_last_name,
  second_last_name = excluded.second_last_name,
  email = excluded.email,
  campus = excluded.campus,
  career = excluded.career,
  status = excluded.status;

update public.students
set
  current_curriculum_term = 1,
  current_term_id = (select id from public.terms where codigo = '26O')
where account_number = '2262139202';

create unique index if not exists academic_records_acta_number_unique
on public.academic_records (acta_number);

create unique index if not exists academic_records_student_subject_unique
on public.academic_records (student_id, subject_id);

-- Las calificaciones se capturan exclusivamente desde el portal ADMIN.
-- No se insertan registros académicos de demostración en este script.

insert into public.notices (title, content, active)
values
  ('Bienvenida al portal de simulación', 'Consulta tu información académica y los registros capturados por administración.', true),
  ('Periodo lectivo 26O', 'La información mostrada pertenece únicamente a esta simulación privada.', true)
on conflict do nothing;

insert into public.profiles (id, username, role, student_id)
select au.id, 'admin', 'ADMIN', null
from auth.users au
where lower(au.email) = 'faroos952@gmail.com'
on conflict (id) do update set
  username = excluded.username,
  role = excluded.role,
  student_id = excluded.student_id,
  updated_at = now();

insert into public.profiles (id, username, role, student_id)
select au.id, '2262139202', 'STUDENT', st.id
from auth.users au
cross join public.students st
where lower(au.email) = '2262139202@simulacion.local'
  and st.account_number = '2262139202'
on conflict (id) do update set
  username = excluded.username,
  role = excluded.role,
  student_id = excluded.student_id,
  updated_at = now();

create or replace function public.current_app_role()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select role from public.profiles where id = auth.uid()
$$;

create or replace function public.current_student_id()
returns integer
language sql
stable
security definer
set search_path = public
as $$
  select student_id from public.profiles where id = auth.uid()
$$;

alter table public.profiles enable row level security;
alter table public.students enable row level security;
alter table public.subjects enable row level security;
alter table public.terms enable row level security;
alter table public.academic_records enable row level security;
alter table public.notices enable row level security;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'profile-photos',
  'profile-photos',
  false,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists profile_photos_select_own on storage.objects;
create policy profile_photos_select_own on storage.objects
for select to authenticated
using (
  bucket_id = 'profile-photos'
  and (storage.foldername(name))[1] = auth.uid()::text
);

drop policy if exists profile_photos_insert_own on storage.objects;
create policy profile_photos_insert_own on storage.objects
for insert to authenticated
with check (
  bucket_id = 'profile-photos'
  and (storage.foldername(name))[1] = auth.uid()::text
);

drop policy if exists profile_photos_update_own on storage.objects;
create policy profile_photos_update_own on storage.objects
for update to authenticated
using (
  bucket_id = 'profile-photos'
  and (storage.foldername(name))[1] = auth.uid()::text
)
with check (
  bucket_id = 'profile-photos'
  and (storage.foldername(name))[1] = auth.uid()::text
);

-- No se crea política DELETE: desde el frontend la foto solo puede subirse
-- o reemplazarse. Su eliminación queda reservada al panel de Supabase.

drop policy if exists profiles_select on public.profiles;
create policy profiles_select on public.profiles
for select to authenticated
using (id = auth.uid() or public.current_app_role() = 'ADMIN');

drop policy if exists profiles_update on public.profiles;
create policy profiles_update on public.profiles
for update to authenticated
using (public.current_app_role() = 'ADMIN')
with check (public.current_app_role() = 'ADMIN');

drop policy if exists students_select on public.students;
create policy students_select on public.students
for select to authenticated
using (public.current_app_role() = 'ADMIN' or id = public.current_student_id());

drop policy if exists students_insert on public.students;
create policy students_insert on public.students
for insert to authenticated
with check (public.current_app_role() = 'ADMIN');

drop policy if exists students_update on public.students;
create policy students_update on public.students
for update to authenticated
using (public.current_app_role() = 'ADMIN')
with check (public.current_app_role() = 'ADMIN');

drop policy if exists students_delete on public.students;
create policy students_delete on public.students
for delete to authenticated
using (public.current_app_role() = 'ADMIN');

drop policy if exists subjects_select on public.subjects;
create policy subjects_select on public.subjects
for select to authenticated
using (true);

drop policy if exists subjects_insert on public.subjects;
create policy subjects_insert on public.subjects
for insert to authenticated
with check (public.current_app_role() = 'ADMIN');

drop policy if exists subjects_update on public.subjects;
create policy subjects_update on public.subjects
for update to authenticated
using (public.current_app_role() = 'ADMIN')
with check (public.current_app_role() = 'ADMIN');

drop policy if exists terms_select on public.terms;
create policy terms_select on public.terms
for select to authenticated
using (true);

drop policy if exists terms_insert on public.terms;
create policy terms_insert on public.terms
for insert to authenticated
with check (public.current_app_role() = 'ADMIN');

drop policy if exists records_select on public.academic_records;
create policy records_select on public.academic_records
for select to authenticated
using (public.current_app_role() = 'ADMIN' or student_id = public.current_student_id());

drop policy if exists records_insert on public.academic_records;
create policy records_insert on public.academic_records
for insert to authenticated
with check (public.current_app_role() = 'ADMIN');

drop policy if exists records_update on public.academic_records;
create policy records_update on public.academic_records
for update to authenticated
using (public.current_app_role() = 'ADMIN')
with check (public.current_app_role() = 'ADMIN');

drop policy if exists records_delete on public.academic_records;
create policy records_delete on public.academic_records
for delete to authenticated
using (public.current_app_role() = 'ADMIN');

drop policy if exists notices_select on public.notices;
create policy notices_select on public.notices
for select to authenticated
using (active = true or public.current_app_role() = 'ADMIN');

drop policy if exists notices_insert on public.notices;
create policy notices_insert on public.notices
for insert to authenticated
with check (public.current_app_role() = 'ADMIN');

drop policy if exists notices_update on public.notices;
create policy notices_update on public.notices
for update to authenticated
using (public.current_app_role() = 'ADMIN')
with check (public.current_app_role() = 'ADMIN');

commit;

-- Deben aparecer exactamente estos dos accesos al terminar:
--   admin       | ADMIN
--   2262139202  | STUDENT
select
  p.username,
  p.role,
  s.account_number
from public.profiles p
left join public.students s on s.id = p.student_id
where p.username in ('admin', '2262139202')
order by p.role, p.username;
