const HomeScreen = ({ onStart }) => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6">
      <div className="text-center animate-fade-in">
        <h1 className="text-6xl md:text-8xl font-bold text-kid-blue mb-4 drop-shadow-lg">
          CodeBridge
        </h1>
        <p className="text-2xl md:text-3xl text-kid-pink font-semibold mb-12">
          Speech Practice
        </p>

        <button
          onClick={onStart}
          className="bg-gradient-to-r from-kid-blue to-kid-pink text-white text-3xl md:text-4xl font-bold py-6 px-12 rounded-full shadow-2xl hover:scale-110 transition-transform duration-300 transform"
        >
          Start Session
        </button>

        <div className="mt-12 max-w-md mx-auto bg-white/80 backdrop-blur-sm rounded-3xl p-6 shadow-lg">
          <h2 className="text-xl font-semibold text-kid-blue mb-4">How It Works</h2>
          <ul className="text-left space-y-2 text-gray-700">
            <li className="flex items-center gap-2">
              <span className="text-2xl">1.</span>
              <span>Look at the word on screen.</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="text-2xl">2.</span>
              <span>Say the word clearly when listening starts.</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="text-2xl">3.</span>
              <span>The app moves to the next word automatically.</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}

export default HomeScreen
