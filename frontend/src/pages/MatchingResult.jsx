import { useState } from "react";

/* ============================================================
   ⚠️ DUMMY DATA — 화면 개발용 임시 데이터입니다.
   C의 실제 궁합 계산 알고리즘 결과가 아니며, 아래 구조는
   팀 공식 API 규격이 아닙니다 (아직 미확정).

   [C와 협의 필요한 사항]
   - Endpoint / Method (예상: GET 계열, 미확정)
   - Request: user_id 기준으로 조회한다고 가정 (미확정)
   - Response 필드명 전체 (score, goodPoints, badPoints,
     region, lifestyle, preferences 등 전부 임시 이름)
   - "잘 맞는 정도" / "보완되는 정도" 두 점수의 정확한 필드명과
     계산 기준 (규칙 12: C와 팀에서 별도 합의)

   실제 연동 시 user_id를 기준으로 사용자를 식별해야 하며
   (규칙 3), JSON 필드명은 최종적으로 snake_case로 맞춰야 합니다.
============================================================ */
const dummyMatches = {
  compatible: [
    {
      user_id: "u1",
      nickname: "고요한숲",
      age: 21,
      gender: "여",
      score: 92,
      goodPoints: ["소음 민감도가 비슷해요", "청결 기준이 잘 맞아요", "생활 패턴 시간대가 같아요"],
      badPoints: ["교류 선호도에 약간 차이가 있어요"],
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
      score: 88,
      goodPoints: ["청결 기준이 잘 맞아요", "흡연/반려동물 기준이 같아요"],
      badPoints: ["수면 패턴이 달라요", "손님 방문 빈도 차이가 있어요"],
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
      score: 84,
      goodPoints: ["예산 범위가 겹쳐요", "흡연 기준이 같아요"],
      badPoints: ["청결 기준에 약간 차이가 있어요"],
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
      score: 79,
      goodPoints: ["흡연/반려동물 기준(딜브레이커)이 같아요", "예산이 겹쳐요"],
      badPoints: ["수면 패턴이 달라요", "손님 방문 선호도가 달라요"],
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
      score: 76,
      goodPoints: ["생활 시간대가 같아요", "흡연 기준이 같아요"],
      badPoints: ["청결 기준 차이가 커요", "예산대가 달라요"],
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
      score: 73,
      goodPoints: ["흡연 기준이 같아요", "손님 방문 빈도가 비슷해요"],
      badPoints: ["수면 패턴이 달라요", "청결 기준에 차이가 있어요"],
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

export default function MatchingResult({ onBack }) {
  const [selectedIds, setSelectedIds] = useState([]);
  const [detailPerson, setDetailPerson] = useState(null);
  const [showLimitWarning, setShowLimitWarning] = useState(false);
  // 각 후보별 진행 상태: null | "requested" | "accepted" | "declined"
  const [requestStatus, setRequestStatus] = useState({});

  function toggleSelect(id) {
    setSelectedIds((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= MAX_SELECT) {
        setShowLimitWarning(true);
        setTimeout(() => setShowLimitWarning(false), 2000);
        return prev; // 2명 초과 선택 방지
      }
      return [...prev, id];
    });
  }

  function sendRequest(id) {
    // ⚠️ 임시 데이터 구조 — 실제 연동 시 A/C와 협의 후 최종 endpoint,
    // request body(user_id, target_user_id 등 필드명 포함) 확정 필요.
    // 아직 팀 공식 API 규격 아님.
    setRequestStatus((prev) => ({ ...prev, [id]: "requested" }));

    // 데모용: 2초 뒤 상대가 랜덤하게 수락/거절하는 것처럼 시뮬레이션
    setTimeout(() => {
      const accepted = Math.random() > 0.4;
      setRequestStatus((prev) => ({
        ...prev,
        [id]: accepted ? "accepted" : "declined",
      }));
    }, 2000);
  }

  return (
    <div style={styles.page}>
      {showLimitWarning && (
        <div style={styles.limitToast}>이미 {MAX_SELECT}명을 선택했어요</div>
      )}

      <header style={styles.header}>
        {onBack && (
          <button type="button" style={styles.backButton} onClick={onBack}>
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#2B2620"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M15 5l-7 7 7 7" />
            </svg>
          </button>
        )}
        <h1 style={styles.title}>당신과 맞는 룸메이트</h1>
        <p style={styles.subtitle}>
          최대 {MAX_SELECT}명까지 선택할 수 있어요 · 현재 {selectedIds.length}/{MAX_SELECT}명 선택
        </p>
      </header>

      <Section
        label="궁합형"
        description="생활 패턴이 비슷한 사람들이에요"
        people={dummyMatches.compatible}
        selectedIds={selectedIds}
        requestStatus={requestStatus}
        onCardClick={setDetailPerson}
        onToggleSelect={toggleSelect}
      />

      <Section
        label="보완형"
        description="다르지만 서로를 보완해줄 수 있는 사람들이에요"
        people={dummyMatches.complementary}
        selectedIds={selectedIds}
        requestStatus={requestStatus}
        onCardClick={setDetailPerson}
        onToggleSelect={toggleSelect}
      />

      {selectedIds.length > 0 && (
        <div style={styles.floatingBar}>
          <span style={styles.floatingText}>{selectedIds.length}명 선택됨</span>
          <button
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
  people,
  selectedIds,
  requestStatus,
  onCardClick,
  onToggleSelect,
}) {
  return (
    <section style={styles.section}>
      <div style={styles.sectionHeader}>
        <h2 style={styles.sectionLabel}>{label}</h2>
        <p style={styles.sectionDesc}>{description}</p>
      </div>
      <div style={styles.cardGrid}>
        {people.map((person) => (
          <MatchCard
            key={person.user_id}
            person={person}
            selected={selectedIds.includes(person.user_id)}
            status={requestStatus[person.user_id]}
            onClick={() => onCardClick(person)}
            onToggleSelect={(e) => {
              e.stopPropagation();
              onToggleSelect(person.user_id);
            }}
          />
        ))}
      </div>
    </section>
  );
}

function MatchCard({ person, selected, status, onClick, onToggleSelect }) {
  return (
    <div
      style={{
        ...styles.card,
        ...(selected ? styles.cardSelected : {}),
      }}
      onClick={onClick}
    >
      <div style={styles.cardTop}>
        <div>
          <p style={styles.nickname}>{person.nickname}</p>
          <p style={styles.metaLine}>
            {person.age}세 · {person.gender}
          </p>
        </div>
        <div style={styles.scoreBadge}>
          <span style={styles.scoreNumber}>{person.score}</span>
          <span style={styles.scorePercent}>%</span>
        </div>
      </div>

      <p style={styles.summary}>{person.goodPoints[0]}</p>

      <div style={styles.cardBottom}>
        <button style={styles.detailButton} onClick={onClick}>
          리포트 보기
        </button>
        {status === "requested" && <span style={styles.statusPending}>요청 전송됨</span>}
        {status === "accepted" && <span style={styles.statusAccepted}>수락됨 ✓</span>}
        {status === "declined" && <span style={styles.statusDeclined}>거절됨</span>}
        {!status && (
          <button style={styles.selectButton} onClick={onToggleSelect}>
            {selected ? "선택 취소" : "선택하기"}
          </button>
        )}
      </div>

      {status === "accepted" && <ContactReveal nickname={person.nickname} />}
    </div>
  );
}

function ContactReveal({ nickname }) {
  return (
    <div style={styles.contactBox}>
      <p style={styles.contactLabel}>연락처 공개됨</p>
      <p style={styles.contactValue}>{nickname}님과 채팅으로 이야기해보세요 →</p>
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
  const LIFESTYLE_MAX = 20;

  return (
    <div style={styles.modalOverlay} onClick={onClose}>
      <div style={styles.modalBox} onClick={(e) => e.stopPropagation()}>
        <div style={styles.modalHeader}>
          <div>
            <p style={styles.modalNickname}>{person.nickname}</p>
            <p style={styles.metaLine}>
              {person.age}세 · {person.gender}
            </p>
          </div>
          <div style={styles.scoreBadgeLarge}>
            <span style={styles.scoreNumber}>{person.score}</span>
            <span style={styles.scorePercent}>%</span>
          </div>
        </div>

        <div style={styles.pointBlock}>
          <p style={styles.pointGoodTitle}>잘 맞을 것 같은 점</p>
          <ul style={styles.pointList}>
            {person.goodPoints.map((p) => (
              <li key={p} style={styles.pointGoodItem}>
                {p}
              </li>
            ))}
          </ul>

          <p style={styles.pointBadTitle}>안 맞을 것 같은 점</p>
          <ul style={styles.pointList}>
            {person.badPoints.map((p) => (
              <li key={p} style={styles.pointBadItem}>
                {p}
              </li>
            ))}
          </ul>
        </div>

        <div style={styles.infoSection}>
          <p style={styles.infoSectionTitle}>희망 지역</p>
          <div style={styles.tagRow}>
            {person.region.map((r) => (
              <span key={r} style={styles.tag}>
                {r}
              </span>
            ))}
          </div>
        </div>

        <div style={styles.infoSection}>
          <p style={styles.infoSectionTitle}>예산 범위</p>
          <div style={styles.tagRow}>
            {preferences.budget.map((b, i) => (
              <span key={i} style={styles.tag}>
                보증금 {b.deposit}만 · 월세 {b.monthlyRent}만
              </span>
            ))}
          </div>
        </div>

        <div style={styles.infoSection}>
          <p style={styles.infoSectionTitle}>기타 사항</p>
          <div style={styles.oxRow}>
            {prefRows.map(([label, allowed]) => (
              <div key={label} style={styles.oxItem}>
                <span
                  style={{
                    ...styles.oxIcon,
                    color: allowed ? "#3E7C59" : "#C0533E",
                  }}
                >
                  {allowed ? "O" : "X"}
                </span>
                <span style={styles.oxLabel}>{label}</span>
              </div>
            ))}
          </div>
        </div>

        <div style={styles.infoSection}>
          <p style={styles.infoSectionTitle}>성향</p>
          <div style={styles.lifestyleList}>
            {lifestyleRows.map(([label, value]) => (
              <div key={label} style={styles.lifestyleRow}>
                <span style={styles.lifestyleLabel}>{label}</span>
                <div style={styles.lifestyleBarTrack}>
                  <div
                    style={{
                      ...styles.lifestyleBarFill,
                      width: `${(value / LIFESTYLE_MAX) * 100}%`,
                    }}
                  />
                </div>
                <span style={styles.lifestyleValue}>{value}</span>
              </div>
            ))}
          </div>
        </div>

        <button style={styles.closeButton} onClick={onClose}>
          닫기
        </button>
      </div>
    </div>
  );
}

/* ============================================================
   스타일 (인라인 객체 — Tailwind 등 추가 설정 없이 바로 동작)
============================================================ */
const styles = {
  limitToast: {
    position: "fixed",
    top: 20,
    left: "50%",
    transform: "translateX(-50%)",
    background: "#C0392B",
    color: "#FFFFFF",
    fontSize: 13.5,
    fontWeight: 700,
    padding: "10px 18px",
    borderRadius: 999,
    boxShadow: "0 8px 20px rgba(192,57,43,0.35)",
    zIndex: 100,
  },
  page: {
    fontFamily: "'Pretendard', 'Apple SD Gothic Neo', sans-serif",
    background: "#FAF7F2",
    minHeight: "100vh",
    padding: "32px 20px 100px",
    maxWidth: 480,
    margin: "0 auto",
  },
  header: { marginBottom: 28 },
  backButton: {
    background: "none",
    border: "none",
    padding: 0,
    marginBottom: 10,
    display: "flex",
    alignItems: "center",
    cursor: "pointer",
  },
  title: { fontSize: 24, fontWeight: 700, color: "#2B2620", margin: 0 },
  subtitle: { fontSize: 13, color: "#8C8375", marginTop: 6 },
  section: { marginBottom: 32 },
  sectionHeader: { marginBottom: 12 },
  sectionLabel: { fontSize: 17, fontWeight: 700, color: "#4A3F35", margin: 0 },
  sectionDesc: { fontSize: 12.5, color: "#9C927F", marginTop: 2 },
  cardGrid: { display: "flex", flexDirection: "column", gap: 12 },
  card: {
    background: "#FFFFFF",
    border: "1px solid #EEE7DA",
    borderRadius: 14,
    padding: "16px 18px",
    cursor: "pointer",
    transition: "border-color 0.15s",
  },
  cardSelected: { border: "1.5px solid #C0533E" },
  cardTop: { display: "flex", justifyContent: "space-between", alignItems: "flex-start" },
  nickname: { fontSize: 15.5, fontWeight: 700, color: "#2B2620", margin: 0 },
  metaLine: { fontSize: 12, color: "#9C927F", marginTop: 2 },
  scoreBadge: {
    display: "flex",
    alignItems: "baseline",
    gap: 1,
    color: "#C0533E",
    background: "#FBEDE7",
    borderRadius: 999,
    padding: "4px 12px",
    height: "fit-content",
  },
  scoreBadgeLarge: {
    display: "flex",
    alignItems: "baseline",
    gap: 1,
    color: "#C0533E",
    background: "#FBEDE7",
    borderRadius: 999,
    padding: "6px 16px",
    height: "fit-content",
  },
  scoreNumber: { fontSize: 18, fontWeight: 800 },
  scorePercent: { fontSize: 12, fontWeight: 700 },
  summary: { fontSize: 13.5, color: "#5C5347", margin: "10px 0" },
  cardBottom: { display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" },
  detailButton: {
    fontSize: 12.5,
    color: "#8C8375",
    background: "none",
    border: "1px solid #E4DCCC",
    borderRadius: 8,
    padding: "6px 10px",
    cursor: "pointer",
  },
  selectButton: {
    fontSize: 12.5,
    fontWeight: 600,
    color: "#FFFFFF",
    background: "#C0533E",
    border: "none",
    borderRadius: 8,
    padding: "6px 12px",
    cursor: "pointer",
    marginLeft: "auto",
  },
  statusPending: { fontSize: 12.5, color: "#B08A3E", marginLeft: "auto" },
  statusAccepted: { fontSize: 12.5, color: "#3E7C59", fontWeight: 700, marginLeft: "auto" },
  statusDeclined: { fontSize: 12.5, color: "#9C927F", marginLeft: "auto" },
  contactBox: {
    marginTop: 10,
    padding: "10px 12px",
    background: "#F1F6F2",
    borderRadius: 10,
  },
  contactLabel: { fontSize: 11, color: "#3E7C59", fontWeight: 700, margin: 0 },
  contactValue: { fontSize: 13, color: "#2B2620", marginTop: 4 },
  floatingBar: {
    position: "fixed",
    bottom: 20,
    left: "50%",
    transform: "translateX(-50%)",
    width: "calc(100% - 40px)",
    maxWidth: 440,
    background: "#2B2620",
    borderRadius: 14,
    padding: "14px 18px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    boxShadow: "0 8px 24px rgba(0,0,0,0.18)",
  },
  floatingText: { color: "#FAF7F2", fontSize: 14, fontWeight: 600 },
  primaryButton: {
    background: "#C0533E",
    color: "#FFFFFF",
    border: "none",
    borderRadius: 10,
    padding: "10px 16px",
    fontSize: 13.5,
    fontWeight: 700,
    cursor: "pointer",
  },
  modalOverlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(43,38,32,0.45)",
    display: "flex",
    alignItems: "flex-end",
    justifyContent: "center",
    zIndex: 50,
  },
  modalBox: {
    background: "#FFFFFF",
    width: "100%",
    maxWidth: 480,
    borderRadius: "20px 20px 0 0",
    padding: "24px 20px 28px",
  },
  modalHeader: { display: "flex", justifyContent: "space-between", alignItems: "flex-start" },
  modalNickname: { fontSize: 18, fontWeight: 700, color: "#2B2620", margin: 0 },
  pointBlock: {
    marginTop: 16,
    padding: "14px 16px",
    background: "#FAF7F2",
    borderRadius: 12,
  },
  pointGoodTitle: { fontSize: 12.5, fontWeight: 700, color: "#3E7C59", margin: 0 },
  pointBadTitle: { fontSize: 12.5, fontWeight: 700, color: "#C0533E", margin: "12px 0 0" },
  pointList: { margin: "6px 0 0", paddingLeft: 18 },
  pointGoodItem: { fontSize: 13, color: "#2B2620", marginBottom: 3 },
  pointBadItem: { fontSize: 13, color: "#2B2620", marginBottom: 3 },
  infoSection: { marginTop: 16 },
  infoSectionTitle: { fontSize: 12, fontWeight: 700, color: "#9C927F", margin: "0 0 8px" },
  tagRow: { display: "flex", flexWrap: "wrap", gap: 6 },
  tag: {
    fontSize: 12,
    color: "#5C5347",
    background: "#F3EEE3",
    borderRadius: 8,
    padding: "5px 10px",
  },
  oxRow: { display: "flex", gap: 18 },
  oxItem: { display: "flex", alignItems: "center", gap: 6 },
  oxIcon: { fontSize: 14, fontWeight: 800 },
  oxLabel: { fontSize: 12.5, color: "#5C5347" },
  lifestyleList: { display: "flex", flexDirection: "column", gap: 8 },
  lifestyleRow: { display: "grid", gridTemplateColumns: "84px 1fr 20px", alignItems: "center", gap: 8 },
  lifestyleLabel: { fontSize: 12, color: "#5C5347" },
  lifestyleBarTrack: {
    height: 6,
    borderRadius: 999,
    background: "#F3EEE3",
    overflow: "hidden",
  },
  lifestyleBarFill: {
    height: "100%",
    borderRadius: 999,
    background: "#C0533E",
  },
  lifestyleValue: { fontSize: 11.5, color: "#9C927F", textAlign: "right" },
  closeButton: {
    marginTop: 18,
    width: "100%",
    padding: "12px 0",
    background: "#F3EEE3",
    border: "none",
    borderRadius: 10,
    fontSize: 14,
    fontWeight: 600,
    color: "#4A3F35",
    cursor: "pointer",
  },
};
