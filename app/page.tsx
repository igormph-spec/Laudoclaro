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

// ── PARCEIRO ─────────────────────────────────────────────────────────────────
// Troque os dados abaixo pelo parceiro real quando fechar o contrato.
const PARCEIRO = {
  logo: '💊',
  nome: 'Drogaria São Paulo',
  tagline: 'Medicamentos com até 40% de desconto',
  descricao: 'Apresente este QR ou use o link exclusivo LaudoClaro e ganhe desconto na sua primeira compra.',
  cta: 'Ver oferta exclusiva',
  url: 'https://www.drogariasaopaulo.com.br', // substituir pelo link de afiliado
  cor: '#1a7a3c',
}

function CardParceiro({ onDismiss }: { onDismiss: () => void }) {
  return (
    <div style={{
      width: '100%', maxWidth: '580px', marginTop: '16px',
      background: 'white', borderRadius: '16px', padding: '20px 24px',
      boxShadow: '0 2px 16px rgba(108,155,210,0.10)',
      border: '1px solid #e8edf5', position: 'relative'
    }}>
      {/* Label publicidade + fechar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
        <span style={{
          fontSize: '10px', fontWeight: '700', color: '#9aa3b8',
          textTransform: 'uppercase', letterSpacing: '0.8px',
          border: '1px solid #d8e4f0', padding: '2px 8px', borderRadius: '20px'
        }}>
          Parceiro
        </span>
        <button
          onClick={onDismiss}
          aria-label="Fechar anúncio"
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: '#b0b8cc', fontSize: '18px', lineHeight: 1, padding: '0 2px'
          }}
        >
          ×
        </button>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div style={{
          width: '52px', height: '52px', borderRadius: '14px', flexShrink: 0,
          background: '#f0f7ff', display: 'flex', alignItems: 'center',
          justifyContent: 'center', fontSize: '1.8rem'
        }}>
          {PARCEIRO.logo}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '0.8rem', color: '#9aa3b8', marginBottom: '2px' }}>{PARCEIRO.nome}</div>
          <div style={{ fontSize: '1rem', fontWeight: '700', color: '#2c3e6b', marginBottom: '4px', lineHeight: '1.3' }}>
            {PARCEIRO.tagline}
          </div>
          <div style={{ fontSize: '0.82rem', color: '#6b7a99', lineHeight: '1.5' }}>
            {PARCEIRO.descricao}
          </div>
        </div>
      </div>

      <a
        href={PARCEIRO.url}
        target="_blank"
        rel="noopener noreferrer sponsored"
        style={{
          display: 'block', marginTop: '16px', padding: '11px',
          borderRadius: '10px', textAlign: 'center',
          background: PARCEIRO.cor, color: 'white',
          fontSize: '0.9rem', fontWeight: '700', textDecoration: 'none',
          transition: 'opacity 0.15s'
        }}
        onMouseEnter={e => (e.currentTarget.style.opacity = '0.88')}
        onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
      >
        {PARCEIRO.cta} →
      </a>
    </div>
  )
}
// ─────────────────────────────────────────────────────────────────────────────

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
  const [planoSelecionado, setPlanoSelecionado] = useState<string | null>(null)

  // Assinatura
  const [plano, setPlano] = useState<string | null>(null)
  const [assinaturaStatus, setAssinaturaStatus] = useState<string | null>(null)

  // Histórico
  const [historico, setHistorico] = useState<HistoricoItem[]>([])
  const [itemSelecionado, setItemSelecionado] = useState<HistoricoItem | null>(null)

  // Publicidade nativa
  const [parceiroDismissed, setParceiroDismissed] = useState(false)

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
      setPlano(data.plano ?? null)
      setAssinaturaStatus(data.assinaturaStatus ?? null)
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

  const salvarTelefone = async (e: React.FormEvent) => {
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

  if (!whatsappSalvo) {
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
      setParceiroDismissed(false)
      salvarHistorico(laudo, data.traducao)
      setHistorico(carregarHistorico())
    } catch (e: any) {
      setErroTraducao('Erro de conexão. Verifique sua internet e tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  async function assinar(planoId: string) {
    setPlanoSelecionado(planoId)
    setIniciandoPagamento(true)
    try {
      const res = await fetch('/api/criar-assinatura', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plano: planoId })
      })
      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
      } else {
        alert('Erro ao iniciar assinatura:\n\n' + (data.erro || 'Resposta inesperada do servidor'))
      }
    } catch {
      alert('Erro de conexão. Tente novamente.')
    } finally {
      setIniciandoPagamento(false)
      setPlanoSelecionado(null)
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
          {assinaturaStatus === 'authorized' ? (
            <span style={{ fontSize: '0.8rem', color: '#27ae60', background: '#eafaf1', padding: '4px 10px', borderRadius: '20px' }}>
              ✓ Plano {plano === 'starter' ? 'Starter' : plano === 'familia' ? 'Família' : 'Premium'}
              {!isPremium && ` · ${credits} laudo${credits !== 1 ? 's' : ''}`}
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

          {/* Paywall — planos de assinatura */}
          {(semCreditos || erroTraducao === 'sem_creditos') && (
            <div style={{
              width: '100%', maxWidth: '680px', marginBottom: '24px',
              background: 'white', border: '1.5px solid #e8edf5',
              borderRadius: '20px', padding: '32px',
              boxShadow: '0 4px 24px rgba(108,155,210,0.12)'
            }}>
              <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                <div style={{ fontSize: '2rem', marginBottom: '10px' }}>🩺</div>
                <h3 style={{ color: '#2c3e6b', margin: '0 0 8px', fontSize: '1.15rem', fontWeight: '700' }}>
                  Escolha seu plano
                </h3>
                <p style={{ color: '#6b7a99', fontSize: '0.88rem', margin: 0, lineHeight: '1.6' }}>
                  Você usou seu laudo gratuito. Assine e continue entendendo seus exames toda semana.
                </p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginBottom: '20px' }}>
                {/* Plano Starter */}
                {(['starter', 'familia', 'premium'] as const).map((planoId) => {
                  const info = {
                    starter: { emoji: '🔰', nome: 'Starter', preco: 'R$ 19,90', periodo: '/mês', laudos: '5 laudos/mês', desc: 'Para uso eventual', destaque: false },
                    familia: { emoji: '👨‍👩‍👧', nome: 'Família', preco: 'R$ 39,90', periodo: '/mês', laudos: '20 laudos/mês', desc: 'O mais popular · 3 perfis', destaque: true },
                    premium: { emoji: '🏆', nome: 'Premium', preco: 'R$ 79,90', periodo: '/mês', laudos: 'Ilimitado', desc: 'Laudos sem limite + 5 perfis', destaque: false },
                  }[planoId]
                  const carregando = iniciandoPagamento && planoSelecionado === planoId
                  return (
                    <div key={planoId} style={{
                      border: info.destaque ? '2px solid #6c9bd2' : '1.5px solid #e0e8f5',
                      borderRadius: '16px', padding: '20px', textAlign: 'center',
                      position: 'relative', background: info.destaque ? '#f5f9ff' : 'white'
                    }}>
                      {info.destaque && (
                        <div style={{
                          position: 'absolute', top: '-11px', left: '50%', transform: 'translateX(-50%)',
                          background: '#6c9bd2', color: 'white', fontSize: '10px', fontWeight: '800',
                          padding: '3px 12px', borderRadius: '20px', whiteSpace: 'nowrap'
                        }}>
                          ⭐ MAIS POPULAR
                        </div>
                      )}
                      <div style={{ fontSize: '1.6rem', marginBottom: '6px' }}>{info.emoji}</div>
                      <div style={{ fontWeight: '800', color: '#2c3e6b', fontSize: '0.95rem', marginBottom: '4px' }}>{info.nome}</div>
                      <div style={{ fontSize: '1.4rem', fontWeight: '900', color: '#2c3e6b' }}>
                        {info.preco}<span style={{ fontSize: '0.75rem', fontWeight: '500', color: '#9aa3b8' }}>{info.periodo}</span>
                      </div>
                      <div style={{ color: '#6b7a99', fontSize: '0.8rem', margin: '8px 0 4px' }}>{info.laudos}</div>
                      <div style={{ color: '#9aa3b8', fontSize: '0.75rem', marginBottom: '14px' }}>{info.desc}</div>
                      <button
                        onClick={() => assinar(planoId)}
                        disabled={iniciandoPagamento}
                        style={{
                          width: '100%', padding: '10px', borderRadius: '10px', border: 'none',
                          background: iniciandoPagamento
                            ? '#b0c8e8'
                            : info.destaque
                              ? 'linear-gradient(135deg, #6c9bd2, #4a7abf)'
                              : '#eef3fb',
                          color: info.destaque && !iniciandoPagamento ? 'white' : '#4a7abf',
                          fontSize: '0.85rem', fontWeight: '700',
                          cursor: iniciandoPagamento ? 'not-allowed' : 'pointer'
                        }}
                      >
                        {carregando ? '⏳ Aguarde...' : 'Assinar'}
                      </button>
                    </div>
                  )
                })}
              </div>

              <p style={{ color: '#b0b8cc', fontSize: '0.72rem', textAlign: 'center', margin: 0 }}>
                Pagamento seguro via Mercado Pago · PIX, cartão ou boleto · Cancele quando quiser
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
                <>
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

                  {!parceiroDismissed && (
                    <CardParceiro onDismiss={() => setParceiroDismissed(true)} />
                  )}
                </>
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
