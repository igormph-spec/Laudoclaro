import { SignUp } from '@clerk/nextjs'

export default function SignUpPage() {
  return (
    <main style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f5f0ff 0%, #e8f4fd 100%)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
      fontFamily: "'Segoe UI', system-ui, sans-serif"
    }}>
      {/* Logo e título */}
      <div style={{ textAlign: 'center', marginBottom: '28px' }}>
        <svg width="52" height="52" viewBox="0 0 56 56" fill="none" style={{ marginBottom: '12px' }}>
          <circle cx="28" cy="28" r="28" fill="#6c9bd2"/>
          <text x="28" y="36" textAnchor="middle" fontSize="22" fill="white">🩺</text>
        </svg>
        <h1 style={{ fontSize: '1.6rem', fontWeight: '700', color: '#2c3e6b', margin: '0 0 6px' }}>
          LaudoClaro
        </h1>
        <p style={{ color: '#6b7a99', fontSize: '0.95rem', margin: 0 }}>
          Crie sua conta e entenda seu laudo médico gratuitamente
        </p>
      </div>

      <SignUp />

      <p style={{ color: '#b0b8cc', fontSize: '0.75rem', marginTop: '24px', textAlign: 'center' }}>
        ℹ️ Esta ferramenta não substitui a consulta médica
      </p>
    </main>
  )
}
