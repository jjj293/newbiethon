import { useState } from 'react'
import '../App.css'
import { saveProfile } from '../api'

const REGIONS = ['안암', '보문', '종암', '제기동']

function ProfilePage({ userId, onProfileSaved }) {
  const [nickname, setNickname] = useState('')
  const [gender, setGender] = useState(null)
  const [age, setAge] = useState('')
  const [regions, setRegions] = useState([])
  const [smoking, setSmoking] = useState(null)
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
    if (smoking === null) return '흡연 여부를 선택해주세요.'
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
      const data = await saveProfile({
        user_id: userId,
        nickname: nickname.trim(),
        gender,
        age: Number(age),
        preferred_regions: regions,
        smoking,
      })
      if (data.success) {
        setMessageType('success')
        setMessage(data.message || '프로필이 저장되었습니다.')
        onProfileSaved?.(nickname.trim())
      } else {
        setMessageType('error')
        setMessage(data.message || '프로필 저장에 실패했습니다.')
      }
    } catch {
      setMessageType('error')
      setMessage('서버와 통신 중 오류가 발생했습니다.')
    }
  }

  return (
    <div className="status-screen">
      <h1>기본 프로필 입력</h1>
      <div className="login-form">
        <input
          type="text"
          placeholder="닉네임"
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
        />

        <div>
          <label>
            <input
              type="radio"
              name="gender"
              checked={gender === '남'}
              onChange={() => setGender('남')}
            />
            남
          </label>
          <label style={{ marginLeft: '12px' }}>
            <input
              type="radio"
              name="gender"
              checked={gender === '여'}
              onChange={() => setGender('여')}
            />
            여
          </label>
        </div>

        <input
          type="number"
          placeholder="나이"
          value={age}
          onChange={(e) => setAge(e.target.value)}
        />

        <div>
          {REGIONS.map((region) => (
            <label key={region} style={{ display: 'block', textAlign: 'left' }}>
              <input
                type="checkbox"
                checked={regions.includes(region)}
                onChange={() => toggleRegion(region)}
              />
              {region}
            </label>
          ))}
        </div>

        <div>
          <label>
            <input
              type="radio"
              name="smoking"
              checked={smoking === false}
              onChange={() => setSmoking(false)}
            />
            비흡연
          </label>
          <label style={{ marginLeft: '12px' }}>
            <input
              type="radio"
              name="smoking"
              checked={smoking === true}
              onChange={() => setSmoking(true)}
            />
            흡연
          </label>
        </div>

        <div className="login-actions">
          <button type="button" onClick={handleSave}>
            프로필 저장
          </button>
        </div>

        {message && <p className={`message ${messageType}`}>{message}</p>}
      </div>
    </div>
  )
}

export default ProfilePage
