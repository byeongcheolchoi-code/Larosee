import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../supabaseClient'

export default function SignUp() {
  const navigate = useNavigate()
  const [stores, setStores] = useState([])
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    storeId: '',
    requestedRole: '일반직원',
  })
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    supabase.from('stores').select('id, name, department_store').order('name')
      .then(({ data, error }) => {
        if (!error) setStores(data)
      })
  }, [])

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    if (!form.name || !form.email || !form.password || !form.storeId) {
      setError('모든 항목을 입력해주세요.')
      return
    }
    if (form.password.length < 6) {
      setError('비밀번호는 6자 이상이어야 합니다.')
      return
    }

    setSubmitting(true)

    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
    })

    if (signUpError) {
      setError(signUpError.message.includes('already registered')
        ? '이미 가입된 이메일입니다.'
        : signUpError.message)
      setSubmitting(false)
      return
    }

    const userId = signUpData.user?.id
    if (!userId) {
      setError('가입 처리 중 문제가 발생했습니다. 다시 시도해주세요.')
      setSubmitting(false)
      return
    }

    const { error: profileError } = await supabase.from('profiles').insert({
      id: userId,
      name: form.name,
      email: form.email,
      store_id: form.storeId,
      requested_role: form.requestedRole,
    })

    setSubmitting(false)

    if (profileError) {
      setError('프로필 생성 중 오류: ' + profileError.message)
      return
    }

    navigate('/pending')
  }

  return (
    <div style={{ maxWidth: 380, margin: '40px auto' }}>
      <div style={{ background: '#EEF3F7', borderRadius: 'var(--radius-lg)', padding: '1.5rem' }}>
        <h1 style={{ fontSize: 18, marginBottom: 4 }}>직원 가입 신청</h1>
        <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 20 }}>
          가입 후 본사관리자 승인이 완료되면 로그인할 수 있습니다.
        </p>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <Field label="이름">
            <input value={form.name} onChange={(e) => update('name', e.target.value)} placeholder="홍길동" style={inputStyle} />
          </Field>

          <Field label="이메일">
            <input type="email" value={form.email} onChange={(e) => update('email', e.target.value)} placeholder="example@larosee.co.kr" style={inputStyle} />
          </Field>

          <Field label="비밀번호 (6자 이상)">
            <input type="password" value={form.password} onChange={(e) => update('password', e.target.value)} style={inputStyle} />
          </Field>

          <Field label="소속 지점">
            <select value={form.storeId} onChange={(e) => update('storeId', e.target.value)} style={inputStyle}>
              <option value="">선택하세요</option>
              {stores.map((s) => (
                <option key={s.id} value={s.id}>{s.name} ({s.department_store})</option>
              ))}
            </select>
          </Field>

          <Field label="신청 권한">
            <div style={{ display: 'flex', gap: 8 }}>
              {['일반직원', '파트장'].map((role) => (
                <button
                  type="button"
                  key={role}
                  onClick={() => update('requestedRole', role)}
                  style={{
                    flex: 1,
                    padding: '8px',
                    fontSize: 13,
                    background: form.requestedRole === role ? 'var(--blue)' : 'var(--surface)',
                    color: form.requestedRole === role ? '#fff' : 'var(--text)',
                  }}
                >
                  {role}
                </button>
              ))}
            </div>
            <p style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 4 }}>
              본사관리자 권한은 가입 후 별도로 부여됩니다.
            </p>
          </Field>

          {error && <div style={{ fontSize: 13, color: 'var(--danger-text)', background: 'var(--danger-bg)', padding: '8px 10px', borderRadius: 6 }}>{error}</div>}

          <button type="submit" disabled={submitting} style={{ background: 'var(--blue)', color: '#fff', fontWeight: 500, padding: 10, border: 'none', marginTop: 6 }}>
            {submitting ? '처리 중...' : '가입 신청하기'}
          </button>
        </form>

        <p style={{ fontSize: 13, textAlign: 'center', marginTop: 16, color: 'var(--text-secondary)' }}>
          이미 계정이 있으신가요? <Link to="/login">로그인</Link>
        </p>
      </div>
    </div>
  )
}

function Field({ label, children }) {
  return (
    <div>
      <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 4 }}>{label}</div>
      {children}
    </div>
  )
}

const inputStyle = { width: '100%', padding: '8px 10px', fontSize: 14 }
