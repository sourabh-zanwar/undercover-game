

import { useState } from 'react';
import './App.css';
import wordPairs from './wordPairs';

const SCREENS = {
  SETUP: 'setup',
  SHOW_WORD: 'show-word', // NEW
  REVEAL_WORD: 'reveal-word', // NEW
  CLUE_ORDER: 'clue-order', // NEW
  CLUE: 'clue',
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
  const [clueOrder, setClueOrder] = useState([]); // NEW: clue order

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
    setPlayers(playerNames.map((name, idx) => {
      // Try to find existing player to preserve their score
      const existing = players.find(p => p.name === name);
      return {
        name,
        role: roles[idx],
        points: existing ? existing.points : 0,
        eliminated: false,
        word: roles[idx] === 'civilian' ? pair.civilian : roles[idx] === 'undercover' ? pair.undercover : '',
        clue: '',
        votes: 0,
      };
    }));
    setClueOrder(shuffle(playerNames)); // NEW: randomize clue order
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
    <div className="App fun-bg">
      <h1 style={{ fontSize: '3rem', marginBottom: 0 }}>🕵️‍♂️ Undercover Party! 🎉</h1>
      <p style={{ marginTop: 0, color: '#ffb300', fontWeight: 'bold', fontSize: '1.2rem' }}>Who can you trust? 👀</p>
      {screen === SCREENS.SETUP && (
        <div className="card fun-card">
          <h2 style={{ fontSize: '2rem' }}>Game Setup <span role="img" aria-label="gear">⚙️</span></h2>
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
              goTo(SCREENS.SHOW_WORD); // NEW: go to show-word screen
            }}
          >
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontWeight: 'bold' }}>👥 Player Names (one per line):</label>
              <br />
              <textarea
                rows={5}
                style={{ width: '100%', maxWidth: 400, borderRadius: 8, border: '2px solid #ffb300', padding: 8 }}
                value={playerNamesText}
                onChange={e => {
                  setPlayerNamesText(e.target.value);
                  setPlayerNames(e.target.value.split('\n').map(s => s.trim()).filter(Boolean));
                }}
                placeholder="Enter each player's name on a new line 📝"
              />
            </div>
            <div style={{ marginBottom: 8 }}>
              <label style={{ fontWeight: 'bold' }}>👨‍🌾 Number of Civilians: </label>
              <input
                type="number"
                min={1}
                max={playerNames.length}
                value={settings.numCivilians}
                onChange={e => setSettings(s => ({ ...s, numCivilians: Number(e.target.value) }))}
                style={{ borderRadius: 6, border: '1.5px solid #4caf50', width: 60, textAlign: 'center' }}
              />
            </div>
            <div style={{ marginBottom: 8 }}>
              <label style={{ fontWeight: 'bold' }}>🕵️‍♂️ Number of Undercover(s): </label>
              <input
                type="number"
                min={1}
                max={playerNames.length}
                value={settings.numUndercovers}
                onChange={e => setSettings(s => ({ ...s, numUndercovers: Number(e.target.value) }))}
                style={{ borderRadius: 6, border: '1.5px solid #f44336', width: 60, textAlign: 'center' }}
              />
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontWeight: 'bold' }}>
                <input
                  type="checkbox"
                  checked={settings.includeMrWhite}
                  onChange={e => setSettings(s => ({ ...s, includeMrWhite: e.target.checked }))}
                />
                👻 Include Mr. White
              </label>
            </div>
            <button className="fun-btn" type="submit">🚀 Start Game</button>
            {setupError && <div style={{ color: 'red', marginTop: 8 }}>{setupError}</div>}
          </form>
        </div>
      )}

      {/* NEW: Show Word screen */}
      {screen === SCREENS.SHOW_WORD && (() => {
        const alivePlayers = players.filter(p => !p.eliminated);
        if (alivePlayers.length === 0 || currentRevealIndex >= alivePlayers.length) return <p>Loading...</p>;
        return (
          <div className="card fun-card">
            <h2>🔑 Word Reveal</h2>
            <p style={{ fontSize: '1.2rem' }}>Pass the device to:<br /><b style={{ fontSize: '2.5rem', color: '#4caf50' }}>{alivePlayers[currentRevealIndex].name} 🎲</b></p>
            <button className="fun-btn" onClick={() => goTo(SCREENS.REVEAL_WORD)}>👁️ Show Word</button>
          </div>
        );
      })()}

      {/* NEW: Reveal Word screen */}
      {screen === SCREENS.REVEAL_WORD && (() => {
        const alivePlayers = players.filter(p => !p.eliminated);
        if (alivePlayers.length === 0 || currentRevealIndex >= alivePlayers.length) return <p>Loading...</p>;
        const player = alivePlayers[currentRevealIndex];
        const roleEmoji = player.role === 'civilian' ? '👨‍🌾' : player.role === 'undercover' ? '🕵️‍♂️' : '👻';
        return (
          <div className="card fun-card">
            <h2>Your Word {roleEmoji}</h2>
            <div style={{ margin: '24px 0', border: '2px dashed #4f8cff', borderRadius: 12, padding: 20, background: '#232a3b', color: '#4f8cff' }}>
              <p style={{ margin: 0, fontSize: '1.2rem' }}>Your word:<br /><b style={{ fontSize: '2.5rem', color: '#00eaff' }}>{player.word || 'No word (Improvise!)'}</b></p>
            </div>
            <button className="fun-btn" onClick={() => {
              if (currentRevealIndex + 1 < alivePlayers.length) {
                setCurrentRevealIndex(currentRevealIndex + 1);
                goTo(SCREENS.SHOW_WORD);
              } else {
                setCurrentRevealIndex(0);
                goTo(SCREENS.CLUE_ORDER); // NEW: go to clue order screen
              }
            }}>
              {currentRevealIndex + 1 < alivePlayers.length ? '👉 Next Player' : '🎤 Show Clue Order'}
            </button>
          </div>
        );
      })()}

      {/* NEW: Clue Order screen */}
      {screen === SCREENS.CLUE_ORDER && (
        <div className="card fun-card">
          <h2>🎤 Clue Order</h2>
          <p style={{ fontSize: '1.1rem' }}>This is the order in which players will give their clues:</p>
          <ol style={{ textAlign: 'left', maxWidth: 400, margin: '0 auto', fontSize: '1.2rem' }}>
            {clueOrder.map((name, i) => (
              <li key={i}><b>{name}</b></li>
            ))}
          </ol>
          <button className="fun-btn" onClick={() => goTo(SCREENS.CLUE)}>🎲 Start Clue Round</button>
        </div>
      )}
      {screen === SCREENS.CLUE && (() => {
        const alivePlayers = players.filter(p => !p.eliminated);
        if (alivePlayers.length === 0) {
          return <div className="card fun-card"><h2>No players left! 😱</h2><p>The game cannot continue.</p></div>;
        }
        return (
          <div className="card fun-card">
            <h2>🔥 Elimination (Round {round})</h2>
            <p style={{ fontSize: '1.1rem' }}>Discuss clues and select a player to eliminate:</p>
            <ul style={{ textAlign: 'left', maxWidth: 400, margin: '0 auto', fontSize: '1.2rem' }}>
              {alivePlayers.map((p, i) => {
                const roleEmoji = p.role === 'civilian' ? '👨‍🌾' : p.role === 'undercover' ? '🕵️‍♂️' : '👻';
                return (
                  <li key={i} style={{ marginBottom: 10 }}>
                    <b>{p.name}</b> <span style={{ fontSize: '1.1rem' }}>{roleEmoji}</span>
                    <button className="fun-btn danger" style={{ marginLeft: 16 }} onClick={() => {
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
                      // Skip word reveal after first round
                      goTo(SCREENS.CLUE_ORDER);
                    }
                  }}>❌ Eliminate</button>
                  </li>
                );
              })}
            </ul>
          </div>
        );
      })()}
  {/* Voting screen removed as voting is now handled in the elimination screen above */}
      {screen === SCREENS.RESULTS && (
        <div className="card fun-card">
          <h2 style={{ fontSize: '2.2rem' }}>🏆 Game Over! 🏆</h2>
          <h3 style={{ fontSize: '1.7rem', color: winner === 'civilians' ? '#4caf50' : winner === 'undercovers' ? '#f44336' : '#9c27b0' }}>
            Winner: {winner === 'civilians' ? 'Civilians 👨‍🌾' : winner === 'undercovers' ? 'Undercovers 🕵️‍♂️' : 'Mr. White 👻'}
          </h3>
          <div style={{ margin: '18px 0', padding: '12px 0', background: '#232a3b', borderRadius: 10, border: '2px dashed #ffb300' }}>
            <h4 style={{ margin: 0 }}>Civilian Word: <span style={{ color: '#4caf50', fontWeight: 'bold' }}>{words.civilian}</span></h4>
            <h4 style={{ margin: 0 }}>Undercover Word: <span style={{ color: '#f44336', fontWeight: 'bold' }}>{words.undercover}</span></h4>
          </div>
          <h4>Points:</h4>
          <ul style={{ textAlign: 'left', maxWidth: 400, margin: '0 auto', fontSize: '1.2rem' }}>
            {players.map((p, i) => {
              const roleEmoji = p.role === 'civilian' ? '👨‍🌾' : p.role === 'undercover' ? '🕵️‍♂️' : '👻';
              return (
                <li key={i}><b>{p.name}</b> {roleEmoji} ({p.role}): <b>{p.points}</b> {p.eliminated ? <span style={{ color: '#f44336' }}>(eliminated)</span> : <span style={{ color: '#4caf50' }}>(alive)</span>}</li>
              );
            })}
          </ul>
          <button className="fun-btn" onClick={() => {
            // Only reset round/game state, keep players and scores
            setScreen(SCREENS.SHOW_WORD);
            setCurrentRevealIndex(0);
            setCurrentClueIndex(0);
            setCurrentVoteIndex(0);
            setClues([]);
            setVotes([]);
            setRound(1);
            setGameOver(false);
            setWinner(null);
            setWords({ civilian: '', undercover: '' });
            // Assign new roles/words for the same players
            assignRolesAndWords();
          }}>🔄 Play Again</button>
          <button className="fun-btn danger" style={{ marginLeft: 12 }} onClick={() => {
            // Full reset: everything including names and scores
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
          }}>🆕 New Game</button>
        </div>
      )}
    </div>
  );
}

export default App;
