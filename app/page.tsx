export default function Home() {
  return (
    <div 
      className="min-h-screen"
      style={{
        background: '#0a0a0a',
        position: 'relative'
      }}
    >
      {/* Animated gradient overlay */}
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
      
      <main className="container mx-auto px-4 py-16 relative z-10">
        {/* Header */}
        <div className="text-center mb-20">
          {/* Logo */}
          <div className="mb-8">
            <img 
              src="/logotransparent.png" 
              alt="Chess3 Logo" 
              className="mx-auto"
              style={{ 
                height: '180px',
                width: 'auto',
                filter: 'drop-shadow(0 0 40px rgba(139, 92, 246, 0.4))'
              }}
            />
          </div>
          
          <p 
            className="text-3xl font-bold mb-3" 
            style={{ 
              color: '#ffffff',
              fontFamily: 'var(--font-orbitron)'
            }}
          >
            The Future of Chess is P2E
          </p>
          <p className="text-xl mb-8" style={{ color: '#a0a0a0' }}>
            Play • Earn • Own | Powered by Solana
          </p>
        </div>

        {/* Feature Cards */}
        <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto mb-20">
          <div 
            className="rounded-xl p-8 border transition-all duration-300 hover:scale-105"
            style={{
              background: 'rgba(139, 92, 246, 0.05)',
              borderColor: 'rgba(139, 92, 246, 0.3)',
              backdropFilter: 'blur(10px)'
            }}
          >
            <div className="text-5xl mb-4">♟️</div>
            <h3 className="text-2xl font-bold mb-3" style={{ color: '#ffffff', fontFamily: 'var(--font-orbitron)' }}>Compete</h3>
            <p style={{ color: '#a0a0a0', lineHeight: '1.6' }}>
              Battle players worldwide in casual or ranked matches and exclusive tournaments
            </p>
          </div>

          <div 
            className="rounded-xl p-8 border transition-all duration-300 hover:scale-105"
            style={{
              background: 'rgba(16, 185, 129, 0.05)',
              borderColor: 'rgba(16, 185, 129, 0.3)',
              backdropFilter: 'blur(10px)'
            }}
          >
            <div className="text-5xl mb-4">🎨</div>
            <h3 className="text-2xl font-bold mb-3" style={{ color: '#ffffff', fontFamily: 'var(--font-orbitron)' }}>Collect</h3>
            <p style={{ color: '#a0a0a0', lineHeight: '1.6' }}>
              Own exclusive Chess3 NFTs and unlock P2E features
            </p>
          </div>

          <div 
            className="rounded-xl p-8 border transition-all duration-300 hover:scale-105"
            style={{
              background: 'rgba(139, 92, 246, 0.05)',
              borderColor: 'rgba(139, 92, 246, 0.3)',
              backdropFilter: 'blur(10px)'
            }}
          >
            <div className="text-5xl mb-4">💎</div>
            <h3 className="text-2xl font-bold mb-3" style={{ color: '#ffffff', fontFamily: 'var(--font-orbitron)' }}>Earn</h3>
            <p style={{ color: '#a0a0a0', lineHeight: '1.6' }}>
              Win tokens based on your skill and tournament performance
            </p>
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-20">
          <button 
            className="px-10 py-5 font-bold rounded-lg transition-all hover:scale-105"
            style={{
              background: 'linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)',
              color: '#ffffff',
              fontSize: '18px',
              boxShadow: '0 10px 40px rgba(139, 92, 246, 0.3)',
              border: 'none'
            }}
          >
            🔗 Connect Wallet
          </button>
          <a href="/play">
            <button 
              className="px-10 py-5 font-bold rounded-lg transition-all hover:scale-105"
              style={{
                background: 'transparent',
                color: '#ffffff',
                fontSize: '18px',
                border: '2px solid rgba(255, 255, 255, 0.2)'
              }}
            >
              ♟️ Play as Guest
            </button>
          </a>
        </div>

        {/* Footer */}
        <div className="text-center">
          <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full" style={{ background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
            <span style={{ color: '#10B981', fontSize: '20px' }}>⚡</span>
            <span style={{ color: '#a0a0a0' }}>Powered by</span>
            <span style={{ color: '#ffffff', fontWeight: 'bold' }}>Solana</span>
          </div>
        </div>
      </main>
    </div>
  );
}
