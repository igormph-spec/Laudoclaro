'use client'

import { useState } from 'react'

export default function Home() {
  const [laudo, setLaudo] = useState('')
  const [traducao, setTraducao] = useState('')
  const [loading, setLoading] = useState(false)

  async function traduzir() {
    if (!laudo.trim()) return
    setLoading(true)
    setTraducao('')
    try {
      const res = await fetch('/api/traduzir', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ laudo })
      })
      const data = await res.json()
      setTraducao(data.traducao)
    } catch (e) {
      setTraducao('Erro ao traduzir. Tente novamente.')
    }
    setLoading(false)
  }

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
        value={laudo}
        onChange={e => setLaudo(e.target.value)}
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
      <button
        onClick={traduzir}
        disabled={loading}
        style={{
          background: loading ? '#90cdf4' : '#2b6cb0',
          color: 'white',
          border: 'none',
          padding: '12px 32px',
          borderRadius: '8px',
          fontSize: '1rem',
          cursor: loading ? 'not-allowed' : 'pointer',
          marginBottom: '32px'
        }}>
        {loading ? 'Traduzindo...' : 'Traduzir Laudo'}
      </button>
      {traducao && (
        <div style={{
          width: '100%',
          maxWidth: '600px',
          background: 'white',
          padding: '24px',
          borderRadius: '8px',
          border: '1px solid #bee3f8',
          color: '#2d3748',
          lineHeight: '1.7',
          whiteSpace: 'pre-wrap'
        }}>
          {traducao}
        </div>
      )}
    </main>
  )
}
