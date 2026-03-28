export default function Home() {
  return (
    <main style={{
      minHeight: '100vh',
      background: '#f0f4f8',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      fontFamily: 'sans-serif'
    }}>
      <h1 style={{ color: '#1a365d', fontSize: '2rem', marginBottom: '8px' }}>
        LaudoClaro
      </h1>
      <p style={{ color: '#4a5568', marginBottom: '32px' }}>
        Entenda seu laudo de ressonância em linguagem simples
      </p>
      <textarea
        placeholder="Cole aqui o texto do seu laudo de ressonância..."
        style={{
          width: '100%',
          maxWidth: '600px',
          height: '200px',
          padding: '16px',
          borderRadius: '8px',
          border: '1px solid #cbd5e0',
          fontSize: '1rem',
          marginBottom: '16px'
        }}
      />
      <button style={{
        background: '#2b6cb0',
        color: 'white',
        border: 'none',
        padding: '12px 32px',
        borderRadius: '8px',
        fontSize: '1rem',
        cursor: 'pointer'
      }}>
        Traduzir Laudo
      </button>
    </main>
  )
}
