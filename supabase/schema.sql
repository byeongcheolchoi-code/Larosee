-- ============================================
-- 라로제 코리아 교육 플랫폼 - DB 스키마
-- Supabase SQL Editor에서 전체 복사 후 Run
-- ============================================

-- 1. 지점 테이블
create table public.stores (
  id uuid primary key default gen_random_uuid(),
  name text not null,                  -- 예: '롯데 본점'
  department_store text,               -- 예: '롯데백화점'
  created_at timestamptz default now()
);

-- 2. 직원 프로필 테이블 (Supabase Auth의 auth.users와 1:1 연결)
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null,
  email text not null,
  store_id uuid references public.stores(id),
  requested_role text not null check (requested_role in ('파트장','일반직원')),
  role text not null default 'pending' check (role in ('pending','본사관리자','파트장','일반직원')),
  status text not null default 'pending' check (status in ('pending','approved','rejected')),
  approved_by uuid references auth.users(id),
  approved_at timestamptz,
  created_at timestamptz default now()
);

-- 3. 테스트 점수 테이블 (Wayground 등 25문항 테스트 결과)
create table public.test_scores (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references public.profiles(id) on delete cascade,
  test_name text not null,
  score numeric not null,
  max_score numeric not null default 100,
  taken_at timestamptz default now()
);

-- 4. 직원별 매출 트래킹 (3개월 트래킹용)
create table public.sales_records (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references public.profiles(id) on delete cascade,
  store_id uuid references public.stores(id),
  record_date date not null,
  sales_amount numeric not null default 0,
  main_product_sold boolean default false,
  basket_products text[],              -- 함께 판매된 제품 목록
  created_at timestamptz default now()
);

-- 5. 파트장 코칭 기록
create table public.coaching_logs (
  id uuid primary key default gen_random_uuid(),
  store_id uuid references public.stores(id),
  written_by uuid references public.profiles(id),
  content text not null,
  created_at timestamptz default now()
);

-- ============================================
-- RLS(Row Level Security) 활성화
-- ============================================
alter table public.profiles enable row level security;
alter table public.stores enable row level security;
alter table public.test_scores enable row level security;
alter table public.sales_records enable row level security;
alter table public.coaching_logs enable row level security;

-- ============================================
-- 정책: profiles
-- ============================================

-- 본인 프로필은 항상 조회 가능
create policy "본인 프로필 조회"
on public.profiles for select
using (auth.uid() = id);

-- 본사관리자는 모든 프로필 조회 가능
create policy "관리자 전체 프로필 조회"
on public.profiles for select
using (
  exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role = '본사관리자'
  )
);

-- 파트장은 같은 지점 프로필 조회 가능
create policy "파트장 같은 지점 조회"
on public.profiles for select
using (
  exists (
    select 1 from public.profiles p
    where p.id = auth.uid()
      and p.role = '파트장'
      and p.store_id = profiles.store_id
  )
);

-- 가입 시 본인 row 생성 가능 (status는 항상 pending으로 강제)
create policy "본인 가입"
on public.profiles for insert
with check (auth.uid() = id and status = 'pending' and role = 'pending');

-- 본사관리자만 승인/거절(업데이트) 가능
create policy "관리자 승인 처리"
on public.profiles for update
using (
  exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role = '본사관리자'
  )
);

-- ============================================
-- 정책: stores (전체 직원이 지점 목록은 볼 수 있어야 가입 폼에 표시 가능)
-- ============================================
create policy "지점 목록 전체 조회"
on public.stores for select
using (true);

-- ============================================
-- 정책: test_scores
-- ============================================
create policy "본인 점수 조회"
on public.test_scores for select
using (profile_id = auth.uid());

create policy "관리자 전체 점수 조회"
on public.test_scores for select
using (
  exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = '본사관리자')
);

create policy "파트장 지점 점수 조회"
on public.test_scores for select
using (
  exists (
    select 1 from public.profiles p
    join public.profiles target on target.id = test_scores.profile_id
    where p.id = auth.uid() and p.role = '파트장' and p.store_id = target.store_id
  )
);

-- ============================================
-- 정책: sales_records
-- ============================================
create policy "본인 매출 조회"
on public.sales_records for select
using (profile_id = auth.uid());

create policy "관리자 전체 매출 조회"
on public.sales_records for select
using (
  exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = '본사관리자')
);

create policy "파트장 지점 매출 조회"
on public.sales_records for select
using (
  exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role = '파트장' and p.store_id = sales_records.store_id
  )
);

-- ============================================
-- 정책: coaching_logs
-- ============================================
create policy "관리자 전체 코칭기록 조회"
on public.coaching_logs for select
using (
  exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = '본사관리자')
);

create policy "파트장 본인 지점 코칭기록 조회/작성"
on public.coaching_logs for select
using (
  exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role = '파트장' and p.store_id = coaching_logs.store_id
  )
);

create policy "파트장 코칭기록 작성"
on public.coaching_logs for insert
with check (
  exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role = '파트장' and p.store_id = coaching_logs.store_id
  )
);

-- ============================================
-- 샘플 지점 데이터 (필요시 수정/추가하세요)
-- ============================================
insert into public.stores (name, department_store) values
  ('롯데 본점', '롯데백화점'),
  ('현대 무역센터', '현대백화점'),
  ('신세계 강남', '신세계백화점'),
  ('갤러리아 명품관', '갤러리아백화점');
