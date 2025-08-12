# Undercover Game (Mr. White)

A pass-and-play party game app built with React and Vite. Available as both a web app and native Android app. Playable on a single device, with customizable roles and points system.

## Features
- 🎮 Pass-and-play mode (one device)
- 📱 Available as web app and Android APK
- ⚙️ Customizable number of Civilians, Undercover(s), and optional Mr. White
- 🏆 Points system: Undercover(s) get 1 point per round survived; winning team gets bonus points
- 🚀 No backend required; all state managed client-side
- 📱 PWA support for mobile web experience

## Requirements

### For Web Development
- **Node.js** (v16 or higher)
- **npm** or **yarn**

### For Android App Development
- **Android Studio** (latest version)
- **Java Development Kit (JDK)** 8 or higher
- **Android SDK** (automatically installed with Android Studio)
- **Gradle** (bundled with Android Studio)

## Getting Started

### 1. Clone the Repository
```bash
git clone https://github.com/sourabh-zanwar/undercover-game.git
cd undercover-game
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Web Development
```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

The web app will be available at `http://localhost:5173`

## Building Android App

### Prerequisites
1. Install [Android Studio](https://developer.android.com/studio)
2. Install Java Development Kit (JDK) 8+
3. Set up Android SDK through Android Studio

### Build APK Steps

1. **Build the web app first:**
   ```bash
   npm run build
   ```

2. **Sync with Capacitor:**
   ```bash
   npx cap sync
   ```

3. **Open in Android Studio:**
   ```bash
   npx cap open android
   ```

4. **Generate APK in Android Studio:**
   - Wait for Gradle sync to complete
   - Go to `Build > Build Bundle(s) / APK(s) > Build APK(s)`
   - Find APK in `android/app/build/outputs/apk/debug/`

5. **Alternative: Command Line Build:**
   ```bash
   cd android
   ./gradlew assembleDebug
   ```

### Customizing App Details

Edit `capacitor.config.json` to customize:
```json
{
  "appId": "com.yourname.undercover",
  "appName": "Undercover Game",
  "webDir": "dist"
}
```

## Deployment Options

### Web Deployment
- **GitHub Pages**: Push to `gh-pages` branch
- **Netlify**: Connect repository for auto-deployment
- **Vercel**: Import project for instant deployment

### Android Distribution
- **Debug APK**: For testing on personal devices
- **Signed APK**: For Play Store or wider distribution
- **App Bundle**: For Play Store (recommended format)

## Project Structure

```
undercover-game/
├── src/                    # React source code
│   ├── App.jsx            # Main app component
│   ├── wordPairs.js       # Game word pairs data
│   └── assets/            # Static assets
├── public/                # Public assets
│   ├── manifest.json      # PWA manifest
│   └── vite.svg          # App icon
├── android/               # Native Android project (Capacitor)
├── dist/                  # Built web app
├── capacitor.config.json  # Capacitor configuration
├── vite.config.js        # Vite configuration
└── package.json          # Dependencies and scripts
```

## Troubleshooting

### Common Issues

**Node.js/npm issues:**
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

**Android build issues:**
```bash
# Clean and rebuild
cd android
./gradlew clean
./gradlew assembleDebug
```

**Capacitor sync issues:**
```bash
# Force sync
npx cap sync --force
```

### Platform-Specific Setup

**Windows:**
- Install Node.js from [nodejs.org](https://nodejs.org/)
- Install Android Studio
- Set JAVA_HOME environment variable

**macOS:**
```bash
# Install Node.js via Homebrew
brew install node

# Install Android Studio from website
# or via Homebrew Cask
brew install --cask android-studio
```

**Linux (Ubuntu/Debian):**
```bash
# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install OpenJDK
sudo apt install openjdk-11-jdk

# Download and install Android Studio manually
```

## Game Rules
- Each player receives a secret role: Civilian, Undercover, or (optionally) Mr. White
- Civilians and Undercover(s) get similar but different words; Mr. White gets a blank
- Players take turns giving clues, then vote to eliminate
- Undercover(s) earn points for each round survived
- Winning team gets bonus points

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is open source and available under the [MIT License](LICENSE).

---

**Tech Stack:** React + Vite + Capacitor  
**Platforms:** Web, Android  
**No backend required** - Fully client-side application
