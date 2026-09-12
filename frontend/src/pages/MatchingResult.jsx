import { useState } from "react";
import "../App.css";

/* ============================================================
   매칭 결과 화면 (D 담당)
   디자인은 design/matching_result_mockup/index.html 기준.

   ⚠️ DUMMY DATA — 화면 개발용 임시 데이터입니다.
   C의 실제 궁합 계산 결과가 아니며 팀 공식 API 규격도 아닙니다.

   [C와 협의 필요한 사항]
   - Endpoint / Method (예상: GET /matches/{user_id}, 미확정)
   - 응답 필드명 전체. 현재 백엔드는 camelCase(matchScore/complementScore)로
     내려주는데 팀 규칙은 snake_case라 어느 쪽으로 맞출지 확정 필요.
   - goodPoints / badPoints 문장을 C가 어떤 기준으로 생성하는지
   - "잘 맞는 정도"와 "보완되는 정도"는 절대 하나로 합치지 않는다 (기획 핵심).
     그래서 카드마다 두 점수를 나란히 보여준다.
============================================================ */
const dummyMatches = {
  compatible: [
    {
      user_id: "u1",
      nickname: "고요한숲",
      age: 21,
      gender: "여",
      match_score: 95,
      complement_score: 81,
      goodPoints: ["소음에 대한 기준이 비슷해 생활 소음 문제로 갈등이 생길 가능성이 낮아요."],
      badPoints: [],
      region: ["이캠", "보문"],
      lifestyle: { noise: 15, cleanliness: 15, sleep: 10, privacy: 13, conflict: 7, social: 10 },
      preferences: {
        guestAllowed: true,
        petAllowed: false,
        smokingAllowed: false,
        budget: [
          { deposit: 100, monthlyRent: 30 },
          { deposit: 300, monthlyRent: 40 },
        ],
      },
    },
    {
      user_id: "u2",
      nickname: "느긋한고양이",
      age: 22,
      gender: "여",
      match_score: 90,
      complement_score: 76,
      goodPoints: ["청결 기준이 비슷해 청소나 정리정돈 방식이 잘 맞을 가능성이 높아요."],
      badPoints: ["수면 패턴이 달라 늦은 시간 생활이 겹칠 수 있어요."],
      region: ["문캠"],
      lifestyle: { noise: 12, cleanliness: 16, sleep: 5, privacy: 14, conflict: 9, social: 8 },
      preferences: {
        guestAllowed: false,
        petAllowed: false,
        smokingAllowed: false,
        budget: [{ deposit: 200, monthlyRent: 35 }],
      },
    },
    {
      user_id: "u3",
      nickname: "잔잔한파도",
      age: 20,
      gender: "여",
      match_score: 90,
      complement_score: 74,
      goodPoints: ["개인 공간에 대한 기준이 비슷해 서로 편안하게 생활할 가능성이 높아요."],
      badPoints: ["청결 기준에 약간 차이가 있어요."],
      region: ["이캠"],
      lifestyle: { noise: 14, cleanliness: 11, sleep: 9, privacy: 12, conflict: 8, social: 11 },
      preferences: {
        guestAllowed: true,
        petAllowed: false,
        smokingAllowed: false,
        budget: [{ deposit: 100, monthlyRent: 30 }],
      },
    },
  ],
  complementary: [
    {
      user_id: "u4",
      nickname: "활발한다람쥐",
      age: 23,
      gender: "여",
      match_score: 70,
      complement_score: 81,
      goodPoints: ["소음 민감도와 수면 패턴이 잘 맞아 늦은 시간 생활로 인한 충돌 가능성이 낮아요."],
      badPoints: ["손님 방문 선호도가 달라 생활 리듬이 어긋날 수 있어요."],
      region: ["보문"],
      lifestyle: { noise: 8, cleanliness: 6, sleep: 16, privacy: 7, conflict: 12, social: 17 },
      preferences: {
        guestAllowed: true,
        petAllowed: false,
        smokingAllowed: false,
        budget: [{ deposit: 100, monthlyRent: 30 }],
      },
    },
    {
      user_id: "u5",
      nickname: "든든한바위",
      age: 21,
      gender: "여",
      match_score: 62,
      complement_score: 78,
      goodPoints: ["생활 및 수면 패턴이 비슷해 함께 생활하기 편할 가능성이 높아요."],
      badPoints: ["청결 기준 차이가 커 정리정돈 방식에서 부딪힐 수 있어요."],
      region: ["이캠", "문캠"],
      lifestyle: { noise: 10, cleanliness: 5, sleep: 11, privacy: 9, conflict: 14, social: 15 },
      preferences: {
        guestAllowed: true,
        petAllowed: false,
        smokingAllowed: false,
        budget: [{ deposit: 300, monthlyRent: 25 }],
      },
    },
    {
      user_id: "u6",
      nickname: "따뜻한코코아",
      age: 22,
      gender: "여",
      match_score: 56,
      complement_score: 72,
      goodPoints: ["함께 지내고 교류하는 정도에 대한 선호가 비슷해요."],
      badPoints: ["개인 공간에 대한 요구 수준이 달라 한 사람이 불편함을 느낄 수 있어요."],
      region: ["보문"],
      lifestyle: { noise: 9, cleanliness: 7, sleep: 4, privacy: 10, conflict: 6, social: 13 },
      preferences: {
        guestAllowed: true,
        petAllowed: false,
        smokingAllowed: false,
        budget: [{ deposit: 100, monthlyRent: 30 }],
      },
    },
  ],
};

const MAX_SELECT = 2;

const C = {
  canvas: "#F2EFE8",
  card: "#FFFFFF",
  text: "#1A1A1A",
  muted: "#8A8A8A",
  border: "#EEECE4",
  green: "#A8E56C",
  greenTint: "#EAF7DB",
  greenText: "#4C7A24",
  blue: "#8FD9FF",
  blueTint: "#E7F7FF",
  blueText: "#2C7EA6",
  pinkTint: "#FFEEF2",
  pinkText: "#B23A5C",
  avatarShell: "#EFECE2",
};

export default function MatchingResult({ onBack, nickname = "민서" }) {
  const [selectedIds, setSelectedIds] = useState([]);
  const [detailPerson, setDetailPerson] = useState(null);
  const [showLimitWarning, setShowLimitWarning] = useState(false);
  // 각 후보별 진행 상태: undefined | "requested" | "accepted" | "declined"
  const [requestStatus, setRequestStatus] = useState({});

  function toggleSelect(id) {
    setSelectedIds((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= MAX_SELECT) {
        setShowLimitWarning(true);
        setTimeout(() => setShowLimitWarning(false), 2000);
        return prev;
      }
      return [...prev, id];
    });
  }

  function sendRequest(id) {
    // ⚠️ 실제 연동 시 endpoint 와 request body(user_id, target_user_id 등) 확정 필요.
    setRequestStatus((prev) => ({ ...prev, [id]: "requested" }));

    // 데모용: 2초 뒤 상대가 랜덤하게 수락/거절하는 것처럼 시뮬레이션
    setTimeout(() => {
      const accepted = Math.random() > 0.4;
      setRequestStatus((prev) => ({ ...prev, [id]: accepted ? "accepted" : "declined" }));
    }, 2000);
  }

  return (
    <div style={styles.page}>
      {showLimitWarning && (
        <div style={styles.limitToast}>이미 {MAX_SELECT}명을 선택했어요</div>
      )}

      <div style={styles.card}>
        <header style={styles.header}>
          {onBack && (
            <button type="button" style={styles.iconButton} onClick={onBack}>
              <svg
                width="17"
                height="17"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M15 5l-7 7 7 7" />
              </svg>
            </button>
          )}
          <div style={styles.avatarShell} />
          <div style={styles.headerName}>{nickname} 님</div>
        </header>

        <h1 style={styles.pageTitle}>매칭 결과</h1>
        <p style={styles.pageSub}>성향 분석이 끝났어요. 이런 분들은 어떠세요?</p>

        <Section
          label="매칭 순위"
          description="성향이 비슷해서 잘 맞는 상대"
          tone="green"
          people={dummyMatches.compatible}
          selectedIds={selectedIds}
          requestStatus={requestStatus}
          onCardClick={setDetailPerson}
          onToggleSelect={toggleSelect}
        />

        <Section
          label="보완 순위"
          description="다른 성향이 서로 보완되는 상대"
          tone="blue"
          people={dummyMatches.complementary}
          selectedIds={selectedIds}
          requestStatus={requestStatus}
          onCardClick={setDetailPerson}
          onToggleSelect={toggleSelect}
        />
      </div>

      {selectedIds.length > 0 && (
        <div style={styles.floatingBar}>
          <span style={styles.floatingText}>
            {selectedIds.length}/{MAX_SELECT}명 선택됨
          </span>
          <button
            type="button"
            style={styles.primaryButton}
            onClick={() => selectedIds.forEach((id) => sendRequest(id))}
          >
            선택 요청 보내기
          </button>
        </div>
      )}

      {detailPerson && (
        <DetailModal person={detailPerson} onClose={() => setDetailPerson(null)} />
      )}
    </div>
  );
}

function Section({
  label,
  description,
  tone,
  people,
  selectedIds,
  requestStatus,
  onCardClick,
  onToggleSelect,
}) {
  return (
    <section style={styles.section}>
      <div style={styles.sectionHead}>
        <span
          style={{
            ...styles.sectionBadge,
            background: tone === "green" ? C.green : C.blue,
            color: tone === "green" ? C.greenText : C.blueText,
          }}
        >
          {label}
        </span>
        <span style={styles.sectionDesc}>{description}</span>
      </div>

      <div style={styles.rankList}>
        {people.map((person, index) => (
          <RankCard
            key={person.user_id}
            rank={index + 1}
            tone={tone}
            person={person}
            selected={selectedIds.includes(person.user_id)}
            status={requestStatus[person.user_id]}
            onOpenDetail={() => onCardClick(person)}
            onToggleSelect={() => onToggleSelect(person.user_id)}
          />
        ))}
      </div>
    </section>
  );
}

function RankCard({ rank, tone, person, selected, status, onOpenDetail, onToggleSelect }) {
  const solid = tone === "green" ? C.green : C.blue;
  const tint = tone === "green" ? C.greenTint : C.blueTint;
  const toneText = tone === "green" ? C.greenText : C.blueText;

  return (
    <div
      style={{
        ...styles.rankCard,
        ...(selected ? { border: `1.5px solid ${solid}` } : {}),
      }}
    >
      <div
        style={{
          ...styles.rankBadge,
          background: rank === 1 ? solid : tint,
          color: toneText,
        }}
      >
        {rank}
      </div>

      <div style={{ ...styles.rankAvatar, background: tint }}>{person.nickname[0]}</div>

      <div style={styles.rankBody}>
        <div style={styles.rankRow}>
          <span style={styles.rankName}>{person.nickname} 님</span>
          <span style={styles.rankScores}>
            <span style={{ ...styles.scorePill, background: C.greenTint, color: C.greenText }}>
              매칭 {person.match_score}
            </span>
            <span style={{ ...styles.scorePill, background: C.blueTint, color: C.blueText }}>
              보완 {person.complement_score}
            </span>
          </span>
        </div>

        <ul style={styles.pointList}>
          {person.goodPoints.slice(0, 1).map((point) => (
            <li key={point} style={styles.pointItem}>
              <span style={{ ...styles.pointMark, color: C.greenText }}>+</span>
              <span>{point}</span>
            </li>
          ))}
          {person.badPoints.slice(0, 1).map((point) => (
            <li key={point} style={styles.pointItem}>
              <span style={{ ...styles.pointMark, color: C.pinkText }}>-</span>
              <span>{point}</span>
            </li>
          ))}
        </ul>

        <div style={styles.cardActions}>
          <button type="button" style={styles.detailButton} onClick={onOpenDetail}>
            리포트 보기
          </button>

          {status === "requested" && <span style={styles.statusPending}>요청 전송됨</span>}
          {status === "accepted" && (
            <span style={{ ...styles.statusText, color: C.greenText }}>수락됨 ✓</span>
          )}
          {status === "declined" && <span style={styles.statusText}>거절됨</span>}
          {!status && (
            <button
              type="button"
              style={{
                ...styles.selectButton,
                ...(selected ? { background: solid, color: toneText } : {}),
              }}
              onClick={onToggleSelect}
            >
              {selected ? "선택 취소" : "선택하기"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function DetailModal({ person, onClose }) {
  const { preferences, lifestyle } = person;
  const prefRows = [
    ["외부인 방문", preferences.guestAllowed],
    ["반려동물", preferences.petAllowed],
    ["흡연", preferences.smokingAllowed],
  ];
  const lifestyleRows = [
    ["소음 민감도", lifestyle.noise],
    ["청결 기준", lifestyle.cleanliness],
    ["수면/생활패턴", lifestyle.sleep],
    ["개인공간 중요도", lifestyle.privacy],
    ["갈등 대응", lifestyle.conflict],
    ["교류 선호도", lifestyle.social],
  ];
  // ⚠️ 기획 문서는 0~20 기준인데 backend/schemas.py 는 0~16 으로 검증한다. C와 확정 필요.
  const LIFESTYLE_MAX = 20;

  return (
    <div style={styles.modalOverlay} onClick={onClose}>
      <div style={styles.modalBox} onClick={(e) => e.stopPropagation()}>
        <div style={styles.modalHeader}>
          <div>
            <p style={styles.modalNickname}>{person.nickname} 님</p>
            <p style={styles.modalMeta}>
              {person.age}세 · {person.gender}
            </p>
          </div>
          <span style={styles.rankScores}>
            <span style={{ ...styles.scorePill, background: C.greenTint, color: C.greenText }}>
              매칭 {person.match_score}
            </span>
            <span style={{ ...styles.scorePill, background: C.blueTint, color: C.blueText }}>
              보완 {person.complement_score}
            </span>
          </span>
        </div>

        <div style={styles.pointBlock}>
          <p style={{ ...styles.pointTitle, color: C.greenText }}>잘 맞을 것 같은 점</p>
          <ul style={styles.modalList}>
            {person.goodPoints.map((p) => (
              <li key={p} style={styles.modalListItem}>
                {p}
              </li>
            ))}
          </ul>

          {person.badPoints.length > 0 && (
            <>
              <p style={{ ...styles.pointTitle, color: C.pinkText, marginTop: 12 }}>
                안 맞을 것 같은 점
              </p>
              <ul style={styles.modalList}>
                {person.badPoints.map((p) => (
                  <li key={p} style={styles.modalListItem}>
                    {p}
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>

        <div style={styles.infoSection}>
          <p style={styles.infoTitle}>희망 지역</p>
          <div style={styles.tagRow}>
            {person.region.map((r) => (
              <span key={r} style={styles.tag}>
                {r}
              </span>
            ))}
          </div>
        </div>

        <div style={styles.infoSection}>
          <p style={styles.infoTitle}>예산 범위</p>
          <div style={styles.tagRow}>
            {preferences.budget.map((b) => (
              <span key={`${b.deposit}-${b.monthlyRent}`} style={styles.tag}>
                보증금 {b.deposit}만 · 월세 {b.monthlyRent}만
              </span>
            ))}
          </div>
        </div>

        <div style={styles.infoSection}>
          <p style={styles.infoTitle}>기타 사항</p>
          <div style={styles.oxRow}>
            {prefRows.map(([label, allowed]) => (
              <div key={label} style={styles.oxItem}>
                <span
                  style={{ ...styles.oxIcon, color: allowed ? C.greenText : C.pinkText }}
                >
                  {allowed ? "O" : "X"}
                </span>
                <span style={styles.oxLabel}>{label}</span>
              </div>
            ))}
          </div>
        </div>

        <div style={styles.infoSection}>
          <p style={styles.infoTitle}>성향</p>
          <div style={styles.lifestyleList}>
            {lifestyleRows.map(([label, value]) => (
              <div key={label} style={styles.lifestyleRow}>
                <span style={styles.lifestyleLabel}>{label}</span>
                <div style={styles.barTrack}>
                  <div
                    style={{ ...styles.barFill, width: `${(value / LIFESTYLE_MAX) * 100}%` }}
                  />
                </div>
                <span style={styles.lifestyleValue}>{value}</span>
              </div>
            ))}
          </div>
        </div>

        <button type="button" style={styles.closeButton} onClick={onClose}>
          닫기
        </button>
      </div>
    </div>
  );
}

/* ---------------- 스타일 ---------------- */

const JUA = "'Jua', 'Apple SD Gothic Neo', system-ui, sans-serif";
const SANS = "-apple-system, 'Apple SD Gothic Neo', system-ui, 'Malgun Gothic', sans-serif";

const styles = {
  page: {
    fontFamily: SANS,
    background: C.canvas,
    color: C.text,
    minHeight: "100vh",
    width: "100%",
    maxWidth: 420,
    margin: "0 auto",
    padding: "24px 16px 100px",
    boxSizing: "border-box",
    textAlign: "left",
  },
  card: {
    background: C.card,
    borderRadius: 26,
    border: `1px solid ${C.border}`,
    padding: 20,
  },
  header: { display: "flex", alignItems: "center", gap: 12, marginBottom: 18 },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 12,
    background: "#F5F3EC",
    border: "none",
    color: C.text,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    flexShrink: 0,
    padding: 0,
  },
  avatarShell: { width: 40, height: 40, borderRadius: 12, background: C.avatarShell, flexShrink: 0 },
  headerName: { fontSize: 15, fontWeight: 600, flex: 1 },
  pageTitle: { fontFamily: JUA, fontSize: 22, fontWeight: 400, margin: "4px 0 2px", letterSpacing: "normal" },
  pageSub: { fontSize: 12.5, color: C.muted, margin: "0 0 18px" },
  section: { marginBottom: 22 },
  sectionHead: { display: "flex", alignItems: "baseline", gap: 8, marginBottom: 10, flexWrap: "wrap" },
  sectionBadge: { fontFamily: JUA, fontSize: 15, padding: "3px 12px", borderRadius: 999 },
  sectionDesc: { fontSize: 11.5, color: C.muted },
  rankList: { display: "flex", flexDirection: "column", gap: 10 },
  rankCard: {
    display: "flex",
    gap: 12,
    padding: 14,
    borderRadius: 18,
    border: `1px solid ${C.border}`,
  },
  rankBadge: {
    width: 26,
    height: 26,
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontFamily: JUA,
    fontSize: 13,
    flexShrink: 0,
    marginTop: 1,
  },
  rankAvatar: {
    width: 38,
    height: 38,
    borderRadius: "50%",
    flexShrink: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 14,
    fontWeight: 600,
    color: C.text,
  },
  rankBody: { flex: 1, minWidth: 0 },
  rankRow: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 },
  rankName: { fontSize: 14.5, fontWeight: 600 },
  rankScores: { display: "flex", gap: 6, flexShrink: 0 },
  scorePill: {
    fontSize: 11,
    fontWeight: 600,
    padding: "2px 8px",
    borderRadius: 999,
    whiteSpace: "nowrap",
  },
  pointList: {
    margin: "8px 0 0",
    padding: 0,
    listStyle: "none",
    display: "flex",
    flexDirection: "column",
    gap: 4,
  },
  pointItem: { fontSize: 12, lineHeight: 1.45, display: "flex", gap: 6, color: C.text },
  pointMark: { flexShrink: 0, fontWeight: 700 },
  cardActions: { display: "flex", alignItems: "center", gap: 8, marginTop: 10 },
  detailButton: {
    fontSize: 11.5,
    color: C.muted,
    background: "none",
    border: `1px solid ${C.border}`,
    borderRadius: 8,
    padding: "5px 10px",
    cursor: "pointer",
    fontFamily: "inherit",
  },
  selectButton: {
    fontSize: 11.5,
    fontWeight: 600,
    color: C.text,
    background: "#F5F3EC",
    border: "none",
    borderRadius: 8,
    padding: "6px 12px",
    cursor: "pointer",
    marginLeft: "auto",
    fontFamily: "inherit",
  },
  statusPending: { fontSize: 11.5, color: C.muted, marginLeft: "auto" },
  statusText: { fontSize: 11.5, fontWeight: 700, color: C.muted, marginLeft: "auto" },
  limitToast: {
    position: "fixed",
    top: 20,
    left: "50%",
    transform: "translateX(-50%)",
    background: C.pinkText,
    color: "#FFFFFF",
    borderRadius: 999,
    padding: "10px 18px",
    fontSize: 13,
    fontWeight: 600,
    zIndex: 60,
  },
  floatingBar: {
    position: "fixed",
    bottom: 20,
    left: "50%",
    transform: "translateX(-50%)",
    width: "calc(100% - 40px)",
    maxWidth: 388,
    background: C.text,
    borderRadius: 16,
    padding: "12px 16px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 10,
    zIndex: 40,
  },
  floatingText: { color: "#FFFFFF", fontSize: 13.5, fontWeight: 600 },
  primaryButton: {
    background: C.green,
    color: C.greenText,
    border: "none",
    borderRadius: 10,
    padding: "10px 14px",
    fontSize: 13,
    fontWeight: 700,
    cursor: "pointer",
    fontFamily: "inherit",
  },
  modalOverlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(26,26,26,0.45)",
    display: "flex",
    alignItems: "flex-end",
    justifyContent: "center",
    zIndex: 50,
  },
  modalBox: {
    background: C.card,
    width: "100%",
    maxWidth: 420,
    borderRadius: "24px 24px 0 0",
    padding: "24px 20px 28px",
    maxHeight: "90vh",
    overflowY: "auto",
    boxSizing: "border-box",
  },
  modalHeader: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10 },
  modalNickname: { fontFamily: JUA, fontSize: 18, margin: 0 },
  modalMeta: { fontSize: 12, color: C.muted, marginTop: 3 },
  pointBlock: { marginTop: 16, padding: "14px 16px", background: C.canvas, borderRadius: 14 },
  pointTitle: { fontSize: 12.5, fontWeight: 700, margin: 0 },
  modalList: { margin: "6px 0 0", paddingLeft: 18 },
  modalListItem: { fontSize: 13, color: C.text, marginBottom: 3, lineHeight: 1.5 },
  infoSection: { marginTop: 16 },
  infoTitle: { fontSize: 12, fontWeight: 700, color: C.muted, margin: "0 0 8px" },
  tagRow: { display: "flex", flexWrap: "wrap", gap: 6 },
  tag: { fontSize: 12, color: C.text, background: C.canvas, borderRadius: 8, padding: "5px 10px" },
  oxRow: { display: "flex", gap: 18 },
  oxItem: { display: "flex", alignItems: "center", gap: 6 },
  oxIcon: { fontSize: 14, fontWeight: 800 },
  oxLabel: { fontSize: 12.5, color: C.text },
  lifestyleList: { display: "flex", flexDirection: "column", gap: 8 },
  lifestyleRow: {
    display: "grid",
    gridTemplateColumns: "84px 1fr 20px",
    alignItems: "center",
    gap: 8,
  },
  lifestyleLabel: { fontSize: 12, color: C.text },
  barTrack: { height: 6, borderRadius: 999, background: C.border, overflow: "hidden" },
  barFill: { height: "100%", borderRadius: 999, background: C.green },
  lifestyleValue: { fontSize: 11.5, color: C.muted, textAlign: "right" },
  closeButton: {
    marginTop: 18,
    width: "100%",
    padding: "12px 0",
    background: C.canvas,
    border: "none",
    borderRadius: 12,
    fontSize: 14,
    fontWeight: 600,
    color: C.text,
    cursor: "pointer",
    fontFamily: "inherit",
  },
};
