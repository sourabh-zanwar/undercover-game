# Undercover Game (Mr. White)

A pass-and-play party game app built with React and Vite. Playable on a single device, with customizable roles and points system, and ready for deployment on GitHub Pages.

## Features
- Pass-and-play mode (one device)
- Customizable number of Civilians, Undercover(s), and optional Mr. White
- Points system: Undercover(s) get 1 point per round survived; winning team gets bonus points
- No backend required; all state managed client-side

## Getting Started

### Development
```
npm install
npm run dev
```

### Build for GitHub Pages
```
npm run build
```

## Game Rules
- Each player receives a secret role: Civilian, Undercover, or (optionally) Mr. White
- Civilians and Undercover(s) get similar but different words; Mr. White gets a blank
- Players take turns giving clues, then vote to eliminate
- Undercover(s) earn points for each round survived
- Winning team gets bonus points

---

This project was bootstrapped with [Vite](https://vitejs.dev/) and [React](https://react.dev/).
