import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from './AuthContext'

// 로그인 + 승인 완료된 사용자만 통과. 필요시 allowedRoles로 권한 제한.
export function RequireAuth({ children, allowedRoles }) {
  const { session, profile, loading } = useAuth()

  if (loading) return <p style={{ padding: 24, fontSize: 14, color: 'var(--text-secondary)' }}>불러오는 중...</p>
  if (!session) return <Navigate to="/login" replace />
  if (!profile) return <p style={{ padding: 24, fontSize: 14, color: 'var(--text-secondary)' }}>불러오는 중...</p>
  if (profile.status === 'rejected') return <RejectedNotice />
  if (profile.status !== 'approved') return <Navigate to="/pending" replace />
  if (allowedRoles && !allowedRoles.includes(profile.role)) return <AccessDenied />

  return children
}

function RejectedNotice() {
  const { signOut } = useAuth()
  return (
    <div style={{ maxWidth: 380, margin: '60px auto', textAlign: 'center' }}>
      <div style={{ background: 'var(--danger-bg)', borderRadius: 'var(--radius-lg)', padding: '2rem 1.5rem' }}>
        <h1 style={{ fontSize: 17, marginBottom: 8, color: 'var(--danger-text)' }}>가입이 승인되지 않았습니다</h1>
        <p style={{ fontSize: 14, color: 'var(--danger-text)' }}>본사관리자에게 문의해주세요.</p>
        <button onClick={signOut} style={{ marginTop: 20, fontSize: 13, padding: '8px 16px' }}>로그아웃</button>
      </div>
    </div>
  )
}

function AccessDenied() {
  return (
    <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-secondary)', fontSize: 14 }}>
      이 페이지에 접근할 권한이 없습니다.
    </div>
  )
}
