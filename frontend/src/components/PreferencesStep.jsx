import { useState } from 'react'
import { preferenceQuestions, budgetOptions } from '../data/preferencesConfig'

function isSameBudget(a, b) {
  return a.deposit === b.deposit && a.monthlyRent === b.monthlyRent
}

// preferences 입력 (구글폼 스타일): 방문/반려동물 O-X, 예산 조합 다중 선택, 특이사항 주관식
function PreferencesStep({ onComplete }) {
  const [answers, setAnswers] = useState({})
  const [selectedBudgets, setSelectedBudgets] = useState([])
  const [notes, setNotes] = useState('')

  function handleAnswer(key, value) {
    setAnswers({ ...answers, [key]: value })
  }

  function toggleBudget(option) {
    const isSelected = selectedBudgets.some((selected) => isSameBudget(selected, option))
    if (isSelected) {
      setSelectedBudgets(selectedBudgets.filter((selected) => !isSameBudget(selected, option)))
    } else {
      setSelectedBudgets([...selectedBudgets, option])
    }
  }

  const isComplete = preferenceQuestions.every((q) => q.key in answers)

  function handleSubmit() {
    onComplete({
      ...answers,
      budget: selectedBudgets,
      notes,
    })
  }

  return (
    <div className="survey-card">
      <h2>추가 정보 입력</h2>

      {preferenceQuestions.map((q) => (
        <div className="form-section" key={q.key}>
          <p className="form-question">{q.question}</p>
          <div className="ox-choices">
            <button
              type="button"
              className={`ox-choice ${answers[q.key] === true ? 'selected' : ''}`}
              onClick={() => handleAnswer(q.key, true)}
            >
              O
            </button>
            <button
              type="button"
              className={`ox-choice ${answers[q.key] === false ? 'selected' : ''}`}
              onClick={() => handleAnswer(q.key, false)}
            >
              X
            </button>
          </div>
        </div>
      ))}

      <div className="form-section">
        <p className="form-question">희망하는 예산 조합을 모두 선택해주세요. (중복 선택 가능)</p>
        <div className="budget-choices">
          {budgetOptions.map((option) => {
            const isSelected = selectedBudgets.some((selected) => isSameBudget(selected, option))
            return (
              <button
                type="button"
                key={`${option.deposit}-${option.monthlyRent}`}
                className={`budget-choice ${isSelected ? 'selected' : ''}`}
                onClick={() => toggleBudget(option)}
              >
                보증금 {option.deposit}만원 / 월세 {option.monthlyRent}만원
              </button>
            )
          })}
        </div>
      </div>

      <div className="form-section">
        <p className="form-question">룸메이트에게 미리 알려주고 싶은 특이사항이 있나요?</p>
        <textarea
          className="notes-input"
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
          placeholder="예: 고양이 알레르기가 있어요."
        />
      </div>

      <button
        type="button"
        className="submit-button"
        disabled={!isComplete}
        onClick={handleSubmit}
      >
        제출하기
      </button>
    </div>
  )
}

export default PreferencesStep
