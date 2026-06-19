import React from 'react'

const grades = [
  { store: '롯데 본점', sales: '128만원', grade: 'S', action: '벤치마킹 사례 수집', bg: 'var(--success-bg)', text: 'var(--success-text)' },
  { store: '현대 무역', sales: '95만원', grade: 'A', action: '정기 모니터링', bg: '#E6F1FB', text: '#0C447C' },
  { store: '신세계 강남', sales: '71만원', grade: 'B', action: '온라인 피드백', bg: 'var(--warning-bg)', text: 'var(--warning-text)' },
  { store: '갤러리아 ○○', sales: '54만원', grade: 'C', action: '재교육 필요', bg: '#FAECE7', text: '#712B13' },
  { store: '현대 ○○', sales: '38만원', grade: 'D', action: '교육팀 방문 우선', bg: 'var(--danger-bg)', text: 'var(--danger-text)' },
]

const weakSales = [
  { name: 'A직원', store: '롯데 ○○', sales: '42만원', missing: '수분스틱, 히알세럼', course: '페이스 루틴 재교육' },
  { name: 'B직원', store: '현대 ○○', sales: '38만원', missing: '샤워오일', course: '워시 카테고리 교육' },
]

function MetricCard({ label, value, sub, danger }) {
  return (
    <div style={{
      background: danger ? 'var(--danger-bg)' : '#EEF3F7',
      borderRadius: 'var(--radius-md)',
      padding: '1rem',
    }}>
      <div style={{ fontSize: 13, color: danger ? 'var(--danger-text)' : 'var(--text-secondary)' }}>{label}</div>
      <div style={{ fontSize: 24, fontWeight: 500, marginTop: 4, color: danger ? 'var(--danger-text)' : 'var(--text)' }}>{value}</div>
      <div style={{ fontSize: 12, color: danger ? 'var(--danger-text)' : 'var(--text-secondary)', marginTop: 2 }}>{sub}</div>
    </div>
  )
}

export default function AdminDashboard() {
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>2026년 6월 19일 (금)</div>
          <h1 style={{ margin: '2px 0 0', fontSize: 22 }}>교육팀장 대시보드</h1>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px,1fr))', gap: 12, marginBottom: 24 }}>
        <MetricCard label="이번 주 신규교육 인원" value="14명" sub="4개 지점 / 3기수" />
        <MetricCard label="3일 교육 완료율" value="86%" sub="12 / 14명 완료" />
        <MetricCard label="테스트 평균 점수" value="78점" sub="25문항 기준" />
        <MetricCard label="재교육 필요 인원" value="9명" sub="위험 지점 3곳" danger />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 1fr', gap: 16, marginBottom: 24 }}>
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '1rem 1.25rem' }}>
          <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 12 }}>지점별 재교육 우선순위 등급</div>
          <table>
            <thead>
              <tr><th>지점</th><th>1인당 매출</th><th>등급</th><th>조치</th></tr>
            </thead>
            <tbody>
              {grades.map((g) => (
                <tr key={g.store}>
                  <td>{g.store}</td>
                  <td>{g.sales}</td>
                  <td><span style={{ background: g.bg, color: g.text, fontSize: 12, padding: '2px 8px', borderRadius: 6 }}>{g.grade}</span></td>
                  <td style={{ color: 'var(--text-secondary)' }}>{g.action}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '1rem 1.25rem' }}>
          <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 12 }}>위험 신호</div>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 10, fontSize: 13 }}>
            <li>1인당 매출 50만원 미만 — <strong>5명</strong></li>
            <li>메인 제품 판매 누락 — <strong>7명</strong></li>
            <li>파트장 코칭 미작성 — <strong>2개 지점</strong></li>
            <li>스틱데이 우수 지점 — <strong>롯데 본점</strong></li>
          </ul>
        </div>
      </div>

      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '1rem 1.25rem' }}>
        <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 8 }}>직원별 제품 판매 약점 (재교육 추천)</div>
        <table>
          <thead>
            <tr><th>직원</th><th>지점</th><th>1인당 매출</th><th>부족 제품</th><th>추천 교육</th></tr>
          </thead>
          <tbody>
            {weakSales.map((w) => (
              <tr key={w.name}>
                <td>{w.name}</td><td>{w.store}</td><td>{w.sales}</td><td>{w.missing}</td><td>{w.course}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 16 }}>
        ※ 위 데이터는 예시이며, 실제 운영 시 ERP/EDI 및 신규입사자 DB와 연동되어야 자동 갱신됩니다.
      </p>
    </div>
  )
}
