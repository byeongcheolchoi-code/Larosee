import React, { useEffect, useState } from 'react'
import { supabase } from '../supabaseClient'

export default function StoreAliasManager() {
  const [aliases, setAliases] = useState([])
  const [stores, setStores] = useState([])
  const [newAlias, setNewAlias] = useState('')
  const [newStoreId, setNewStoreId] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  async function load() {
    const [{ data: a }, { data: s }] = await Promise.all([
      supabase.from('store_aliases').select('*, stores(name)').order('ecount_name'),
      supabase.from('stores').select('id, name').order('name'),
    ])
    setAliases(a || [])
    setStores(s || [])
  }

  useEffect(() => { load() }, [])

  async function addAlias(e) {
    e.preventDefault()
    setError('')
    if (!newAlias.trim() || !newStoreId) {
      setError('이카운트 거래처명과 매칭할 지점을 모두 입력해주세요.')
      return
    }
    setSaving(true)
    const { error: err } = await supabase.from('store_aliases').insert({
      ecount_name: newAlias.trim(),
      store_id: newStoreId,
    })
    setSaving(false)
    if (err) {
      setError(err.message.includes('duplicate') ? '이미 등록된 거래처명입니다.' : err.message)
      return
    }
    setNewAlias('')
    setNewStoreId('')
    load()
  }

  async function removeAlias(id) {
    if (!confirm('이 매핑을 삭제할까요?')) return
    await supabase.from('store_aliases').delete().eq('id', id)
    load()
  }

  return (
    <div>
      <h1 style={{ fontSize: 20, marginBottom: 4 }}>이카운트 지점명 매핑</h1>
      <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 20 }}>
        이카운트 엑셀의 거래처명과 우리 시스템 지점을 연결해두면, 매출 업로드 시 자동으로 매칭됩니다.
      </p>

      <form onSubmit={addAlias} style={{ display: 'flex', gap: 8, marginBottom: 20, background: '#EEF3F7', padding: 14, borderRadius: 'var(--radius-lg)' }}>
        <input
          placeholder="이카운트 거래처명 (예: 롯데쇼핑(주)잠실점)"
          value={newAlias}
          onChange={(e) => setNewAlias(e.target.value)}
          style={{ flex: 1, padding: '8px 10px', fontSize: 13 }}
        />
        <span style={{ alignSelf: 'center', color: 'var(--text-secondary)' }}>→</span>
        <select value={newStoreId} onChange={(e) => setNewStoreId(e.target.value)} style={{ padding: '8px 10px', fontSize: 13 }}>
          <option value="">지점 선택</option>
          {stores.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
        <button type="submit" disabled={saving} style={{ padding: '8px 16px', fontSize: 13, background: 'var(--blue)', color: '#fff', border: 'none' }}>
          추가
        </button>
      </form>

      {error && <div style={{ fontSize: 13, color: 'var(--danger-text)', background: 'var(--danger-bg)', padding: '8px 10px', borderRadius: 6, marginBottom: 16 }}>{error}</div>}

      <table>
        <thead>
          <tr><th>이카운트 거래처명</th><th></th><th>우리 지점</th><th></th></tr>
        </thead>
        <tbody>
          {aliases.map((a) => (
            <tr key={a.id}>
              <td>{a.ecount_name}</td>
              <td style={{ color: 'var(--text-secondary)' }}>→</td>
              <td>{a.stores?.name}</td>
              <td><button onClick={() => removeAlias(a.id)} style={{ fontSize: 12, padding: '3px 8px' }}>삭제</button></td>
            </tr>
          ))}
        </tbody>
      </table>
      {aliases.length === 0 && <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>등록된 매핑이 없습니다.</p>}
    </div>
  )
}
