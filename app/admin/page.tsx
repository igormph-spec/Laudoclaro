'use client'

import { useState, useEffect } from 'react'

type UsuarioRow = {
  id: string
  email: string
  criadoEm: string
  plano: string | null
  laudos: number
  whatsapp: string | null
  isPremium: boolean
}

type Stats = {
  totalUsuarios: number
  totalLeads: number
  totalCompradores: number
  totalLaudos: number
  creditosCirculando: number
  porPlano: { starter: number; familia: number; premium: number }
  ultimos: UsuarioRow[]
}

function TabelaUsuarios({ usuarios, liberandoId, onToggle }: {
  usuarios: UsuarioRow[]
  liberandoId: string | null
  onToggle: (id: string, liberar: boolean) => void
}) {
  return (
    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
      <thead>
        <tr style={{ borderBottom: '2px solid #e8edf5' }}>
          {['E-mail', 'Cadastro', 'Plano', 'Laudos', 'WhatsApp', 'Acesso'].map(h => (
            <th key={h} style={{ textAlign: 'left', padding: '8px 10px', color: '#9aa3b8', fontWeight: '700', fontSize: '0.75rem', textTransform: 'uppercase' }}>
              {h}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {usuarios.map((u, i) => (
          <tr key={i} style={{ borderBottom: '1px solid #f0f4f8' }}>
            <td style={{ padding: '10px 10px', color: '#2c3e6b' }}>{u.email}</td>
            <td style={{ padding: '10px 10px', color: '#6b7a99', whiteSpace: 'nowrap' }}>{u.criadoEm}</td>
            <td style={{ padding: '10px 10px' }}>
              {u.isPremium
                ? <span style={{ background: '#fef9e7', color: '#d4ac0d', borderRadius: '20px', padding: '3px 10px', fontSize: '0.8rem', fontWeight: '700' }}>⭐ Admin</span>
                : u.plano
                  ? <span style={{ background: '#eaf5ff', color: '#2980b9', borderRadius: '20px', padding: '3px 10px', fontSize: '0.8rem', fontWeight: '600' }}>{u.plano}</span>
                  : <span style={{ color: '#c0c8d8', fontSize: '0.8rem' }}>gratuito</span>
              }
            </td>
            <td style={{ padding: '10px 10px', color: '#6b7a99', textAlign: 'center' }}>{u.laudos}</td>
            <td style={{ padding: '10px 10px', color: u.whatsapp ? '#27ae60' : '#c0c8d8', fontSize: '0.82rem' }}>{u.whatsapp ?? '—'}</td>
            <td style={{ padding: '10px 10px' }}>
              {u.isPremium ? (
                <button
                  onClick={() => onToggle(u.id, false)}
                  disabled={liberandoId === u.id}
                  style={{ padding: '5px 12px', borderRadius: '8px', border: '1.5px solid #e0e0e0', background: 'white', color: '#9aa3b8', fontSize: '0.78rem', fontWeight: '600', cursor: liberandoId === u.id ? 'not-allowed' : 'pointer' }}
                >
                  {liberandoId === u.id ? '...' : 'Revogar'}
                </button>
              ) : (
                <button
                  onClick={() => onToggle(u.id, true)}
                  disabled={liberandoId === u.id}
                  style={{ padding: '5px 12px', borderRadius: '8px', border: 'none', background: 'linear-gradient(135deg, #f39c12, #d68910)', color: 'white', fontSize: '0.78rem', fontWeight: '700', cursor: liberandoId === u.id ? 'not-allowed' : 'pointer' }}
                >
                  {liberandoId === u.id ? '...' : '⭐ Liberar'}
                </button>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
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
  const [liberandoId, setLiberandoId] = useState<string | null>(null)
  const [buscaEmail, setBuscaEmail] = useState('')
  const [buscando, setBuscando] = useState(false)
  const [resultadoBusca, setResultadoBusca] = useState<UsuarioRow[] | null>(null)
  const [erroBusca, setErroBusca] = useState('')

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

  async function togglePremium(userId: string, liberar: boolean) {
    setLiberandoId(userId)
    try {
      const secret = sessionStorage.getItem('admin_secret') ?? ''
      await fetch('/api/admin/set-premium', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-admin-secret': secret },
        body: JSON.stringify({ userId, liberar })
      })
      const atualizar = (lista: UsuarioRow[]) =>
        lista.map(u => u.id === userId ? { ...u, isPremium: liberar, plano: liberar ? 'admin' : u.plano } : u)
      setStats(prev => prev ? { ...prev, ultimos: atualizar(prev.ultimos) } : prev)
      setResultadoBusca(prev => prev ? atualizar(prev) : prev)
    } finally {
      setLiberandoId(null)
    }
  }

  async function buscarUsuario(e: React.FormEvent) {
    e.preventDefault()
    if (!buscaEmail.trim()) return
    setBuscando(true)
    setErroBusca('')
    setResultadoBusca(null)
    try {
      const secret = sessionStorage.getItem('admin_secret') ?? ''
      const res = await fetch(`/api/admin/buscar-usuario?email=${encodeURIComponent(buscaEmail.trim())}`, {
        headers: { 'x-admin-secret': secret }
      })
      const data = await res.json()
      if (data.erro) { setErroBusca(data.erro); return }
      setResultadoBusca(data.usuarios)
    } catch {
      setErroBusca('Erro de conexão.')
    } finally {
      setBuscando(false)
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

        {/* Busca por e-mail */}
        <div style={{ background: 'white', borderRadius: '16px', padding: '24px', boxShadow: '0 2px 12px rgba(108,155,210,0.1)', marginBottom: '20px' }}>
          <h2 style={{ fontSize: '1rem', fontWeight: '700', color: '#2c3e6b', margin: '0 0 14px' }}>🔍 Buscar usuário por e-mail</h2>
          <form onSubmit={buscarUsuario} style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <input
              type="email"
              value={buscaEmail}
              onChange={e => { setBuscaEmail(e.target.value); setResultadoBusca(null); setErroBusca('') }}
              placeholder="email@exemplo.com"
              required
              style={{
                flex: 1, minWidth: '220px', padding: '10px 14px', borderRadius: '10px',
                border: '1.5px solid #d8e4f0', fontSize: '0.95rem', color: '#2c3e6b', outline: 'none'
              }}
            />
            <button
              type="submit"
              disabled={buscando}
              style={{
                padding: '10px 22px', borderRadius: '10px', border: 'none',
                background: buscando ? '#b0c8e8' : 'linear-gradient(135deg, #6c9bd2, #4a7abf)',
                color: 'white', fontWeight: '700', fontSize: '0.9rem',
                cursor: buscando ? 'not-allowed' : 'pointer'
              }}
            >
              {buscando ? 'Buscando...' : 'Buscar'}
            </button>
          </form>

          {erroBusca && <p style={{ color: '#e74c3c', fontSize: '0.85rem', marginTop: '10px' }}>⚠️ {erroBusca}</p>}

          {resultadoBusca !== null && (
            resultadoBusca.length === 0
              ? <p style={{ color: '#9aa3b8', fontSize: '0.88rem', marginTop: '12px' }}>Nenhum usuário encontrado com esse e-mail.</p>
              : <div style={{ overflowX: 'auto', marginTop: '16px' }}>
                  <TabelaUsuarios usuarios={resultadoBusca} liberandoId={liberandoId} onToggle={togglePremium} />
                </div>
          )}
        </div>

        {/* Tabela últimos usuários */}
        <div style={{
          background: 'white', borderRadius: '16px', padding: '24px',
          boxShadow: '0 2px 12px rgba(108,155,210,0.1)', overflowX: 'auto'
        }}>
          <h2 style={{ fontSize: '1rem', fontWeight: '700', color: '#2c3e6b', margin: '0 0 18px' }}>
            Últimos 10 usuários cadastrados
          </h2>
          <TabelaUsuarios usuarios={stats.ultimos} liberandoId={liberandoId} onToggle={togglePremium} />
        </div>

      </div>
    </main>
  )
}
