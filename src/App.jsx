

import { useState } from 'react';
import './App.css';
import wordPairs from './wordPairs';

const SCREENS = {
  SETUP: 'setup',
  ROLE_REVEAL: 'role-reveal',
  CLUE: 'clue',
  VOTE: 'vote',
  RESULTS: 'results',
};



function App() {
  const [screen, setScreen] = useState(SCREENS.SETUP);
  const [players, setPlayers] = useState([]); // [{name, role, points, eliminated, word, clue, votes}]
  const [settings, setSettings] = useState({
    numCivilians: 4,
    numUndercovers: 1,
    includeMrWhite: false,
  });
  const [playerNamesText, setPlayerNamesText] = useState('');
  const [playerNames, setPlayerNames] = useState([]);
  const [setupError, setSetupError] = useState('');

  // Game round state
  const [currentRevealIndex, setCurrentRevealIndex] = useState(0);
  const [currentClueIndex, setCurrentClueIndex] = useState(0);
  const [currentVoteIndex, setCurrentVoteIndex] = useState(0);
  const [clues, setClues] = useState([]); // [{name, clue}]
  const [votes, setVotes] = useState([]); // [{voter, votedFor}]
  const [round, setRound] = useState(1);
  const [gameOver, setGameOver] = useState(false);
  const [winner, setWinner] = useState(null);
  const [words, setWords] = useState({ civilian: '', undercover: '' });
  const [usedWordPairIndices, setUsedWordPairIndices] = useState([]);

  function goTo(screenName) {
    setScreen(screenName);
  }

  // Helper: shuffle array
  function shuffle(array) {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  // Helper: assign roles and words
  function assignRolesAndWords() {
    // Select a word pair that hasn't been used this session
    let availableIndices = wordPairs.map((_, i) => i).filter(i => !usedWordPairIndices.includes(i));
    // If all pairs used, reset
    if (availableIndices.length === 0) {
      setUsedWordPairIndices([]);
      availableIndices = wordPairs.map((_, i) => i);
    }
    const idx = availableIndices[Math.floor(Math.random() * availableIndices.length)];
    const pair = wordPairs[idx];
    setWords(pair);
    setUsedWordPairIndices(prev => [...prev, idx]);
    // Assign roles
    let roles = [];
    for (let i = 0; i < settings.numCivilians; i++) roles.push('civilian');
    for (let i = 0; i < settings.numUndercovers; i++) roles.push('undercover');
    if (settings.includeMrWhite) roles.push('mrwhite');
    roles = shuffle(roles);
    // Assign to players
    setPlayers(playerNames.map((name, idx) => ({
      name,
      role: roles[idx],
      points: 0,
      eliminated: false,
      word: roles[idx] === 'civilian' ? pair.civilian : roles[idx] === 'undercover' ? pair.undercover : '',
      clue: '',
      votes: 0,
    })));
  }

  // Helper: check win condition
  function checkWinCondition(playersList) {
    const alive = playersList.filter(p => !p.eliminated);
    const civilians = alive.filter(p => p.role === 'civilian').length;
    const undercovers = alive.filter(p => p.role === 'undercover').length;
    const mrwhites = alive.filter(p => p.role === 'mrwhite').length;
    if (undercovers === 0 && mrwhites === 0) return 'civilians';
    if ((undercovers > 0 && civilians + mrwhites <= 1) || (mrwhites > 0 && civilians + undercovers <= 1)) {
      if (undercovers > 0 && civilians + mrwhites <= 1) return 'undercovers';
      if (mrwhites > 0 && civilians + undercovers <= 1) return 'mrwhite';
    }
    return null;
  }

  return (
    <div className="App">
      <h1>Undercover</h1>
      {screen === SCREENS.SETUP && (
        <div>
          <h2>Game Setup</h2>
          <form
            onSubmit={e => {
              e.preventDefault();
              if (playerNames.length < settings.numCivilians + settings.numUndercovers + (settings.includeMrWhite ? 1 : 0)) {
                setSetupError('Not enough player names for selected roles.');
                return;
              }
              setSetupError('');
              assignRolesAndWords();
              setCurrentRevealIndex(0);
              setRound(1);
              setGameOver(false);
              setWinner(null);
              goTo(SCREENS.ROLE_REVEAL);
            }}
          >
            <div style={{ marginBottom: 16 }}>
              <label>Player Names (one per line):</label>
              <br />
              <textarea
                rows={5}
                style={{ width: '100%', maxWidth: 400 }}
                value={playerNamesText}
                onChange={e => {
                  setPlayerNamesText(e.target.value);
                  setPlayerNames(e.target.value.split('\n').map(s => s.trim()).filter(Boolean));
                }}
                placeholder="Enter each player's name on a new line"
              />
            </div>
            <div style={{ marginBottom: 8 }}>
              <label>Number of Civilians: </label>
              <input
                type="number"
                min={1}
                max={playerNames.length}
                value={settings.numCivilians}
                onChange={e => setSettings(s => ({ ...s, numCivilians: Number(e.target.value) }))}
              />
            </div>
            <div style={{ marginBottom: 8 }}>
              <label>Number of Undercover(s): </label>
              <input
                type="number"
                min={1}
                max={playerNames.length}
                value={settings.numUndercovers}
                onChange={e => setSettings(s => ({ ...s, numUndercovers: Number(e.target.value) }))}
              />
            </div>
            <div style={{ marginBottom: 16 }}>
              <label>
                <input
                  type="checkbox"
                  checked={settings.includeMrWhite}
                  onChange={e => setSettings(s => ({ ...s, includeMrWhite: e.target.checked }))}
                />
                Include Mr. White
              </label>
            </div>
            <button type="submit">Start Game</button>
            {setupError && <div style={{ color: 'red', marginTop: 8 }}>{setupError}</div>}
          </form>
        </div>
      )}
      {screen === SCREENS.ROLE_REVEAL && (
        <div>
          <h2>Role Reveal</h2>
          {(() => {
            const alivePlayers = players.filter(p => !p.eliminated);
            return alivePlayers.length > 0 && currentRevealIndex < alivePlayers.length ? (
              <div>
                <p><b>Pass the device to: {alivePlayers[currentRevealIndex].name}</b></p>
                <div style={{ margin: '24px 0', border: '1px solid #888', borderRadius: 8, padding: 16, background: '#222' }}>
                  <p>Your role: <b>{alivePlayers[currentRevealIndex].role === 'civilian' ? 'Civilian' : alivePlayers[currentRevealIndex].role === 'undercover' ? 'Undercover' : 'Mr. White'}</b></p>
                  <p>{alivePlayers[currentRevealIndex].role === 'mrwhite' ? 'You have no word. Improvise!' : `Your word: ${alivePlayers[currentRevealIndex].word}`}</p>
                </div>
                <button onClick={() => {
                  if (currentRevealIndex + 1 < alivePlayers.length) {
                    setCurrentRevealIndex(currentRevealIndex + 1);
                  } else {
                    setCurrentClueIndex(0);
                    setClues([]);
                    goTo(SCREENS.CLUE);
                  }
                }}>
                  {currentRevealIndex + 1 < alivePlayers.length ? 'Next Player' : 'Start Clue Round'}
                </button>
              </div>
            ) : <p>Loading...</p>;
          })()}
        </div>
      )}
      {screen === SCREENS.CLUE && (
        <div>
          <h2>Elimination (Round {round})</h2>
          <p>Discuss clues and select a player to eliminate:</p>
          <ul style={{ textAlign: 'left', maxWidth: 400, margin: '0 auto' }}>
            {players.filter(p => !p.eliminated).map((p, i) => (
              <li key={i}>
                <b>{p.name}</b>
                <button style={{ marginLeft: 16 }} onClick={() => {
                  // Eliminate this player
                  const updatedPlayers = players.map(pl => pl.name === p.name ? { ...pl, eliminated: true } : pl);
                  // Award points to undercovers for surviving
                  updatedPlayers.forEach(pl => {
                    if (pl.role === 'undercover' && !pl.eliminated) pl.points += 1;
                  });
                  // Check win condition
                  const win = checkWinCondition(updatedPlayers);
                  if (win) {
                    // Award bonus points to the winning team
                    let awardedPlayers = updatedPlayers.map(p => {
                      if (win === 'civilians' && p.role === 'civilian') return { ...p, points: p.points + 3 };
                      if (win === 'undercovers' && p.role === 'undercover') return { ...p, points: p.points + 3 };
                      if (win === 'mrwhite' && p.role === 'mrwhite') return { ...p, points: p.points + 5 };
                      return p;
                    });
                    setPlayers(awardedPlayers);
                    setWinner(win);
                    setGameOver(true);
                    goTo(SCREENS.RESULTS);
                  } else {
                    setPlayers(updatedPlayers);
                    setRound(round + 1);
                    setCurrentRevealIndex(0);
                    setCurrentClueIndex(0);
                    setCurrentVoteIndex(0);
                    setClues([]);
                    setVotes([]);
                    goTo(SCREENS.ROLE_REVEAL);
                  }
                }}>Eliminate</button>
              </li>
            ))}
          </ul>
        </div>
      )}
  {/* Voting screen removed as voting is now handled in the elimination screen above */}
      {screen === SCREENS.RESULTS && (
        <div>
          <h2>Game Over!</h2>
          <h3>Winner: {winner === 'civilians' ? 'Civilians' : winner === 'undercovers' ? 'Undercovers' : 'Mr. White'}</h3>
          <h4>Points:</h4>
          <ul style={{ textAlign: 'left', maxWidth: 400, margin: '0 auto' }}>
            {players.map((p, i) => (
              <li key={i}><b>{p.name}</b> ({p.role}): {p.points} {p.eliminated ? '(eliminated)' : ''}</li>
            ))}
          </ul>
          <button onClick={() => {
            setScreen(SCREENS.SETUP);
            setPlayers([]);
            setPlayerNamesText('');
            setPlayerNames([]);
            setSettings({ numCivilians: 4, numUndercovers: 1, includeMrWhite: false });
            setCurrentRevealIndex(0);
            setCurrentClueIndex(0);
            setCurrentVoteIndex(0);
            setClues([]);
            setVotes([]);
            setRound(1);
            setGameOver(false);
            setWinner(null);
            setWords({ civilian: '', undercover: '' });
            // Do not reset usedWordPairIndices here to keep session memory
          }}>Play Again</button>
        </div>
      )}
    </div>
  );
}

export default App;
