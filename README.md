# CodeBridge Kids Speech Trainer 🎤

An interactive educational web application designed to help children learn and practice speaking words through speech recognition technology.

## Features ✨

- 🎯 **Interactive Learning**: Kids speak words displayed on screen
- 🎤 **Speech Recognition**: Uses Web Speech API for real-time word detection
- ⏱️ **Timer System**: 15-second timer per word with visual countdown
- ✅ **Visual Feedback**: Animated success/error indicators with emojis
- 📊 **Score Tracking**: Results screen with detailed breakdown
- 🎨 **Kid-Friendly UI**: Bright colors, large buttons, and playful animations
- 📱 **Responsive Design**: Works on desktop, tablet, and mobile devices

## Tech Stack 🛠️

- **React 18** - UI framework
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Styling
- **Web Speech API** - Speech recognition

## Prerequisites 📋

- Node.js (v16 or higher)
- npm or yarn
- Modern browser with Web Speech API support (Chrome, Edge recommended)

## Installation & Setup 🚀

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start the development server:**
   ```bash
   npm run dev
   ```

3. **Open your browser:**
   - The app will be available at `http://localhost:5173` (or the port shown in terminal)
   - **Important**: Use Chrome or Edge for best speech recognition support

## How to Use 📖

1. Click "Start Test" on the home screen
2. A word will appear on screen
3. Click the microphone button (or it will auto-start)
4. Speak the word clearly
5. Get instant feedback (✅ correct or ❌ incorrect)
6. After 5 words, view your results!

## Word List 📝

The app currently uses these 5 words:
- Apple
- Ball
- Cat
- Dog
- Sun

*(Words can be easily modified in `src/components/TestScreen.jsx`)*

## Browser Compatibility 🌐

- ✅ Chrome (Recommended)
- ✅ Edge (Recommended)
- ✅ Safari (Limited support)
- ❌ Firefox (No Web Speech API support)

## Project Structure 📁

```
codebridge-kids-speech-trainer/
├── src/
│   ├── components/
│   │   ├── HomeScreen.jsx
│   │   ├── TestScreen.jsx
│   │   ├── ResultScreen.jsx
│   │   ├── Timer.jsx
│   │   ├── MicrophoneButton.jsx
│   │   └── FeedbackAnimation.jsx
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js
└── README.md
```

## Building for Production 🏗️

To create a production build:

```bash
npm run build
```

The built files will be in the `dist/` directory.

## Notes ⚠️

- **Microphone Permission**: The browser will ask for microphone permission on first use
- **HTTPS Required**: Speech recognition works best over HTTPS (or localhost)
- **Internet Connection**: Some browsers may require internet for speech recognition

## License 📄

This project is created for educational purposes.

---

Made with ❤️ for kids learning!
