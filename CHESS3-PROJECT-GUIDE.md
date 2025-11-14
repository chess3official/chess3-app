# Chess3 Custom Platform - Project Guide

## 🎯 Project Overview

This is the custom Chess3 platform built with modern technologies for full control and Solana integration from day 1.

### Tech Stack

- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript
- **Styling:** TailwindCSS with Chess3 purple/green theme
- **Chess Engine:** chess.js
- **Chess UI:** react-chessboard
- **Blockchain:** Solana Web3.js + Wallet Adapter
- **State:** React Context + Hooks
- **Icons:** Lucide React

---

## 📁 Project Structure

```
chess3-app/
├── app/                      # Next.js App Router
│   ├── (auth)/              # Authentication pages
│   │   ├── login/
│   │   └── register/
│   ├── (game)/              # Game pages
│   │   ├── play/
│   │   ├── lobby/
│   │   └── watch/
│   ├── api/                 # API routes
│   │   ├── game/
│   │   ├── user/
│   │   └── solana/
│   ├── globals.css          # Global styles with Chess3 theme
│   ├── layout.tsx           # Root layout
│   └── page.tsx             # Homepage
├── components/
│   ├── chess/               # Chess-specific components
│   │   ├── Board.tsx
│   │   ├── MoveList.tsx
│   │   ├── Timer.tsx
│   │   └── GameControls.tsx
│   ├── solana/              # Web3 components
│   │   ├── WalletButton.tsx
│   │   ├── NFTVerifier.tsx
│   │   ├── TokenBalance.tsx
│   │   └── WalletProvider.tsx
│   ├── ui/                  # Reusable UI components
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── dialog.tsx
│   │   └── ...
│   └── layout/              # Layout components
│       ├── Header.tsx
│       ├── Footer.tsx
│       └── Sidebar.tsx
├── lib/
│   ├── chess/               # Chess logic
│   │   ├── engine.ts
│   │   ├── validation.ts
│   │   └── notation.ts
│   ├── solana/              # Blockchain logic
│   │   ├── connection.ts
│   │   ├── nft.ts
│   │   ├── tokens.ts
│   │   └── wallet.ts
│   ├── db/                  # Database (future)
│   └── utils.ts             # Utilities
├── public/
│   ├── logo/                # Chess3 logos
│   └── sounds/              # Game sounds
└── types/
    ├── chess.ts
    ├── user.ts
    └── solana.ts
```

---

## 🎨 Chess3 Theme

### Colors

```typescript
// Primary Purple
chess3-purple: #8B5CF6
chess3-purple-dark: #6D28D9
chess3-purple-light: #C4B5FD

// Secondary Green
chess3-green: #10B981
chess3-green-dark: #059669
chess3-green-light: #34D399
```

### Usage

```tsx
// Tailwind classes
<div className="bg-chess3-purple text-white">
<button className="bg-chess3-green hover:bg-chess3-green-dark">

// Gradient backgrounds
<div className="gradient-chess3">  // Purple gradient
<div className="gradient-chess3-reverse">  // Purple to green
```

---

## 🚀 Getting Started

### Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### Build for Production

```bash
npm run build
npm start
```

---

## 📦 Key Dependencies

### Chess
- `chess.js` - Chess game logic
- `react-chessboard` - Interactive chess board

### Solana
- `@solana/web3.js` - Solana blockchain interaction
- `@solana/wallet-adapter-react` - Wallet connection
- `@solana/wallet-adapter-react-ui` - Wallet UI components
- `@solana/wallet-adapter-wallets` - Wallet integrations

### UI
- `tailwindcss` - Utility-first CSS
- `lucide-react` - Icons
- `class-variance-authority` - Component variants
- `clsx` + `tailwind-merge` - Class name utilities

---

## 🎮 Features Roadmap

### Phase 1: Core Chess (Week 1-2)
- [ ] Chess board component
- [ ] Move validation
- [ ] Game state management
- [ ] Timer system
- [ ] Move history

### Phase 2: Multiplayer (Week 3-4)
- [ ] Socket.io integration
- [ ] Matchmaking
- [ ] Real-time game sync
- [ ] Spectator mode

### Phase 3: Solana Integration (Week 5-6)
- [ ] Wallet connection
- [ ] NFT verification
- [ ] Token rewards
- [ ] Premium features

### Phase 4: Advanced Features (Week 7-8)
- [ ] Game analysis
- [ ] Opening explorer
- [ ] Puzzles
- [ ] Tournaments

---

## 🔐 Environment Variables

Create `.env.local`:

```env
# Solana
NEXT_PUBLIC_SOLANA_NETWORK=devnet
NEXT_PUBLIC_SOLANA_RPC_URL=https://api.devnet.solana.com

# Chess3 NFT Collection
NEXT_PUBLIC_NFT_COLLECTION_ADDRESS=your_collection_address

# API
NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

---

## 📝 Development Guidelines

### Component Structure

```tsx
// components/chess/Board.tsx
'use client';

import { Chess } from 'chess.js';
import { Chessboard } from 'react-chessboard';

interface BoardProps {
  game: Chess;
  onMove: (move: string) => void;
}

export function Board({ game, onMove }: BoardProps) {
  return (
    <div className="w-full max-w-2xl mx-auto">
      <Chessboard
        position={game.fen()}
        onPieceDrop={(sourceSquare, targetSquare) => {
          const move = game.move({
            from: sourceSquare,
            to: targetSquare,
            promotion: 'q',
          });
          if (move) {
            onMove(move.san);
            return true;
          }
          return false;
        }}
      />
    </div>
  );
}
```

### Styling Conventions

- Use Tailwind utility classes
- Use Chess3 color variables
- Responsive by default (mobile-first)
- Dark mode support

### TypeScript

- Strict mode enabled
- No `any` types
- Proper interfaces for all props
- Type-safe API calls

---

## 🧪 Testing

```bash
# Run tests (to be added)
npm test

# Type checking
npm run type-check

# Linting
npm run lint
```

---

## 🚢 Deployment

### Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

### Environment Variables

Set in Vercel dashboard:
- `NEXT_PUBLIC_SOLANA_NETWORK`
- `NEXT_PUBLIC_SOLANA_RPC_URL`
- `NEXT_PUBLIC_NFT_COLLECTION_ADDRESS`

---

## 📚 Resources

- [Next.js Docs](https://nextjs.org/docs)
- [chess.js](https://github.com/jhlywa/chess.js)
- [Solana Web3.js](https://solana-labs.github.io/solana-web3.js/)
- [TailwindCSS](https://tailwindcss.com/docs)

---

## 🤝 Contributing

This is a private project for Chess3 development.

---

## 📄 License

Proprietary - Chess3 Platform

---

**Built with 💜 for the Chess3 community**
