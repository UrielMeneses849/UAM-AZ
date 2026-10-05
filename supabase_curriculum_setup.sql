-- Separa el trimestre curricular (1, 2, 3) del periodo académico (26O, 27I...).
-- Ejecutar una vez en Supabase SQL Editor. Es idempotente.

begin;

alter table public.subjects
add column if not exists curriculum_term integer not null default 1
check (curriculum_term between 1 and 12);

alter table public.students
add column if not exists current_curriculum_term integer not null default 1
check (current_curriculum_term between 1 and 12);

alter table public.students
add column if not exists current_term_id integer references public.terms(id) on delete set null;

update public.subjects
set curriculum_term = 1
where clave in ('1100037', '1111078', '1112013', '1112042', '1113084', '1113085');

update public.students
set
  current_curriculum_term = 1,
  current_term_id = (select id from public.terms where codigo = '26O')
where account_number = '2262139202';

create unique index if not exists academic_records_student_subject_unique
on public.academic_records (student_id, subject_id);

drop policy if exists subjects_update on public.subjects;
create policy subjects_update on public.subjects
for update to authenticated
using (public.current_app_role() = 'ADMIN')
with check (public.current_app_role() = 'ADMIN');

commit;

select
  st.account_number,
  st.current_curriculum_term,
  tm.codigo as current_period,
  count(sb.id) as subjects_in_curriculum_term
from public.students st
left join public.terms tm on tm.id = st.current_term_id
left join public.subjects sb on sb.curriculum_term = st.current_curriculum_term and sb.activo = true
where st.account_number = '2262139202'
group by st.account_number, st.current_curriculum_term, tm.codigo;
