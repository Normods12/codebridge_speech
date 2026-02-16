import { useState } from 'react'
import HomeScreen from './components/HomeScreen'
import TestScreen from './components/TestScreen'
import ResultScreen from './components/ResultScreen'

function App() {
  const [currentScreen, setCurrentScreen] = useState('home') // 'home', 'test', 'result'
  const [testResults, setTestResults] = useState([])

  const handleStartTest = () => {
    setTestResults([])
    setCurrentScreen('test')
  }

  const handleTestComplete = (results) => {
    setTestResults(results)
    setCurrentScreen('result')
  }

  const handleRestart = () => {
    setTestResults([])
    setCurrentScreen('home')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-yellow-50 to-pink-100 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-32 h-32 bg-yellow-200 rounded-full opacity-30 animate-pulse"></div>
        <div className="absolute top-40 right-20 w-24 h-24 bg-pink-200 rounded-full opacity-30 animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute bottom-20 left-1/4 w-40 h-40 bg-blue-200 rounded-full opacity-30 animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute bottom-40 right-1/3 w-28 h-28 bg-green-200 rounded-full opacity-30 animate-pulse" style={{ animationDelay: '0.5s' }}></div>
      </div>

      <div className="relative z-10">
        {currentScreen === 'home' && <HomeScreen onStart={handleStartTest} />}
        {currentScreen === 'test' && <TestScreen onComplete={handleTestComplete} />}
        {currentScreen === 'result' && <ResultScreen results={testResults} onRestart={handleRestart} />}
      </div>
    </div>
  )
}

export default App
