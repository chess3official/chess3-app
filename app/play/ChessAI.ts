import { Chess } from 'chess.js';

/**
 * Chess AI using Minimax algorithm with alpha-beta pruning
 * Difficulty levels: easy (depth 1), medium (depth 2), hard (depth 3)
 */

// Piece values for evaluation
const PIECE_VALUES: { [key: string]: number } = {
  p: 100,   // Pawn
  n: 320,   // Knight
  b: 330,   // Bishop
  r: 500,   // Rook
  q: 900,   // Queen
  k: 20000  // King
};

// Position bonus tables for better piece placement
const PAWN_TABLE = [
  0,  0,  0,  0,  0,  0,  0,  0,
  50, 50, 50, 50, 50, 50, 50, 50,
  10, 10, 20, 30, 30, 20, 10, 10,
  5,  5, 10, 25, 25, 10,  5,  5,
  0,  0,  0, 20, 20,  0,  0,  0,
  5, -5,-10,  0,  0,-10, -5,  5,
  5, 10, 10,-20,-20, 10, 10,  5,
  0,  0,  0,  0,  0,  0,  0,  0
];

const KNIGHT_TABLE = [
  -50,-40,-30,-30,-30,-30,-40,-50,
  -40,-20,  0,  0,  0,  0,-20,-40,
  -30,  0, 10, 15, 15, 10,  0,-30,
  -30,  5, 15, 20, 20, 15,  5,-30,
  -30,  0, 15, 20, 20, 15,  0,-30,
  -30,  5, 10, 15, 15, 10,  5,-30,
  -40,-20,  0,  5,  5,  0,-20,-40,
  -50,-40,-30,-30,-30,-30,-40,-50,
];

const BISHOP_TABLE = [
  -20,-10,-10,-10,-10,-10,-10,-20,
  -10,  0,  0,  0,  0,  0,  0,-10,
  -10,  0,  5, 10, 10,  5,  0,-10,
  -10,  5,  5, 10, 10,  5,  5,-10,
  -10,  0, 10, 10, 10, 10,  0,-10,
  -10, 10, 10, 10, 10, 10, 10,-10,
  -10,  5,  0,  0,  0,  0,  5,-10,
  -20,-10,-10,-10,-10,-10,-10,-20,
];

const KING_TABLE = [
  -30,-40,-40,-50,-50,-40,-40,-30,
  -30,-40,-40,-50,-50,-40,-40,-30,
  -30,-40,-40,-50,-50,-40,-40,-30,
  -30,-40,-40,-50,-50,-40,-40,-30,
  -20,-30,-30,-40,-40,-30,-30,-20,
  -10,-20,-20,-20,-20,-20,-20,-10,
  20, 20,  0,  0,  0,  0, 20, 20,
  20, 30, 10,  0,  0, 10, 30, 20
];

/**
 * Evaluate the board position
 * Positive score favors white, negative favors black
 */
function evaluateBoard(game: Chess): number {
  let score = 0;
  const board = game.board();

  for (let i = 0; i < 8; i++) {
    for (let j = 0; j < 8; j++) {
      const piece = board[i][j];
      if (!piece) continue;

      const pieceValue = PIECE_VALUES[piece.type];
      const position = i * 8 + j;
      
      // Get position bonus
      let positionBonus = 0;
      if (piece.type === 'p') {
        positionBonus = piece.color === 'w' ? PAWN_TABLE[position] : PAWN_TABLE[63 - position];
      } else if (piece.type === 'n') {
        positionBonus = KNIGHT_TABLE[position];
      } else if (piece.type === 'b') {
        positionBonus = BISHOP_TABLE[position];
      } else if (piece.type === 'k') {
        positionBonus = KING_TABLE[position];
      }

      const totalValue = pieceValue + positionBonus;
      score += piece.color === 'w' ? totalValue : -totalValue;
    }
  }

  return score;
}

/**
 * Minimax algorithm with alpha-beta pruning
 */
function minimax(
  game: Chess,
  depth: number,
  alpha: number,
  beta: number,
  maximizingPlayer: boolean
): number {
  if (depth === 0 || game.isGameOver()) {
    return evaluateBoard(game);
  }

  const moves = game.moves({ verbose: true });

  if (maximizingPlayer) {
    let maxEval = -Infinity;
    for (const move of moves) {
      game.move(move);
      const evaluation = minimax(game, depth - 1, alpha, beta, false);
      game.undo();
      maxEval = Math.max(maxEval, evaluation);
      alpha = Math.max(alpha, evaluation);
      if (beta <= alpha) break; // Beta cutoff
    }
    return maxEval;
  } else {
    let minEval = Infinity;
    for (const move of moves) {
      game.move(move);
      const evaluation = minimax(game, depth - 1, alpha, beta, true);
      game.undo();
      minEval = Math.min(minEval, evaluation);
      beta = Math.min(beta, evaluation);
      if (beta <= alpha) break; // Alpha cutoff
    }
    return minEval;
  }
}

/**
 * Get the best move for the AI
 * @param game - Current chess game instance
 * @param difficulty - 'easy' (depth 1), 'medium' (depth 2), 'hard' (depth 3)
 */
export function getBestMove(game: Chess, difficulty: 'easy' | 'medium' | 'hard' = 'medium'): any {
  const depth = difficulty === 'easy' ? 1 : difficulty === 'medium' ? 2 : 3;
  const moves = game.moves({ verbose: true });
  
  if (moves.length === 0) return null;

  // For easy mode, add some randomness
  if (difficulty === 'easy' && Math.random() < 0.3) {
    return moves[Math.floor(Math.random() * moves.length)];
  }

  let bestMove = moves[0];
  let bestValue = game.turn() === 'w' ? -Infinity : Infinity;

  for (const move of moves) {
    game.move(move);
    const boardValue = minimax(
      game,
      depth - 1,
      -Infinity,
      Infinity,
      game.turn() === 'w'
    );
    game.undo();

    if (game.turn() === 'w') {
      if (boardValue > bestValue) {
        bestValue = boardValue;
        bestMove = move;
      }
    } else {
      if (boardValue < bestValue) {
        bestValue = boardValue;
        bestMove = move;
      }
    }
  }

  return bestMove;
}

/**
 * Make AI move with a delay for better UX
 */
export async function makeAIMove(
  game: Chess,
  difficulty: 'easy' | 'medium' | 'hard' = 'medium',
  delay: number = 500
): Promise<any> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const bestMove = getBestMove(game, difficulty);
      resolve(bestMove);
    }, delay);
  });
}

export default { getBestMove, makeAIMove };
