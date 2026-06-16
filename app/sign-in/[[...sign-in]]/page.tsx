'use client'

import { useSignIn, useAuth } from '@clerk/nextjs'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

type Etapa = 'login' | 'reset_email' | 'reset_codigo'

const inputStyle = {
  width: '100%', padding: '12px 14px', borderRadius: '12px',
  border: '1.5px solid #d8e4f0', fontSize: '0.95rem',
  color: '#2c3e6b', outline: 'none', boxSizing: 'border-box' as const
}

const btnPrimario = (disabled: boolean) => ({
  width: '100%', marginTop: '20px', padding: '13px',
  borderRadius: '12px', border: 'none',
  background: disabled ? '#b0c8e8' : 'linear-gradient(135deg, #6c9bd2, #4a7abf)',
  color: 'white', fontSize: '1rem', fontWeight: '600',
  cursor: disabled ? 'not-allowed' : 'pointer'
} as const)

export default function SignInPage() {
  const { isLoaded, signIn, setActive } = useSignIn()
  const { isSignedIn } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (isSignedIn) window.location.href = '/'
  }, [isSignedIn])

  const [etapa, setEtapa] = useState<Etapa>('login')

  // Login
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')

  // Reset
  const [emailReset, setEmailReset] = useState('')
  const [codigoReset, setCodigoReset] = useState('')
  const [novaSenha, setNovaSenha] = useState('')
  const [confirmaSenha, setConfirmaSenha] = useState('')

  const [erro, setErro] = useState('')
  const [sucesso, setSucesso] = useState('')
  const [loading, setLoading] = useState(false)
  const [loginOk, setLoginOk] = useState(false)

  async function redirecionar() {
    await router.refresh()
    router.push('/')
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    if (!isLoaded) return
    setLoading(true)
    setErro('')
    try {
      const result = await signIn.create({ identifier: email, password: senha })
      if (result.status === 'complete') {
        await setActive({ session: result.createdSessionId })
        setLoginOk(true)
        await redirecionar()
        return
      }
    } catch (err: any) {
      const code = err?.errors?.[0]?.code
      if (code === 'form_password_incorrect') setErro('Senha incorreta. Use "Esqueci a senha" para redefinir.')
      else if (code === 'form_identifier_not_found') setErro('E-mail não encontrado. Verifique ou cadastre-se.')
      else if (code === 'too_many_requests') setErro('Muitas tentativas. Aguarde alguns minutos.')
      else if (code === 'session_exists') { setLoginOk(true); await redirecionar(); return }
      else setErro(err?.errors?.[0]?.message || 'Erro ao entrar. Verifique seus dados.')
    }
    setLoading(false)
  }

  async function handleEnviarCodigo(e: React.FormEvent) {
    e.preventDefault()
    if (!isLoaded) return
    setLoading(true)
    setErro('')
    try {
      await signIn.create({ strategy: 'reset_password_email_code', identifier: emailReset })
      setEtapa('reset_codigo')
      setSucesso(`Código enviado para ${emailReset}. Verifique sua caixa de entrada.`)
    } catch (err: any) {
      const code = err?.errors?.[0]?.code
      if (code === 'form_identifier_not_found') setErro('E-mail não encontrado.')
      else setErro(err?.errors?.[0]?.message || 'Erro ao enviar código.')
    }
    setLoading(false)
  }

  async function handleRedefinirSenha(e: React.FormEvent) {
    e.preventDefault()
    if (!isLoaded) return
    if (novaSenha !== confirmaSenha) {
      setErro('As senhas não coincidem.')
      return
    }
    if (novaSenha.length < 8) {
      setErro('A senha deve ter pelo menos 8 caracteres.')
      return
    }
    setLoading(true)
    setErro('')
    try {
      const result = await signIn.attemptFirstFactor({
        strategy: 'reset_password_email_code',
        code: codigoReset,
        password: novaSenha,
      })
      if (result.status === 'complete') {
        await setActive({ session: result.createdSessionId })
        setLoginOk(true)
        await redirecionar()
        return
      }
    } catch (err: any) {
      const code = err?.errors?.[0]?.code
      if (code === 'form_code_incorrect') setErro('Código incorreto. Verifique o e-mail e tente novamente.')
      else if (code === 'form_code_expired') setErro('Código expirado. Solicite um novo.')
      else setErro(err?.errors?.[0]?.message || 'Erro ao redefinir senha.')
    }
    setLoading(false)
  }

  function voltarParaLogin() {
    setEtapa('login')
    setErro('')
    setSucesso('')
    setCodigoReset('')
    setNovaSenha('')
    setConfirmaSenha('')
  }

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
          Entenda seu laudo médico em linguagem simples
        </p>
      </div>

      <div style={{
        background: 'white', borderRadius: '20px', padding: '36px 32px',
        width: '100%', maxWidth: '400px',
        boxShadow: '0 4px 24px rgba(108,155,210,0.15)'
      }}>

        {/* ── LOGIN OK — redirecionando ── */}
        {loginOk && (
          <div style={{ textAlign: 'center', padding: '12px 0' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '14px' }}>✅</div>
            <p style={{ color: '#1e8449', fontWeight: '700', fontSize: '1rem', marginBottom: '8px' }}>
              Login realizado com sucesso!
            </p>
            <p style={{ color: '#6b7a99', fontSize: '0.88rem', marginBottom: '20px' }}>
              Redirecionando...
            </p>
            <a href="/" style={{
              display: 'inline-block', padding: '12px 28px',
              background: 'linear-gradient(135deg, #6c9bd2, #4a7abf)',
              color: 'white', borderRadius: '12px', fontWeight: '700',
              textDecoration: 'none', fontSize: '0.95rem'
            }}>
              Entrar no aplicativo →
            </a>
          </div>
        )}

        {/* ── LOGIN ── */}
        {!loginOk && etapa === 'login' && (
          <>
            <h2 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#2c3e6b', margin: '0 0 6px' }}>
              Entrar na sua conta
            </h2>
            <p style={{ color: '#6b7a99', fontSize: '0.9rem', margin: '0 0 24px' }}>Bem-vindo de volta!</p>

            <form onSubmit={handleLogin}>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', color: '#4a5580', fontWeight: '600', fontSize: '0.9rem', marginBottom: '6px' }}>
                  E-mail
                </label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="seu@email.com" required style={inputStyle} />
              </div>

              <div style={{ marginBottom: '4px' }}>
                <label style={{ display: 'block', color: '#4a5580', fontWeight: '600', fontSize: '0.9rem', marginBottom: '6px' }}>
                  Senha
                </label>
                <input type="password" value={senha} onChange={e => setSenha(e.target.value)}
                  placeholder="••••••••" required style={inputStyle} />
              </div>

              <div style={{ textAlign: 'right', marginTop: '8px' }}>
                <button type="button" onClick={() => { setEmailReset(email); setEtapa('reset_email'); setErro('') }}
                  style={{ background: 'none', border: 'none', color: '#4a7abf', fontSize: '0.85rem', cursor: 'pointer', fontWeight: '600', padding: 0 }}>
                  Esqueci a senha
                </button>
              </div>

              {erro && (
                <p style={{ color: '#e74c3c', fontSize: '0.85rem', margin: '10px 0 0', lineHeight: '1.4' }}>⚠️ {erro}</p>
              )}

              <button type="submit" disabled={loading} style={btnPrimario(loading)}>
                {loading ? 'Entrando...' : 'Entrar'}
              </button>
            </form>

            <p style={{ textAlign: 'center', color: '#6b7a99', fontSize: '0.9rem', marginTop: '20px', marginBottom: 0 }}>
              Não tem uma conta?{' '}
              <Link href="/sign-up" style={{ color: '#4a7abf', fontWeight: '600', textDecoration: 'none' }}>
                Cadastre-se grátis
              </Link>
            </p>
          </>
        )}

        {/* ── RESET — digitar e-mail ── */}
        {!loginOk && etapa === 'reset_email' && (
          <>
            <button onClick={voltarParaLogin} style={{ background: 'none', border: 'none', color: '#6b7a99', fontSize: '0.85rem', cursor: 'pointer', padding: '0 0 16px', display: 'flex', alignItems: 'center', gap: '4px' }}>
              ← Voltar ao login
            </button>
            <h2 style={{ fontSize: '1.2rem', fontWeight: '700', color: '#2c3e6b', margin: '0 0 8px' }}>
              Redefinir senha
            </h2>
            <p style={{ color: '#6b7a99', fontSize: '0.88rem', margin: '0 0 24px', lineHeight: '1.5' }}>
              Informe seu e-mail e enviaremos um código para criar uma nova senha.
            </p>

            <form onSubmit={handleEnviarCodigo}>
              <label style={{ display: 'block', color: '#4a5580', fontWeight: '600', fontSize: '0.9rem', marginBottom: '6px' }}>
                E-mail cadastrado
              </label>
              <input type="email" value={emailReset} onChange={e => setEmailReset(e.target.value)}
                placeholder="seu@email.com" required style={inputStyle} />

              {erro && (
                <p style={{ color: '#e74c3c', fontSize: '0.85rem', margin: '10px 0 0' }}>⚠️ {erro}</p>
              )}

              <button type="submit" disabled={loading} style={btnPrimario(loading)}>
                {loading ? 'Enviando...' : 'Enviar código por e-mail'}
              </button>
            </form>
          </>
        )}

        {/* ── RESET — inserir código + nova senha ── */}
        {!loginOk && etapa === 'reset_codigo' && (
          <>
            <button onClick={() => { setEtapa('reset_email'); setErro(''); setSucesso('') }}
              style={{ background: 'none', border: 'none', color: '#6b7a99', fontSize: '0.85rem', cursor: 'pointer', padding: '0 0 16px', display: 'flex', alignItems: 'center', gap: '4px' }}>
              ← Reenviar código
            </button>
            <h2 style={{ fontSize: '1.2rem', fontWeight: '700', color: '#2c3e6b', margin: '0 0 8px' }}>
              Nova senha
            </h2>

            {sucesso && (
              <div style={{ background: '#eafaf1', border: '1px solid #a9dfbf', borderRadius: '10px', padding: '10px 14px', marginBottom: '20px', color: '#1e8449', fontSize: '0.85rem', lineHeight: '1.4' }}>
                ✅ {sucesso}
              </div>
            )}

            <form onSubmit={handleRedefinirSenha}>
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', color: '#4a5580', fontWeight: '600', fontSize: '0.9rem', marginBottom: '6px' }}>
                  Código recebido por e-mail
                </label>
                <input type="text" value={codigoReset} onChange={e => setCodigoReset(e.target.value.trim())}
                  placeholder="000000" required maxLength={6}
                  style={{ ...inputStyle, letterSpacing: '6px', fontSize: '1.2rem', textAlign: 'center' }} />
              </div>

              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', color: '#4a5580', fontWeight: '600', fontSize: '0.9rem', marginBottom: '6px' }}>
                  Nova senha
                </label>
                <input type="password" value={novaSenha} onChange={e => setNovaSenha(e.target.value)}
                  placeholder="Mínimo 8 caracteres" required style={inputStyle} />
              </div>

              <div style={{ marginBottom: '4px' }}>
                <label style={{ display: 'block', color: '#4a5580', fontWeight: '600', fontSize: '0.9rem', marginBottom: '6px' }}>
                  Confirmar nova senha
                </label>
                <input type="password" value={confirmaSenha} onChange={e => setConfirmaSenha(e.target.value)}
                  placeholder="Repita a senha" required style={inputStyle} />
              </div>

              {erro && (
                <p style={{ color: '#e74c3c', fontSize: '0.85rem', margin: '10px 0 0', lineHeight: '1.4' }}>⚠️ {erro}</p>
              )}

              <button type="submit" disabled={loading} style={btnPrimario(loading)}>
                {loading ? 'Redefinindo...' : 'Redefinir senha e entrar'}
              </button>
            </form>
          </>
        )}
      </div>

      <p style={{ color: '#b0b8cc', fontSize: '0.75rem', marginTop: '24px', textAlign: 'center' }}>
        ℹ️ Esta ferramenta não substitui a consulta médica
      </p>
    </main>
  )
}
