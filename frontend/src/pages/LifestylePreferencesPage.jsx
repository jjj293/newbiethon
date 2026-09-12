import { useState } from 'react'
import './LifestylePreferencesPage.css'
import LifestyleSimulation from '../components/LifestyleSimulation'
import PreferencesStep from '../components/PreferencesStep'
import { submitLifestylePreferences } from '../api'

// lifestyleAnswers: { [questionId]: { lifestyle_key, choice, score } }
// housingConditions: { guest_allowed, pet_allowed, budget, notes }
// 여기서는 문제별 원본 점수만 모아 보낼 뿐, noise/cleanliness/... 최종 합산은 하지 않는다.
// 최종 합산은 이 데이터를 받는 쪽(백엔드 또는 추후 로직)에서 구현한다.
function buildSurveyPayload(user_id, lifestyleAnswers, housingConditions) {
  return {
    user_id,
    lifestyle_answers: Object.entries(lifestyleAnswers).map(([questionId, answer]) => ({
      question_id: questionId,
      lifestyle_key: answer.lifestyle_key,
      score: answer.score,
    })),
    housing_conditions: {
      guest_allowed: housingConditions.guest_allowed,
      pet_allowed: housingConditions.pet_allowed,
      budget: housingConditions.budget,
      notes: housingConditions.notes,
    },
  }
}

// user_id는 로그인 파트(LoginPage/auth)에서 발급된 값을 그대로 전달받아 사용한다.
// 이 페이지에서는 user_id를 생성하지 않는다.
function LifestylePreferencesPage({ user_id }) {
  const [step, setStep] = useState('lifestyle') // 'lifestyle' | 'preferences'
  const [lifestyleAnswers, setLifestyleAnswers] = useState(null)
  const [status, setStatus] = useState('idle') // 'idle' | 'submitting' | 'success' | 'error'
  const [errorMessage, setErrorMessage] = useState('')

  function handleLifestyleComplete(answers) {
    setLifestyleAnswers(answers)
    setStep('preferences')
  }

  async function handlePreferencesComplete(housingConditions) {
    const payload = buildSurveyPayload(user_id, lifestyleAnswers, housingConditions)
    setStatus('submitting')
    try {
      const data = await submitLifestylePreferences(payload)
      if (!data.success) {
        throw new Error(data.message || '제출에 실패했습니다.')
      }
      setStatus('success')
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
