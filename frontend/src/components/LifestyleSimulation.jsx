import { useState } from 'react'
import { lifestyleQuestions } from '../data/lifestyleQuestions'
import characterImage from '../assets/character.png'
import './LifestyleSimulation.css'

// 문제를 한 번에 하나씩 보여주고, 선택한 답의 score만 기록한다.
// 여기서는 noise/cleanliness/... 최종 합산을 하지 않는다.
function LifestyleSimulation({ nickname, onComplete }) {
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState({})
  const [selectedChoice, setSelectedChoice] = useState(null)

  const question = lifestyleQuestions[step]

  function handleSelect(choice) {
    const nextAnswers = {
      ...answers,
      [question.id]: {
        lifestyle_key: question.lifestyle_key,
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

  function handleConfirm() {
    if (!selectedChoice) return
    handleSelect(selectedChoice)
    setSelectedChoice(null)
  }

  return (
    <div className="vn-root">
      <div className="vn-character-area">
        <img className="vn-character" src={characterImage} alt="" aria-hidden="true" />
      </div>
      <div className="vn-dialog-wrap">
        <div className="vn-dialog">
          <div className="vn-nameplate">{nickname}</div>
          <div className="vn-body">
            <p className="vn-progress">
              QUESTION {String(step + 1).padStart(2, '0')} / {lifestyleQuestions.length}
            </p>
            <div className="vn-meta-row">
              <span className="vn-title">{question.title}</span>
              <span className="vn-time">{question.time}</span>
            </div>
            <p className="vn-situation">{question.situation}</p>
            <p className="vn-question">{question.question}</p>
            <div className="vn-choices">
              {question.choices.map((choice) => (
                <button
                  key={choice.label}
                  type="button"
                  className={`vn-choice ${selectedChoice?.label === choice.label ? 'is-selected' : ''}`}
                  onClick={() => setSelectedChoice(choice)}
                >
                  <span className="vn-choice-label">[{choice.label}]</span>
                  <span className="vn-choice-text">{choice.text}</span>
                </button>
              ))}
            </div>
            <div className="vn-actions">
              <button
                type="button"
                className="vn-next-button"
                aria-label="다음"
                disabled={!selectedChoice}
                onClick={handleConfirm}
              >
                &#9654;
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LifestyleSimulation
