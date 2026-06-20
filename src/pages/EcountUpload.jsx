import React, { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import { parseEcountDetailFile, matchToDb } from '../lib/ecountParser'

export default function EcountUpload() {
  const fileInputRef = useRef(null)
  const [parsing, setParsing] = useState(false)
  const [rows, setRows] = useState(null) // 매칭 결과 미리보기
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const [result, setResult] = useState(null)

  async function handleFile(e) {
    const file = e.target.files?.[0]
    if (!file) return

    setError('')
    setRows(null)
    setResult(null)
    setParsing(true)

    try {
      const buffer = await file.arrayBuffer()
      const parsed = parseEcountDetailFile(buffer)

      // 매핑 테이블과 직원 목록을 불러와서 매칭
      const { data: aliases } = await supabase.from('store_aliases').select('ecount_name, store_id')
      const storeAliasMap = Object.fromEntries((aliases || []).map((a) => [a.ecount_name, a.store_id]))

      const { data: members } = await supabase.from('profiles').select('id, name, store_id').eq('status', 'approved')
      const storeMembersByStoreThenName = {}
      for (const m of members || []) {
        if (!storeMembersByStoreThenName[m.store_id]) storeMembersByStoreThenName[m.store_id] = {}
        storeMembersByStoreThenName[m.store_id][m.name] = m.id
      }

      const matched = matchToDb(parsed, storeAliasMap, storeMembersByStoreThenName)
      setRows(matched)
    } catch (err) {
      setError(err.message)
    } finally {
      setParsing(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const validRows = rows?.filter((r) => !r.matchIssue) || []
  const invalidRows = rows?.filter((r) => r.matchIssue) || []

  async function handleConfirmUpload() {
    if (validRows.length === 0) return
    setSaving(true)
    setError('')

    const inserts = validRows.map((r) => ({
      profile_id: r.profileId,
      store_id: r.storeId,
      record_date: r.date,
      sales_amount: r.total,
      main_product_sold: r.mainProductSold,
      basket_products: r.basketProducts,
      source: 'ecount',
      ecount_ref: `${r.date}-${r.receiptNo}-${r.salesperson}`,
    }))

    // upsert로 동일 영수증 중복 업로드 방지 (ecount_ref unique 인덱스 활용)
    const { error: err, data } = await supabase
      .from('sales_records')
      .upsert(inserts, { onConflict: 'profile_id,record_date,ecount_ref', ignoreDuplicates: true })
      .select()

    setSaving(false)

    if (err) {
      setError('저장 실패: ' + err.message)
      return
    }

    setResult({ inserted: data?.length ?? 0, attempted: inserts.length })
    setRows(null)
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
        <h1 style={{ fontSize: 20 }}>이카운트 매출 업로드</h1>
        <Link to="/store-aliases" style={{ fontSize: 13 }}>지점명 매핑 관리</Link>
      </div>
      <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 20 }}>
        이카운트에서 받은 "판매사원별 상세" 엑셀 파일을 업로드하세요. 직원별 매출로 자동 변환됩니다.
      </p>

      <div style={{ background: '#EEF3F7', borderRadius: 'var(--radius-lg)', padding: 20, marginBottom: 20 }}>
        <input
          ref={fileInputRef}
          type="file"
          accept=".xlsx,.xls"
          onChange={handleFile}
          disabled={parsing}
        />
        {parsing && <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 8 }}>파일을 읽는 중...</p>}
      </div>

      {error && (
        <div style={{ fontSize: 13, color: 'var(--danger-text)', background: 'var(--danger-bg)', padding: '10px 14px', borderRadius: 8, marginBottom: 16 }}>
          {error}
        </div>
      )}

      {result && (
        <div style={{ fontSize: 13, color: 'var(--success-text)', background: 'var(--success-bg)', padding: '10px 14px', borderRadius: 8, marginBottom: 16 }}>
          업로드 완료: {result.attempted}건 중 {result.inserted}건 새로 등록됨 (중복 건은 건너뛰었습니다)
        </div>
      )}

      {rows && (
        <>
          <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
            <Metric label="정상 인식" value={`${validRows.length}건`} good />
            <Metric label="매칭 실패" value={`${invalidRows.length}건`} bad={invalidRows.length > 0} />
          </div>

          {invalidRows.length > 0 && (
            <div style={{ background: 'var(--danger-bg)', borderRadius: 'var(--radius-lg)', padding: '1rem 1.25rem', marginBottom: 16 }}>
              <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--danger-text)', marginBottom: 8 }}>
                매칭 실패 (이 건들은 업로드되지 않습니다)
              </div>
              <table>
                <thead><tr><th>날짜</th><th>거래처명</th><th>판매사원</th><th>금액</th><th>사유</th></tr></thead>
                <tbody>
                  {invalidRows.map((r, i) => (
                    <tr key={i}>
                      <td>{r.date}</td>
                      <td>{r.customer}</td>
                      <td>{r.salesperson}</td>
                      <td>{r.total.toLocaleString()}원</td>
                      <td style={{ color: 'var(--danger-text)' }}>{r.matchIssue}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p style={{ fontSize: 12, color: 'var(--danger-text)', marginTop: 8 }}>
                지점 매핑 누락이면 <Link to="/store-aliases">지점명 매핑 관리</Link>에서 등록 후 다시 업로드해주세요.
                직원 이름 매칭 실패면 이카운트의 판매사원명과 시스템 직원 이름이 일치하는지 확인해주세요.
              </p>
            </div>
          )}

          {validRows.length > 0 && (
            <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '1rem 1.25rem', marginBottom: 16 }}>
              <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 8 }}>업로드 미리보기 (정상 인식된 건)</div>
              <table>
                <thead><tr><th>날짜</th><th>지점</th><th>직원</th><th>금액</th><th>메인제품</th><th>함께 판매</th></tr></thead>
                <tbody>
                  {validRows.slice(0, 30).map((r, i) => (
                    <tr key={i}>
                      <td>{r.date}</td>
                      <td>{r.customer}</td>
                      <td>{r.salesperson}</td>
                      <td>{r.total.toLocaleString()}원</td>
                      <td>{r.mainProductSold ? 'O' : 'X'}</td>
                      <td style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{r.basketProducts.join(', ') || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {validRows.length > 30 && (
                <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 8 }}>
                  외 {validRows.length - 30}건 더 있습니다.
                </p>
              )}
            </div>
          )}

          {validRows.length > 0 && (
            <button
              onClick={handleConfirmUpload}
              disabled={saving}
              style={{ background: 'var(--blue)', color: '#fff', fontWeight: 500, padding: '10px 20px', border: 'none' }}
            >
              {saving ? '저장 중...' : `${validRows.length}건 매출 등록 확정`}
            </button>
          )}
        </>
      )}
    </div>
  )
}

function Metric({ label, value, good, bad }) {
  return (
    <div style={{
      background: bad ? 'var(--danger-bg)' : good ? 'var(--success-bg)' : '#EEF3F7',
      borderRadius: 'var(--radius-md)', padding: '0.75rem 1rem',
    }}>
      <div style={{ fontSize: 12, color: bad ? 'var(--danger-text)' : good ? 'var(--success-text)' : 'var(--text-secondary)' }}>{label}</div>
      <div style={{ fontSize: 20, fontWeight: 500, color: bad ? 'var(--danger-text)' : good ? 'var(--success-text)' : 'var(--text)' }}>{value}</div>
    </div>
  )
}
