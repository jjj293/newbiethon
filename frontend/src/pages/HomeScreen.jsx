/* ============================================================
   홈 화면 (D 담당)

   ⚠️ 임시 데이터 — 확정 API 아님. 아래 dummy* 는 전부 더미다.
   이 화면을 실제 데이터로 채우려면 다른 담당자 작업이 먼저 필요하다.

   [C/백엔드에 필요한 것]
   1. GET /users/{user_id} 응답에 nickname 추가
      - DB(users.nickname)에는 이미 저장되는데 schemas.UserOut 에 필드가 없어서
        프론트가 닉네임을 읽어올 수 없다. 헤더의 "OO 님" 이 여기서 막혀 있음.
   2. 요청 관련 API 가 아직 없음. 타일 우측 상단 숫자를 채우려면
      받은 요청 / 보낸 요청 / 매칭 성사된 상대의 개수가 필요하다.

   [A/App.jsx 에 필요한 것]
   3. 이 컴포넌트는 아직 App.jsx 에 연결되어 있지 않다.
      아래 props 에 화면 전환만 연결하면 된다.
      user / counts / onStartSimulation / onGoMatching /
      onGoReceived / onGoSent / onGoMatched / onOpenSettings

   팀 규칙에 따라 사용자 식별자는 user_id, 서버와 주고받는 필드는
   snake_case 로 맞춰 둠.
============================================================ */
const dummyUser = {
  user_id: 1,
  nickname: '민서',
  profile_completed: true,
}

const dummyCounts = {
  received_requests: 2,
  sent_requests: 1,
  matched_partners: 1,
}

export const COLORS = {
  bg: '#FFFFFF',
  text: '#1A1A1A',
  textSub: '#8A8A8A',
  sectionBg: '#F1EFE8',
  green: '#A8E56C',
  greenText: '#2E4D14',
  pink: '#FFB4C6',
  pinkText: '#7A2942',
  sky: '#8FD9FF',
  skyText: '#0B4B66',
  yellow: '#FFE07D',
  yellowText: '#6B4A05',
  badge: '#D4537E',
}

export default function HomeScreen({
  user = dummyUser,
  counts = dummyCounts,
  onStartSimulation,
  onGoMatching,
  onGoReceived,
  onGoSent,
  onGoMatched,
  onOpenSettings,
}) {
  // 프로필(시뮬레이션)을 아직 안 끝낸 사용자에게는 타일을 전부 숨기고
  // 시뮬레이션으로 보내는 화면만 보여준다.
  if (!user.profile_completed) {
    return (
      <div style={styles.page}>
        <Header nickname={user.nickname} showActions={false} />
        <LockedHome onStartSimulation={onStartSimulation} />
      </div>
    )
  }

  return (
    <div style={styles.page}>
      <Header nickname={user.nickname} onOpenSettings={onOpenSettings} />

      <button type="button" style={styles.matchTile} onClick={onGoMatching}>
        <SearchIcon color={COLORS.greenText} />
        <span style={{ ...styles.tileLabel, color: COLORS.greenText }}>매칭하러가기</span>
      </button>

      <div style={styles.tileRow}>
        <SmallTile
          label="받은 요청"
          background={COLORS.pink}
          color={COLORS.pinkText}
          badge={counts.received_requests}
          icon={<EnvelopeIcon color={COLORS.pinkText} />}
          onClick={onGoReceived}
        />
        <SmallTile
          label="보낸 요청"
          background={COLORS.sky}
          color={COLORS.skyText}
          badge={counts.sent_requests}
          icon={<SendIcon color={COLORS.skyText} />}
          onClick={onGoSent}
        />
        <SmallTile
          label="매칭된 상대"
          background={COLORS.yellow}
          color={COLORS.yellowText}
          badge={counts.matched_partners}
          icon={<HeartIcon color={COLORS.yellowText} />}
          onClick={onGoMatched}
        />
      </div>
    </div>
  )
}

function LockedHome({ onStartSimulation }) {
  return (
    <div style={styles.lockedArea}>
      <div style={styles.lockedIconBox}>
        <PuzzleIcon color={COLORS.green} />
      </div>
      <p style={styles.lockedTitle}>아직 프로필이 완성되지 않았어요</p>
      <p style={styles.lockedDesc}>시뮬레이션을 마치면 매칭을 시작할 수 있어요.</p>
      <button type="button" style={styles.lockedButton} onClick={onStartSimulation}>
        시뮬레이션으로 프로필 완성하기
      </button>
    </div>
  )
}

function Header({ nickname, onOpenSettings, showActions = true }) {
  return (
    <header style={styles.header}>
      <div style={styles.profileArea}>
        <div style={styles.avatar} />
        <span style={styles.nickname}>{nickname} 님</span>
      </div>

      {showActions && (
        <button type="button" style={styles.iconButton} onClick={onOpenSettings}>
          <GearIcon color={COLORS.text} />
        </button>
      )}
    </header>
  )
}

function SmallTile({ label, background, color, badge, icon, onClick }) {
  return (
    <button type="button" style={{ ...styles.smallTile, background }} onClick={onClick}>
      {icon}
      <span style={{ ...styles.tileLabel, color, fontSize: 13 }}>{label}</span>
      {badge > 0 && <span style={styles.tileBadge}>{badge}</span>}
    </button>
  )
}

/* ---------------- 아이콘 (외부 라이브러리 추가 없이 인라인 SVG) ---------------- */

function SearchIcon({ color }) {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
      <circle cx="11" cy="11" r="7" />
      <line x1="16.5" y1="16.5" x2="21" y2="21" strokeLinecap="round" />
    </svg>
  )
}

function EnvelopeIcon({ color }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
      <rect x="2.5" y="5" width="19" height="14" rx="2" />
      <path d="M3 7l9 6 9-6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function SendIcon({ color }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
      <path d="M21 3L3 10.5l7 3 3 7L21 3z" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function HeartIcon({ color }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
      <path
        d="M12 20s-7-4.4-7-9.3A4.2 4.2 0 0 1 12 8a4.2 4.2 0 0 1 7 2.7c0 4.9-7 9.3-7 9.3z"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function PuzzleIcon({ color }) {
  return (
    <svg
      width="36"
      height="36"
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M19.44 7.85c-.05.32.06.65.29.88l1.57 1.57c.47.47.7 1.09.7 1.7s-.23 1.24-.7 1.71l-1.62 1.61a.98.98 0 0 1-.83.28c-.47-.07-.8-.48-.97-.93a2.5 2.5 0 1 0-3.21 3.22c.44.16.85.5.92.97a.98.98 0 0 1-.27.83l-1.61 1.61c-.47.47-1.09.71-1.71.71s-1.23-.24-1.7-.71l-1.57-1.57a1.03 1.03 0 0 0-.88-.29c-.49.08-.84.51-1.02.97a2.5 2.5 0 1 1-3.24-3.24c.47-.18.9-.53.97-1.02a1.03 1.03 0 0 0-.29-.88l-1.57-1.57A2.4 2.4 0 0 1 2 12c0-.62.24-1.24.71-1.7L4.23 8.77c.24-.24.58-.36.92-.31.51.08.88.53 1.07 1.01a2.5 2.5 0 1 0 3.26-3.26c-.48-.19-.93-.56-1.01-1.07a1.03 1.03 0 0 1 .3-.92l1.53-1.52A2.4 2.4 0 0 1 12 2c.62 0 1.23.24 1.7.71l1.57 1.57c.23.23.56.34.88.29.49-.08.84-.51 1.02-.97a2.5 2.5 0 1 1 3.24 3.24c-.47.18-.9.53-.97 1.01z" />
    </svg>
  )
}

function GearIcon({ color }) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
      <circle cx="12" cy="12" r="3" />
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
    // #root가 column flex라 width를 안 주면 flex 아이템이 max-content로 늘어나 가로 스크롤이 생긴다.
    width: '100%',
    maxWidth: 480,
    margin: '0 auto',
    padding: '20px 16px 40px',
    boxSizing: 'border-box',
    textAlign: 'left',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  profileArea: { display: 'flex', alignItems: 'center', gap: 12 },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 14,
    background: COLORS.sectionBg,
    flexShrink: 0,
  },
  nickname: { fontSize: 18, fontWeight: 700, color: COLORS.text },
  iconButton: {
    position: 'relative',
    width: 42,
    height: 42,
    borderRadius: 14,
    border: '1px solid #E5E3DC',
    background: COLORS.bg,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    padding: 0,
  },
  lockedArea: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    paddingTop: 72,
  },
  lockedIconBox: {
    width: 76,
    height: 76,
    borderRadius: 22,
    background: COLORS.text,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  lockedTitle: { fontSize: 17, fontWeight: 700, color: COLORS.text },
  lockedDesc: { fontSize: 14, color: COLORS.textSub, marginTop: 8 },
  lockedButton: {
    marginTop: 24,
    background: COLORS.text,
    color: '#FFFFFF',
    border: 'none',
    borderRadius: 14,
    padding: '14px 22px',
    fontSize: 15,
    fontWeight: 700,
    fontFamily: 'inherit',
    cursor: 'pointer',
  },
  matchTile: {
    width: '100%',
    background: COLORS.green,
    border: 'none',
    borderRadius: 20,
    padding: 16,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 40,
    cursor: 'pointer',
    fontFamily: 'inherit',
    textAlign: 'left',
    boxSizing: 'border-box',
  },
  tileRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: 10,
    marginTop: 10,
  },
  smallTile: {
    position: 'relative',
    border: 'none',
    borderRadius: 16,
    padding: 14,
    aspectRatio: '1 / 1',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    cursor: 'pointer',
    fontFamily: 'inherit',
    textAlign: 'left',
    boxSizing: 'border-box',
  },
  tileLabel: { fontSize: 16, fontWeight: 700 },
  tileBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    minWidth: 22,
    height: 22,
    padding: '0 6px',
    borderRadius: 999,
    background: COLORS.badge,
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 700,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxSizing: 'border-box',
  },
}
