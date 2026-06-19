import React, { useState } from 'react'

const AGES = ['20대', '30대', '40대', '50대 이상']
const CONCERNS = ['속건조', '당김', '민감성', '각질', '모공']
const PRODUCTS = ['수분스틱', '바디크림', '히알루론산세럼', '머드스틱마스크', '샤워오일', '바디스크럽', '페이스젤']
const EXTRAS = ['화장 뜸', '가격 부담', '선물용', '재구매 고객']

const TEMPLATES = {
  수분스틱: (a, c, e) => [
    `고객님, 이 제품은 건조할 때만 바르는 제품이라기보다 ${e.includes('화장 뜸') ? '오후에 화장이 뜨거나 ' : ''}${c ? c + '이 느껴질 때' : '얼굴이 당길 때'} 바로 수분감을 올려주는 제품이에요. ${e.includes('화장 뜸') ? '메이크업 위에도 사용할 수 있어서 들고 다니기 편하세요.' : '끈적임 없이 흡수돼서 부담 없이 덧바르실 수 있어요.'}`,
    `손에 묻히지 않고 스틱으로 바로 톡톡 발라주시면 돼요. ${a ? a + ' 고객님들이' : '많은 분들이'} 화장 파우치에 하나씩 넣고 다니세요.`,
  ],
  바디크림: (a, c, e) => [
    `샤워 후 3분 안에 발라주시면 흡수가 훨씬 좋아요. 끈적이지 않고 보송하게 마무리돼서 ${e.includes('가격 부담') ? '한 통으로 오래 쓰실 수 있어요.' : '옷 입기 전에 바로 입으셔도 괜찮으세요.'}`,
    `${e.includes('선물용') ? '선물용으로도 부담 없는 구성이에요. 피부 타입 가리지 않고 쓸 수 있어서 실패 확률이 낮아요.' : '바디 전체에 발라도 무겁지 않아서 매일 쓰기 편하세요.'}`,
  ],
  히알루론산세럼: (a, c) => [
    `이 세럼은 한 방울로도 얼굴 전체에 수분막을 만들어줘서, ${c ? c + ' 느낌이 줄어든다는 분들이 많아요.' : '당김 없이 촉촉한 느낌이 오래 가요.'} 스킨 다음 단계에 가볍게 발라주시면 돼요.`,
    `사용자 96%가 피부가 부드러워졌다고 답한 제품이에요. 다른 제품 위에 레이어링해서 써도 무겁지 않으세요.`,
  ],
  머드스틱마스크: (a, c) => [
    `이건 씻어내는 팩이 아니라 스틱 타입이라 ${c ? c + ' 부위에' : '모공이 신경 쓰이는 부위에'} 톡톡 발랐다가 5분 후에 닦아내시면 돼요. 욕실에서 바로 쓰기 편하세요.`,
  ],
  샤워오일: (a, c) => [
    `클렌징과 보습을 한 번에 해결하는 제품이에요. 거품이 적어서 씻는 시간이 줄고, 샤워 후 별도 로션 없이도 ${c ? c + ' 느낌이 덜해요.' : '당기지 않아요.'}`,
  ],
  바디스크럽: (a, c) => [
    `${c ? c + '이 고민이시면' : '각질이 쌓이기 쉬운 부위는'} 주 1~2회만 사용하셔도 톤이 한결 부드러워 보여요. 입욕 중에 가볍게 마사지하듯 써주시면 돼요.`,
  ],
  페이스젤: (a, c, e) => [
    `${e.includes('화장 뜸') ? '화장 전 마지막 단계로 가볍게 발라주시면 메이크업이 들뜨는 걸 줄여줘요.' : '산뜻하게 마무리되는 젤 타입이라 가벼운 보습을 원하실 때 좋아요.'}`,
  ],
}

function ChipGroup({ options, selected, onSelect, multiple }) {
  const isActive = (opt) => (multiple ? selected.includes(opt) : selected === opt)
  const toggle = (opt) => {
    if (multiple) {
      onSelect(selected.includes(opt) ? selected.filter((x) => x !== opt) : [...selected, opt])
    } else {
      onSelect(opt)
    }
  }
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 14 }}>
      {options.map((opt) => (
        <button
          key={opt}
          onClick={() => toggle(opt)}
          style={{
            fontSize: 12,
            padding: '6px 12px',
            background: isActive(opt) ? 'var(--bg-blue)' : 'var(--surface)',
            color: isActive(opt) ? 'var(--blue-dark)' : 'var(--text)',
            borderColor: isActive(opt) ? 'var(--blue)' : 'var(--border)',
          }}
        >
          {opt}
        </button>
      ))}
    </div>
  )
}

export default function ScriptGenerator() {
  const [age, setAge] = useState(null)
  const [concern, setConcern] = useState(null)
  const [product, setProduct] = useState('수분스틱')
  const [extra, setExtra] = useState([])
  const [result, setResult] = useState(null)
  const [lastIdx, setLastIdx] = useState(-1)

  const generate = () => {
    const opts = TEMPLATES[product](age, concern, extra)
    let idx = Math.floor(Math.random() * opts.length)
    if (opts.length > 1 && idx === lastIdx) idx = (idx + 1) % opts.length
    setLastIdx(idx)
    setResult(opts[idx])
  }

  return (
    <div style={{ maxWidth: 380, margin: '0 auto' }}>
      <div style={{ background: '#EEF3F7', borderRadius: 'var(--radius-lg)', padding: '1.5rem' }}>
        <div style={{ fontSize: 15, fontWeight: 500, marginBottom: 16 }}>✦ AI 응대 스크립트</div>

        <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 6 }}>연령대</div>
        <ChipGroup options={AGES} selected={age} onSelect={setAge} />

        <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 6 }}>고객 고민</div>
        <ChipGroup options={CONCERNS} selected={concern} onSelect={setConcern} />

        <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 6 }}>관심 제품</div>
        <ChipGroup options={PRODUCTS} selected={product} onSelect={setProduct} />

        <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 6 }}>추가 상황</div>
        <ChipGroup options={EXTRAS} selected={extra} onSelect={setExtra} multiple />

        <button
          onClick={generate}
          style={{ width: '100%', background: 'var(--blue)', color: '#fff', fontWeight: 500, padding: 10, border: 'none' }}
        >
          응대 멘트 생성
        </button>

        {result && (
          <div style={{ marginTop: 16, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: 14 }}>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 6 }}>추천 응대 멘트</div>
            <div style={{ fontSize: 14, lineHeight: 1.7 }}>{result}</div>
            <div style={{ display: 'flex', gap: 6, marginTop: 10 }}>
              <button style={{ fontSize: 12, padding: '5px 10px' }} onClick={() => navigator.clipboard.writeText(result)}>복사</button>
              <button style={{ fontSize: 12, padding: '5px 10px' }} onClick={generate}>다른 멘트</button>
            </div>
          </div>
        )}
      </div>

      <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 16 }}>
        ※ 현재는 템플릿 조합 방식입니다. Claude API 연동 버전은 이어서 별도로 안내해 드립니다.
      </p>
    </div>
  )
}
