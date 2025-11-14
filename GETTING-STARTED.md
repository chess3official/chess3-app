# Chess3 Custom Platform - Getting Started

## 🎉 Your Dev Server is Running!

**URL:** http://localhost:3000

---

## 🎨 What You're Seeing

The Chess3 homepage with:
- 💜 **Purple/Green Gradient** - Chess3 brand colors
- ♟️ **Play Chess** - Feature card
- 🎨 **NFT Ownership** - Feature card  
- 💰 **Earn Tokens** - Feature card
- 🔘 **Connect Wallet** - CTA button
- 🎮 **Play as Guest** - CTA button

---

## 🛠️ Development Commands

### Start Dev Server
```bash
npm run dev
```
Runs at http://localhost:3000

### Build for Production
```bash
npm run build
```

### Start Production Server
```bash
npm start
```

### Type Check
```bash
npm run type-check
```

### Lint Code
```bash
npm run lint
```

---

## 📁 Project Structure

```
chess3-app/
├── app/
│   ├── page.tsx          ← Homepage (what you see now)
│   ├── layout.tsx        ← Root layout
│   └── globals.css       ← Chess3 theme
├── components/           ← Create components here
├── lib/                  ← Business logic here
└── public/               ← Static assets
```

---

## 🎨 Using Chess3 Colors

### In Tailwind Classes
```tsx
<div className="bg-chess3-purple">
<div className="bg-chess3-green">
<div className="text-chess3-purple-dark">
```

### Gradients
```tsx
<div className="bg-gradient-to-br from-chess3-purple-dark to-chess3-green">
```

### CSS Variables
```css
color: var(--chess3-purple);
background: var(--chess3-green);
```

---

## 🚀 Next Steps

### 1. Create Chess Board Component
```bash
# Create component file
touch components/chess/Board.tsx
```

### 2. Add Solana Wallet
```bash
# Create wallet provider
touch components/solana/WalletProvider.tsx
```

### 3. Create Game Page
```bash
# Create game route
mkdir app/play
touch app/play/page.tsx
```

---

## 📚 Key Dependencies

- **chess.js** - Chess game logic
- **react-chessboard** - Interactive board
- **@solana/web3.js** - Blockchain
- **@solana/wallet-adapter-react** - Wallet connection

---

## 🔥 Hot Reload

The dev server has hot reload enabled. Any changes you make will automatically refresh in the browser!

Try editing `app/page.tsx` and watch it update instantly.

---

## 🌐 Multiple Servers

You now have TWO Chess3 instances running:

1. **Lichess Fork:** http://localhost:8080
   - Full chess platform
   - Production-ready
   - For quick launch

2. **Custom Platform:** http://localhost:3000
   - Modern Next.js app
   - Full control
   - Long-term solution

---

## 💡 Tips

- Use TypeScript for type safety
- Follow the component structure in CHESS3-PROJECT-GUIDE.md
- Test on mobile (responsive by default)
- Use Chess3 colors consistently

---

**Happy coding! 🚀♟️💜**
