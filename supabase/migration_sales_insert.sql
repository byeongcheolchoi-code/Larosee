-- ============================================
-- 매출 기록 입력(INSERT) 권한 추가
-- Supabase SQL Editor에서 실행하세요
-- ============================================

-- 일반직원: 본인 매출만 입력 가능
create policy "본인 매출 입력"
on public.sales_records for insert
with check (
  profile_id = auth.uid()
  and store_id = public.get_my_store_id()
);

-- 파트장: 같은 지점 누구의 매출이든 입력 가능
create policy "파트장 지점 매출 입력"
on public.sales_records for insert
with check (
  public.get_my_role() = '파트장'
  and store_id = public.get_my_store_id()
  and exists (
    select 1 from public.profiles target
    where target.id = sales_records.profile_id
      and target.store_id = public.get_my_store_id()
  )
);
