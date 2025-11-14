'use client';

import dynamic from 'next/dynamic';

const ChessGame = dynamic(() => import('./ChessGame'), {
  ssr: false,
  loading: () => (
    <div className="text-center" style={{ color: '#a0a0a0', padding: '100px' }}>
      Loading chess board...
    </div>
  ),
});

export default function PlayPage() {
  return (
    <div 
      className="min-h-screen"
      style={{
        background: '#0a0a0a',
        position: 'relative'
      }}
    >
      {/* Gradient overlay */}
      <div 
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'radial-gradient(circle at 20% 50%, rgba(139, 92, 246, 0.15) 0%, transparent 50%), radial-gradient(circle at 80% 50%, rgba(16, 185, 129, 0.15) 0%, transparent 50%)',
          pointerEvents: 'none'
        }}
      />

      <main className="container mx-auto px-4 py-8 relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 
            className="text-4xl font-bold mb-2"
            style={{ 
              color: '#ffffff',
              fontFamily: 'var(--font-orbitron)'
            }}
          >
            Play Chess
          </h1>
          <p style={{ color: '#a0a0a0' }}>
            Make your move
          </p>
        </div>

        {/* Chess Game Component */}
        <ChessGame />
      </main>
    </div>
  );
}
