# Chess3 AI Bot Guide

## 🤖 Overview

The Chess3 app now includes a fully functional AI bot that players can compete against. The AI uses the **Minimax algorithm with alpha-beta pruning** for intelligent move selection.

---

## ✨ Features

### **1. Three Difficulty Levels**
- **Easy** (Depth 1): Quick moves, 30% random for variety
- **Medium** (Depth 2): Balanced gameplay, good for practice
- **Hard** (Depth 3): Challenging opponent, thinks ahead 3 moves

### **2. Color Selection**
- Play as **White** (you move first)
- Play as **Black** (AI moves first)

### **3. Smart AI**
- Uses piece-square tables for positional play
- Evaluates material advantage
- Considers piece positioning
- Uses alpha-beta pruning for efficiency

### **4. User Experience**
- Visual "AI is thinking..." indicator
- 800ms delay for natural feel
- Prevents moves during AI's turn
- Smooth animations

---

## 🎮 How to Use

### **Enable AI Mode**
1. Go to `/play` page
2. Toggle "Play vs AI" to **ON**
3. Select difficulty: Easy, Medium, or Hard
4. Choose your color: White or Black
5. Start playing!

### **Disable AI Mode**
- Toggle "Play vs AI" to **OFF** to play against another human

---

## 🧠 AI Algorithm Details

### **Minimax with Alpha-Beta Pruning**
```
Minimax evaluates all possible moves to a certain depth
Alpha-beta pruning eliminates branches that won't affect the outcome
Result: Faster computation without losing accuracy
```

### **Evaluation Function**
The AI evaluates positions based on:

1. **Material Value**
   - Pawn: 100
   - Knight: 320
   - Bishop: 330
   - Rook: 500
   - Queen: 900
   - King: 20,000

2. **Position Bonuses**
   - Pawns: Bonus for advancing
   - Knights: Bonus for center control
   - Bishops: Bonus for center control
   - King: Bonus for safety (early game)

### **Search Depth**
- **Easy**: 1 move ahead (~instant)
- **Medium**: 2 moves ahead (~0.5-1s)
- **Hard**: 3 moves ahead (~1-3s)

---

## 📁 File Structure

```
app/play/
├── ChessAI.ts          # AI logic (Minimax algorithm)
├── ChessGame.tsx       # Chess game component with AI integration
└── page.tsx            # Play page wrapper
```

---

## 🔧 Technical Implementation

### **ChessAI.ts**
```typescript
// Main functions:
- evaluateBoard(game): Evaluates position score
- minimax(game, depth, alpha, beta, maximizing): Minimax algorithm
- getBestMove(game, difficulty): Returns best move for AI
- makeAIMove(game, difficulty, delay): Async move with delay
```

### **ChessGame.tsx**
```typescript
// AI Integration:
- vsAI: Toggle AI mode on/off
- aiDifficulty: 'easy' | 'medium' | 'hard'
- aiThinking: Shows AI thinking indicator
- playerColor: 'w' | 'b' (player's color)
- useEffect: Triggers AI move when it's AI's turn
```

---

## 🎯 Future Enhancements

Potential improvements for the AI:

1. **Opening Book**: Pre-programmed opening moves
2. **Endgame Tables**: Perfect play in endgames
3. **Time Management**: Adjust thinking time based on position
4. **Personality**: Different playing styles (aggressive, defensive, etc.)
5. **Learning**: Save and learn from games
6. **Difficulty Levels**: Add more granular difficulty (1-10)
7. **Move Hints**: Suggest moves to the player
8. **Analysis Mode**: Show AI's evaluation of positions

---

## 🐛 Known Limitations

1. **Performance**: Hard difficulty may lag on slower devices
2. **Opening Play**: No opening book, so early moves may not be optimal
3. **Endgame**: No endgame tablebase, so may not play perfectly in endgames
4. **Time Control**: No time management (always uses fixed delay)

---

## 🧪 Testing the AI

### **Test Easy Mode**
- Should make quick moves
- Occasionally makes suboptimal moves
- Good for beginners

### **Test Medium Mode**
- Should play reasonably well
- Takes about 0.5-1 second per move
- Good for intermediate players

### **Test Hard Mode**
- Should play strong chess
- Takes 1-3 seconds per move
- Challenging for most players

---

## 💡 Tips for Players

1. **Start with Easy**: Get comfortable with the interface
2. **Practice Tactics**: AI will punish mistakes on Medium/Hard
3. **Learn Openings**: AI doesn't have opening book, so you can gain advantage
4. **Endgame Practice**: Use AI to practice endgame positions
5. **Analyze Games**: Review your games to improve

---

## 🚀 Running the App

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Open browser
http://localhost:3000/play
```

---

## 📝 Code Example

```typescript
// Enable AI mode
setVsAI(true);

// Set difficulty
setAiDifficulty('medium');

// Choose color
setPlayerColor('w'); // Play as white

// AI will automatically make moves when it's their turn
```

---

**Enjoy playing against the Chess3 AI bot!** 🎮♟️
