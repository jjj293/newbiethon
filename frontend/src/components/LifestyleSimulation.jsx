import { useState } from 'react'
import { lifestyleQuestions } from '../data/lifestyleQuestions'

// 문제를 한 번에 하나씩 보여주고, 선택한 답의 score만 기록한다.
// 여기서는 noise/cleanliness/... 최종 합산을 하지 않는다.
function LifestyleSimulation({ onComplete }) {
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState({})

  const question = lifestyleQuestions[step]

  function handleSelect(choice) {
    const nextAnswers = {
      ...answers,
      [question.id]: {
        lifestyleKey: question.lifestyleKey,
        choice: choice.label,
        score: choice.score,
      },
    }
    setAnswers(nextAnswers)

    if (step + 1 < lifestyleQuestions.length) {
      setStep(step + 1)
    } else {
      onComplete(nextAnswers)
    }
  }

  return (
    <div className="survey-card">
      <p className="survey-progress">
        {step + 1} / {lifestyleQuestions.length}
      </p>
      <h2>{question.title}</h2>
      <p className="survey-time">{question.time}</p>
      <p className="survey-situation">{question.situation}</p>
      <p className="survey-question">{question.question}</p>
      <div className="survey-choices">
        {question.choices.map((choice) => (
          <button
            key={choice.label}
            type="button"
            className="survey-choice"
            onClick={() => handleSelect(choice)}
          >
            <strong>{choice.label}.</strong> {choice.text}
          </button>
        ))}
      </div>
    </div>
  )
}

export default LifestyleSimulation
