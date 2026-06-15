'use client'

import { useState, useEffect } from 'react'
import { UserButton, useAuth } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'

interface HistoricoItem {
  id: string
  data: string
  resumo: string
  traducao: string
}

const HISTORICO_KEY = 'laudoclaro_historico'

function salvarHistorico(resumo: string, traducao: string) {
  const historico: HistoricoItem[] = JSON.parse(localStorage.getItem(HISTORICO_KEY) || '[]')
  const item: HistoricoItem = {
    id: Date.now().toString(),
    data: new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
    resumo: resumo.slice(0, 80) + (resumo.length > 80 ? '...' : ''),
    traducao
  }
  historico.unshift(item)
  localStorage.setItem(HISTORICO_KEY, JSON.stringify(historico.slice(0, 20)))
}

function carregarHistorico(): HistoricoItem[] {
  return JSON.parse(localStorage.getItem(HISTORICO_KEY) || '[]')
}

export default function Home() {
  const { isLoaded, isSignedIn } = useAuth()
  const router = useRouter()

  const [laudo, setLaudo] = useState('')
  const [traducao, setTraducao] = useState('')
  const [loading, setLoading] = useState(false)
  const [historico, setHistorico] = useState<HistoricoItem[]>([])
  const [itemSelecionado, setItemSelecionado] = useState<HistoricoItem | null>(null)
  const [usageCount, setUsageCount] = useState<number | null>(null)
  const [isPremium, setIsPremium] = useState(false)
  const [limiteAtingido, setLimiteAtingido] = useState(false)
  const FREE_LIMIT = 3

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push('/sign-in')
    }
  }, [isLoaded, isSignedIn, router])

  useEffect(() => {
    if (isSignedIn) {
      setHistorico(carregarHistorico())
    }
  }, [isSignedIn])

  if (!isLoaded || !isSignedIn) return null

  async function traduzir() {
    if (!laudo.trim()) return
    setLoading(true)
    setTraducao('')
    setItemSelecionado(null)
    try {
      const res = await fetch('/api/traduzir', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ laudo })
      })
      const data = await res.json()

      if (data.erro === 'limite_atingido') {
        setLimiteAtingido(true)
        setUsageCount(data.usageCount)
        setLoading(false)
        return
      }

      if (data.erro) {
        setTraducao('Erro: ' + data.erro)
        setLoading(false)
        return
      }

      setTraducao(data.traducao)
      setUsageCount(data.usageCount)
      setIsPremium(data.isPremium)
      salvarHistorico(laudo, data.traducao)
      setHistorico(carregarHistorico())
    } catch (e: any) {
      setTraducao('Erro de conexão: ' + e.message)
    }
    setLoading(false)
  }

  const usoRestante = usageCount !== null ? Math.max(0, FREE_LIMIT - usageCount) : null

  return (
    <main style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f5f0ff 0%, #e8f4fd 100%)',
      fontFamily: "'Segoe UI', system-ui, sans-serif"
    }}>
      {/* Header */}
      <header style={{
        background: 'white',
        borderBottom: '1px solid #e8edf5',
        padding: '12px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        boxShadow: '0 1px 8px rgba(108,155,210,0.08)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <svg width="32" height="32" viewBox="0 0 56 56" fill="none">
            <circle cx="28" cy="28" r="28" fill="#6c9bd2"/>
            <text x="28" y="36" textAnchor="middle" fontSize="22" fill="white">🩺</text>
          </svg>
          <span style={{ fontSize: '1.2rem', fontWeight: '700', color: '#2c3e6b' }}>LaudoClaro</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {!isPremium && usageCount !== null && (
            <span style={{
              fontSize: '0.8rem',
              color: usoRestante === 0 ? '#e74c3c' : '#6b7a99',
              background: usoRestante === 0 ? '#fdecea' : '#f0f4ff',
              padding: '4px 10px',
              borderRadius: '20px'
            }}>
              {usoRestante === 0 ? '⚠️ Limite atingido' : `${usoRestante} traduções restantes`}
            </span>
          )}
          {isPremium && (
            <span style={{ fontSize: '0.8rem', color: '#27ae60', background: '#eafaf1', padding: '4px 10px', borderRadius: '20px' }}>
              ✓ Premium
            </span>
          )}
          <UserButton afterSignOutUrl="/sign-in" />
        </div>
      </header>

      <div style={{ display: 'flex', minHeight: 'calc(100vh - 57px)' }}>
        {/* Sidebar - histórico */}
        {historico.length > 0 && (
          <aside style={{
            width: '260px',
            minWidth: '260px',
            background: 'white',
            borderRight: '1px solid #e8edf5',
            padding: '20px 0',
            overflowY: 'auto'
          }}>
            <p style={{ fontSize: '0.75rem', fontWeight: '700', color: '#9aa3b8', textTransform: 'uppercase', letterSpacing: '0.5px', padding: '0 16px 12px' }}>
              Histórico
            </p>
            {historico.map(item => (
              <button
                key={item.id}
                onClick={() => { setItemSelecionado(item); setTraducao(''); setLaudo('') }}
                style={{
                  width: '100%',
                  textAlign: 'left',
                  padding: '12px 16px',
                  border: 'none',
                  background: itemSelecionado?.id === item.id ? '#f0f4ff' : 'transparent',
                  borderLeft: itemSelecionado?.id === item.id ? '3px solid #6c9bd2' : '3px solid transparent',
                  cursor: 'pointer',
                  transition: 'background 0.15s'
                }}
              >
                <div style={{ fontSize: '0.75rem', color: '#9aa3b8', marginBottom: '4px' }}>{item.data}</div>
                <div style={{ fontSize: '0.85rem', color: '#3a4a6b', lineHeight: '1.4' }}>{item.resumo}</div>
              </button>
            ))}
          </aside>
        )}

        {/* Conteúdo principal */}
        <div style={{ flex: 1, padding: '40px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>

          {/* Cabeçalho da página */}
          <div style={{ textAlign: 'center', marginBottom: '32px', maxWidth: '560px' }}>
            <h1 style={{ fontSize: '1.8rem', fontWeight: '700', color: '#2c3e6b', margin: '0 0 8px 0' }}>
              Entenda seu laudo médico
            </h1>
            <p style={{ color: '#6b7a99', fontSize: '1rem', margin: 0 }}>
              Cole o texto de qualquer laudo — ressonância, tomografia, ultrassom, raio-x e mais — e receba uma explicação em linguagem simples.
            </p>
          </div>

          {/* Aviso de limite */}
          {limiteAtingido && (
            <div style={{
              width: '100%', maxWidth: '580px', marginBottom: '20px',
              background: '#fff8e1', border: '1.5px solid #f9ca24',
              borderRadius: '16px', padding: '20px 24px', textAlign: 'center'
            }}>
              <div style={{ fontSize: '1.5rem', marginBottom: '8px' }}>⭐</div>
              <h3 style={{ color: '#b8860b', margin: '0 0 8px', fontSize: '1rem' }}>Você usou suas 3 traduções gratuitas</h3>
              <p style={{ color: '#8a6914', fontSize: '0.9rem', margin: '0 0 16px' }}>
                Para continuar usando o LaudoClaro sem limites, entre em contato para ativar o plano premium.
              </p>
              <a
                href="mailto:contato@laudoclaro.com.br?subject=Quero o plano Premium"
                style={{
                  display: 'inline-block',
                  padding: '10px 24px',
                  background: '#f9ca24',
                  color: '#5a4000',
                  borderRadius: '10px',
                  fontWeight: '700',
                  textDecoration: 'none',
                  fontSize: '0.9rem'
                }}
              >
                Quero o plano Premium
              </a>
            </div>
          )}

          {/* Visualização do histórico selecionado */}
          {itemSelecionado && (
            <div style={{ width: '100%', maxWidth: '580px', marginBottom: '20px' }}>
              <button
                onClick={() => setItemSelecionado(null)}
                style={{ background: 'none', border: 'none', color: '#6c9bd2', cursor: 'pointer', fontSize: '0.9rem', marginBottom: '12px', padding: 0 }}
              >
                ← Nova tradução
              </button>
              <div style={{
                background: 'white', borderRadius: '20px', padding: '28px',
                boxShadow: '0 4px 24px rgba(108,155,210,0.12)', borderLeft: '5px solid #6c9bd2'
              }}>
                <div style={{ fontSize: '0.75rem', color: '#9aa3b8', marginBottom: '12px' }}>{itemSelecionado.data}</div>
                <h2 style={{ color: '#2c3e6b', fontSize: '1rem', fontWeight: '700', marginBottom: '16px' }}>✅ Explicação do laudo</h2>
                <div style={{ color: '#3a4a6b', lineHeight: '1.8', fontSize: '0.95rem', whiteSpace: 'pre-wrap' }}>
                  {itemSelecionado.traducao}
                </div>
              </div>
            </div>
          )}

          {/* Formulário principal */}
          {!itemSelecionado && (
            <>
              <div style={{
                width: '100%', maxWidth: '580px',
                background: 'white', borderRadius: '20px', padding: '28px',
                boxShadow: '0 4px 24px rgba(108,155,210,0.12)', marginBottom: '20px'
              }}>
                <label style={{ display: 'block', color: '#4a5580', fontWeight: '600', marginBottom: '10px', fontSize: '0.95rem' }}>
                  Cole o texto do seu laudo aqui:
                </label>
                <textarea
                  value={laudo}
                  onChange={e => setLaudo(e.target.value)}
                  placeholder="Ex: Discreta protrusão discal central em L4-L5, redução do sinal em T2 compatível com desidratação discal..."
                  rows={8}
                  style={{
                    width: '100%', padding: '14px', borderRadius: '12px',
                    border: '1.5px solid #d8e4f0', fontSize: '0.95rem',
                    color: '#2c3e6b', resize: 'vertical', outline: 'none',
                    boxSizing: 'border-box', lineHeight: '1.6'
                  }}
                />
                <button
                  onClick={traduzir}
                  disabled={loading || limiteAtingido}
                  style={{
                    width: '100%', marginTop: '16px', padding: '14px',
                    borderRadius: '12px', border: 'none',
                    background: (loading || limiteAtingido) ? '#b0c8e8' : 'linear-gradient(135deg, #6c9bd2, #4a7abf)',
                    color: 'white', fontSize: '1rem', fontWeight: '600',
                    cursor: (loading || limiteAtingido) ? 'not-allowed' : 'pointer',
                    transition: 'all 0.2s', letterSpacing: '0.3px'
                  }}
                >
                  {loading ? '⏳ Explicando seu laudo...' : '🔍 Explicar Laudo'}
                </button>
              </div>

              {traducao && (
                <div style={{
                  width: '100%', maxWidth: '580px',
                  background: 'white', borderRadius: '20px', padding: '28px',
                  boxShadow: '0 4px 24px rgba(108,155,210,0.12)', borderLeft: '5px solid #6c9bd2'
                }}>
                  <h2 style={{ color: '#2c3e6b', fontSize: '1rem', fontWeight: '700', marginBottom: '16px' }}>
                    ✅ Explicação do seu laudo
                  </h2>
                  <div style={{ color: '#3a4a6b', lineHeight: '1.8', fontSize: '0.95rem', whiteSpace: 'pre-wrap' }}>
                    {traducao}
                  </div>
                </div>
              )}
            </>
          )}

          <p style={{ color: '#b0b8cc', fontSize: '0.75rem', marginTop: '32px', textAlign: 'center' }}>
            ℹ️ Esta ferramenta não substitui a consulta médica · LaudoClaro © 2025
          </p>
        </div>
      </div>
    </main>
  )
}
