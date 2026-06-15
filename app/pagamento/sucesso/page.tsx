import Link from 'next/link'

export default function PagamentoSucesso() {
  return (
    <main style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f5f0ff 0%, #e8f4fd 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
      fontFamily: "'Segoe UI', system-ui, sans-serif"
    }}>
      <div style={{
        background: 'white',
        borderRadius: '24px',
        padding: '48px 40px',
        maxWidth: '420px',
        width: '100%',
        boxShadow: '0 8px 40px rgba(108,155,210,0.15)',
        textAlign: 'center'
      }}>
        <div style={{ fontSize: '3.5rem', marginBottom: '16px' }}>✅</div>
        <h1 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#2c3e6b', margin: '0 0 12px' }}>
          Pagamento confirmado!
        </h1>
        <p style={{ color: '#6b7a99', fontSize: '0.95rem', marginBottom: '32px', lineHeight: '1.6' }}>
          Seus <strong>20 laudos</strong> já estão disponíveis na sua conta. Pode começar a usar agora!
        </p>
        <Link href="/" style={{
          display: 'inline-block',
          padding: '14px 32px',
          background: 'linear-gradient(135deg, #6c9bd2, #4a7abf)',
          color: 'white',
          borderRadius: '12px',
          fontWeight: '700',
          textDecoration: 'none',
          fontSize: '1rem'
        }}>
          Usar o LaudoClaro →
        </Link>
      </div>
    </main>
  )
}
