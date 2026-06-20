import React from 'react'
import { useAuth } from '../auth/AuthContext'

export default function Pending() {
  const { profile, signOut } = useAuth()

  return (
    <div style={{ maxWidth: 380, margin: '60px auto', textAlign: 'center' }}>
      <div style={{ background: 'var(--warning-bg)', borderRadius: 'var(--radius-lg)', padding: '2rem 1.5rem' }}>
        <div style={{ fontSize: 32, marginBottom: 12 }}>⏳</div>
        <h1 style={{ fontSize: 17, marginBottom: 8 }}>승인 대기 중입니다</h1>
        <p style={{ fontSize: 14, color: 'var(--warning-text)', lineHeight: 1.6 }}>
          {profile?.name}님의 가입 신청이 접수되었습니다.<br />
          본사관리자 승인 후 로그인하실 수 있습니다.
        </p>
        <button onClick={signOut} style={{ marginTop: 20, fontSize: 13, padding: '8px 16px' }}>
          로그아웃
        </button>
      </div>
    </div>
  )
}
