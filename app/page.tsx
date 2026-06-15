'use client'

import { useState, useEffect, useCallback } from 'react'
import { UserButton, useAuth } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'

const FREE_LIMIT = 1 // 1º laudo gratuito

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

function formatarTelefone(valor: string): string {
  const digits = valor.replace(/\D/g, '').slice(0, 11)
  if (digits.length <= 2) return digits.length ? `(${digits}` : ''
  if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`
}

export default function Home() {
  const { isLoaded, isSignedIn } = useAuth()
  const router = useRouter()

  // Perfil
  const [usageCount, setUsageCount] = useState(0)
  const [credits, setCredits] = useState(0)
  const [isPremium, setIsPremium] = useState(false)
  const [whatsappSalvo, setWhatsappSalvo] = useState<string | null>(null)
  const [perfilCarregado, setPerfilCarregado] = useState(false)

  // Captura de telefone
  const [telefone, setTelefone] = useState('')
  const [telefoneErro, setTelefoneErro] = useState('')
  const [salvandoTelefone, setSalvandoTelefone] = useState(false)

  // Tradução
  const [laudo, setLaudo] = useState('')
  const [traducao, setTraducao] = useState('')
  const [loading, setLoading] = useState(false)
  const [erroTraducao, setErroTraducao] = useState('')

  // Pagamento
  const [iniciandoPagamento, setIniciandoPagamento] = useState(false)

  // Histórico
  const [historico, setHistorico] = useState<HistoricoItem[]>([])
  const [itemSelecionado, setItemSelecionado] = useState<HistoricoItem | null>(null)

  useEffect(() => {
    if (isLoaded && !isSignedIn) router.push('/sign-in')
  }, [isLoaded, isSignedIn, router])

  const carregarPerfil = useCallback(async () => {
    try {
      const res = await fetch('/api/perfil')
      if (!res.ok) return
      const data = await res.json()
      setUsageCount(data.usageCount ?? 0)
      setCredits(data.credits ?? 0)
      setIsPremium(data.isPremium ?? false)
      setWhatsappSalvo(data.whatsapp ?? null)
    } finally {
      setPerfilCarregado(true)
    }
  }, [])

  useEffect(() => {
    if (isSignedIn) {
      carregarPerfil()
      setHistorico(carregarHistorico())
    }
  }, [isSignedIn, carregarPerfil])

  if (!isLoaded || !isSignedIn || !perfilCarregado) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #f5f0ff 0%, #e8f4fd 100%)' }}>
        <div style={{ textAlign: 'center', color: '#6b7a99' }}>
          <div style={{ fontSize: '2rem', marginBottom: '12px' }}>🩺</div>
          <p>Carregando...</p>
        </div>
      </div>
    )
  }

  // Tela de captura de WhatsApp
  if (!whatsappSalvo) {
    async function salvarTelefone(e: React.FormEvent) {
      e.preventDefault()
      setTelefoneErro('')
      setSalvandoTelefone(true)
      try {
        const res = await fetch('/api/salvar-telefone', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ whatsapp: telefone })
        })
        const data = await res.json()
        if (data.erro) {
          setTelefoneErro(data.erro)
        } else {
          setWhatsappSalvo(data.whatsapp)
        }
      } catch {
        setTelefoneErro('Erro de conexão. Tente novamente.')
      }
      setSalvandoTelefone(false)
    }

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
          background: 'white', borderRadius: '24px', padding: '40px 36px',
          maxWidth: '420px', width: '100%',
          boxShadow: '0 8px 40px rgba(108,155,210,0.15)', textAlign: 'center'
        }}>
          <div style={{ fontSize: '3rem', marginBottom: '16px' }}>📱</div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#2c3e6b', margin: '0 0 10px' }}>
            Antes de começar
          </h1>
          <p style={{ color: '#6b7a99', fontSize: '0.95rem', marginBottom: '28px', lineHeight: '1.6' }}>
            Informe seu número de WhatsApp para acessar o LaudoClaro.
          </p>
          <form onSubmit={salvarTelefone}>
            <div style={{ position: 'relative', marginBottom: '8px' }}>
              <span style={{
                position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)',
                color: '#9aa3b8', fontSize: '0.95rem', pointerEvents: 'none'
              }}>🇧🇷</span>
              <input
                type="tel"
                value={telefone}
                onChange={e => setTelefone(formatarTelefone(e.target.value))}
                placeholder="(XX) 9XXXX-XXXX"
                required
                style={{
                  width: '100%', padding: '14px 14px 14px 40px', borderRadius: '12px',
                  border: telefoneErro ? '1.5px solid #e74c3c' : '1.5px solid #d8e4f0',
                  fontSize: '1rem', color: '#2c3e6b', outline: 'none',
                  boxSizing: 'border-box', letterSpacing: '0.5px'
                }}
              />
            </div>
            {telefoneErro && (
              <p style={{ color: '#e74c3c', fontSize: '0.85rem', margin: '0 0 12px', textAlign: 'left' }}>
                ⚠️ {telefoneErro}
              </p>
            )}
            <button
              type="submit"
              disabled={salvandoTelefone || telefone.replace(/\D/g, '').length < 11}
              style={{
                width: '100%', padding: '14px', borderRadius: '12px', border: 'none',
                background: salvandoTelefone || telefone.replace(/\D/g, '').length < 11
                  ? '#b0c8e8' : 'linear-gradient(135deg, #6c9bd2, #4a7abf)',
                color: 'white', fontSize: '1rem', fontWeight: '600',
                cursor: salvandoTelefone || telefone.replace(/\D/g, '').length < 11 ? 'not-allowed' : 'pointer',
                marginTop: '8px'
              }}
            >
              {salvandoTelefone ? 'Salvando...' : 'Acessar o LaudoClaro →'}
            </button>
          </form>
          <p style={{ color: '#b0b8cc', fontSize: '0.75rem', marginTop: '20px' }}>
            Seus dados são protegidos e não serão compartilhados.
          </p>
        </div>
      </main>
    )
  }

  async function traduzir() {
    if (!laudo.trim() || loading) return
    setLoading(true)
    setTraducao('')
    setErroTraducao('')
    setItemSelecionado(null)
    try {
      const res = await fetch('/api/traduzir', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ laudo })
      })
      const data = await res.json()

      if (data.erro === 'sem_creditos') {
        setErroTraducao('sem_creditos')
        return
      }
      if (data.erro) {
        setErroTraducao('Erro: ' + data.erro)
        return
      }

      setTraducao(data.traducao)
      setUsageCount(data.usageCount)
      setCredits(data.credits)
      setIsPremium(data.isPremium)
      salvarHistorico(laudo, data.traducao)
      setHistorico(carregarHistorico())
    } catch (e: any) {
      setErroTraducao('Erro de conexão. Verifique sua internet e tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  async function comprar() {
    setIniciandoPagamento(true)
    try {
      const res = await fetch('/api/criar-pagamento', { method: 'POST' })
      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
      } else {
        alert('Erro ao iniciar pagamento. Tente novamente.')
      }
    } catch {
      alert('Erro de conexão. Tente novamente.')
    } finally {
      setIniciandoPagamento(false)
    }
  }

  const semCreditos = !isPremium && usageCount >= FREE_LIMIT && credits <= 0
  const laudosRestantes = isPremium ? '∞' : usageCount === 0 ? '1 gratuito' : `${credits} crédito${credits !== 1 ? 's' : ''}`

  return (
    <main style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f5f0ff 0%, #e8f4fd 100%)',
      fontFamily: "'Segoe UI', system-ui, sans-serif"
    }}>
      {/* Header */}
      <header style={{
        background: 'white', borderBottom: '1px solid #e8edf5',
        padding: '12px 24px', display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', boxShadow: '0 1px 8px rgba(108,155,210,0.08)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <svg width="32" height="32" viewBox="0 0 56 56" fill="none">
            <circle cx="28" cy="28" r="28" fill="#6c9bd2"/>
            <text x="28" y="36" textAnchor="middle" fontSize="22" fill="white">🩺</text>
          </svg>
          <span style={{ fontSize: '1.2rem', fontWeight: '700', color: '#2c3e6b' }}>LaudoClaro</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {isPremium ? (
            <span style={{ fontSize: '0.8rem', color: '#27ae60', background: '#eafaf1', padding: '4px 10px', borderRadius: '20px' }}>
              ✓ Premium
            </span>
          ) : (
            <span style={{
              fontSize: '0.8rem',
              color: semCreditos ? '#e74c3c' : '#6b7a99',
              background: semCreditos ? '#fdecea' : '#f0f4ff',
              padding: '4px 10px', borderRadius: '20px'
            }}>
              {semCreditos ? '⚠️ Sem créditos' : `${laudosRestantes} disponível${credits !== 1 ? 'eis' : ''}`}
            </span>
          )}
          <UserButton afterSignOutUrl="/sign-in" />
        </div>
      </header>

      <div style={{ display: 'flex', minHeight: 'calc(100vh - 57px)' }}>
        {/* Sidebar histórico */}
        {historico.length > 0 && (
          <aside style={{
            width: '260px', minWidth: '260px', background: 'white',
            borderRight: '1px solid #e8edf5', padding: '20px 0', overflowY: 'auto'
          }}>
            <p style={{ fontSize: '0.75rem', fontWeight: '700', color: '#9aa3b8', textTransform: 'uppercase', letterSpacing: '0.5px', padding: '0 16px 12px' }}>
              Histórico
            </p>
            {historico.map(item => (
              <button
                key={item.id}
                onClick={() => { setItemSelecionado(item); setTraducao(''); setLaudo(''); setErroTraducao('') }}
                style={{
                  width: '100%', textAlign: 'left', padding: '12px 16px', border: 'none',
                  background: itemSelecionado?.id === item.id ? '#f0f4ff' : 'transparent',
                  borderLeft: itemSelecionado?.id === item.id ? '3px solid #6c9bd2' : '3px solid transparent',
                  cursor: 'pointer', transition: 'background 0.15s'
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

          <div style={{ textAlign: 'center', marginBottom: '32px', maxWidth: '560px' }}>
            <h1 style={{ fontSize: '1.8rem', fontWeight: '700', color: '#2c3e6b', margin: '0 0 8px 0' }}>
              Entenda seu laudo médico
            </h1>
            <p style={{ color: '#6b7a99', fontSize: '1rem', margin: 0 }}>
              Cole o texto de qualquer laudo — ressonância, tomografia, ultrassom, raio-x, exames laboratoriais e mais.
            </p>
          </div>

          {/* Paywall */}
          {(semCreditos || erroTraducao === 'sem_creditos') && (
            <div style={{
              width: '100%', maxWidth: '580px', marginBottom: '24px',
              background: 'white', border: '1.5px solid #e8edf5',
              borderRadius: '20px', padding: '32px', textAlign: 'center',
              boxShadow: '0 4px 24px rgba(108,155,210,0.12)'
            }}>
              <div style={{ fontSize: '2rem', marginBottom: '12px' }}>🩺</div>
              <h3 style={{ color: '#2c3e6b', margin: '0 0 8px', fontSize: '1.15rem', fontWeight: '700' }}>
                Continue usando o LaudoClaro
              </h3>
              <p style={{ color: '#6b7a99', fontSize: '0.9rem', margin: '0 0 8px', lineHeight: '1.6' }}>
                Você usou seu laudo gratuito. Para continuar, adquira um pacote de créditos.
              </p>
              <div style={{
                background: 'linear-gradient(135deg, #f5f0ff, #e8f4fd)',
                borderRadius: '14px', padding: '20px', margin: '20px 0'
              }}>
                <div style={{ fontSize: '1.8rem', fontWeight: '800', color: '#2c3e6b', marginBottom: '4px' }}>
                  R$ 39,90
                </div>
                <div style={{ color: '#6b7a99', fontSize: '0.9rem' }}>20 laudos · sem prazo de validade</div>
              </div>
              <button
                onClick={comprar}
                disabled={iniciandoPagamento}
                style={{
                  width: '100%', padding: '14px', borderRadius: '12px', border: 'none',
                  background: iniciandoPagamento ? '#b0c8e8' : 'linear-gradient(135deg, #6c9bd2, #4a7abf)',
                  color: 'white', fontSize: '1rem', fontWeight: '700',
                  cursor: iniciandoPagamento ? 'not-allowed' : 'pointer'
                }}
              >
                {iniciandoPagamento ? '⏳ Redirecionando...' : '💳 Comprar 20 laudos'}
              </button>
              <p style={{ color: '#b0b8cc', fontSize: '0.75rem', marginTop: '12px' }}>
                Pagamento seguro via Mercado Pago · PIX, cartão ou boleto
              </p>
            </div>
          )}

          {/* Histórico selecionado */}
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

          {/* Formulário */}
          {!itemSelecionado && (
            <>
              <div style={{
                width: '100%', maxWidth: '580px', background: 'white',
                borderRadius: '20px', padding: '28px',
                boxShadow: '0 4px 24px rgba(108,155,210,0.12)', marginBottom: '20px'
              }}>
                <label style={{ display: 'block', color: '#4a5580', fontWeight: '600', marginBottom: '10px', fontSize: '0.95rem' }}>
                  Cole o texto do seu laudo aqui:
                </label>
                <textarea
                  value={laudo}
                  onChange={e => setLaudo(e.target.value)}
                  placeholder="Ex: Hemograma completo — Hemácias: 4,5 M/µL | Leucócitos: 8.200/µL..."
                  rows={8}
                  disabled={semCreditos}
                  style={{
                    width: '100%', padding: '14px', borderRadius: '12px',
                    border: '1.5px solid #d8e4f0', fontSize: '0.95rem',
                    color: '#2c3e6b', resize: 'vertical', outline: 'none',
                    boxSizing: 'border-box', lineHeight: '1.6',
                    background: semCreditos ? '#f8f9fb' : 'white'
                  }}
                />
                <button
                  onClick={traduzir}
                  disabled={loading || semCreditos || !laudo.trim()}
                  style={{
                    width: '100%', marginTop: '16px', padding: '14px',
                    borderRadius: '12px', border: 'none',
                    background: (loading || semCreditos || !laudo.trim()) ? '#b0c8e8' : 'linear-gradient(135deg, #6c9bd2, #4a7abf)',
                    color: 'white', fontSize: '1rem', fontWeight: '600',
                    cursor: (loading || semCreditos || !laudo.trim()) ? 'not-allowed' : 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  {loading ? '⏳ Explicando seu laudo...' : '🔍 Explicar Laudo'}
                </button>
              </div>

              {erroTraducao && erroTraducao !== 'sem_creditos' && (
                <div style={{
                  width: '100%', maxWidth: '580px', marginBottom: '20px',
                  background: '#fdecea', border: '1px solid #f5c6cb',
                  borderRadius: '12px', padding: '16px',
                  color: '#c0392b', fontSize: '0.9rem'
                }}>
                  ⚠️ {erroTraducao}
                </div>
              )}

              {traducao && (
                <div style={{
                  width: '100%', maxWidth: '580px', background: 'white',
                  borderRadius: '20px', padding: '28px',
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
