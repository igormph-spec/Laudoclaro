'use client'

import { useState, useEffect } from 'react'

type Stats = {
  totalUsuarios: number
  totalLeads: number
  totalCompradores: number
  totalLaudos: number
  creditosCirculando: number
  porPlano: { starter: number; familia: number; premium: number }
  ultimos: {
    email: string
    criadoEm: string
    plano: string | null
    laudos: number
    whatsapp: string | null
  }[]
}

const card = (titulo: string, valor: string | number, sub: string, cor: string, emoji: string) => (
  <div style={{
    background: 'white', borderRadius: '16px', padding: '22px 24px',
    boxShadow: '0 2px 12px rgba(108,155,210,0.1)',
    borderTop: `4px solid ${cor}`, flex: '1', minWidth: '140px'
  }}>
    <div style={{ fontSize: '1.6rem', marginBottom: '6px' }}>{emoji}</div>
    <div style={{ fontSize: '1.8rem', fontWeight: '800', color: '#2c3e6b', lineHeight: 1 }}>{valor}</div>
    <div style={{ fontSize: '0.82rem', fontWeight: '700', color: '#4a5580', marginTop: '6px' }}>{titulo}</div>
    <div style={{ fontSize: '0.75rem', color: '#9aa3b8', marginTop: '2px' }}>{sub}</div>
  </div>
)

export default function AdminPage() {
  const [senha, setSenha] = useState('')
  const [autenticado, setAutenticado] = useState(false)
  const [stats, setStats] = useState<Stats | null>(null)
  const [carregando, setCarregando] = useState(false)
  const [erro, setErro] = useState('')

  async function entrar(e: React.FormEvent) {
    e.preventDefault()
    setCarregando(true)
    setErro('')
    await buscarStats(senha)
    setCarregando(false)
  }

  async function buscarStats(secret: string) {
    try {
      const res = await fetch('/api/admin/stats', {
        headers: { 'x-admin-secret': secret }
      })
      if (res.status === 401) {
        setErro('Senha incorreta.')
        return
      }
      const data = await res.json()
      if (data.erro) { setErro(data.erro); return }
      setStats(data)
      setAutenticado(true)
      sessionStorage.setItem('admin_secret', secret)
    } catch {
      setErro('Erro de conexão.')
    }
  }

  // Recarregar automaticamente a cada 60s
  useEffect(() => {
    if (!autenticado) return
    const secret = sessionStorage.getItem('admin_secret') ?? ''
    const interval = setInterval(() => buscarStats(secret), 60000)
    return () => clearInterval(interval)
  }, [autenticado])

  // Tentar sessão salva ao abrir
  useEffect(() => {
    const saved = sessionStorage.getItem('admin_secret')
    if (saved) { setSenha(saved); buscarStats(saved) }
  }, [])

  const estilo: React.CSSProperties = {
    minHeight: '100dvh',
    background: 'linear-gradient(135deg, #f5f0ff 0%, #e8f4fd 100%)',
    fontFamily: "'Segoe UI', system-ui, sans-serif",
    padding: '32px 24px'
  }

  if (!autenticado) return (
    <main style={{ ...estilo, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{
        background: 'white', borderRadius: '20px', padding: '40px 36px',
        width: '100%', maxWidth: '360px',
        boxShadow: '0 4px 24px rgba(108,155,210,0.15)', textAlign: 'center'
      }}>
        <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>🔐</div>
        <h1 style={{ fontSize: '1.3rem', fontWeight: '700', color: '#2c3e6b', margin: '0 0 6px' }}>
          Painel Admin
        </h1>
        <p style={{ color: '#6b7a99', fontSize: '0.9rem', margin: '0 0 24px' }}>LaudoClaro</p>

        <form onSubmit={entrar}>
          <input
            type="password"
            value={senha}
            onChange={e => setSenha(e.target.value)}
            placeholder="Senha de acesso"
            required
            style={{
              width: '100%', padding: '12px 14px', borderRadius: '12px',
              border: '1.5px solid #d8e4f0', fontSize: '0.95rem',
              color: '#2c3e6b', outline: 'none', boxSizing: 'border-box',
              marginBottom: '12px'
            }}
          />
          {erro && (
            <p style={{ color: '#e74c3c', fontSize: '0.85rem', marginBottom: '10px' }}>⚠️ {erro}</p>
          )}
          <button
            type="submit"
            disabled={carregando}
            style={{
              width: '100%', padding: '13px', borderRadius: '12px', border: 'none',
              background: carregando ? '#b0c8e8' : 'linear-gradient(135deg, #6c9bd2, #4a7abf)',
              color: 'white', fontSize: '1rem', fontWeight: '600', cursor: 'pointer'
            }}
          >
            {carregando ? 'Verificando...' : 'Entrar'}
          </button>
        </form>
      </div>
    </main>
  )

  if (!stats) return (
    <main style={{ ...estilo, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p style={{ color: '#6b7a99' }}>Carregando...</p>
    </main>
  )

  const receita = stats.porPlano.starter * 19.90 + stats.porPlano.familia * 39.90 + stats.porPlano.premium * 79.90

  return (
    <main style={estilo}>
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '32px', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: '800', color: '#2c3e6b', margin: 0 }}>
              🩺 LaudoClaro — Painel Admin
            </h1>
            <p style={{ color: '#9aa3b8', fontSize: '0.8rem', margin: '4px 0 0' }}>
              Atualizado agora · recarrega automaticamente a cada 60s
            </p>
          </div>
          <button
            onClick={() => { sessionStorage.removeItem('admin_secret'); setAutenticado(false); setStats(null) }}
            style={{
              padding: '8px 16px', borderRadius: '10px', border: '1.5px solid #e0e8f5',
              background: 'white', color: '#6b7a99', fontSize: '0.85rem', cursor: 'pointer'
            }}
          >
            Sair
          </button>
        </div>

        {/* Cards de métricas */}
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginBottom: '24px' }}>
          {card('Usuários cadastrados', stats.totalUsuarios, 'total de contas', '#6c9bd2', '👥')}
          {card('Leads WhatsApp', stats.totalLeads, 'números coletados', '#27ae60', '📱')}
          {card('Compradores', stats.totalCompradores, 'pagamentos realizados', '#e67e22', '💳')}
          {card('Laudos traduzidos', stats.totalLaudos, 'uso total da IA', '#8e44ad', '🔍')}
        </div>

        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginBottom: '32px' }}>
          {card('Receita estimada', `R$ ${receita.toFixed(2).replace('.', ',')}`, 'soma dos planos comprados', '#c0392b', '💰')}
          {card('Créditos em circulação', stats.creditosCirculando, 'laudos pré-pagos não usados', '#2980b9', '🎫')}
          <div style={{
            background: 'white', borderRadius: '16px', padding: '22px 24px',
            boxShadow: '0 2px 12px rgba(108,155,210,0.1)',
            borderTop: '4px solid #4a7abf', flex: '1', minWidth: '140px'
          }}>
            <div style={{ fontSize: '1.6rem', marginBottom: '6px' }}>📊</div>
            <div style={{ fontSize: '0.82rem', fontWeight: '700', color: '#4a5580', marginBottom: '10px' }}>Vendas por plano</div>
            {(['starter', 'familia', 'premium'] as const).map(p => (
              <div key={p} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '6px' }}>
                <span style={{ color: '#6b7a99', textTransform: 'capitalize' }}>
                  {p === 'starter' ? '🔰 Starter' : p === 'familia' ? '👨‍👩‍👧 Família' : '🏆 Premium'}
                </span>
                <strong style={{ color: '#2c3e6b' }}>{stats.porPlano[p]}</strong>
              </div>
            ))}
          </div>
        </div>

        {/* Tabela últimos usuários */}
        <div style={{
          background: 'white', borderRadius: '16px', padding: '24px',
          boxShadow: '0 2px 12px rgba(108,155,210,0.1)', overflowX: 'auto'
        }}>
          <h2 style={{ fontSize: '1rem', fontWeight: '700', color: '#2c3e6b', margin: '0 0 18px' }}>
            Últimos 10 usuários cadastrados
          </h2>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #e8edf5' }}>
                {['E-mail', 'Cadastro', 'Plano', 'Laudos usados', 'WhatsApp'].map(h => (
                  <th key={h} style={{ textAlign: 'left', padding: '8px 10px', color: '#9aa3b8', fontWeight: '700', fontSize: '0.75rem', textTransform: 'uppercase' }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {stats.ultimos.map((u, i) => (
                <tr key={i} style={{ borderBottom: '1px solid #f0f4f8' }}>
                  <td style={{ padding: '10px 10px', color: '#2c3e6b' }}>{u.email}</td>
                  <td style={{ padding: '10px 10px', color: '#6b7a99', whiteSpace: 'nowrap' }}>{u.criadoEm}</td>
                  <td style={{ padding: '10px 10px' }}>
                    {u.plano
                      ? <span style={{ background: '#eaf5ff', color: '#2980b9', borderRadius: '20px', padding: '3px 10px', fontSize: '0.8rem', fontWeight: '600' }}>
                          {u.plano}
                        </span>
                      : <span style={{ color: '#c0c8d8', fontSize: '0.8rem' }}>gratuito</span>
                    }
                  </td>
                  <td style={{ padding: '10px 10px', color: '#6b7a99', textAlign: 'center' }}>{u.laudos}</td>
                  <td style={{ padding: '10px 10px', color: u.whatsapp ? '#27ae60' : '#c0c8d8', fontSize: '0.82rem' }}>
                    {u.whatsapp ?? '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>
    </main>
  )
}
