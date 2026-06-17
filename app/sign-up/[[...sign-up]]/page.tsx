'use client'

import { useSignUp } from '@clerk/nextjs'
import { useState } from 'react'
import Link from 'next/link'

export default function SignUpPage() {
  const { isLoaded, signUp, setActive } = useSignUp()

  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [mostrarSenha, setMostrarSenha] = useState(false)
  const [codigo, setCodigo] = useState('')
  const [etapa, setEtapa] = useState<'cadastro' | 'verificacao'>('cadastro')
  const [erro, setErro] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleCadastro(e: React.FormEvent) {
    e.preventDefault()
    if (!isLoaded) return
    if (senha.length < 8) {
      setErro('A senha deve ter pelo menos 8 caracteres.')
      return
    }
    setLoading(true)
    setErro('')
    try {
      await signUp.create({ emailAddress: email, password: senha })
      await signUp.prepareEmailAddressVerification({ strategy: 'email_code' })
      setEtapa('verificacao')
    } catch (err: any) {
      const code = err?.errors?.[0]?.code
      if (code === 'form_password_pwned')
        setErro('Essa senha é muito comum e pode ser facilmente descoberta. Tente uma combinação diferente — por exemplo: "Joao@2024" ou "Saude#minha7".')
      else if (code === 'form_identifier_exists')
        setErro('Este e-mail já tem uma conta. Use "Entrar" ou recupere sua senha.')
      else if (code === 'form_password_length_too_short')
        setErro('A senha deve ter pelo menos 8 caracteres.')
      else if (code === 'form_param_format_invalid')
        setErro('E-mail inválido. Verifique e tente novamente.')
      else
        setErro('Não foi possível criar a conta. Verifique os dados e tente novamente.')
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
        window.location.href = '/'
      }
    } catch (err: any) {
      const code = err?.errors?.[0]?.code
      if (code === 'form_code_incorrect')
        setErro('Código incorreto. Verifique o e-mail e tente novamente.')
      else if (code === 'verification_expired')
        setErro('Código expirado. Volte e tente criar a conta novamente.')
      else
        setErro('Erro ao verificar. Tente novamente.')
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
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      padding: '24px', fontFamily: "'Segoe UI', system-ui, sans-serif"
    }}>
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

              <div style={{ marginBottom: '4px' }}>
                <label style={{ display: 'block', color: '#4a5580', fontWeight: '600', fontSize: '0.9rem', marginBottom: '6px' }}>
                  Senha
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={mostrarSenha ? 'text' : 'password'}
                    value={senha}
                    onChange={e => { setSenha(e.target.value); setErro('') }}
                    placeholder="Mínimo 8 caracteres"
                    required
                    style={{ ...inputStyle, paddingRight: '48px' }}
                  />
                  <button
                    type="button"
                    onClick={() => setMostrarSenha(v => !v)}
                    style={{
                      position: 'absolute', right: '12px', top: '50%',
                      transform: 'translateY(-50%)', background: 'none',
                      border: 'none', cursor: 'pointer', color: '#9aa3b8',
                      fontSize: '0.85rem', padding: '4px'
                    }}
                  >
                    {mostrarSenha ? 'Ocultar' : 'Ver'}
                  </button>
                </div>
              </div>

              {/* Dicas de senha sempre visíveis */}
              <div style={{
                background: '#f5f9ff', borderRadius: '10px',
                padding: '10px 14px', marginTop: '10px',
                fontSize: '0.8rem', color: '#6b7a99', lineHeight: '1.7'
              }}>
                <strong style={{ color: '#4a5580' }}>Dicas para uma boa senha:</strong><br />
                ✓ Pelo menos 8 caracteres<br />
                ✓ Misture letras maiúsculas e minúsculas<br />
                ✓ Inclua um número ou símbolo (ex: @, #, !)<br />
                ✗ Evite: 12345678, senha123, seu nome ou data de nascimento
              </div>

              {erro && (
                <div style={{
                  background: '#fff3f3', border: '1px solid #f5c6cb',
                  borderRadius: '10px', padding: '12px 14px',
                  marginTop: '12px', color: '#c0392b',
                  fontSize: '0.85rem', lineHeight: '1.5'
                }}>
                  ⚠️ {erro}
                </div>
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
            <div style={{
              background: '#eafaf1', border: '1px solid #a9dfbf',
              borderRadius: '10px', padding: '12px 14px', marginBottom: '20px',
              fontSize: '0.88rem', color: '#1e8449', lineHeight: '1.5'
            }}>
              📧 Enviamos um código de 6 dígitos para <strong>{email}</strong>.
              Verifique também a caixa de spam.
            </div>

            <form onSubmit={handleVerificacao}>
              <div style={{ marginBottom: '8px' }}>
                <label style={{ display: 'block', color: '#4a5580', fontWeight: '600', fontSize: '0.9rem', marginBottom: '6px' }}>
                  Código de verificação
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  value={codigo}
                  onChange={e => { setCodigo(e.target.value.replace(/\D/g, '').slice(0, 6)); setErro('') }}
                  placeholder="000000"
                  required
                  maxLength={6}
                  style={{ ...inputStyle, fontSize: '1.5rem', letterSpacing: '0.5rem', textAlign: 'center' }}
                />
              </div>

              {erro && (
                <div style={{
                  background: '#fff3f3', border: '1px solid #f5c6cb',
                  borderRadius: '10px', padding: '12px 14px',
                  marginTop: '8px', color: '#c0392b',
                  fontSize: '0.85rem', lineHeight: '1.5'
                }}>
                  ⚠️ {erro}
                </div>
              )}

              <button type="submit" disabled={loading || codigo.length < 6} style={btnStyle(loading || codigo.length < 6)}>
                {loading ? 'Verificando...' : 'Confirmar e entrar'}
              </button>
            </form>

            <button
              onClick={() => { setEtapa('cadastro'); setErro(''); setCodigo('') }}
              style={{
                width: '100%', marginTop: '12px', padding: '10px',
                borderRadius: '12px', border: '1.5px solid #d8e4f0',
                background: 'white', color: '#6b7a99', fontSize: '0.9rem', cursor: 'pointer'
              }}
            >
              ← Voltar e corrigir os dados
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
