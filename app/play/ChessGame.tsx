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
        {/* Left Side - Controls & Turn Indicator */}
        <div style={{ width: '280px' }}>
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
            className="w-full px-4 py-3 font-bold rounded-lg transition-all hover:scale-105 mb-4"
            style={{
              background: 'linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)',
              color: '#ffffff',
              border: 'none',
              boxShadow: '0 4px 20px rgba(139, 92, 246, 0.3)'
            }}
          >
            New Game
          </button>

          {/* Turn Indicators */}
          <div className="flex flex-col gap-4">
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
                wP: ({ squareWidth }: any) => (
                  <div style={{ width: squareWidth, height: squareWidth, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <svg viewBox="0 0 45 45" style={{ width: '100%', height: '100%' }}>
                      <path d="M22.5 9c-2.21 0-4 1.79-4 4 0 .89.29 1.71.78 2.38C17.33 16.5 16 18.59 16 21c0 2.03.94 3.84 2.41 5.03-3 1.06-7.41 5.55-7.41 13.47h23c0-7.92-4.41-12.41-7.41-13.47 1.47-1.19 2.41-3 2.41-5.03 0-2.41-1.33-4.5-3.28-5.62.49-.67.78-1.49.78-2.38 0-2.21-1.79-4-4-4z" fill="#10B981" stroke="#fff" strokeWidth="1.5" strokeLinecap="round"/>
                    </svg>
                  </div>
                ),
                wN: ({ squareWidth }: any) => (
                  <div style={{ width: squareWidth, height: squareWidth, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <svg viewBox="0 0 45 45" style={{ width: '100%', height: '100%' }}>
                      <path d="M22 10c10.5 1 16.5 8 16 29H15c0-9 10-6.5 8-21" fill="#10B981" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M24 18c.38 2.91-5.55 7.37-8 9-3 2-2.82 4.34-5 4-1.042-.94 1.41-3.04 0-3-1 0 .19 1.23-1 2-1 0-4.003 1-4-4 0-2 6-12 6-12s1.89-1.9 2-3.5c-.73-.994-.5-2-.5-3 1-1 3 2.5 3 2.5h2s.78-1.992 2.5-3c1 0 1 3 1 3" fill="#10B981" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                ),
                wB: ({ squareWidth }: any) => (
                  <div style={{ width: squareWidth, height: squareWidth, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <svg viewBox="0 0 45 45" style={{ width: '100%', height: '100%' }}>
                      <path d="M9 36c3.39-.97 10.11.43 13.5-2 3.39 2.43 10.11 1.03 13.5 2 0 0 1.65.54 3 2-.68.97-1.65.99-3 .5-3.39-.97-10.11.46-13.5-1-3.39 1.46-10.11.03-13.5 1-1.354.49-2.323.47-3-.5 1.354-1.94 3-2 3-2zm6-4c2.5 2.5 12.5 2.5 15 0 .5-1.5 0-2 0-2 0-2.5-2.5-4-2.5-4 5.5-1.5 6-11.5-5-15.5-11 4-10.5 14-5 15.5 0 0-2.5 1.5-2.5 4 0 0-.5.5 0 2zM25 8a2.5 2.5 0 1 1-5 0 2.5 2.5 0 1 1 5 0z" fill="#10B981" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                ),
                wR: ({ squareWidth }: any) => (
                  <div style={{ width: squareWidth, height: squareWidth, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <svg viewBox="0 0 45 45" style={{ width: '100%', height: '100%' }}>
                      <g fill="#10B981" fillRule="evenodd" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M9 39h27v-3H9v3zM12 36v-4h21v4H12zM11 14V9h4v2h5V9h5v2h5V9h4v5H11z" strokeLinecap="butt"/>
                        <path d="M34 14l-3 3H14l-3-3"/>
                        <path d="M31 17v12.5H14V17" strokeLinecap="butt" strokeLinejoin="miter"/>
                        <path d="M31 29.5l1.5 2.5h-20l1.5-2.5"/>
                        <path d="M11 14h23" fill="none" strokeLinejoin="miter"/>
                      </g>
                    </svg>
                  </div>
                ),
                wQ: ({ squareWidth }: any) => (
                  <div style={{ width: squareWidth, height: squareWidth, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <svg viewBox="0 0 45 45" style={{ width: '100%', height: '100%' }}>
                      <path d="M8 12a2 2 0 1 1-4 0 2 2 0 1 1 4 0zm16.5-4.5a2 2 0 1 1-4 0 2 2 0 1 1 4 0zM41 12a2 2 0 1 1-4 0 2 2 0 1 1 4 0zM16 8.5a2 2 0 1 1-4 0 2 2 0 1 1 4 0zM33 9a2 2 0 1 1-4 0 2 2 0 1 1 4 0z" fill="#10B981" stroke="#fff" strokeWidth="1.5"/>
                      <path d="M9 26c8.5-1.5 21-1.5 27 0l2-12-7 11V11l-5.5 13.5-3-15-3 15-5.5-14V25L7 14l2 12z" fill="#10B981" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M9 26c0 2 1.5 2 2.5 4 1 1.5 1 1 .5 3.5-1.5 1-1.5 2.5-1.5 2.5-1.5 1.5.5 2.5.5 2.5 6.5 1 16.5 1 23 0 0 0 1.5-1 0-2.5 0 0 .5-1.5-1-2.5-.5-2.5-.5-2 .5-3.5 1-2 2.5-2 2.5-4-8.5-1.5-18.5-1.5-27 0z" fill="#10B981" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                ),
                wK: ({ squareWidth }: any) => (
                  <div style={{ width: squareWidth, height: squareWidth, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <svg viewBox="0 0 45 45" style={{ width: '100%', height: '100%' }}>
                      <path d="M22.5 11.63V6M20 8h5" fill="none" stroke="#fff" strokeWidth="1.5" strokeLinecap="round"/>
                      <path d="M22.5 25s4.5-7.5 3-10.5c0 0-1-2.5-3-2.5s-3 2.5-3 2.5c-1.5 3 3 10.5 3 10.5" fill="#10B981" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M11.5 37c5.5 3.5 15.5 3.5 21 0v-7s9-4.5 6-10.5c-4-6.5-13.5-3.5-16 4V27v-3.5c-3.5-7.5-13-10.5-16-4-3 6 5 10 5 10V37z" fill="#10B981" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                ),
                bP: ({ squareWidth }: any) => (
                  <div style={{ width: squareWidth, height: squareWidth, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <svg viewBox="0 0 45 45" style={{ width: '100%', height: '100%' }}>
                      <path d="M22.5 9c-2.21 0-4 1.79-4 4 0 .89.29 1.71.78 2.38C17.33 16.5 16 18.59 16 21c0 2.03.94 3.84 2.41 5.03-3 1.06-7.41 5.55-7.41 13.47h23c0-7.92-4.41-12.41-7.41-13.47 1.47-1.19 2.41-3 2.41-5.03 0-2.41-1.33-4.5-3.28-5.62.49-.67.78-1.49.78-2.38 0-2.21-1.79-4-4-4z" fill="#8B5CF6" stroke="#fff" strokeWidth="1.5" strokeLinecap="round"/>
                    </svg>
                  </div>
                ),
                bN: ({ squareWidth }: any) => (
                  <div style={{ width: squareWidth, height: squareWidth, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <svg viewBox="0 0 45 45" style={{ width: '100%', height: '100%' }}>
                      <path d="M22 10c10.5 1 16.5 8 16 29H15c0-9 10-6.5 8-21" fill="#8B5CF6" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M24 18c.38 2.91-5.55 7.37-8 9-3 2-2.82 4.34-5 4-1.042-.94 1.41-3.04 0-3-1 0 .19 1.23-1 2-1 0-4.003 1-4-4 0-2 6-12 6-12s1.89-1.9 2-3.5c-.73-.994-.5-2-.5-3 1-1 3 2.5 3 2.5h2s.78-1.992 2.5-3c1 0 1 3 1 3" fill="#8B5CF6" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                ),
                bB: ({ squareWidth }: any) => (
                  <div style={{ width: squareWidth, height: squareWidth, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <svg viewBox="0 0 45 45" style={{ width: '100%', height: '100%' }}>
                      <path d="M9 36c3.39-.97 10.11.43 13.5-2 3.39 2.43 10.11 1.03 13.5 2 0 0 1.65.54 3 2-.68.97-1.65.99-3 .5-3.39-.97-10.11.46-13.5-1-3.39 1.46-10.11.03-13.5 1-1.354.49-2.323.47-3-.5 1.354-1.94 3-2 3-2zm6-4c2.5 2.5 12.5 2.5 15 0 .5-1.5 0-2 0-2 0-2.5-2.5-4-2.5-4 5.5-1.5 6-11.5-5-15.5-11 4-10.5 14-5 15.5 0 0-2.5 1.5-2.5 4 0 0-.5.5 0 2zM25 8a2.5 2.5 0 1 1-5 0 2.5 2.5 0 1 1 5 0z" fill="#8B5CF6" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                ),
                bR: ({ squareWidth }: any) => (
                  <div style={{ width: squareWidth, height: squareWidth, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <svg viewBox="0 0 45 45" style={{ width: '100%', height: '100%' }}>
                      <g fill="#8B5CF6" fillRule="evenodd" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M9 39h27v-3H9v3zM12 36v-4h21v4H12zM11 14V9h4v2h5V9h5v2h5V9h4v5H11z" strokeLinecap="butt"/>
                        <path d="M34 14l-3 3H14l-3-3"/>
                        <path d="M31 17v12.5H14V17" strokeLinecap="butt" strokeLinejoin="miter"/>
                        <path d="M31 29.5l1.5 2.5h-20l1.5-2.5"/>
                        <path d="M11 14h23" fill="none" strokeLinejoin="miter"/>
                      </g>
                    </svg>
                  </div>
                ),
                bQ: ({ squareWidth }: any) => (
                  <div style={{ width: squareWidth, height: squareWidth, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <svg viewBox="0 0 45 45" style={{ width: '100%', height: '100%' }}>
                      <path d="M8 12a2 2 0 1 1-4 0 2 2 0 1 1 4 0zm16.5-4.5a2 2 0 1 1-4 0 2 2 0 1 1 4 0zM41 12a2 2 0 1 1-4 0 2 2 0 1 1 4 0zM16 8.5a2 2 0 1 1-4 0 2 2 0 1 1 4 0zM33 9a2 2 0 1 1-4 0 2 2 0 1 1 4 0z" fill="#8B5CF6" stroke="#fff" strokeWidth="1.5"/>
                      <path d="M9 26c8.5-1.5 21-1.5 27 0l2-12-7 11V11l-5.5 13.5-3-15-3 15-5.5-14V25L7 14l2 12z" fill="#8B5CF6" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M9 26c0 2 1.5 2 2.5 4 1 1.5 1 1 .5 3.5-1.5 1-1.5 2.5-1.5 2.5-1.5 1.5.5 2.5.5 2.5 6.5 1 16.5 1 23 0 0 0 1.5-1 0-2.5 0 0 .5-1.5-1-2.5-.5-2.5-.5-2 .5-3.5 1-2 2.5-2 2.5-4-8.5-1.5-18.5-1.5-27 0z" fill="#8B5CF6" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                ),
                bK: ({ squareWidth }: any) => (
                  <div style={{ width: squareWidth, height: squareWidth, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <svg viewBox="0 0 45 45" style={{ width: '100%', height: '100%' }}>
                      <path d="M22.5 11.63V6M20 8h5" fill="none" stroke="#fff" strokeWidth="1.5" strokeLinecap="round"/>
                      <path d="M22.5 25s4.5-7.5 3-10.5c0 0-1-2.5-3-2.5s-3 2.5-3 2.5c-1.5 3 3 10.5 3 10.5" fill="#8B5CF6" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M11.5 37c5.5 3.5 15.5 3.5 21 0v-7s9-4.5 6-10.5c-4-6.5-13.5-3.5-16 4V27v-3.5c-3.5-7.5-13-10.5-16-4-3 6 5 10 5 10V37z" fill="#8B5CF6" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                ),
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

        </div>
      </div>
    </>
  );
}
