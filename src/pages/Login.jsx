import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../supabaseClient'

export default function Login() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setSubmitting(true)

    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password })

    setSubmitting(false)

    if (signInError) {
      setError(signInError.message.includes('Invalid login')
        ? '이메일 또는 비밀번호가 올바르지 않습니다.'
        : signInError.message)
      return
    }

    navigate('/')
  }

  return (
    <div style={{ maxWidth: 360, margin: '60px auto' }}>
      <div style={{ background: '#EEF3F7', borderRadius: 'var(--radius-lg)', padding: '1.5rem' }}>
        <h1 style={{ fontSize: 18, marginBottom: 20 }}>로그인</h1>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 4 }}>이메일</div>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} style={inputStyle} />
          </div>
          <div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 4 }}>비밀번호</div>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} style={inputStyle} />
          </div>

          {error && <div style={{ fontSize: 13, color: 'var(--danger-text)', background: 'var(--danger-bg)', padding: '8px 10px', borderRadius: 6 }}>{error}</div>}

          <button type="submit" disabled={submitting} style={{ background: 'var(--blue)', color: '#fff', fontWeight: 500, padding: 10, border: 'none', marginTop: 6 }}>
            {submitting ? '로그인 중...' : '로그인'}
          </button>
        </form>

        <p style={{ fontSize: 13, textAlign: 'center', marginTop: 16, color: 'var(--text-secondary)' }}>
          계정이 없으신가요? <Link to="/signup">가입 신청</Link>
        </p>
      </div>
    </div>
  )
}

const inputStyle = { width: '100%', padding: '8px 10px', fontSize: 14 }
