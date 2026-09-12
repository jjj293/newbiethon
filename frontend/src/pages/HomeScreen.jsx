import { useState } from 'react'

/* ============================================================
   홈 화면 (D 담당)

   ⚠️ 임시 데이터 — 확정 API 아님.
   아래 dummyUser / dummyCounts 는 전부 더미이며, 실제 연동 시
   A(전체 연결 담당)와 아래 항목을 먼저 합의해야 함.
     - 홈 진입 시 사용자 요약 정보를 주는 endpoint/method
     - 프로필 완성 여부 판단 필드명 (지금은 profile_completed 로 가정)
     - 받은 요청 개수 / 안 읽은 알림 개수를 홈에서 같이 내려줄지 여부
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
  unread_notifications: 2,
}

const COLORS = {
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

export default function HomeScreen({ user = dummyUser, counts = dummyCounts }) {
  const [notificationsOpen, setNotificationsOpen] = useState(false)

  return (
    <div style={styles.page}>
      <Header
        nickname={user.nickname}
        unreadCount={counts.unread_notifications}
        notificationsOpen={notificationsOpen}
        onToggleNotifications={() => setNotificationsOpen((prev) => !prev)}
      />

      <button type="button" style={styles.matchTile}>
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
        />
        <SmallTile
          label="보낸 요청"
          background={COLORS.sky}
          color={COLORS.skyText}
          icon={<SendIcon color={COLORS.skyText} />}
        />
        <SmallTile
          label="매칭된 상대"
          background={COLORS.yellow}
          color={COLORS.yellowText}
          icon={<HeartIcon color={COLORS.yellowText} />}
        />
      </div>
    </div>
  )
}

function Header({ nickname, unreadCount, notificationsOpen, onToggleNotifications }) {
  return (
    <header style={styles.header}>
      <div style={styles.profileArea}>
        <div style={styles.avatar} />
        <span style={styles.nickname}>{nickname} 님</span>
      </div>

      <div style={styles.headerActions}>
        <button
          type="button"
          onClick={onToggleNotifications}
          style={{
            ...styles.iconButton,
            ...(notificationsOpen ? styles.iconButtonActive : {}),
          }}
        >
          <BellIcon color={notificationsOpen ? '#FFFFFF' : COLORS.text} />
          {unreadCount > 0 && <span style={styles.headerBadge}>{unreadCount}</span>}
        </button>

        <button type="button" style={styles.iconButton}>
          <GearIcon color={COLORS.text} />
        </button>
      </div>
    </header>
  )
}

function SmallTile({ label, background, color, badge, icon }) {
  return (
    <button type="button" style={{ ...styles.smallTile, background }}>
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

function BellIcon({ color }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
      <path
        d="M18 9a6 6 0 1 0-12 0c0 5-2 6-2 6h16s-2-1-2-6z"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M10.5 19a1.8 1.8 0 0 0 3 0" strokeLinecap="round" />
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
  headerActions: { display: 'flex', alignItems: 'center', gap: 8 },
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
  iconButtonActive: { background: '#1A1A1A', border: '1px solid #1A1A1A' },
  headerBadge: {
    position: 'absolute',
    top: -6,
    right: -6,
    minWidth: 20,
    height: 20,
    padding: '0 5px',
    borderRadius: 999,
    background: COLORS.badge,
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: 700,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxSizing: 'border-box',
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
