-- ============================================
-- 이카운트 엑셀 업로드 지원 + 관리자 매출입력 권한 추가
-- Supabase SQL Editor에서 실행하세요
-- ============================================

-- 1. 이카운트 거래처명 ↔ 우리 지점(stores) 매핑 테이블
create table public.store_aliases (
  id uuid primary key default gen_random_uuid(),
  ecount_name text not null unique,   -- 이카운트에 찍히는 거래처명 그대로 (예: '롯데쇼핑(주)잠실점')
  store_id uuid not null references public.stores(id),
  created_at timestamptz default now()
);

alter table public.store_aliases enable row level security;

-- 본사관리자/최고관리자만 매핑 테이블 조회/관리 가능
create policy "관리자 매핑 조회"
on public.store_aliases for select
using (public.get_my_role() in ('본사관리자','최고관리자'));

create policy "관리자 매핑 입력"
on public.store_aliases for insert
with check (public.get_my_role() in ('본사관리자','최고관리자'));

create policy "관리자 매핑 수정"
on public.store_aliases for update
using (public.get_my_role() in ('본사관리자','최고관리자'));

create policy "관리자 매핑 삭제"
on public.store_aliases for delete
using (public.get_my_role() in ('본사관리자','최고관리자'));

-- ============================================
-- 2. 본사관리자/최고관리자도 매출 입력 가능하도록 정책 추가
-- ============================================

-- 관리자: 전체 지점 누구의 매출이든 입력 가능 (수동 입력 + 엑셀 업로드 공용)
create policy "관리자 매출 입력"
on public.sales_records for insert
with check (public.get_my_role() in ('본사관리자','최고관리자'));

-- ============================================
-- 3. 엑셀 업로드 시 동일 거래 중복 방지용 unique 제약
--    (같은 직원, 같은 날짜, 같은 출처 데이터가 중복 등록되는 것을 방지)
-- ============================================
alter table public.sales_records add column if not exists source text default 'manual';
alter table public.sales_records add column if not exists ecount_ref text;

create unique index if not exists sales_records_ecount_unique
on public.sales_records (profile_id, record_date, ecount_ref)
where ecount_ref is not null;
