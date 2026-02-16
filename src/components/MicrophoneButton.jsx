const MicrophoneButton = ({ isListening, onClick, disabled }) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`relative w-32 h-32 md:w-40 md:h-40 rounded-full ${
        isListening
          ? 'bg-gradient-to-r from-kid-blue to-kid-pink animate-pulse-glow'
          : 'bg-gradient-to-r from-kid-blue to-kid-pink hover:scale-110'
      } text-white text-6xl md:text-7xl flex items-center justify-center shadow-2xl transition-transform duration-300 transform ${
        disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
      }`}
    >
      🎤
      {isListening && (
        <div className="absolute inset-0 rounded-full bg-kid-blue animate-ping opacity-75"></div>
      )}
    </button>
  )
}

export default MicrophoneButton
