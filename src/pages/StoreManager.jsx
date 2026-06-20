import React, { useEffect, useState } from 'react'
import { supabase } from '../supabaseClient'

const GROUPS = ['롯데백화점', '현대백화점', '신세계백화점', '갤러리아백화점', 'AK플라자']

export default function StoreManager() {
  const [stores, setStores] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('전체')

  async function load() {
    setLoading(true)
    const { data, error } = await supabase
      .from('stores')
      .select('id, name, department_store, status')
      .order('department_store')
      .order('name')
    if (!error) setStores(data)
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  async function toggleStatus(store) {
    const newStatus = store.status === '운영중' ? '오픈예정' : '운영중'
    const { error } = await supabase.from('stores').update({ status: newStatus }).eq('id', store.id)
    if (error) {
      alert('변경 실패: ' + error.message)
      return
    }
    setStores((list) => list.map((s) => (s.id === store.id ? { ...s, status: newStatus } : s)))
  }

  const filtered = stores.filter((s) => filter === '전체' || s.department_store === filter)
  const openCount = stores.filter((s) => s.status === '운영중').length
  const upcomingCount = stores.filter((s) => s.status === '오픈예정').length

  return (
    <div>
      <h1 style={{ fontSize: 20, marginBottom: 4 }}>지점 관리</h1>
      <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 16 }}>
        오픈예정 지점은 매출 입력 등 실무 화면의 지점 선택 목록에서 제외됩니다. 오픈 후 여기서 "운영중"으로 바꿔주세요.
      </p>

      <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
        <div style={{ background: 'var(--success-bg)', borderRadius: 'var(--radius-md)', padding: '0.75rem 1rem' }}>
          <div style={{ fontSize: 12, color: 'var(--success-text)' }}>운영중</div>
          <div style={{ fontSize: 20, fontWeight: 500, color: 'var(--success-text)' }}>{openCount}개</div>
        </div>
        <div style={{ background: 'var(--warning-bg)', borderRadius: 'var(--radius-md)', padding: '0.75rem 1rem' }}>
          <div style={{ fontSize: 12, color: 'var(--warning-text)' }}>오픈예정</div>
          <div style={{ fontSize: 20, fontWeight: 500, color: 'var(--warning-text)' }}>{upcomingCount}개</div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 6, marginBottom: 16, flexWrap: 'wrap' }}>
        {['전체', ...GROUPS].map((g) => (
          <button
            key={g}
            onClick={() => setFilter(g)}
            style={{
              fontSize: 12, padding: '6px 12px',
              background: filter === g ? 'var(--bg-blue)' : 'var(--surface)',
              color: filter === g ? 'var(--blue-dark)' : 'var(--text)',
            }}
          >
            {g}
          </button>
        ))}
      </div>

      {loading ? (
        <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>불러오는 중...</p>
      ) : (
        <table>
          <thead>
            <tr><th>지점명</th><th>백화점</th><th>상태</th><th></th></tr>
          </thead>
          <tbody>
            {filtered.map((s) => (
              <tr key={s.id}>
                <td>{s.name}</td>
                <td style={{ color: 'var(--text-secondary)' }}>{s.department_store}</td>
                <td>
                  <span style={{
                    fontSize: 12, padding: '2px 8px', borderRadius: 6,
                    background: s.status === '운영중' ? 'var(--success-bg)' : 'var(--warning-bg)',
                    color: s.status === '운영중' ? 'var(--success-text)' : 'var(--warning-text)',
                  }}>
                    {s.status}
                  </span>
                </td>
                <td>
                  <button onClick={() => toggleStatus(s)} style={{ fontSize: 12, padding: '3px 10px' }}>
                    {s.status === '운영중' ? '오픈예정으로 전환' : '운영중으로 전환'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}
