import React, { useEffect, useState } from 'react'
import { supabase } from '../supabaseClient'
import { useAuth } from '../auth/AuthContext'

export default function MyStatus() {
  const { profile } = useAuth()
  const [scores, setScores] = useState([])

  useEffect(() => {
    if (!profile) return
    supabase
      .from('test_scores')
      .select('*')
      .eq('profile_id', profile.id)
      .order('taken_at', { ascending: false })
      .then(({ data, error }) => { if (!error) setScores(data) })
  }, [profile])

  return (
    <div>
      <h1 style={{ fontSize: 20, marginBottom: 4 }}>내 학습 현황</h1>
      <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 20 }}>
        {profile?.name}님 · {profile?.stores?.name} · {profile?.role}
      </p>

      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '1rem 1.25rem' }}>
        <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 12 }}>테스트 점수 기록</div>
        {scores.length === 0 ? (
          <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>아직 응시한 테스트가 없습니다.</p>
        ) : (
          <table>
            <thead><tr><th>테스트</th><th>점수</th><th>응시일</th></tr></thead>
            <tbody>
              {scores.map((s) => (
                <tr key={s.id}>
                  <td>{s.test_name}</td>
                  <td>{s.score} / {s.max_score}</td>
                  <td>{new Date(s.taken_at).toLocaleDateString('ko-KR')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
