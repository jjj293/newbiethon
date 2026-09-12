import { useState } from 'react'
import './LifestylePreferencesPage.css'
import LifestyleSimulation from '../components/LifestyleSimulation'
import PreferencesStep from '../components/PreferencesStep'
import { getUser, updateUserProfile } from '../api'

// lifestyleAnswers: { [questionId]: { lifestyle_key, choice, score } }
// 문제당 점수는 2/4/6/8이고 항목당 문제가 2개이므로, 합산하면 noise 등 각 항목이 4~16 범위가 되어
// 백엔드(schemas.LifestyleCreate)가 요구하는 0~16 범위를 만족한다.
function aggregateLifestyleScores(lifestyleAnswers) {
  const totals = {}
  for (const answer of Object.values(lifestyleAnswers)) {
    totals[answer.lifestyle_key] = (totals[answer.lifestyle_key] || 0) + answer.score
  }
  return totals
}

// 고정 조합(예: 보증금 100 / 월세 30)을 매칭 팀 스키마의 min/max 범위로 변환한다.
// (지금은 화면에서 범위를 따로 입력받지 않고 고정 조합만 선택하므로 min == max)
function toBudgetRange(budget) {
  return {
    deposit_min: budget.deposit,
    deposit_max: budget.deposit,
    monthly_rent_min: budget.monthly_rent,
    monthly_rent_max: budget.monthly_rent,
  }
}

// gender/age/is_smoker/regions는 이 화면이 다루는 데이터가 아니라 프로필 화면 담당이다.
// PUT /users/{user_id}가 이 값들을 필수로 요구하므로, 제출 전 GET으로 기존 값을 읽어와 그대로 유지하고
// lifestyle/preferences/budgets만 이번 제출 값으로 교체한다.
function buildProfileUpdatePayload(existingUser, lifestyleAnswers, housingConditions) {
  return {
    gender: existingUser.gender,
    age: existingUser.age,
    is_smoker: existingUser.isSmoker,
    regions: existingUser.regions,
    lifestyle: aggregateLifestyleScores(lifestyleAnswers),
    preferences: {
      guest_allowed: housingConditions.guest_allowed,
      pet_allowed: housingConditions.pet_allowed,
      notes: housingConditions.notes,
    },
    budgets: housingConditions.budget.map(toBudgetRange),
  }
}

// user_id는 로그인 파트(LoginPage/auth)에서 발급된 값을 그대로 전달받아 사용한다.
// 이 페이지에서는 user_id를 생성하지 않는다.
function LifestylePreferencesPage({ user_id, onComplete }) {
  const [step, setStep] = useState('lifestyle') // 'lifestyle' | 'preferences'
  const [lifestyleAnswers, setLifestyleAnswers] = useState(null)
  const [status, setStatus] = useState('idle') // 'idle' | 'submitting' | 'success' | 'error'
  const [errorMessage, setErrorMessage] = useState('')

  function handleLifestyleComplete(answers) {
    setLifestyleAnswers(answers)
    setStep('preferences')
  }

  async function handlePreferencesComplete(housingConditions) {
    setStatus('submitting')
    try {
      const existingUser = await getUser(user_id)
      const payload = buildProfileUpdatePayload(existingUser, lifestyleAnswers, housingConditions)
      await updateUserProfile(user_id, payload)
      setStatus('success')
      onComplete?.()
    } catch (error) {
      setErrorMessage(error.message)
      setStatus('error')
    }
  }

  if (status === 'success') {
    return (
      <div className="survey-card">
        <h2>제출이 완료되었습니다.</h2>
      </div>
    )
  }

  if (status === 'error') {
    return (
      <div className="survey-card">
        <h2>제출에 실패했습니다.</h2>
        <p>{errorMessage}</p>
      </div>
    )
  }

  if (status === 'submitting') {
    return (
      <div className="survey-card">
        <h2>제출 중입니다...</h2>
      </div>
    )
  }

  return (
    <div className="survey-screen">
      {step === 'lifestyle' && <LifestyleSimulation onComplete={handleLifestyleComplete} />}
      {step === 'preferences' && <PreferencesStep onComplete={handlePreferencesComplete} />}
    </div>
  )
}

export default LifestylePreferencesPage
