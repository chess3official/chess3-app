'use client';

import { useState, useEffect } from 'react';
import { Chess } from 'chess.js';
import { Chessboard } from 'react-chessboard';
import { makeAIMove } from './ChessAI';

export default function ChessGame() {
  const [game, setGame] = useState(new Chess());
  const [moveFrom, setMoveFrom] = useState('');
  const [optionSquares, setOptionSquares] = useState({});
  const [testClicks, setTestClicks] = useState(0);
  const [vsAI, setVsAI] = useState(false);
  const [aiDifficulty, setAiDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [aiThinking, setAiThinking] = useState(false);
  const [playerColor, setPlayerColor] = useState<'w' | 'b'>('w');

  useEffect(() => {
    console.log('ChessGame component mounted!');
    console.log('Initial game position:', game.fen());
  }, []);

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

  return (
    <>
      {/* Chess Board */}
      <div className="max-w-2xl mx-auto">
        <div 
          className="rounded-xl overflow-hidden"
          style={{
            boxShadow: '0 0 60px rgba(139, 92, 246, 0.3)'
          }}
        >
          <Chessboard
            position={game.fen()}
            onPieceDrop={onPieceDrop}
            onSquareClick={onSquareClick}
            customSquareStyles={optionSquares}
            boardWidth={600}
            customDarkSquareStyle={{ backgroundColor: '#3a3a3a' }}
            customLightSquareStyle={{ backgroundColor: '#e8e8e8' }}
          />
        </div>

        {/* Test Button */}
        <div className="mt-6 text-center">
          <div style={{ color: '#ffffff', marginBottom: '10px', fontSize: '18px' }}>
            Component State Test: {testClicks}
          </div>
          <button
            onClick={() => {
              const newCount = testClicks + 1;
              console.log('Test button clicked! New count:', newCount);
              setTestClicks(newCount);
            }}
            className="px-4 py-2 rounded"
            style={{
              background: '#10B981',
              color: '#ffffff',
              marginBottom: '10px',
              cursor: 'pointer',
              border: 'none',
              fontSize: '16px'
            }}
          >
            Click Me to Test (Clicks: {testClicks})
          </button>
          <div style={{ color: '#a0a0a0', fontSize: '12px', marginTop: '5px' }}>
            If this counter doesn't change, React state isn't updating
          </div>
        </div>

        {/* Game Info */}
        <div className="mt-6 text-center">
          <p style={{ color: '#a0a0a0' }}>
            {game.isGameOver() ? (
              <span style={{ color: '#10B981', fontWeight: 'bold' }}>
                Game Over! {game.isCheckmate() ? 'Checkmate!' : 'Draw!'}
              </span>
            ) : (
              <span>
                Turn: <span style={{ color: '#ffffff', fontWeight: 'bold' }}>
                  {game.turn() === 'w' ? 'White' : 'Black'}
                </span>
                {game.isCheck() && <span style={{ color: '#ef4444' }}> (Check!)</span>}
              </span>
            )}
          </p>
        </div>

        {/* AI Controls */}
        <div className="mt-6 p-6 rounded-xl" style={{ background: 'rgba(139, 92, 246, 0.1)', border: '1px solid rgba(139, 92, 246, 0.3)' }}>
          <div className="flex items-center justify-between mb-4">
            <span style={{ color: '#ffffff', fontWeight: 'bold', fontSize: '16px' }}>Play vs AI</span>
            <button
              onClick={() => {
                setVsAI(!vsAI);
                setGame(new Chess());
                setAiThinking(false);
              }}
              className="px-4 py-2 rounded-lg transition-all"
              style={{
                background: vsAI ? '#10B981' : 'rgba(255, 255, 255, 0.1)',
                color: '#ffffff',
                border: 'none',
                cursor: 'pointer'
              }}
            >
              {vsAI ? 'ON' : 'OFF'}
            </button>
          </div>
          
          {vsAI && (
            <>
              <div className="mb-4">
                <label style={{ color: '#a0a0a0', fontSize: '14px', display: 'block', marginBottom: '8px' }}>Difficulty</label>
                <div className="flex gap-2">
                  {(['easy', 'medium', 'hard'] as const).map((diff) => (
                    <button
                      key={diff}
                      onClick={() => setAiDifficulty(diff)}
                      className="px-4 py-2 rounded-lg transition-all flex-1"
                      style={{
                        background: aiDifficulty === diff ? 'linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)' : 'rgba(255, 255, 255, 0.1)',
                        color: '#ffffff',
                        border: 'none',
                        cursor: 'pointer',
                        textTransform: 'capitalize'
                      }}
                    >
                      {diff}
                    </button>
                  ))}
                </div>
              </div>
              
              <div>
                <label style={{ color: '#a0a0a0', fontSize: '14px', display: 'block', marginBottom: '8px' }}>Your Color</label>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setPlayerColor('w');
                      setGame(new Chess());
                      setAiThinking(false);
                    }}
                    className="px-4 py-2 rounded-lg transition-all flex-1"
                    style={{
                      background: playerColor === 'w' ? 'linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)' : 'rgba(255, 255, 255, 0.1)',
                      color: '#ffffff',
                      border: 'none',
                      cursor: 'pointer'
                    }}
                  >
                    ⚪ White
                  </button>
                  <button
                    onClick={() => {
                      setPlayerColor('b');
                      const newGame = new Chess();
                      setGame(newGame);
                      setAiThinking(false);
                    }}
                    className="px-4 py-2 rounded-lg transition-all flex-1"
                    style={{
                      background: playerColor === 'b' ? 'linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)' : 'rgba(255, 255, 255, 0.1)',
                      color: '#ffffff',
                      border: 'none',
                      cursor: 'pointer'
                    }}
                  >
                    ⚫ Black
                  </button>
                </div>
              </div>
              
              {aiThinking && (
                <div className="mt-4 text-center" style={{ color: '#10B981' }}>
                  🤖 AI is thinking...
                </div>
              )}
            </>
          )}
        </div>

        {/* Reset Button */}
        <div className="mt-6 text-center">
          <button
            onClick={() => {
              setGame(new Chess());
              setAiThinking(false);
            }}
            className="px-6 py-3 font-bold rounded-lg transition-all hover:scale-105"
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
