'use client'

import { useSignIn } from '@clerk/nextjs'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function SignInPage() {
  const { isLoaded, signIn, setActive } = useSignIn()
  const router = useRouter()

  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [erro, setErro] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!isLoaded) return
    setLoading(true)
    setErro('')
    try {
      const result = await signIn.create({ identifier: email, password: senha })
      if (result.status === 'complete') {
        await setActive({ session: result.createdSessionId })
        router.push('/')
      }
    } catch (err: any) {
      const msg = err?.errors?.[0]?.code
      if (msg === 'form_password_incorrect') setErro('Senha incorreta.')
      else if (msg === 'form_identifier_not_found') setErro('E-mail não encontrado.')
      else setErro('Erro ao entrar. Verifique seus dados.')
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
      justifyContent: 'center',
      padding: '24px',
      fontFamily: "'Segoe UI', system-ui, sans-serif"
    }}>
      {/* Logo */}
      <div style={{ textAlign: 'center', marginBottom: '28px' }}>
        <svg width="52" height="52" viewBox="0 0 56 56" fill="none" style={{ marginBottom: '12px' }}>
          <circle cx="28" cy="28" r="28" fill="#6c9bd2"/>
          <text x="28" y="36" textAnchor="middle" fontSize="22" fill="white">🩺</text>
        </svg>
        <h1 style={{ fontSize: '1.6rem', fontWeight: '700', color: '#2c3e6b', margin: '0 0 6px' }}>
          LaudoClaro
        </h1>
        <p style={{ color: '#6b7a99', fontSize: '0.95rem', margin: 0 }}>
          Entenda seu laudo médico em linguagem simples
        </p>
      </div>

      {/* Card */}
      <div style={{
        background: 'white',
        borderRadius: '20px',
        padding: '36px 32px',
        width: '100%',
        maxWidth: '400px',
        boxShadow: '0 4px 24px rgba(108,155,210,0.15)'
      }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#2c3e6b', margin: '0 0 6px' }}>
          Entrar na sua conta
        </h2>
        <p style={{ color: '#6b7a99', fontSize: '0.9rem', margin: '0 0 24px' }}>
          Bem-vindo de volta!
        </p>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', color: '#4a5580', fontWeight: '600', fontSize: '0.9rem', marginBottom: '6px' }}>
              E-mail
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="seu@email.com"
              required
              style={{
                width: '100%', padding: '12px 14px', borderRadius: '12px',
                border: '1.5px solid #d8e4f0', fontSize: '0.95rem',
                color: '#2c3e6b', outline: 'none', boxSizing: 'border-box'
              }}
            />
          </div>

          <div style={{ marginBottom: '8px' }}>
            <label style={{ display: 'block', color: '#4a5580', fontWeight: '600', fontSize: '0.9rem', marginBottom: '6px' }}>
              Senha
            </label>
            <input
              type="password"
              value={senha}
              onChange={e => setSenha(e.target.value)}
              placeholder="••••••••"
              required
              style={{
                width: '100%', padding: '12px 14px', borderRadius: '12px',
                border: '1.5px solid #d8e4f0', fontSize: '0.95rem',
                color: '#2c3e6b', outline: 'none', boxSizing: 'border-box'
              }}
            />
          </div>

          {erro && (
            <p style={{ color: '#e74c3c', fontSize: '0.85rem', margin: '8px 0 0' }}>⚠️ {erro}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%', marginTop: '20px', padding: '13px',
              borderRadius: '12px', border: 'none',
              background: loading ? '#b0c8e8' : 'linear-gradient(135deg, #6c9bd2, #4a7abf)',
              color: 'white', fontSize: '1rem', fontWeight: '600',
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        <p style={{ textAlign: 'center', color: '#6b7a99', fontSize: '0.9rem', marginTop: '20px', marginBottom: 0 }}>
          Não tem uma conta?{' '}
          <Link href="/sign-up" style={{ color: '#4a7abf', fontWeight: '600', textDecoration: 'none' }}>
            Cadastre-se grátis
          </Link>
        </p>
      </div>

      <p style={{ color: '#b0b8cc', fontSize: '0.75rem', marginTop: '24px', textAlign: 'center' }}>
        ℹ️ Esta ferramenta não substitui a consulta médica
      </p>
    </main>
  )
}
