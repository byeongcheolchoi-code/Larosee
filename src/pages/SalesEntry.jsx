import React, { useEffect, useState } from 'react'
import { supabase } from '../supabaseClient'
import { useAuth } from '../auth/AuthContext'

const PRODUCTS = ['수분스틱', '바디크림', '히알루론산세럼', '머드스틱마스크', '샤워오일', '바디스크럽', '페이스젤']

function todayStr() {
  return new Date().toISOString().slice(0, 10)
}

export default function SalesEntry() {
  const { profile } = useAuth()
  const isPartLeader = profile?.role === '파트장'
  const isAdmin = profile?.role === '본사관리자' || profile?.role === '최고관리자'
  // 관리자/파트장은 다른 사람 매출을 대신 입력할 수 있음
  const canPickOthers = isPartLeader || isAdmin

  const [stores, setStores] = useState([])
  const [selectedStoreId, setSelectedStoreId] = useState(profile?.store_id || '')
  const [storeMembers, setStoreMembers] = useState([])
  const [recentRecords, setRecentRecords] = useState([])
  const [loadingRecords, setLoadingRecords] = useState(true)

  const [form, setForm] = useState({
    profileId: profile?.id || '',
    recordDate: todayStr(),
    salesAmount: '',
    mainProductSold: false,
    basketProducts: [],
  })
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState(null)

  // 관리자는 전체 지점 목록이 필요함 (어느 지점 직원이든 입력 가능)
  useEffect(() => {
    if (!isAdmin) return
    supabase.from('stores').select('id, name').order('name')
      .then(({ data, error }) => { if (!error) setStores(data) })
  }, [isAdmin])

  // 선택된 지점(파트장은 본인 지점 고정, 관리자는 선택한 지점)의 직원 목록
  useEffect(() => {
    if (!canPickOthers || !selectedStoreId) return
    supabase
      .from('profiles')
      .select('id, name')
      .eq('store_id', selectedStoreId)
      .eq('status', 'approved')
      .order('name')
      .then(({ data, error }) => {
        if (!error) {
          setStoreMembers(data)
          // 지점이 바뀌면 선택된 직원도 그 지점 소속으로 리셋
          if (!data.find((m) => m.id === form.profileId)) {
            setForm((f) => ({ ...f, profileId: data[0]?.id || '' }))
          }
        }
      })
  }, [canPickOthers, selectedStoreId])

  async function loadRecent() {
    if (!profile) return
    setLoadingRecords(true)
    let query = supabase
      .from('sales_records')
      .select('*, profiles(name), stores(name)')
      .order('record_date', { ascending: false })
      .limit(10)

    if (isAdmin) {
      // 전체 (제한 없음)
    } else if (isPartLeader) {
      query = query.eq('store_id', profile.store_id)
    } else {
      query = query.eq('profile_id', profile.id)
    }

    const { data, error } = await query
    if (!error) setRecentRecords(data)
    setLoadingRecords(false)
  }

  useEffect(() => { loadRecent() }, [profile])

  function toggleProduct(p) {
    setForm((f) => ({
      ...f,
      basketProducts: f.basketProducts.includes(p)
        ? f.basketProducts.filter((x) => x !== p)
        : [...f.basketProducts, p],
    }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setMessage(null)

    if (!form.salesAmount || Number(form.salesAmount) < 0) {
      setMessage({ type: 'error', text: '매출액을 올바르게 입력해주세요.' })
      return
    }
    if (canPickOthers && !form.profileId) {
      setMessage({ type: 'error', text: '직원을 선택해주세요.' })
      return
    }

    setSubmitting(true)

    const storeId = isAdmin ? selectedStoreId : profile.store_id

    const { error } = await supabase.from('sales_records').insert({
      profile_id: form.profileId,
      store_id: storeId,
      record_date: form.recordDate,
      sales_amount: Number(form.salesAmount),
      main_product_sold: form.mainProductSold,
      basket_products: form.basketProducts,
      source: 'manual',
    })

    setSubmitting(false)

    if (error) {
      setMessage({ type: 'error', text: '저장 실패: ' + error.message })
      return
    }

    setMessage({ type: 'success', text: '매출이 등록되었습니다.' })
    setForm((f) => ({ ...f, salesAmount: '', mainProductSold: false, basketProducts: [] }))
    loadRecent()
  }

  return (
    <div>
      <h1 style={{ fontSize: 20, marginBottom: 4 }}>매출 기록 입력</h1>
      <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 20 }}>
        {isAdmin ? '전체 지점' : profile?.stores?.name} · {profile?.name}님 ({profile?.role})
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: '380px 1fr', gap: 20, alignItems: 'flex-start' }}>
        <form onSubmit={handleSubmit} style={{ background: '#EEF3F7', borderRadius: 'var(--radius-lg)', padding: '1.25rem' }}>
          {isAdmin && (
            <Field label="지점 선택">
              <select
                value={selectedStoreId}
                onChange={(e) => setSelectedStoreId(e.target.value)}
                style={inputStyle}
              >
                <option value="">선택하세요</option>
                {stores.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </Field>
          )}

          {canPickOthers && (
            <Field label="직원 선택">
              <select
                value={form.profileId}
                onChange={(e) => setForm((f) => ({ ...f, profileId: e.target.value }))}
                style={inputStyle}
                disabled={isAdmin && !selectedStoreId}
              >
                {!isAdmin && <option value={profile.id}>{profile.name} (본인)</option>}
                {storeMembers.filter((m) => m.id !== profile.id || isAdmin).map((m) => (
                  <option key={m.id} value={m.id}>{m.name}{m.id === profile.id ? ' (본인)' : ''}</option>
                ))}
              </select>
            </Field>
          )}

          <Field label="날짜">
            <input
              type="date"
              value={form.recordDate}
              onChange={(e) => setForm((f) => ({ ...f, recordDate: e.target.value }))}
              style={inputStyle}
            />
          </Field>

          <Field label="매출액 (원)">
            <input
              type="number"
              min="0"
              placeholder="예: 420000"
              value={form.salesAmount}
              onChange={(e) => setForm((f) => ({ ...f, salesAmount: e.target.value }))}
              style={inputStyle}
            />
          </Field>

          <Field label="메인 제품(수분스틱) 판매 여부">
            <div style={{ display: 'flex', gap: 8 }}>
              {[{ v: true, label: '판매함' }, { v: false, label: '판매 안 함' }].map((opt) => (
                <button
                  type="button"
                  key={String(opt.v)}
                  onClick={() => setForm((f) => ({ ...f, mainProductSold: opt.v }))}
                  style={{
                    flex: 1, padding: 8, fontSize: 13,
                    background: form.mainProductSold === opt.v ? 'var(--blue)' : 'var(--surface)',
                    color: form.mainProductSold === opt.v ? '#fff' : 'var(--text)',
                  }}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </Field>

          <Field label="함께 판매한 제품 (복수 선택)">
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {PRODUCTS.map((p) => (
                <button
                  type="button"
                  key={p}
                  onClick={() => toggleProduct(p)}
                  style={{
                    fontSize: 12, padding: '6px 10px',
                    background: form.basketProducts.includes(p) ? 'var(--bg-blue)' : 'var(--surface)',
                    color: form.basketProducts.includes(p) ? 'var(--blue-dark)' : 'var(--text)',
                    borderColor: form.basketProducts.includes(p) ? 'var(--blue)' : 'var(--border)',
                  }}
                >
                  {p}
                </button>
              ))}
            </div>
          </Field>

          {message && (
            <div style={{
              fontSize: 13, padding: '8px 10px', borderRadius: 6, marginTop: 8,
              background: message.type === 'error' ? 'var(--danger-bg)' : 'var(--success-bg)',
              color: message.type === 'error' ? 'var(--danger-text)' : 'var(--success-text)',
            }}>
              {message.text}
            </div>
          )}

          <button type="submit" disabled={submitting} style={{ width: '100%', background: 'var(--blue)', color: '#fff', fontWeight: 500, padding: 10, border: 'none', marginTop: 14 }}>
            {submitting ? '저장 중...' : '매출 등록'}
          </button>
        </form>

        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '1rem 1.25rem' }}>
          <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 12 }}>
            최근 매출 기록 {isAdmin ? '(전체)' : isPartLeader ? '(지점 전체)' : '(본인)'}
          </div>
          {loadingRecords ? (
            <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>불러오는 중...</p>
          ) : recentRecords.length === 0 ? (
            <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>등록된 매출 기록이 없습니다.</p>
          ) : (
            <table>
              <thead>
                <tr>
                  {isAdmin && <th>지점</th>}
                  {canPickOthers && <th>직원</th>}
                  <th>날짜</th>
                  <th>매출액</th>
                  <th>메인제품</th>
                  <th>함께 판매</th>
                  <th>출처</th>
                </tr>
              </thead>
              <tbody>
                {recentRecords.map((r) => (
                  <tr key={r.id}>
                    {isAdmin && <td>{r.stores?.name}</td>}
                    {canPickOthers && <td>{r.profiles?.name}</td>}
                    <td>{r.record_date}</td>
                    <td>{Number(r.sales_amount).toLocaleString()}원</td>
                    <td>{r.main_product_sold ? 'O' : 'X'}</td>
                    <td style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                      {(r.basket_products || []).join(', ') || '-'}
                    </td>
                    <td style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                      {r.source === 'ecount' ? '이카운트' : '수동'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}

function Field({ label, children }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 4 }}>{label}</div>
      {children}
    </div>
  )
}

const inputStyle = { width: '100%', padding: '8px 10px', fontSize: 14 }
