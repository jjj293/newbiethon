import { useState } from 'react'
import '../App.css'
import './ProfilePage.css'
import { updateUserProfile } from '../api'

const REGIONS = [
  { name: '안암', tone: 'main' },
  { name: '보문', tone: '2' },
  { name: '종암', tone: '3' },
  { name: '제기동', tone: '4' },
]

// 이 화면(기본 프로필)은 gender/age/is_smoker/regions만 다룬다.
// PUT /users/{user_id}는 lifestyle/preferences도 필수로 요구하므로, 아직 입력받지 않은
// 값은 자리표시자로 채워 보내고, 이후 LifestylePreferencesPage에서 실제 값으로 덮어쓴다.
function buildPlaceholderPayload({ gender, age, isSmoker, regions }) {
  return {
    gender,
    age,
    is_smoker: isSmoker,
    regions,
    lifestyle: {
      noise: 8,
      cleanliness: 8,
      sleep: 8,
      privacy: 8,
      conflict: 8,
      social: 8,
    },
    preferences: {
      guest_allowed: false,
      pet_allowed: false,
    },
    budgets: [],
  }
}

function IconPerson() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
      <circle cx="12" cy="8" r="3.6" />
      <path d="M4.5 20c0-4.2 3.4-6.4 7.5-6.4s7.5 2.2 7.5 6.4" />
    </svg>
  )
}

function IconPin() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 21s7-7.1 7-12a7 7 0 10-14 0c0 4.9 7 12 7 12z" />
      <circle cx="12" cy="9" r="2.4" />
    </svg>
  )
}

function IconNoSmoke() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="4.5" y="10.2" width="11" height="3.6" rx="1" />
      <path d="M18 12h1.5" />
      <circle cx="12" cy="12" r="9.5" />
      <path d="M5 19L19 5" />
    </svg>
  )
}

function IconSmoke() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3.5" y="10.2" width="13" height="3.6" rx="1" />
      <path d="M16.5 10.2v3.6" />
      <path d="M19 7c1-1 1-2 0-3" />
      <path d="M21.5 8.5c1.2-1 1.2-2.4 0-3.6" />
    </svg>
  )
}

function IconCheck() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12.5l4.5 4.5L19 7" />
    </svg>
  )
}

function ProfilePage({ userId }) {
  const [nickname, setNickname] = useState('')
  const [gender, setGender] = useState(null)
  const [age, setAge] = useState('')
  const [regions, setRegions] = useState([])
  const [isSmoker, setIsSmoker] = useState(null)
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState('')

  const toggleRegion = (region) => {
    setRegions((prev) =>
      prev.includes(region) ? prev.filter((r) => r !== region) : [...prev, region]
    )
  }

  const validate = () => {
    if (nickname.trim() === '') return '닉네임을 입력해주세요.'
    if (gender === null) return '성별을 선택해주세요.'
    if (age.trim() === '' || !/^[1-9]\d*$/.test(age.trim())) return '올바른 나이를 입력해주세요.'
    if (regions.length === 0) return '희망 거주 지역을 1개 이상 선택해주세요.'
    if (isSmoker === null) return '흡연 여부를 선택해주세요.'
    return null
  }

  const handleSave = async () => {
    const validationError = validate()
    if (validationError) {
      setMessageType('error')
      setMessage(validationError)
      return
    }

    try {
      const payload = buildPlaceholderPayload({ gender, age: Number(age), isSmoker, regions })
      await updateUserProfile(userId, payload)
      setMessageType('success')
      setMessage('기본 프로필이 저장되었습니다.')
    } catch (error) {
      setMessageType('error')
      setMessage(error.message || '프로필 저장에 실패했습니다.')
    }
  }

  return (
    <div className="status-screen">
      <div className="profile-card">
        <h1 className="profile-title">기본 프로필</h1>
        <p className="profile-subtitle">매칭에 필요한 기본 정보를 입력해주세요.</p>

        <input
          className="login-input"
          type="text"
          placeholder="닉네임"
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
        />

        <section className="profile-section">
          <p className="profile-section-label">성별</p>
          <div className="profile-option-grid">
            <button
              type="button"
              className={`profile-option profile-option--tone-4 ${gender === '남' ? 'selected' : ''}`}
              onClick={() => setGender('남')}
            >
              <span className="profile-option-icon"><IconPerson /></span>
              <span>남</span>
            </button>
            <button
              type="button"
              className={`profile-option profile-option--tone-2 ${gender === '여' ? 'selected' : ''}`}
              onClick={() => setGender('여')}
            >
              <span className="profile-option-icon"><IconPerson /></span>
              <span>여</span>
            </button>
          </div>
        </section>

        <input
          className="login-input"
          type="number"
          placeholder="나이"
          value={age}
          onChange={(e) => setAge(e.target.value)}
        />

        <section className="profile-section">
          <p className="profile-section-label">희망 거주 지역</p>
          <div className="profile-chip-grid">
            {REGIONS.map((region) => (
              <button
                type="button"
                key={region.name}
                className={`profile-chip profile-chip--tone-${region.tone} ${
                  regions.includes(region.name) ? 'selected' : ''
                }`}
                onClick={() => toggleRegion(region.name)}
              >
                <span className="profile-option-icon"><IconPin /></span>
                <span>{region.name}</span>
              </button>
            ))}
          </div>
        </section>

        <section className="profile-section">
          <p className="profile-section-label">흡연 여부</p>
          <div className="profile-option-grid">
            <button
              type="button"
              className={`profile-option profile-option--tone-main ${isSmoker === false ? 'selected' : ''}`}
              onClick={() => setIsSmoker(false)}
            >
              <span className="profile-option-icon"><IconNoSmoke /></span>
              <span>비흡연</span>
            </button>
            <button
              type="button"
              className={`profile-option profile-option--tone-3 ${isSmoker === true ? 'selected' : ''}`}
              onClick={() => setIsSmoker(true)}
            >
              <span className="profile-option-icon"><IconSmoke /></span>
              <span>흡연</span>
            </button>
          </div>
        </section>

        <button type="button" className="profile-save-button" onClick={handleSave}>
          <span className="profile-option-icon"><IconCheck /></span>
          기본 프로필 저장하기
        </button>

        {message && <p className={`message ${messageType}`}>{message}</p>}
      </div>
    </div>
  )
}

export default ProfilePage
