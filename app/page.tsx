'use client'

import { useState, useEffect } from 'react'
import { UserButton, useAuth } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'


export default function Home() {
    const { isLoaded, isSignedIn } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push('/sign-in')
    }
  }, [isLoaded, isSignedIn, router])

  if (!isLoaded || !isSignedIn) return null

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
      if (data.erro) {
        setTraducao('Erro da API: ' + data.erro)
        setLoading(false)
        return
      }
      setTraducao(data.traducao)
    } catch (e: any) {
      setTraducao('Erro: ' + e.message)
    }
    setLoading(false)
  }

  return (
    <main style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f5f0ff 0%, #e8f4fd 100%)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '40px 20px',
      fontFamily: "'Segoe UI', sans-serif"
    }}>

      {/* Header com botão de usuário */}
      <div style={{
        width: '100%',
        maxWidth: '620px',
        display: 'flex',
        justifyContent: 'flex-end',
        marginBottom: '16px'
      }}>
        <UserButton afterSignOutUrl="/sign-in" />
      </div>

      {/* Logo */}
      <div style={{ marginBottom: '8px' }}>
        <svg width="56" height="56" viewBox="0 0 56 56" fill="none">
          <circle cx="28" cy="28" r="28" fill="#6c9bd2"/>
          <text x="28" y="36" textAnchor="middle" fontSize="26" fill="white">🩻</text>
        </svg>
      </div>

      <h1 style={{
        fontSize: '2rem',
        fontWeight: '700',
        color: '#2c3e6b',
        margin: '0 0 4px 0',
        letterSpacing: '-0.5px'
      }}>
        LaudoClaro
      </h1>

      <p style={{
        color: '#6b7a99',
        fontSize: '1rem',
        marginBottom: '8px',
        textAlign: 'center'
      }}>
        Entenda seu laudo de ressonância em linguagem simples
      </p>

      <p style={{
        color: '#9aa3b8',
        fontSize: '0.8rem',
        marginBottom: '32px',
        textAlign: 'center',
        maxWidth: '360px'
      }}>
        ℹ️ Esta ferramenta não substitui a consulta médica
      </p>

      {/* Card principal */}
      <div style={{
        width: '100%',
        maxWidth: '620px',
        background: 'white',
        borderRadius: '20px',
        padding: '28px',
        boxShadow: '0 4px 24px rgba(108,155,210,0.12)',
        marginBottom: '20px'
      }}>
        <label style={{
          display: 'block',
          color: '#4a5580',
          fontWeight: '600',
          marginBottom: '10px',
          fontSize: '0.95rem'
        }}>
          Cole o texto do seu laudo aqui:
        </label>
        <textarea
          value={laudo}
          onChange={e => setLaudo(e.target.value)}
          placeholder="Ex: Discreta protrusão discal central em L4-L5..."
          rows={7}
          style={{
            width: '100%',
            padding: '14px',
            borderRadius: '12px',
            border: '1.5px solid #d8e4f0',
            fontSize: '0.95rem',
            color: '#2c3e6b',
            resize: 'vertical',
            outline: 'none',
            boxSizing: 'border-box',
            lineHeight: '1.6'
          }}
        />

        <button
          onClick={traduzir}
          disabled={loading}
          style={{
            width: '100%',
            marginTop: '16px',
            padding: '14px',
            borderRadius: '12px',
            border: 'none',
            background: loading
              ? '#b0c8e8'
              : 'linear-gradient(135deg, #6c9bd2, #4a7abf)',
            color: 'white',
            fontSize: '1rem',
            fontWeight: '600',
            cursor: loading ? 'not-allowed' : 'pointer',
            transition: 'all 0.2s',
            letterSpacing: '0.3px'
          }}>
          {loading ? '⏳ Traduzindo seu laudo...' : '🔍 Traduzir Laudo'}
        </button>
      </div>

      {/* Resultado */}
      {traducao && (
        <div style={{
          width: '100%',
          maxWidth: '620px',
          background: 'white',
          borderRadius: '20px',
          padding: '28px',
          boxShadow: '0 4px 24px rgba(108,155,210,0.12)',
          borderLeft: '5px solid #6c9bd2'
        }}>
          <h2 style={{
            color: '#2c3e6b',
            fontSize: '1rem',
            fontWeight: '700',
            marginBottom: '16px'
          }}>
            ✅ Tradução do seu laudo
          </h2>
          <div style={{
            color: '#3a4a6b',
            lineHeight: '1.8',
            fontSize: '0.95rem',
            whiteSpace: 'pre-wrap'
          }}>
            {traducao}
          </div>
        </div>
      )}

      <p style={{
        color: '#b0b8cc',
        fontSize: '0.75rem',
        marginTop: '32px',
        textAlign: 'center'
      }}>
        LaudoClaro © 2025 · Não é um serviço médico
      </p>
    </main>
  )
}
