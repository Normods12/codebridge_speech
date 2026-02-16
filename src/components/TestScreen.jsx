import { useState, useEffect, useRef } from 'react'
import Timer from './Timer'
import FeedbackAnimation from './FeedbackAnimation'

const WORDS = ['Apple', 'Ball', 'Cat', 'Dog', 'Sun']
const TIME_PER_WORD = 15

// Calculate Levenshtein distance for fuzzy matching
const levenshteinDistance = (str1, str2) => {
  const matrix = []
  for (let i = 0; i <= str2.length; i++) {
    matrix[i] = [i]
  }
  for (let j = 0; j <= str1.length; j++) {
    matrix[0][j] = j
  }
  for (let i = 1; i <= str2.length; i++) {
    for (let j = 1; j <= str1.length; j++) {
      if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1]
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        )
      }
    }
  }
  return matrix[str2.length][str1.length]
}

// Calculate similarity percentage (0-100)
const calculateSimilarity = (str1, str2) => {
  const maxLen = Math.max(str1.length, str2.length)
  if (maxLen === 0) return 100
  const distance = levenshteinDistance(str1, str2)
  return ((maxLen - distance) / maxLen) * 100
}

const normalizeForComparison = (text) =>
  text
    .toLowerCase()
    .replace(/[^a-z\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

const collapseRepeatedWords = (text) => {
  const words = normalizeForComparison(text).split(' ').filter(Boolean)
  if (words.length === 0) return ''
  const collapsed = [words[0]]
  for (let i = 1; i < words.length; i++) {
    if (words[i] !== words[i - 1]) {
      collapsed.push(words[i])
    }
  }
  return collapsed.join(' ')
}

// Check phonetic similarity for common mispronunciations
const isPhoneticallySimilar = (spoken, target) => {
  const phoneticPairs = [
    ['b', 'p'], ['p', 'b'],
    ['d', 't'], ['t', 'd'],
    ['g', 'k'], ['k', 'g'],
    ['f', 'v'], ['v', 'f'],
    ['s', 'z'], ['z', 's'],
    ['m', 'n'], ['n', 'm'],
    ['l', 'r'], ['r', 'l'],
  ]

  if (spoken.length === target.length) {
    let differences = 0
    for (let i = 0; i < spoken.length; i++) {
      if (spoken[i] !== target[i]) {
        const isPhoneticPair = phoneticPairs.some(
          ([a, b]) =>
            (spoken[i] === a && target[i] === b) ||
            (spoken[i] === b && target[i] === a)
        )
        if (!isPhoneticPair) {
          differences++
        }
      }
    }
    return differences <= Math.min(2, Math.floor(target.length / 2))
  }
  return false
}

// Accept common short-word vowel substitutions from speech engines (sun->son, bed->bad)
const isSingleVowelVariation = (spoken, target) => {
  const vowels = new Set(['a', 'e', 'i', 'o', 'u'])

  if (spoken.length !== target.length || spoken.length < 3 || spoken.length > 5) {
    return false
  }

  let vowelDiffs = 0
  let consonantDiffs = 0

  for (let i = 0; i < spoken.length; i++) {
    if (spoken[i] === target[i]) continue

    const spokenIsVowel = vowels.has(spoken[i])
    const targetIsVowel = vowels.has(target[i])
    if (spokenIsVowel && targetIsVowel) {
      vowelDiffs++
    } else {
      consonantDiffs++
    }
  }

  return consonantDiffs === 0 && vowelDiffs === 1
}

const isMatchCandidate = (spoken, target) => {
  const cleanSpoken = normalizeForComparison(spoken)
  const cleanWord = normalizeForComparison(target)

  if (!cleanSpoken || !cleanWord) {
    return false
  }

  if (cleanSpoken === cleanWord) {
    return true
  }

  if (cleanSpoken.includes(cleanWord) || cleanWord.includes(cleanSpoken)) {
    return true
  }

  const spokenWords = cleanSpoken.split(' ').filter(w => w.length > 0)
  const targetWords = cleanWord.split(' ').filter(w => w.length > 0)

  for (const spokenWord of spokenWords) {
    for (const targetWord of targetWords) {
      if (spokenWord === targetWord) {
        return true
      }
      if (spokenWord.startsWith(targetWord) || targetWord.startsWith(spokenWord)) {
        const diff = Math.abs(spokenWord.length - targetWord.length)
        if (diff <= 2) {
          return true
        }
      }
      if (isPhoneticallySimilar(spokenWord, targetWord)) {
        return true
      }
      if (isSingleVowelVariation(spokenWord, targetWord)) {
        return true
      }
      const similarity = calculateSimilarity(spokenWord, targetWord)
      if (similarity >= 80) {
        return true
      }
    }
  }

  return false
}

const TestScreen = ({ onComplete }) => {
  const showDebug =
    (typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('debug') === '1') ||
    import.meta.env.VITE_SHOW_SPEECH_DEBUG === 'true'
  const [currentWordIndex, setCurrentWordIndex] = useState(0)
  const [isListening, setIsListening] = useState(false)
  const [feedback, setFeedback] = useState(null)
  const [spokenText, setSpokenText] = useState('')
  const [results, setResults] = useState([])
  const [hasStarted, setHasStarted] = useState(false)
  const [hasAnsweredCurrentWord, setHasAnsweredCurrentWord] = useState(false)
  const [debugInfo, setDebugInfo] = useState({
    status: 'idle',
    error: '',
    alternatives: [],
    rawTranscript: '',
    selectedTranscript: '',
  })
  const [debugLog, setDebugLog] = useState([])

  const recognitionRef = useRef(null)
  const timeoutRef = useRef(null)
  const listenTimeoutRef = useRef(null)
  const restartListenTimeoutRef = useRef(null)
  const currentWordIndexRef = useRef(0)
  const resultsRef = useRef([])
  const feedbackRef = useRef(null)
  const isListeningRef = useRef(false)
  const hasStartedRef = useRef(false)
  const hasAnsweredRef = useRef(false)

  const appendDebugLog = (message) => {
    if (!showDebug) return
    const stamp = new Date().toLocaleTimeString()
    setDebugLog((prev) => [`${stamp} - ${message}`, ...prev].slice(0, 12))
  }

  useEffect(() => {
    currentWordIndexRef.current = currentWordIndex
  }, [currentWordIndex])

  useEffect(() => {
    resultsRef.current = results
  }, [results])

  useEffect(() => {
    feedbackRef.current = feedback
  }, [feedback])

  useEffect(() => {
    isListeningRef.current = isListening
  }, [isListening])

  useEffect(() => {
    hasStartedRef.current = hasStarted
  }, [hasStarted])

  useEffect(() => {
    hasAnsweredRef.current = hasAnsweredCurrentWord
  }, [hasAnsweredCurrentWord])

  useEffect(() => {
    setHasAnsweredCurrentWord(false)
    hasAnsweredRef.current = false
  }, [currentWordIndex])

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition

    if (!SpeechRecognition) {
      alert('Speech recognition is not supported in this browser. Please use Chrome or Edge.')
      return
    }

    const recognition = new SpeechRecognition()
    recognition.continuous = false
    recognition.interimResults = false
    recognition.maxAlternatives = 5
    recognition.lang = 'en-US'

    recognition.onstart = () => {
      setIsListening(true)
      setDebugInfo((prev) => ({ ...prev, status: 'listening', error: '' }))
      appendDebugLog(`Listening for "${WORDS[currentWordIndexRef.current]}"`)
    }

    recognition.onresult = (event) => {
      const wordIndex = currentWordIndexRef.current
      const currentWord = WORDS[wordIndex].toLowerCase()
      const alternatives = Array.from(event.results[0] || [])
        .map(result => ({
          transcript: result.transcript?.trim() || '',
          confidence: Number.isFinite(result.confidence) ? Math.round(result.confidence * 100) : null,
        }))
        .filter(item => item.transcript.length > 0)

      const transcripts = alternatives.map(item => item.transcript)
      const matchedAlternative = transcripts.find((alt) => isMatchCandidate(alt, currentWord))
      const transcript = (matchedAlternative || transcripts[0] || '').toLowerCase()

      setDebugInfo((prev) => ({
        ...prev,
        status: 'result',
        error: '',
        alternatives,
        rawTranscript: transcripts[0] || '',
        selectedTranscript: transcript,
      }))
      appendDebugLog(`Heard: ${transcripts.join(' | ') || '(empty)'}`)

      setSpokenText(transcript)
      checkAnswer(transcript)
    }

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error)
      setIsListening(false)
      setDebugInfo((prev) => ({ ...prev, status: 'error', error: event.error || 'unknown error' }))
      appendDebugLog(`Error: ${event.error || 'unknown error'}`)
    }

    recognition.onend = () => {
      setIsListening(false)
      isListeningRef.current = false
      setDebugInfo((prev) => ({
        ...prev,
        status: hasAnsweredRef.current ? 'answered' : 'idle',
      }))

      if (listenTimeoutRef.current) {
        clearTimeout(listenTimeoutRef.current)
        listenTimeoutRef.current = null
      }
    }

    recognitionRef.current = recognition

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop()
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
      if (listenTimeoutRef.current) {
        clearTimeout(listenTimeoutRef.current)
      }
      if (restartListenTimeoutRef.current) {
        clearTimeout(restartListenTimeoutRef.current)
      }
    }
  }, [])

  const startListening = () => {
    if (hasAnsweredRef.current || feedbackRef.current !== null || !hasStartedRef.current) {
      return
    }

    if (recognitionRef.current && !isListeningRef.current) {
      try {
        recognitionRef.current.start()
        if (listenTimeoutRef.current) {
          clearTimeout(listenTimeoutRef.current)
        }
        listenTimeoutRef.current = setTimeout(() => {
          if (recognitionRef.current && isListeningRef.current) {
            recognitionRef.current.stop()
          }
        }, 4000)
      } catch (error) {
        console.log('Recognition already active')
      }
    }
  }

  const checkAnswer = (spoken) => {
    if (hasAnsweredRef.current) {
      return
    }

    const wordIndex = currentWordIndexRef.current
    const currentWord = WORDS[wordIndex].toLowerCase()
    const isCorrect = isMatchCandidate(spoken, currentWord)
    const cleanedSpokenForResult = collapseRepeatedWords(spoken)

    if (recognitionRef.current && isListeningRef.current) {
      recognitionRef.current.stop()
    }

    setHasAnsweredCurrentWord(true)
    hasAnsweredRef.current = true
    setFeedback(isCorrect)

    setResults(prevResults => {
      const newResults = [...prevResults, { word: WORDS[wordIndex], correct: isCorrect, spoken: cleanedSpokenForResult || 'No speech detected' }]
      resultsRef.current = newResults
      return newResults
    })

    playSound(isCorrect)

    timeoutRef.current = setTimeout(() => {
      const currentIdx = currentWordIndexRef.current
      const currentResults = resultsRef.current

      if (currentIdx < WORDS.length - 1) {
        setCurrentWordIndex(currentIdx + 1)
        setFeedback(null)
        setSpokenText('')
        setHasAnsweredCurrentWord(false)
        hasAnsweredRef.current = false
        setDebugInfo((prev) => ({
          ...prev,
          status: 'idle',
          error: '',
          alternatives: [],
          rawTranscript: '',
          selectedTranscript: '',
        }))
      } else {
        setTimeout(() => {
          onComplete(currentResults)
        }, 2000)
      }
    }, 2000)
  }

  const handleTimeout = () => {
    if (hasAnsweredRef.current) {
      return
    }

    const wordIndex = currentWordIndexRef.current

    if (recognitionRef.current && isListeningRef.current) {
      recognitionRef.current.stop()
    }

    setHasAnsweredCurrentWord(true)
    hasAnsweredRef.current = true
    setFeedback(false)
    setSpokenText('')

    setResults(prevResults => {
      const newResults = [...prevResults, { word: WORDS[wordIndex], correct: false, spoken: 'No speech detected' }]
      resultsRef.current = newResults

      if (wordIndex < WORDS.length - 1) {
        setTimeout(() => {
          setCurrentWordIndex(wordIndex + 1)
          setFeedback(null)
          setHasAnsweredCurrentWord(false)
          hasAnsweredRef.current = false
          setDebugInfo((prev) => ({
            ...prev,
            status: 'idle',
            error: '',
            alternatives: [],
            rawTranscript: '',
            selectedTranscript: '',
          }))
        }, 2000)
      } else {
        setTimeout(() => {
          onComplete(newResults)
        }, 2000)
      }

      return newResults
    })
  }

  const handleStartTest = () => {
    if (hasStarted) return
    setHasStarted(true)
    appendDebugLog('Session started')
  }

  useEffect(() => {
    if (!hasStarted || hasAnsweredRef.current || feedbackRef.current !== null || isListeningRef.current) {
      return
    }

    if (restartListenTimeoutRef.current) {
      clearTimeout(restartListenTimeoutRef.current)
    }

    restartListenTimeoutRef.current = setTimeout(() => {
      startListening()
    }, 250)

    return () => {
      if (restartListenTimeoutRef.current) {
        clearTimeout(restartListenTimeoutRef.current)
        restartListenTimeoutRef.current = null
      }
    }
  }, [hasStarted, currentWordIndex, feedback, hasAnsweredCurrentWord, isListening])

  const playSound = (isCorrect) => {
    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)()
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()

      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)

      if (isCorrect) {
        oscillator.frequency.setValueAtTime(523.25, audioContext.currentTime)
        oscillator.frequency.setValueAtTime(659.25, audioContext.currentTime + 0.1)
        oscillator.frequency.setValueAtTime(783.99, audioContext.currentTime + 0.2)
      } else {
        oscillator.frequency.value = 200
      }

      oscillator.type = 'sine'
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3)

      oscillator.start(audioContext.currentTime)
      oscillator.stop(audioContext.currentTime + 0.3)
    } catch (error) {
      console.log('Audio playback not available')
    }
  }

  if (!hasStarted) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6">
        <div className="text-center animate-fade-in">
          <h2 className="text-4xl md:text-5xl font-bold text-kid-blue mb-8">
            Get Ready!
          </h2>
          <p className="text-2xl text-gray-700 mb-8">
            First word: <span className="font-bold text-kid-pink text-3xl">{WORDS[0]}</span>
          </p>
          <button
            onClick={handleStartTest}
            className="bg-gradient-to-r from-kid-blue to-kid-pink text-white text-2xl font-bold py-4 px-8 rounded-full shadow-xl hover:scale-110 transition-transform duration-300"
          >
            Start Test
          </button>
        </div>
      </div>
    )
  }

  if (currentWordIndex >= WORDS.length) {
    return null
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6">
      <div className="text-center max-w-2xl w-full">
        <div className="mb-6">
          <p className="text-xl font-semibold text-kid-blue">
            Word {currentWordIndex + 1} of {WORDS.length}
          </p>
          <div className="w-full bg-gray-200 rounded-full h-4 mt-2">
            <div
              className="bg-gradient-to-r from-kid-blue to-kid-pink h-4 rounded-full transition-all duration-500"
              style={{ width: `${((currentWordIndex + 1) / WORDS.length) * 100}%` }}
            ></div>
          </div>
        </div>

        <Timer
          key={currentWordIndex}
          seconds={TIME_PER_WORD}
          onTimeout={handleTimeout}
        />

        <div className="mb-8 animate-fade-in">
          <h2 className="text-6xl md:text-8xl font-bold text-kid-blue mb-4 drop-shadow-lg">
            {WORDS[currentWordIndex]}
          </h2>
        </div>

        <div className="mb-8">
          <p className={`text-xl font-semibold mt-4 ${isListening ? 'text-kid-blue animate-pulse' : 'text-gray-500'}`}>
            {isListening ? 'Listening...' : 'Waiting for speech...'}
          </p>
        </div>

        <FeedbackAnimation isCorrect={feedback} spokenText={spokenText} />

        {showDebug && (
          <div className="mt-8 text-left bg-white border border-gray-200 rounded-xl p-4 shadow">
            <p className="text-sm font-bold text-gray-700 mb-2">Speech Debug</p>
            <p className="text-xs text-gray-600">Status: {debugInfo.status}</p>
            <p className="text-xs text-gray-600">Raw: {debugInfo.rawTranscript || '(none)'}</p>
            <p className="text-xs text-gray-600">Selected: {debugInfo.selectedTranscript || '(none)'}</p>
            <p className="text-xs text-red-500">Error: {debugInfo.error || '(none)'}</p>
            <p className="text-xs text-gray-700 mt-2 mb-1">Alternatives:</p>
            <div className="text-xs text-gray-600 space-y-1 max-h-24 overflow-y-auto">
              {debugInfo.alternatives.length === 0 && <p>(none)</p>}
              {debugInfo.alternatives.map((item, idx) => (
                <p key={`${item.transcript}-${idx}`}>
                  {idx + 1}. "{item.transcript}"{item.confidence !== null ? ` (${item.confidence}%)` : ''}
                </p>
              ))}
            </div>
            <p className="text-xs text-gray-700 mt-2 mb-1">Recent Events:</p>
            <div className="text-xs text-gray-600 space-y-1 max-h-28 overflow-y-auto">
              {debugLog.length === 0 && <p>(none)</p>}
              {debugLog.map((line, idx) => (
                <p key={`${line}-${idx}`}>{line}</p>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default TestScreen
