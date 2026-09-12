import { useState } from 'react'
import { COLORS } from './theme'

/* ============================================================
   요청 화면 3종 (D 담당)
   홈 화면의 타일 3개에서 각각 연결되는 화면이며, 카드 틀은 공용이고
   카드 하단 액션 영역만 화면별로 다르다.

     view="received"  받은 요청      프로필 보기 + 거절/수락
     view="sent"      보낸 요청 현황  상태 뱃지만 (버튼 없음)
     view="matched"   매칭된 상대     리포트 다시 보기 + 연락처

   ⚠️ 임시 데이터 — 확정 API 아님. 아래 dummy* 는 전부 더미다.

   [C/백엔드에 필요한 것]
   1. 받은 요청 / 보낸 요청 / 매칭된 상대 목록 조회 API
   2. 수락·거절 액션 API (endpoint/method/request/response 미확정)
   3. 상호 수락 시 양쪽 "매칭된 상대"에 반영되는 규칙
      - 프론트 polling 인지 서버 알림인지 A와 협의 필요. 지금은 이 컴포넌트
        안에서만 목록이 이동하고, 새로고침하면 더미 상태로 되돌아간다.
   4. 연락처는 매칭 성사 이후에만 내려와야 한다 (형식도 팀 논의 필요)

   [A/App.jsx 에 필요한 것]
   5. 홈 타일 → 이 화면 연결. view / onBack props 만 연결하면 된다.
      수락 시 목록 간 이동이 유지되려면 이 컴포넌트를 언마운트하지 말고
      view prop 만 바꿔주는 편이 좋다.
   6. "프로필 보기" / "리포트 다시 보기" 는 MatchingResult 의 상세 리포트를
      재사용할 자리인데, 지금 더미에는 리포트에 필요한 lifestyle/preferences
      데이터가 없어 onViewProfile 콜백만 열어두고 비워뒀다.
============================================================ */

const dummyReceived = [
  {
    request_id: 1,
    from_user_id: 2,
    nickname: '지우',
    age: 23,
    gender: '여',
    score: 79,
    good_point_preview: '예산이 겹쳐요',
    status: 'pending',
    // 실제로는 매칭 성사 후에만 서버가 내려줘야 하는 값
    contact: { type: 'kakao', value: 'jiwoo_room' },
  },
  {
    request_id: 2,
    from_user_id: 5,
    nickname: '하은',
    age: 20,
    gender: '여',
    score: 84,
    good_point_preview: '흡연 기준이 같아요',
    status: 'pending',
    contact: { type: 'kakao', value: 'haeun_00' },
  },
]

const dummySent = [
  { request_id: 11, to_user_id: 3, nickname: '서연', age: 22, gender: '여', status: 'pending' },
  { request_id: 12, to_user_id: 4, nickname: '고요한숲', age: 21, gender: '여', status: 'accepted' },
  { request_id: 13, to_user_id: 6, nickname: '든든한바위', age: 21, gender: '여', status: 'declined' },
]

const dummyMatched = [
  {
    match_id: 1,
    user_id: 4,
    nickname: '고요한숲',
    age: 21,
    gender: '여',
    score: 92,
    contact: { type: 'kakao', value: 'soonsoon_forest' },
  },
]

const LOCAL = {
  scoreBg: '#FBEDE7',
  scoreText: '#C0533E',
  pendingBg: '#F1EFE8',
  pendingText: '#8A8A8A',
  acceptedBg: '#EAF3DE',
  acceptedText: '#3B6D11',
  declinedBg: '#FCEBEB',
  declinedText: '#A32D2D',
  declinedBorder: '#F0C4C4',
  outline: '#E5E3DC',
}

const VIEW_CONFIG = {
  received: { title: '받은 요청', badgeBg: COLORS.pink, badgeText: COLORS.pinkText },
  sent: { title: '보낸 요청 현황', badgeBg: null, badgeText: null },
  matched: { title: '매칭된 상대', badgeBg: COLORS.yellow, badgeText: COLORS.yellowText },
}

const STATUS_LABEL = {
  pending: '대기중',
  accepted: '수락됨',
  declined: '거절됨',
}

export default function RequestsScreen({
  view = 'received',
  received = dummyReceived,
  sent = dummySent,
  matched = dummyMatched,
  onAccept,
  onDecline,
  onBack,
  onViewProfile,
}) {
  // 목록은 부모(홈 화면)가 들고 있다. 여기서 따로 복사해 두면 화면을 오갈 때
  // 수락/거절 결과가 되돌아가 버린다.
  // 수락 버튼을 누른 직후 오버레이에 띄울 상대만 이 화면의 상태다.
  const [pendingAccept, setPendingAccept] = useState(null)

  const confirmAccept = () => {
    onAccept?.(pendingAccept)
    setPendingAccept(null)
  }

  const config = VIEW_CONFIG[view]
  const count = view === 'received' ? received.length : matched.length

  return (
    <div style={styles.page}>
      <header style={styles.header}>
        <button type="button" style={styles.backButton} onClick={onBack}>
          <BackIcon color={COLORS.text} />
        </button>
        <h1 style={styles.title}>{config.title}</h1>
        {config.badgeBg && count > 0 && (
          <span style={{ ...styles.countBadge, background: config.badgeBg, color: config.badgeText }}>
            {count}
          </span>
        )}
      </header>

      {view === 'received' && (
        <List isEmpty={received.length === 0} emptyText="받은 요청이 없어요">
          {received.map((person) => (
            <PersonCard key={person.request_id} person={person}>
              <p style={styles.goodPoint}>{person.good_point_preview}</p>
              <button
                type="button"
                style={styles.outlineButton}
                onClick={() => onViewProfile?.(person)}
              >
                프로필 보기
              </button>
              <div style={styles.actionRow}>
                <button
                  type="button"
                  style={styles.declineButton}
                  onClick={() => onDecline?.(person)}
                >
                  거절
                </button>
                <button
                  type="button"
                  style={styles.acceptButton}
                  onClick={() => setPendingAccept(person)}
                >
                  수락
                </button>
              </div>
            </PersonCard>
          ))}
        </List>
      )}

      {view === 'sent' && (
        <List isEmpty={sent.length === 0} emptyText="보낸 요청이 없어요">
          {sent.map((person) => (
            <PersonCard key={person.request_id} person={person} status={person.status} compact>
              <StatusBadge status={person.status} />
            </PersonCard>
          ))}
        </List>
      )}

      {view === 'matched' && (
        <List isEmpty={matched.length === 0} emptyText="아직 매칭된 상대가 없어요">
          {matched.map((person) => (
            <PersonCard key={person.user_id} person={person}>
              <button
                type="button"
                style={styles.outlineButton}
                onClick={() => onViewProfile?.(person)}
              >
                리포트 다시 보기
              </button>
              <div style={styles.contactBox}>
                <p style={styles.contactLabel}>연락처</p>
                <div style={styles.contactValueRow}>
                  <ChatIcon color={COLORS.text} />
                  <span style={styles.contactValue}>
                    {person.contact.type}: {person.contact.value}
                  </span>
                </div>
              </div>
            </PersonCard>
          ))}
        </List>
      )}

      {pendingAccept && (
        <MatchOverlay nickname={pendingAccept.nickname} onConfirm={confirmAccept} />
      )}
    </div>
  )
}

function List({ isEmpty, emptyText, children }) {
  if (isEmpty) return <p style={styles.emptyText}>{emptyText}</p>
  return <div style={styles.list}>{children}</div>
}

function PersonCard({ person, status, compact, children }) {
  const isDeclined = status === 'declined'

  return (
    <div
      style={{
        ...styles.card,
        ...(isDeclined ? { border: `1px solid ${LOCAL.declinedBorder}` } : {}),
      }}
    >
      <div style={compact ? styles.cardTopCompact : styles.cardTop}>
        <div style={styles.person}>
          <div style={styles.avatar} />
          <div>
            <p style={{ ...styles.nickname, ...(isDeclined ? { color: COLORS.textSub } : {}) }}>
              {person.nickname}
            </p>
            <p style={styles.meta}>
              {person.age}세 · {person.gender}
            </p>
          </div>
        </div>

        {compact ? children : person.score != null && (
          <span style={styles.scoreBadge}>{person.score}%</span>
        )}
      </div>

      {!compact && children}
    </div>
  )
}

function StatusBadge({ status }) {
  const tone = {
    pending: { background: LOCAL.pendingBg, color: LOCAL.pendingText },
    accepted: { background: LOCAL.acceptedBg, color: LOCAL.acceptedText },
    declined: { background: LOCAL.declinedBg, color: LOCAL.declinedText },
  }[status]

  return (
    <span style={{ ...styles.statusBadge, ...tone }}>
      {status === 'pending' && <ClockIcon color={LOCAL.pendingText} />}
      {STATUS_LABEL[status]}
    </span>
  )
}

function MatchOverlay({ nickname, onConfirm }) {
  return (
    <div style={styles.overlay}>
      <div style={styles.overlayCard}>
        <div style={styles.overlayIconBox}>
          <HeartIcon color={COLORS.greenText} />
        </div>
        <p style={styles.overlayTitle}>매칭되었습니다!</p>
        <p style={styles.overlayDesc}>{nickname} 님과 매칭됐어요</p>
        <button type="button" style={styles.overlayButton} onClick={onConfirm}>
          확인
        </button>
      </div>
    </div>
  )
}

/* ---------------- 아이콘 (외부 라이브러리 추가 없이 인라인 SVG) ---------------- */

function BackIcon({ color }) {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M15 5l-7 7 7 7" />
    </svg>
  )
}

function ClockIcon({ color }) {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5.5l3.5 2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function ChatIcon({ color }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 11.5a8 8 0 0 1-11.6 7.1L4 20l1.4-4.2A8 8 0 1 1 21 11.5z" />
    </svg>
  )
}

function HeartIcon({ color }) {
  return (
    <svg
      width="28"
      height="28"
      viewBox="0 0 24 24"
      fill={color}
      stroke={color}
      strokeWidth="2"
      strokeLinejoin="round"
    >
      <path d="M12 20s-7-4.4-7-9.3A4.2 4.2 0 0 1 12 8a4.2 4.2 0 0 1 7 2.7c0 4.9-7 9.3-7 9.3z" />
    </svg>
  )
}

/* ---------------- 스타일 ---------------- */

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
  header: { display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 },
  backButton: {
    background: 'none',
    border: 'none',
    padding: 0,
    display: 'flex',
    alignItems: 'center',
    cursor: 'pointer',
  },
  title: { fontSize: 20, fontWeight: 700, color: COLORS.text, margin: 0, letterSpacing: 'normal' },
  countBadge: {
    minWidth: 24,
    height: 24,
    padding: '0 8px',
    borderRadius: 999,
    fontSize: 13,
    fontWeight: 700,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxSizing: 'border-box',
  },
  list: { display: 'flex', flexDirection: 'column', gap: 12 },
  card: {
    background: COLORS.bg,
    border: `1px solid ${LOCAL.outline}`,
    borderRadius: 16,
    padding: 16,
  },
  cardTop: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 10,
  },
  cardTopCompact: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  person: { display: 'flex', alignItems: 'center', gap: 12 },
  avatar: {
    width: 46,
    height: 46,
    borderRadius: 999,
    background: COLORS.sectionBg,
    flexShrink: 0,
  },
  nickname: { fontSize: 16, fontWeight: 700, color: COLORS.text },
  meta: { fontSize: 13, color: COLORS.textSub, marginTop: 3 },
  scoreBadge: {
    background: LOCAL.scoreBg,
    color: LOCAL.scoreText,
    borderRadius: 999,
    padding: '5px 12px',
    fontSize: 14,
    fontWeight: 700,
    whiteSpace: 'nowrap',
  },
  statusBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 5,
    borderRadius: 999,
    padding: '6px 12px',
    fontSize: 13,
    fontWeight: 700,
    whiteSpace: 'nowrap',
  },
  goodPoint: { fontSize: 14, color: COLORS.text, margin: '12px 0 0' },
  outlineButton: {
    width: '100%',
    marginTop: 12,
    background: COLORS.bg,
    border: `1px solid ${LOCAL.outline}`,
    borderRadius: 12,
    padding: '12px 0',
    fontSize: 14,
    color: COLORS.text,
    fontFamily: 'inherit',
    cursor: 'pointer',
  },
  actionRow: { display: 'grid', gridTemplateColumns: '1fr 1.4fr', gap: 10, marginTop: 10 },
  declineButton: {
    background: COLORS.bg,
    border: `1px solid ${LOCAL.outline}`,
    borderRadius: 12,
    padding: '12px 0',
    fontSize: 14,
    color: COLORS.text,
    fontFamily: 'inherit',
    cursor: 'pointer',
  },
  acceptButton: {
    background: COLORS.green,
    color: COLORS.greenText,
    border: 'none',
    borderRadius: 12,
    padding: '12px 0',
    fontSize: 14,
    fontWeight: 700,
    fontFamily: 'inherit',
    cursor: 'pointer',
  },
  contactBox: {
    marginTop: 12,
    background: COLORS.sectionBg,
    borderRadius: 12,
    padding: 14,
  },
  contactLabel: { fontSize: 12, color: COLORS.textSub },
  contactValueRow: { display: 'flex', alignItems: 'center', gap: 8, marginTop: 6 },
  contactValue: { fontSize: 15, color: COLORS.text, fontWeight: 600 },
  emptyText: { fontSize: 14, color: COLORS.textSub, padding: '32px 4px' },
  overlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(26,26,26,0.55)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    zIndex: 50,
  },
  overlayCard: {
    background: COLORS.bg,
    borderRadius: 20,
    padding: '28px 24px 24px',
    width: '100%',
    maxWidth: 320,
    textAlign: 'center',
  },
  overlayIconBox: {
    width: 66,
    height: 66,
    borderRadius: 999,
    background: COLORS.green,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 16px',
  },
  overlayTitle: { fontSize: 19, fontWeight: 700, color: COLORS.text },
  overlayDesc: { fontSize: 14, color: COLORS.textSub, marginTop: 6 },
  overlayButton: {
    width: '100%',
    marginTop: 20,
    background: COLORS.text,
    color: '#FFFFFF',
    border: 'none',
    borderRadius: 14,
    padding: '14px 0',
    fontSize: 15,
    fontWeight: 700,
    fontFamily: 'inherit',
    cursor: 'pointer',
  },
}
