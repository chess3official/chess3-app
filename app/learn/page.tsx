'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Chess } from 'chess.js';
import { Chessboard } from 'react-chessboard';

// Simple knight training exercise
// Start: white king + knight vs bare king, white to move
// Goal: move the knight onto the highlighted target square

const KNIGHT_TRAINING_FEN = '8/8/8/8/4n3/8/8/4K3 w - - 0 1'; // white king e1, knight e4 (as white piece)
const KNIGHT_TARGET_SQUARE = 'f6';

export default function LearnPage() {
  const [game, setGame] = useState(() => new Chess(KNIGHT_TRAINING_FEN));
  const [moveFrom, setMoveFrom] = useState('');
  const [optionSquares, setOptionSquares] = useState<Record<string, any>>({});
  const [status, setStatus] = useState('Move the knight to the highlighted square.');
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    // Reset status if game resets
    setStatus('Move the knight to the highlighted square.');
    setCompleted(false);
    setMoveFrom('');
    setOptionSquares({});
  }, [game.fen()]);

  const resetExercise = () => {
    setGame(new Chess(KNIGHT_TRAINING_FEN));
    setStatus('Move the knight to the highlighted square.');
    setCompleted(false);
    setMoveFrom('');
    setOptionSquares({});
  };

  const highlightKnightMoves = (square: string) => {
    const moves = game.moves({ square: square as any, verbose: true });
    if (!moves.length) {
      setOptionSquares({});
      return;
    }
    const squares: Record<string, any> = {};
    moves.forEach((m: any) => {
      squares[m.to] = {
        background: 'radial-gradient(circle, rgba(139,92,246,0.5) 30%, transparent 30%)',
        borderRadius: '50%',
      };
    });
    squares[square] = { background: 'rgba(16, 185, 129, 0.4)' };
    setOptionSquares(squares);
  };

  const handleMove = (from: string, to: string) => {
    if (completed) return false;

    const piece = game.get(from as any);
    // Only allow knight moves in this drill
    if (!piece || piece.type !== 'n' || piece.color !== 'w') {
      setStatus('In this drill, only move the knight.');
      return false;
    }

    const gameCopy = new Chess(game.fen());
    const move = gameCopy.move({ from: from as any, to: to as any, promotion: 'q' });

    if (!move) {
      setStatus('That is not a legal knight move. Try again.');
      return false;
    }

    setGame(gameCopy);
    setMoveFrom('');
    setOptionSquares({});

    if (to === KNIGHT_TARGET_SQUARE) {
      setCompleted(true);
      setStatus('Nice! You reached the target square with the knight.');
    } else {
      setStatus('Good move, but try to land on the highlighted square.');
    }

    return true;
  };

  const onSquareClick = (square: string) => {
    if (completed) return;

    if (!moveFrom) {
      const piece = game.get(square as any);
      if (piece && piece.type === 'n' && piece.color === 'w') {
        setMoveFrom(square);
        highlightKnightMoves(square);
      }
      return;
    }

    if (moveFrom === square) {
      setMoveFrom('');
      setOptionSquares({});
      return;
    }

    handleMove(moveFrom, square);
  };

  const onPieceDrop = (sourceSquare: string, targetSquare: string) => {
    return handleMove(sourceSquare, targetSquare);
  };

  // Merge training highlight with target square highlight
  const combinedSquareStyles = {
    ...optionSquares,
    [KNIGHT_TARGET_SQUARE]: {
      ...(optionSquares[KNIGHT_TARGET_SQUARE] || {}),
      boxShadow: '0 0 15px 5px rgba(16, 185, 129, 0.7) inset',
      background:
        optionSquares[KNIGHT_TARGET_SQUARE]?.background || 'radial-gradient(circle, rgba(16,185,129,0.4) 30%, transparent 30%)',
    },
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-start py-10" style={{ background: 'radial-gradient(circle at top, #1e293b 0%, #020617 60%)' }}>
      <div className="flex items-center justify-between mb-4 w-full max-w-5xl px-4">
        <Link
          href="/"
          className="px-3 py-1.5 rounded-lg text-xs font-semibold border"
          style={{
            borderColor: 'rgba(148, 163, 184, 0.6)',
            color: '#e5e7eb',
            background: 'rgba(15,23,42,0.75)',
          }}
        >
          ← Home
        </Link>
        <div />
      </div>

      <h1 className="text-3xl font-bold mb-2" style={{ color: '#ffffff' }}>Learn Chess3</h1>
      <p className="mb-8 text-sm" style={{ color: '#a0a0a0' }}>Piece training drills inspired by lichess – starting with knight moves.</p>

      <div className="flex gap-6 items-start max-w-5xl w-full px-4">
        {/* Left: drill list */}
        <div style={{ width: '220px' }}>
          <div className="mb-3 p-3 rounded-xl" style={{ background: 'rgba(15,23,42,0.9)', border: '1px solid rgba(148,163,184,0.4)' }}>
            <div className="text-xs font-semibold mb-2" style={{ color: '#9ca3af', letterSpacing: '0.08em' }}>DRILLS</div>
            <button
              className="w-full px-3 py-2 rounded-lg text-left text-sm font-semibold"
              style={{
                background: 'linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)',
                color: '#ffffff',
                border: 'none',
                boxShadow: '0 6px 20px rgba(139, 92, 246, 0.35)',
              }}
            >
              Knight moves
            </button>
            <div className="mt-3 text-xs" style={{ color: '#6b7280' }}>
              More drills (rook, bishop, pawn endings) coming soon.
            </div>
          </div>
        </div>

        {/* Center: board */}
        <div>
          <div className="mb-3 p-3 rounded-xl" style={{ background: 'rgba(15,23,42,0.9)', border: '1px solid rgba(148,163,184,0.4)' }}>
            <div className="flex items-center justify-between mb-2">
              <div>
                <div className="text-sm font-semibold" style={{ color: '#ffffff' }}>Knight movement training</div>
                <div className="text-xs" style={{ color: '#9ca3af' }}>Move the knight to the glowing target square.</div>
              </div>
              <button
                onClick={resetExercise}
                className="px-3 py-1 rounded-lg text-xs font-semibold"
                style={{
                  background: 'rgba(148,163,184,0.15)',
                  color: '#e5e7eb',
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                Reset
              </button>
            </div>

            <div
              className="rounded-xl overflow-hidden"
              style={{ boxShadow: '0 0 60px rgba(139, 92, 246, 0.25)' }}
            >
              <Chessboard
                position={game.fen()}
                onPieceDrop={onPieceDrop}
                onSquareClick={onSquareClick}
                boardWidth={480}
                customSquareStyles={combinedSquareStyles}
                customDarkSquareStyle={{ backgroundColor: '#1f2933' }}
                customLightSquareStyle={{ backgroundColor: '#e5e7eb' }}
              />
            </div>

            <div className="mt-3 text-sm" style={{ color: completed ? '#10B981' : '#e5e7eb' }}>
              {status}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
