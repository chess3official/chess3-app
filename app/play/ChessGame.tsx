'use client';

import { useState, useEffect } from 'react';
import { Chess } from 'chess.js';
import { Chessboard } from 'react-chessboard';
import { makeAIMove } from './ChessAI';

type TimeControl = '1+0' | '3+0' | '5+0' | '10+0' | '15+10' | '30+0' | 'unlimited';

const TIME_CONTROLS: { [key in TimeControl]: { minutes: number; increment: number; name: string } } = {
  '1+0': { minutes: 1, increment: 0, name: 'Bullet' },
  '3+0': { minutes: 3, increment: 0, name: 'Blitz' },
  '5+0': { minutes: 5, increment: 0, name: 'Blitz' },
  '10+0': { minutes: 10, increment: 0, name: 'Rapid' },
  '15+10': { minutes: 15, increment: 10, name: 'Rapid' },
  '30+0': { minutes: 30, increment: 0, name: 'Classical' },
  'unlimited': { minutes: 0, increment: 0, name: 'Unlimited' },
};

export default function ChessGame() {
  const [game, setGame] = useState(new Chess());
  const [moveFrom, setMoveFrom] = useState('');
  const [optionSquares, setOptionSquares] = useState({});
  const [vsAI, setVsAI] = useState(false);
  const [aiDifficulty, setAiDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [aiThinking, setAiThinking] = useState(false);
  const [playerColor, setPlayerColor] = useState<'w' | 'b'>('w');
  const [timeControl, setTimeControl] = useState<TimeControl>('10+0');
  const [whiteTime, setWhiteTime] = useState(600); // seconds
  const [blackTime, setBlackTime] = useState(600); // seconds
  const [isTimerActive, setIsTimerActive] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [alienzMode, setAlienzMode] = useState(false);

  useEffect(() => {
    console.log('ChessGame component mounted!');
    console.log('Initial game position:', game.fen());
  }, []);

  // Timer effect
  useEffect(() => {
    if (!isTimerActive || game.isGameOver() || timeControl === 'unlimited') return;

    const interval = setInterval(() => {
      if (game.turn() === 'w') {
        setWhiteTime((prev) => {
          if (prev <= 0) {
            setIsTimerActive(false);
            return 0;
          }
          return prev - 1;
        });
      } else {
        setBlackTime((prev) => {
          if (prev <= 0) {
            setIsTimerActive(false);
            return 0;
          }
          return prev - 1;
        });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isTimerActive, game, timeControl]);

  // Start timer on first move
  useEffect(() => {
    if (!gameStarted && game.history().length > 0) {
      setGameStarted(true);
      setIsTimerActive(true);
    }
  }, [game, gameStarted]);

  // AI move effect
  useEffect(() => {
    if (vsAI && game.turn() !== playerColor && !game.isGameOver() && !aiThinking) {
      setAiThinking(true);
      makeAIMove(game, aiDifficulty, 800).then((move: any) => {
        if (move) {
          const gameCopy = new Chess(game.fen());
          gameCopy.move(move);
          setGame(gameCopy);
        }
        setAiThinking(false);
      });
    }
  }, [game, vsAI, playerColor, aiDifficulty, aiThinking]);

  function getMoveOptions(square: string) {
    const moves = game.moves({
      square: square as any,
      verbose: true,
    });
    
    if (moves.length === 0) {
      setOptionSquares({});
      return false;
    }

    const newSquares: any = {};
    moves.forEach((move: any) => {
      const targetPiece = game.get(move.to);
      const sourcePiece = game.get(square as any);
      newSquares[move.to] = {
        background:
          targetPiece && sourcePiece && targetPiece.color !== sourcePiece.color
            ? 'radial-gradient(circle, rgba(139,92,246,0.4) 85%, transparent 85%)'
            : 'radial-gradient(circle, rgba(139,92,246,0.4) 25%, transparent 25%)',
        borderRadius: '50%',
      };
    });
    newSquares[square] = {
      background: 'rgba(16, 185, 129, 0.4)',
    };
    setOptionSquares(newSquares);
    return true;
  }

  function onSquareClick(square: string) {
    console.log('Square clicked:', square);
    
    // Prevent moves when AI is thinking or it's not player's turn
    if (aiThinking || (vsAI && game.turn() !== playerColor)) {
      return;
    }
    
    if (!moveFrom) {
      const hasMoveOptions = getMoveOptions(square);
      if (hasMoveOptions) setMoveFrom(square);
      return;
    }

    if (moveFrom === square) {
      setMoveFrom('');
      setOptionSquares({});
      return;
    }

    try {
      const gameCopy = new Chess(game.fen());
      const move = gameCopy.move({
        from: moveFrom as any,
        to: square as any,
        promotion: 'q',
      });

      if (move) {
        setGame(gameCopy);
        setMoveFrom('');
        setOptionSquares({});
        // Add increment after move
        if (timeControl !== 'unlimited') {
          const increment = TIME_CONTROLS[timeControl].increment;
          if (game.turn() === 'w') {
            setWhiteTime((prev) => prev + increment);
          } else {
            setBlackTime((prev) => prev + increment);
          }
        }
        console.log('Move made:', move);
      } else {
        const hasMoveOptions = getMoveOptions(square);
        setMoveFrom(hasMoveOptions ? square : '');
      }
    } catch (e) {
      console.log('Move error:', e);
      const hasMoveOptions = getMoveOptions(square);
      setMoveFrom(hasMoveOptions ? square : '');
    }
  }

  function onPieceDragBegin(piece: string, sourceSquare: string) {
    console.log('Piece drag begin:', piece, sourceSquare);
    getMoveOptions(sourceSquare);
  }

  function onPieceDragEnd() {
    setOptionSquares({});
  }

  function onPieceDrop(sourceSquare: string, targetSquare: string) {
    console.log('Piece dropped from', sourceSquare, 'to', targetSquare);
    
    // Prevent moves when AI is thinking or it's not player's turn
    if (aiThinking || (vsAI && game.turn() !== playerColor)) {
      return false;
    }
    
    try {
      const gameCopy = new Chess(game.fen());
      const move = gameCopy.move({
        from: sourceSquare as any,
        to: targetSquare as any,
        promotion: 'q',
      });

      if (move) {
        setGame(gameCopy);
        setMoveFrom('');
        setOptionSquares({});
        // Add increment after move
        if (timeControl !== 'unlimited') {
          const increment = TIME_CONTROLS[timeControl].increment;
          if (game.turn() === 'w') {
            setWhiteTime((prev) => prev + increment);
          } else {
            setBlackTime((prev) => prev + increment);
          }
        }
        console.log('Drop successful:', move);
        return true;
      }
      console.log('Invalid drop');
      return false;
    } catch (e) {
      console.log('Drop error:', e);
      return false;
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleNewGame = () => {
    setGame(new Chess());
    setAiThinking(false);
    setGameStarted(false);
    setIsTimerActive(false);
    const { minutes } = TIME_CONTROLS[timeControl];
    setWhiteTime(minutes * 60);
    setBlackTime(minutes * 60);
  };

  const handleTimeControlChange = (tc: TimeControl) => {
    setTimeControl(tc);
    const { minutes } = TIME_CONTROLS[tc];
    setWhiteTime(minutes * 60);
    setBlackTime(minutes * 60);
  };

  return (
    <>
      {/* Game Status at Top */}
      <div className="text-center mb-6">
        {game.isGameOver() ? (
          <div style={{ color: '#10B981', fontWeight: 'bold', fontSize: '24px' }}>
            Game Over! {game.isCheckmate() ? 'Checkmate!' : 'Draw!'}
          </div>
        ) : (
          <div style={{ color: '#a0a0a0', fontSize: '18px' }}>
            {game.isCheck() && <span style={{ color: '#ef4444', fontWeight: 'bold' }}>Check! </span>}
          </div>
        )}
      </div>

      {/* Main Game Layout */}
      <div className="flex gap-6 items-start justify-center">
        {/* Left Side - Turn Indicator */}
        <div className="flex flex-col gap-4" style={{ width: '80px' }}>
          {/* Black Turn Indicator */}
          <div 
            className="p-4 rounded-lg text-center transition-all"
            style={{
              background: game.turn() === 'b' ? 'linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)' : 'rgba(255, 255, 255, 0.05)',
              border: game.turn() === 'b' ? '2px solid #8B5CF6' : '2px solid rgba(255, 255, 255, 0.1)',
              boxShadow: game.turn() === 'b' ? '0 0 20px rgba(139, 92, 246, 0.5)' : 'none'
            }}
          >
            <div style={{ fontSize: '32px', marginBottom: '4px' }}>⚫</div>
            <div style={{ color: '#ffffff', fontSize: '12px', fontWeight: 'bold' }}>BLACK</div>
          </div>

          {/* White Turn Indicator */}
          <div 
            className="p-4 rounded-lg text-center transition-all"
            style={{
              background: game.turn() === 'w' ? 'linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)' : 'rgba(255, 255, 255, 0.05)',
              border: game.turn() === 'w' ? '2px solid #8B5CF6' : '2px solid rgba(255, 255, 255, 0.1)',
              boxShadow: game.turn() === 'w' ? '0 0 20px rgba(139, 92, 246, 0.5)' : 'none'
            }}
          >
            <div style={{ fontSize: '32px', marginBottom: '4px' }}>⚪</div>
            <div style={{ color: '#ffffff', fontSize: '12px', fontWeight: 'bold' }}>WHITE</div>
          </div>
        </div>

        {/* Center - Chess Board */}
        <div>
          <div 
            className="rounded-xl overflow-hidden"
            style={{
              boxShadow: '0 0 60px rgba(139, 92, 246, 0.3)'
            }}
          >
            <Chessboard
              position={game.fen()}
              onPieceDrop={onPieceDrop}
              onPieceDragBegin={onPieceDragBegin}
              onPieceDragEnd={onPieceDragEnd}
              onSquareClick={onSquareClick}
              customSquareStyles={optionSquares}
              boardWidth={480}
              customDarkSquareStyle={{ backgroundColor: '#3a3a3a' }}
              customLightSquareStyle={{ backgroundColor: '#e8e8e8' }}
              customPieces={alienzMode ? {
                wP: () => <div style={{ fontSize: '40px', color: '#10B981' }}>♙</div>,
                wN: () => <div style={{ fontSize: '40px', color: '#10B981' }}>♘</div>,
                wB: () => <div style={{ fontSize: '40px', color: '#10B981' }}>♗</div>,
                wR: () => <div style={{ fontSize: '40px', color: '#10B981' }}>♖</div>,
                wQ: () => <div style={{ fontSize: '40px', color: '#10B981' }}>♕</div>,
                wK: () => <div style={{ fontSize: '40px', color: '#10B981' }}>♔</div>,
                bP: () => <div style={{ fontSize: '40px', color: '#8B5CF6' }}>♟</div>,
                bN: () => <div style={{ fontSize: '40px', color: '#8B5CF6' }}>♞</div>,
                bB: () => <div style={{ fontSize: '40px', color: '#8B5CF6' }}>♝</div>,
                bR: () => <div style={{ fontSize: '40px', color: '#8B5CF6' }}>♜</div>,
                bQ: () => <div style={{ fontSize: '40px', color: '#8B5CF6' }}>♛</div>,
                bK: () => <div style={{ fontSize: '40px', color: '#8B5CF6' }}>♚</div>,
              } : undefined}
            />
          </div>
        </div>

        {/* Right Side - Timer & Controls */}
        <div style={{ width: '280px' }}>
          {/* Timer */}
          <div className="mb-4 p-4 rounded-xl" style={{ background: 'rgba(139, 92, 246, 0.1)', border: '1px solid rgba(139, 92, 246, 0.3)' }}>
            <div className="mb-3">
              <div style={{ color: '#a0a0a0', fontSize: '12px', marginBottom: '4px' }}>Black</div>
              <div 
                className="p-3 rounded-lg text-center"
                style={{
                  background: game.turn() === 'b' && isTimerActive ? 'rgba(139, 92, 246, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                  border: game.turn() === 'b' && isTimerActive ? '2px solid #8B5CF6' : '1px solid rgba(255, 255, 255, 0.1)',
                  color: blackTime <= 10 && isTimerActive ? '#ef4444' : '#ffffff',
                  fontSize: '28px',
                  fontWeight: 'bold',
                  fontFamily: 'monospace'
                }}
              >
                {formatTime(blackTime)}
              </div>
            </div>
            <div>
              <div style={{ color: '#a0a0a0', fontSize: '12px', marginBottom: '4px' }}>White</div>
              <div 
                className="p-3 rounded-lg text-center"
                style={{
                  background: game.turn() === 'w' && isTimerActive ? 'rgba(139, 92, 246, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                  border: game.turn() === 'w' && isTimerActive ? '2px solid #8B5CF6' : '1px solid rgba(255, 255, 255, 0.1)',
                  color: whiteTime <= 10 && isTimerActive ? '#ef4444' : '#ffffff',
                  fontSize: '28px',
                  fontWeight: 'bold',
                  fontFamily: 'monospace'
                }}
              >
                {formatTime(whiteTime)}
              </div>
            </div>
          </div>

          {/* Time Control Selection */}
          <div className="mb-4 p-4 rounded-xl" style={{ background: 'rgba(139, 92, 246, 0.1)', border: '1px solid rgba(139, 92, 246, 0.3)' }}>
            <label style={{ color: '#ffffff', fontSize: '14px', fontWeight: 'bold', display: 'block', marginBottom: '8px' }}>Time Control</label>
            <div className="grid grid-cols-2 gap-2">
              {(['1+0', '3+0', '5+0', '10+0', '15+10', '30+0', 'unlimited'] as TimeControl[]).map((tc) => (
                <button
                  key={tc}
                  onClick={() => handleTimeControlChange(tc)}
                  disabled={gameStarted}
                  className="px-3 py-2 rounded-lg transition-all"
                  style={{
                    background: timeControl === tc ? 'linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)' : 'rgba(255, 255, 255, 0.1)',
                    color: '#ffffff',
                    border: 'none',
                    cursor: gameStarted ? 'not-allowed' : 'pointer',
                    opacity: gameStarted ? 0.5 : 1,
                    fontSize: '11px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '2px'
                  }}
                >
                  <span style={{ fontWeight: 'bold' }}>{tc === 'unlimited' ? '∞' : tc}</span>
                  <span style={{ fontSize: '9px', opacity: 0.7 }}>{TIME_CONTROLS[tc].name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Alienz Mode Toggle */}
          <div className="mb-4 p-4 rounded-xl" style={{ background: 'rgba(139, 92, 246, 0.1)', border: '1px solid rgba(139, 92, 246, 0.3)' }}>
            <div className="flex items-center justify-between">
              <div>
                <span style={{ color: '#ffffff', fontWeight: 'bold', fontSize: '14px' }}>Alienz Mode</span>
                <div style={{ color: '#a0a0a0', fontSize: '10px', marginTop: '2px' }}>Green vs Purple</div>
              </div>
              <button
                onClick={() => setAlienzMode(!alienzMode)}
                className="px-3 py-1 rounded-lg transition-all"
                style={{
                  background: alienzMode ? 'linear-gradient(135deg, #10B981 0%, #8B5CF6 100%)' : 'rgba(255, 255, 255, 0.1)',
                  color: '#ffffff',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '12px'
                }}
              >
                {alienzMode ? 'ON' : 'OFF'}
              </button>
            </div>
          </div>

          {/* AI Controls */}
          <div className="mb-4 p-4 rounded-xl" style={{ background: 'rgba(139, 92, 246, 0.1)', border: '1px solid rgba(139, 92, 246, 0.3)' }}>
            <div className="flex items-center justify-between mb-3">
              <span style={{ color: '#ffffff', fontWeight: 'bold', fontSize: '14px' }}>Play vs AI</span>
              <button
                onClick={() => {
                  setVsAI(!vsAI);
                  handleNewGame();
                }}
                className="px-3 py-1 rounded-lg transition-all"
                style={{
                  background: vsAI ? '#10B981' : 'rgba(255, 255, 255, 0.1)',
                  color: '#ffffff',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '12px'
                }}
              >
                {vsAI ? 'ON' : 'OFF'}
              </button>
            </div>
            
            {vsAI && (
              <>
                <div className="mb-3">
                  <label style={{ color: '#a0a0a0', fontSize: '12px', display: 'block', marginBottom: '6px' }}>Difficulty</label>
                  <div className="flex gap-2">
                    {(['easy', 'medium', 'hard'] as const).map((diff) => (
                      <button
                        key={diff}
                        onClick={() => setAiDifficulty(diff)}
                        className="px-3 py-1 rounded-lg transition-all flex-1"
                        style={{
                          background: aiDifficulty === diff ? 'linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)' : 'rgba(255, 255, 255, 0.1)',
                          color: '#ffffff',
                          border: 'none',
                          cursor: 'pointer',
                          textTransform: 'capitalize',
                          fontSize: '12px'
                        }}
                      >
                        {diff}
                      </button>
                    ))}
                  </div>
                </div>
                
                <div>
                  <label style={{ color: '#a0a0a0', fontSize: '12px', display: 'block', marginBottom: '6px' }}>Your Color</label>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setPlayerColor('w');
                        handleNewGame();
                      }}
                      className="px-3 py-1 rounded-lg transition-all flex-1"
                      style={{
                        background: playerColor === 'w' ? 'linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)' : 'rgba(255, 255, 255, 0.1)',
                        color: '#ffffff',
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: '12px'
                      }}
                    >
                      ⚪ White
                    </button>
                    <button
                      onClick={() => {
                        setPlayerColor('b');
                        handleNewGame();
                      }}
                      className="px-3 py-1 rounded-lg transition-all flex-1"
                      style={{
                        background: playerColor === 'b' ? 'linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)' : 'rgba(255, 255, 255, 0.1)',
                        color: '#ffffff',
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: '12px'
                      }}
                    >
                      ⚫ Black
                    </button>
                  </div>
                </div>
                
                {aiThinking && (
                  <div className="mt-3 text-center" style={{ color: '#10B981', fontSize: '12px' }}>
                    🤖 AI is thinking...
                  </div>
                )}
              </>
            )}
          </div>

          {/* New Game Button */}
          <button
            onClick={handleNewGame}
            className="w-full px-4 py-3 font-bold rounded-lg transition-all hover:scale-105"
            style={{
              background: 'linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)',
              color: '#ffffff',
              border: 'none',
              boxShadow: '0 4px 20px rgba(139, 92, 246, 0.3)'
            }}
          >
            New Game
          </button>
        </div>
      </div>
    </>
  );
}
