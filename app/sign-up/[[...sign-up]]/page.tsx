'use client'

import { useSignUp } from '@clerk/nextjs'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function SignUpPage() {
  const { isLoaded, signUp, setActive } = useSignUp()
  const router = useRouter()

  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [codigo, setCodigo] = useState('')
  const [etapa, setEtapa] = useState<'cadastro' | 'verificacao'>('cadastro')
  const [erro, setErro] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleCadastro(e: React.FormEvent) {
    e.preventDefault()
    if (!isLoaded) return
    setLoading(true)
    setErro('')
    try {
      await signUp.create({ emailAddress: email, password: senha })
      await signUp.prepareEmailAddressVerification({ strategy: 'email_code' })
      setEtapa('verificacao')
    } catch (err: any) {
      const msg = err?.errors?.[0]?.code
      if (msg === 'form_password_pwned') setErro('Senha muito simples. Use letras, números e símbolos.')
      else if (msg === 'form_identifier_exists') setErro('Este e-mail já está cadastrado.')
      else if (msg === 'form_password_length_too_short') setErro('A senha deve ter pelo menos 8 caracteres.')
      else setErro('Erro ao criar conta. Verifique os dados.')
    }
    setLoading(false)
  }

  async function handleVerificacao(e: React.FormEvent) {
    e.preventDefault()
    if (!isLoaded) return
    setLoading(true)
    setErro('')
    try {
      const result = await signUp.attemptEmailAddressVerification({ code: codigo })
      if (result.status === 'complete') {
        await setActive({ session: result.createdSessionId })
        router.push('/')
      }
    } catch (err: any) {
      const msg = err?.errors?.[0]?.code
      if (msg === 'form_code_incorrect') setErro('Código incorreto. Verifique e tente novamente.')
      else if (msg === 'verification_expired') setErro('Código expirado. Volte e tente de novo.')
      else setErro('Erro ao verificar. Tente novamente.')
    }
    setLoading(false)
  }

  const inputStyle = {
    width: '100%', padding: '12px 14px', borderRadius: '12px',
    border: '1.5px solid #d8e4f0', fontSize: '0.95rem',
    color: '#2c3e6b', outline: 'none', boxSizing: 'border-box' as const
  }

  const btnStyle = (disabled: boolean) => ({
    width: '100%', marginTop: '20px', padding: '13px',
    borderRadius: '12px', border: 'none',
    background: disabled ? '#b0c8e8' : 'linear-gradient(135deg, #6c9bd2, #4a7abf)',
    color: 'white', fontSize: '1rem', fontWeight: '600' as const,
    cursor: disabled ? 'not-allowed' as const : 'pointer' as const
  })

  return (
    <main style={{
      minHeight: '100dvh',
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
          Crie sua conta e entenda seu laudo gratuitamente
        </p>
      </div>

      {/* Card */}
      <div style={{
        background: 'white', borderRadius: '20px', padding: '36px 32px',
        width: '100%', maxWidth: '400px',
        boxShadow: '0 4px 24px rgba(108,155,210,0.15)'
      }}>
        {etapa === 'cadastro' ? (
          <>
            <h2 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#2c3e6b', margin: '0 0 6px' }}>
              Criar conta grátis
            </h2>
            <p style={{ color: '#6b7a99', fontSize: '0.9rem', margin: '0 0 24px' }}>
              1 laudo gratuito para começar
            </p>

            <form onSubmit={handleCadastro}>
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
                  style={inputStyle}
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
                  placeholder="Mínimo 8 caracteres"
                  required
                  minLength={8}
                  style={inputStyle}
                />
              </div>

              {erro && (
                <p style={{ color: '#e74c3c', fontSize: '0.85rem', margin: '8px 0 0' }}>⚠️ {erro}</p>
              )}

              <button type="submit" disabled={loading} style={btnStyle(loading)}>
                {loading ? 'Criando conta...' : 'Criar conta grátis'}
              </button>
            </form>

            <p style={{ textAlign: 'center', color: '#6b7a99', fontSize: '0.9rem', marginTop: '20px', marginBottom: 0 }}>
              Já tem uma conta?{' '}
              <Link href="/sign-in" style={{ color: '#4a7abf', fontWeight: '600', textDecoration: 'none' }}>
                Entrar
              </Link>
            </p>
          </>
        ) : (
          <>
            <h2 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#2c3e6b', margin: '0 0 6px' }}>
              Confirme seu e-mail
            </h2>
            <p style={{ color: '#6b7a99', fontSize: '0.9rem', margin: '0 0 24px' }}>
              Enviamos um código de 6 dígitos para <strong>{email}</strong>
            </p>

            <form onSubmit={handleVerificacao}>
              <div style={{ marginBottom: '8px' }}>
                <label style={{ display: 'block', color: '#4a5580', fontWeight: '600', fontSize: '0.9rem', marginBottom: '6px' }}>
                  Código de verificação
                </label>
                <input
                  type="text"
                  value={codigo}
                  onChange={e => setCodigo(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="000000"
                  required
                  maxLength={6}
                  style={{ ...inputStyle, fontSize: '1.5rem', letterSpacing: '0.5rem', textAlign: 'center' }}
                />
              </div>

              {erro && (
                <p style={{ color: '#e74c3c', fontSize: '0.85rem', margin: '8px 0 0' }}>⚠️ {erro}</p>
              )}

              <button type="submit" disabled={loading || codigo.length < 6} style={btnStyle(loading || codigo.length < 6)}>
                {loading ? 'Verificando...' : 'Confirmar e entrar'}
              </button>
            </form>

            <button
              onClick={() => { setEtapa('cadastro'); setErro('') }}
              style={{ width: '100%', marginTop: '12px', padding: '10px', borderRadius: '12px', border: '1.5px solid #d8e4f0', background: 'white', color: '#6b7a99', fontSize: '0.9rem', cursor: 'pointer' }}
            >
              ← Voltar
            </button>
          </>
        )}
      </div>

      <p style={{ color: '#b0b8cc', fontSize: '0.75rem', marginTop: '24px', textAlign: 'center' }}>
        ℹ️ Esta ferramenta não substitui a consulta médica
      </p>
    </main>
  )
}
