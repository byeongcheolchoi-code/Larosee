-- ============================================
-- 최고관리자(super_admin) 역할 추가 마이그레이션
-- Supabase SQL Editor에서 전체 복사 후 Run
-- ============================================

-- 1. role 체크 제약조건에 '최고관리자' 추가
alter table public.profiles drop constraint profiles_role_check;
alter table public.profiles add constraint profiles_role_check
  check (role in ('pending','본사관리자','최고관리자','파트장','일반직원'));

-- 2. 기존 "관리자 전체 프로필 조회" 정책을 최고관리자도 포함하도록 갱신
drop policy "관리자 전체 프로필 조회" on public.profiles;
create policy "관리자 전체 프로필 조회"
on public.profiles for select
using (
  exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role in ('본사관리자','최고관리자')
  )
);

-- 3. 승인/거절(update) 정책 갱신
--    - 본사관리자: 일반직원·파트장 승인만 가능 (본사관리자/최고관리자로는 못 올림)
--    - 최고관리자: 모든 권한 부여 가능
drop policy "관리자 승인 처리" on public.profiles;

create policy "본사관리자 일반승인"
on public.profiles for update
using (
  exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = '본사관리자')
)
with check (
  role in ('일반직원','파트장','rejected')
  or status = 'rejected'
);

create policy "최고관리자 전체승인"
on public.profiles for update
using (
  exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = '최고관리자')
);

-- 4. 나머지 테이블(test_scores, sales_records, coaching_logs)의
--    "관리자 전체 조회" 정책들도 최고관리자를 포함하도록 갱신
drop policy "관리자 전체 점수 조회" on public.test_scores;
create policy "관리자 전체 점수 조회"
on public.test_scores for select
using (
  exists (select 1 from public.profiles p where p.id = auth.uid() and p.role in ('본사관리자','최고관리자'))
);

drop policy "관리자 전체 매출 조회" on public.sales_records;
create policy "관리자 전체 매출 조회"
on public.sales_records for select
using (
  exists (select 1 from public.profiles p where p.id = auth.uid() and p.role in ('본사관리자','최고관리자'))
);

drop policy "관리자 전체 코칭기록 조회" on public.coaching_logs;
create policy "관리자 전체 코칭기록 조회"
on public.coaching_logs for select
using (
  exists (select 1 from public.profiles p where p.id = auth.uid() and p.role in ('본사관리자','최고관리자'))
);

-- ============================================
-- 5. 라온님 계정을 최고관리자로 승격
--    아래 이메일을 본인 이메일로 바꿔서 실행하세요
-- ============================================
-- update public.profiles
-- set role = '최고관리자', status = 'approved'
-- where email = '본인이메일@example.com';
