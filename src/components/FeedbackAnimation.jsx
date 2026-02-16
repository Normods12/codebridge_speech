import { useEffect, useState } from 'react'

const FeedbackAnimation = ({ isCorrect, spokenText }) => {
  const [showFeedback, setShowFeedback] = useState(false)

  useEffect(() => {
    if (isCorrect !== null) {
      setShowFeedback(true)
    }
  }, [isCorrect])

  if (isCorrect === null) return null

  return (
    <div className="mt-8 animate-fade-in">
      {isCorrect ? (
        <div className="text-center">
          <div className="text-8xl mb-4 animate-bounce-custom">✔️</div>
          <div className="flex justify-center gap-4 text-6xl mb-4">
            <span className="animate-bounce" style={{ animationDelay: '0s' }}>😄</span>
            <span className="animate-bounce" style={{ animationDelay: '0.2s' }}>🎉</span>
            <span className="animate-bounce" style={{ animationDelay: '0.4s' }}>⭐</span>
          </div>
          <p className="text-2xl font-bold text-kid-green">Great Job!</p>
          <p className="text-lg text-green-700 font-medium mt-2">
            You said: "{spokenText || 'No speech detected'}"
          </p>
        </div>
      ) : (
        <div className="text-center">
          <div className="text-8xl mb-4 animate-shake">❌</div>
          <div className="flex justify-center gap-4 text-6xl mb-4">
            <span className="animate-nod-no">😕</span>
            <span className="animate-nod-no" style={{ animationDelay: '0.1s' }}>🙅‍♂️</span>
            <span className="animate-nod-no" style={{ animationDelay: '0.2s' }}>👎</span>
          </div>
          <p className="text-2xl font-bold text-red-500">Try Again!</p>
          <p className="text-lg text-red-700 font-medium mt-2">
            You said: "{spokenText || 'No speech detected'}"
          </p>
        </div>
      )}
    </div>
  )
}

export default FeedbackAnimation
