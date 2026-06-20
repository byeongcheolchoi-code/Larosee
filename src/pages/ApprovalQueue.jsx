import React, { useEffect, useState } from 'react'
import { supabase } from '../supabaseClient'
import { useAuth } from '../auth/AuthContext'

export default function ApprovalQueue() {
  const { profile: myProfile } = useAuth()
  const isSuperAdmin = myProfile?.role === '최고관리자'
  const roleOptions = isSuperAdmin
    ? ['일반직원', '파트장', '본사관리자', '최고관리자']
    : ['일반직원', '파트장']

  const [pending, setPending] = useState([])
  const [loading, setLoading] = useState(true)
  const [actingOn, setActingOn] = useState(null)

  async function load() {
    setLoading(true)
    const { data, error } = await supabase
      .from('profiles')
      .select('*, stores(name)')
      .eq('status', 'pending')
      .order('created_at', { ascending: true })
    if (!error) setPending(data)
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  async function approve(id, grantedRole) {
    setActingOn(id)
    const { data: { user } } = await supabase.auth.getUser()
    const { error } = await supabase
      .from('profiles')
      .update({ status: 'approved', role: grantedRole, approved_by: user.id, approved_at: new Date().toISOString() })
      .eq('id', id)
    setActingOn(null)
    if (error) {
      alert('승인 처리 실패: ' + error.message + (grantedRole.includes('관리자') && !isSuperAdmin ? '\n(본사관리자/최고관리자 권한 부여는 최고관리자만 가능합니다)' : ''))
      return
    }
    setPending((list) => list.filter((p) => p.id !== id))
  }

  async function reject(id) {
    if (!confirm('이 가입 신청을 거절하시겠습니까?')) return
    setActingOn(id)
    const { error } = await supabase
      .from('profiles')
      .update({ status: 'rejected' })
      .eq('id', id)
    setActingOn(null)
    if (error) {
      alert('거절 처리 실패: ' + error.message)
      return
    }
    setPending((list) => list.filter((p) => p.id !== id))
  }

  if (loading) return <p style={{ fontSize: 14, color: 'var(--text-secondary)' }}>불러오는 중...</p>

  return (
    <div>
      <h1 style={{ fontSize: 20, marginBottom: 4 }}>가입 승인 대기</h1>
      <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 8 }}>
        대기 중인 신청 {pending.length}건
      </p>
      {!isSuperAdmin && (
        <p style={{ fontSize: 12, color: 'var(--text-secondary)', background: '#EEF3F7', padding: '8px 10px', borderRadius: 6, marginBottom: 16 }}>
          일반직원·파트장 권한만 부여할 수 있습니다. 본사관리자 권한 부여는 최고관리자만 가능합니다.
        </p>
      )}

      {pending.length === 0 && (
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)', fontSize: 14 }}>
          대기 중인 가입 신청이 없습니다.
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {pending.map((p) => (
          <ApprovalCard key={p.id} person={p} busy={actingOn === p.id} onApprove={approve} onReject={reject} roleOptions={roleOptions} />
        ))}
      </div>
    </div>
  )
}

function ApprovalCard({ person, busy, onApprove, onReject, roleOptions }) {
  const [grantedRole, setGrantedRole] = useState(
    roleOptions.includes(person.requested_role) ? person.requested_role : roleOptions[0]
  )

  return (
    <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '1rem 1.25rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={{ fontWeight: 500, fontSize: 15 }}>{person.name}</div>
          <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 2 }}>{person.email}</div>
          <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
            {person.stores?.name} · 신청 권한: {person.requested_role}
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 12 }}>
        <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>부여 권한</span>
        <select value={grantedRole} onChange={(e) => setGrantedRole(e.target.value)} style={{ fontSize: 13, padding: '4px 8px' }}>
          {roleOptions.map((r) => <option key={r} value={r}>{r}</option>)}
        </select>

        <div style={{ flex: 1 }} />

        <button disabled={busy} onClick={() => onReject(person.id)} style={{ fontSize: 13, padding: '6px 12px' }}>
          거절
        </button>
        <button
          disabled={busy}
          onClick={() => onApprove(person.id, grantedRole)}
          style={{ fontSize: 13, padding: '6px 12px', background: 'var(--blue)', color: '#fff', border: 'none' }}
        >
          {busy ? '처리 중...' : '승인'}
        </button>
      </div>
    </div>
  )
}
