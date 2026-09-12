import { useState } from 'react'
import './App.css'
import LifestyleSimulation from './components/LifestyleSimulation'
import PreferencesStep from './components/PreferencesStep'
import { submitSurvey } from './api/submitSurvey'

// lifestyleAnswers: { [questionId]: { lifestyleKey, choice, score } }
// preferences: { guestAllowed, petAllowed, budget, notes }
// 여기서는 문제별 원본 점수만 모아 보낼 뿐, noise/cleanliness/... 최종 합산은 하지 않는다.
// 최종 합산은 이 데이터를 받는 쪽(백엔드 또는 추후 로직)에서 구현한다.
function buildSurveyPayload(userId, lifestyleAnswers, preferences) {
  return {
    userId,
    lifestyleAnswers: Object.entries(lifestyleAnswers).map(([questionId, answer]) => ({
      questionId,
      lifestyleKey: answer.lifestyleKey,
      choice: answer.choice,
      score: answer.score,
    })),
    preferences: {
      guestAllowed: preferences.guestAllowed,
      petAllowed: preferences.petAllowed,
      budget: preferences.budget,
      notes: preferences.notes,
    },
  }
}

// TODO: userId는 로그인 파트에서 실제 로그인한 사용자 id를 전달해줘야 함.
// 이 화면에서는 userId를 생성하지 않고, 전달받은 값을 그대로 사용한다.
function App({ userId = '' }) {
  const [step, setStep] = useState('lifestyle') // 'lifestyle' | 'preferences'
  const [lifestyleAnswers, setLifestyleAnswers] = useState(null)
  const [status, setStatus] = useState('idle') // 'idle' | 'submitting' | 'success' | 'error'
  const [errorMessage, setErrorMessage] = useState('')

  function handleLifestyleComplete(answers) {
    setLifestyleAnswers(answers)
    setStep('preferences')
  }

  async function handlePreferencesComplete(preferences) {
    const payload = buildSurveyPayload(userId, lifestyleAnswers, preferences)
    setStatus('submitting')
    try {
      await submitSurvey(payload)
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

export default App
