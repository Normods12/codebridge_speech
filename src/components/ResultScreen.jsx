const ResultScreen = ({ results, onRestart }) => {
  const correctCount = results.filter((r) => r.correct).length
  const totalWords = results.length
  const score = correctCount
  const percentage = totalWords > 0 ? (score / totalWords) * 100 : 0

  const getStars = () => Math.round((score / Math.max(totalWords, 1)) * 5)

  const getMessage = () => {
    if (score === totalWords) {
      return 'Perfect score. Excellent speaking.'
    }
    if (score >= totalWords * 0.6) {
      return 'Great work. Keep practicing.'
    }
    return 'Nice effort. A little more practice will help.'
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6">
      <div className="text-center max-w-3xl w-full animate-fade-in">
        <div className="mb-8">
          <h1 className="text-5xl md:text-7xl font-bold text-kid-blue mb-4">Your Score</h1>
          <div className="text-8xl md:text-9xl font-bold text-kid-pink mb-4">
            {score}/{totalWords}
          </div>
          <div className="text-3xl font-semibold text-gray-700">{percentage.toFixed(0)}%</div>
        </div>

        <div className="mb-8">
          <div className="flex justify-center gap-2 text-6xl">
            {[...Array(5)].map((_, i) => (
              <span key={i} className={i < getStars() ? 'text-kid-yellow' : 'text-gray-300'}>
                *
              </span>
            ))}
          </div>
        </div>

        <div className="mb-8">
          <p className="text-3xl md:text-4xl font-bold text-kid-green mb-4">{getMessage()}</p>
        </div>

        <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-6 md:p-8 shadow-xl mb-8">
          <h2 className="text-2xl font-bold text-kid-blue mb-6">Response Summary</h2>
          <div className="space-y-4">
            {results.map((result, index) => (
              <div
                key={index}
                className={`flex items-center justify-between p-4 rounded-2xl ${
                  result.correct ? 'bg-green-100' : 'bg-red-100'
                }`}
              >
                <div className="flex items-center gap-4">
                  <span className="text-3xl">{result.correct ? 'Correct' : 'Miss'}</span>
                  <div>
                    <p className="text-xl font-semibold text-gray-800">
                      Word: <span className="text-kid-blue">{result.word}</span>
                    </p>
                    <p className={`text-sm ${result.correct ? 'text-green-700' : 'text-red-700'} font-medium mt-1`}>
                      Heard: "{result.spoken || 'No speech detected'}"
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <button
          onClick={onRestart}
          className="bg-gradient-to-r from-kid-blue to-kid-pink text-white text-2xl md:text-3xl font-bold py-6 px-12 rounded-full shadow-2xl hover:scale-110 transition-transform duration-300 transform"
        >
          Start Again
        </button>
      </div>
    </div>
  )
}

export default ResultScreen
