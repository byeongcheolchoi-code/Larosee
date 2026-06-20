import * as XLSX from 'xlsx'

export const PRODUCT_KEYWORDS = [
  '수분스틱', '바디크림', '히알루론산세럼', '머드스틱마스크', '샤워오일', '바디스크럽', '페이스젤',
]
// 이카운트 품목명이 정확한 제품명과 다르게 적히는 경우의 별칭 매핑
const KEYWORD_ALIASES = {
  '수분스틱': ['수분 스틱', '모이스처라이징 스틱'],
  '바디크림': ['모이스춰라이징 바디크림', '모이스춰라이징 바디크림'],
  '히알루론산세럼': ['히알루론산 세럼', '히알세럼'],
  '머드스틱마스크': ['머드 스틱', '화이트 머드'],
  '샤워오일': ['샤워 오일'],
  '바디스크럽': ['너리싱 바디스크럽', '바디 스크럽'],
  '페이스젤': ['페이스 젤'],
}
const MAIN_PRODUCT = '수분스틱'

function matchProductKeyword(itemName) {
  for (const keyword of PRODUCT_KEYWORDS) {
    if (itemName.includes(keyword)) return keyword
    const aliases = KEYWORD_ALIASES[keyword] || []
    if (aliases.some((a) => itemName.includes(a))) return keyword
  }
  return null
}

/**
 * 이카운트 양식2(판매사원별 상세) 엑셀 파일을 파싱합니다.
 * 헤더 행을 찾아 일자-No., 거래처명, 판매사원, 품목명, 합계 컬럼을 추출하고
 * 같은 (날짜, 영수증번호, 판매사원)을 하나의 매출 레코드로 그룹핑합니다.
 */
export function parseEcountDetailFile(arrayBuffer) {
  const workbook = XLSX.read(arrayBuffer, { type: 'array' })
  const sheet = workbook.Sheets[workbook.SheetNames[0]]
  const rows = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' })

  // 헤더 행 찾기 ('일자-No.' 또는 '판매사원'이 포함된 행)
  let headerRowIdx = rows.findIndex((r) =>
    r.some((cell) => String(cell).includes('판매사원')) &&
    r.some((cell) => String(cell).includes('일자'))
  )
  if (headerRowIdx === -1) {
    throw new Error('판매사원별 상세 양식을 찾을 수 없습니다. 이카운트에서 받은 원본 파일인지 확인해주세요.')
  }

  const header = rows[headerRowIdx].map((h) => String(h).trim())
  const colIdx = {
    dateNo: header.findIndex((h) => h.includes('일자') && h.includes('No')),
    customer: header.findIndex((h) => h.includes('거래처명')),
    salesperson: header.findIndex((h) => h.includes('판매사원')),
    itemName: header.findIndex((h) => h.includes('품목명')),
    total: header.findIndex((h) => h === '합계' || h.includes('합계')),
  }

  if (Object.values(colIdx).some((i) => i === -1)) {
    throw new Error('필수 컬럼(일자-No., 거래처명, 판매사원, 품목명, 합계)을 찾지 못했습니다.')
  }

  const dataRows = rows.slice(headerRowIdx + 1)
  const groups = new Map() // key: "날짜|영수증No|거래처|판매사원" -> { date, receiptNo, customer, salesperson, total, products:Set, mainProductSold }

  for (const row of dataRows) {
    const dateNoRaw = String(row[colIdx.dateNo] || '').trim()
    if (!dateNoRaw || dateNoRaw.includes('총합계')) continue

    const customer = String(row[colIdx.customer] || '').trim()
    const salesperson = String(row[colIdx.salesperson] || '').trim()
    const itemName = String(row[colIdx.itemName] || '').trim()
    const total = Number(String(row[colIdx.total] || '0').replace(/,/g, '')) || 0

    if (!customer || !salesperson) continue

    // "2026/06/20 -111" 형태에서 날짜와 영수증No 분리
    const m = dateNoRaw.match(/(\d{4}[./-]\d{2}[./-]\d{2})\s*-?\s*(\d+)?/)
    if (!m) continue
    const date = m[1].replace(/\./g, '-').replace(/\//g, '-')
    const receiptNo = m[2] || '0'

    const key = `${date}|${receiptNo}|${customer}|${salesperson}`
    if (!groups.has(key)) {
      groups.set(key, {
        date, receiptNo, customer, salesperson,
        total: 0, products: new Set(), mainProductSold: false, rawItems: [],
      })
    }
    const g = groups.get(key)
    g.total += total
    g.rawItems.push(itemName)

    const matched = matchProductKeyword(itemName)
    if (matched) {
      g.products.add(matched)
      if (matched === MAIN_PRODUCT) g.mainProductSold = true
    }
  }

  return Array.from(groups.values()).map((g) => ({
    date: g.date,
    receiptNo: g.receiptNo,
    customer: g.customer,
    salesperson: g.salesperson,
    total: g.total,
    basketProducts: Array.from(g.products),
    mainProductSold: g.mainProductSold,
  }))
}

/**
 * 파싱된 거래 그룹들을 우리 DB의 지점/직원과 매칭합니다.
 * storeAliasMap: { ecount_name: store_id }
 * profilesByName: { name: profile_id } (같은 지점 내에서만 매칭하려면 호출부에서 필터링)
 */
export function matchToDb(parsedRows, storeAliasMap, storeMembersByStoreThenName) {
  return parsedRows.map((row) => {
    const storeId = storeAliasMap[row.customer] || null
    let profileId = null
    let matchIssue = null

    if (!storeId) {
      matchIssue = '지점 매핑 없음'
    } else {
      const membersInStore = storeMembersByStoreThenName[storeId] || {}
      profileId = membersInStore[row.salesperson] || null
      if (!profileId) matchIssue = '직원 이름 매칭 실패'
    }

    return { ...row, storeId, profileId, matchIssue }
  })
}
