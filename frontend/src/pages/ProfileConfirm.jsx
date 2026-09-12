import { COLORS } from './theme'

/* ============================================================
   프로필 완성 확인 화면 (D 담당)

   시뮬레이션(B 담당) + 주거 조건 입력이 끝난 직후 보여주는 화면.
   "확인"을 누르면 홈 화면으로 이동한다.

   ⚠️ 임시 데이터 — 확정 API 아님.
   실제 연동 시 B/A와 아래를 합의해야 함.
     - 완성된 프로필을 내려주는 endpoint/method
     - age_group 을 문자열("20대 초반")로 줄지, age 숫자로 줄지
     - housing_conditions 안의 budget 이 단일 값인지 범위(min/max)인지
       (백엔드 schemas.py 는 현재 deposit_min/deposit_max 범위 형태임)
============================================================ */
const dummyProfile = {
  user_id: 1,
  gender: '여',
  age_group: '20대 초반',
  preferred_region: ['이캠', '보문'],
  lifestyle: { noise: 15, cleanliness: 15, sleep: 10, privacy: 13, conflict: 7, social: 10 },
  housing_conditions: {
    guest_allowed: true,
    pet_allowed: false,
    smoking_allowed: false,
    budget: { deposit: 100, monthly_rent: 30 },
  },
}

// ⚠️ 백엔드(schemas.py)는 현재 0~16 으로 검증하는데 기획 문서는 0~20 기준이다.
// 어느 쪽이 맞는지 C와 확정 필요. 지금은 문서 기준(20)으로 그린다.
const LIFESTYLE_MAX = 20

const LIFESTYLE_LABELS = [
  ['noise', '소음'],
  ['cleanliness', '청결'],
  ['sleep', '수면패턴'],
  ['privacy', '개인공간'],
  ['conflict', '갈등대응'],
  ['social', '교류'],
]

export default function ProfileConfirm({ profile = dummyProfile, onConfirm }) {
  const { gender, age_group, preferred_region, lifestyle, housing_conditions } = profile
  const { budget, guest_allowed, pet_allowed, smoking_allowed } = housing_conditions

  const tags = [
    `보증금 ${budget.deposit} · 월세 ${budget.monthly_rent}`,
    guest_allowed ? '방문 가능' : '방문 불가',
    pet_allowed ? '반려동물 O' : '반려동물 X',
    smoking_allowed ? '흡연 O' : '흡연 X',
  ]

  return (
    <div style={styles.page}>
      <header style={styles.header}>
        <div style={styles.checkBox}>
          <CheckIcon color={COLORS.greenText} />
        </div>
        <p style={styles.title}>프로필이 완성됐어요</p>
      </header>

      <section style={styles.section}>
        <p style={styles.sectionLabel}>기본 정보</p>
        <p style={styles.basicInfo}>
          {gender} · {age_group} · {preferred_region.join(', ')}
        </p>
      </section>

      <section style={styles.section}>
        <p style={styles.sectionLabel}>생활 성향</p>
        <div style={styles.lifestyleList}>
          {LIFESTYLE_LABELS.map(([key, label]) => (
            <div key={key} style={styles.lifestyleRow}>
              <span style={styles.lifestyleLabel}>{label}</span>
              <div style={styles.barTrack}>
                <div
                  style={{
                    ...styles.barFill,
                    width: `${(lifestyle[key] / LIFESTYLE_MAX) * 100}%`,
                  }}
                />
              </div>
              <span style={styles.lifestyleValue}>{lifestyle[key]}</span>
            </div>
          ))}
        </div>
      </section>

      <section style={styles.section}>
        <p style={styles.sectionLabel}>주거 조건</p>
        <div style={styles.tagRow}>
          {tags.map((tag) => (
            <span key={tag} style={styles.tag}>
              {tag}
            </span>
          ))}
        </div>
      </section>

      <button type="button" style={styles.confirmButton} onClick={onConfirm}>
        확인
      </button>
    </div>
  )
}

function CheckIcon({ color }) {
  return (
    <svg
      width="26"
      height="26"
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4 12.5l5.5 5.5L20 7" />
    </svg>
  )
}

const styles = {
  page: {
    fontFamily: 'var(--sans)',
    background: COLORS.bg,
    color: COLORS.text,
    minHeight: '100vh',
    width: '100%',
    maxWidth: 480,
    margin: '0 auto',
    padding: '20px 16px 40px',
    boxSizing: 'border-box',
    textAlign: 'left',
  },
  header: { display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20 },
  checkBox: {
    width: 48,
    height: 48,
    borderRadius: 14,
    background: COLORS.green,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  title: { fontSize: 19, fontWeight: 700, color: COLORS.text },
  section: {
    background: COLORS.sectionBg,
    borderRadius: 16,
    padding: 16,
    marginBottom: 10,
  },
  sectionLabel: { fontSize: 13, color: COLORS.textSub, marginBottom: 10 },
  basicInfo: { fontSize: 16, fontWeight: 700, color: COLORS.text },
  lifestyleList: { display: 'flex', flexDirection: 'column', gap: 10 },
  lifestyleRow: {
    display: 'grid',
    gridTemplateColumns: '68px 1fr 24px',
    alignItems: 'center',
    gap: 10,
  },
  lifestyleLabel: { fontSize: 13, color: COLORS.text },
  barTrack: {
    height: 8,
    borderRadius: 999,
    background: '#E2DFD5',
    overflow: 'hidden',
  },
  barFill: { height: '100%', borderRadius: 999, background: COLORS.green },
  lifestyleValue: { fontSize: 13, color: COLORS.textSub, textAlign: 'right' },
  tagRow: { display: 'flex', flexWrap: 'wrap', gap: 8 },
  tag: {
    fontSize: 13,
    color: COLORS.text,
    background: COLORS.bg,
    borderRadius: 10,
    padding: '8px 12px',
  },
  confirmButton: {
    marginTop: 18,
    width: '100%',
    background: COLORS.text,
    color: '#FFFFFF',
    border: 'none',
    borderRadius: 16,
    padding: '16px 0',
    fontSize: 16,
    fontWeight: 700,
    fontFamily: 'inherit',
    cursor: 'pointer',
  },
}
