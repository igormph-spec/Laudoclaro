'use client'

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

const PLANOS: Record<string, { laudos: string; nome: string }> = {
  starter: { laudos: '5 laudos por mês', nome: 'Starter' },
  familia: { laudos: '20 laudos por mês', nome: 'Família' },
  premium: { laudos: 'laudos ilimitados', nome: 'Premium' },
}

function ConteudoSucesso() {
  const params = useSearchParams()
  const plano = params.get('plano') ?? ''
  const info = PLANOS[plano]

  return (
    <div style={{
      background: 'white', borderRadius: '24px', padding: '48px 40px',
      maxWidth: '440px', width: '100%',
      boxShadow: '0 8px 40px rgba(108,155,210,0.15)', textAlign: 'center'
    }}>
      <div style={{ fontSize: '3.5rem', marginBottom: '16px' }}>✅</div>
      <h1 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#2c3e6b', margin: '0 0 12px' }}>
        Assinatura confirmada!
      </h1>
      <p style={{ color: '#6b7a99', fontSize: '0.95rem', marginBottom: '16px', lineHeight: '1.6' }}>
        {info
          ? <>Bem-vindo ao <strong>Plano {info.nome}</strong>! Você tem <strong>{info.laudos}</strong> disponíveis a partir de agora.</>
          : <>Seu pagamento foi confirmado. Seus laudos já estão disponíveis na sua conta!</>
        }
      </p>
      <div style={{
        background: '#f0f7ff', borderRadius: '12px', padding: '14px 18px',
        marginBottom: '28px', fontSize: '0.85rem', color: '#4a6a9b', lineHeight: '1.6'
      }}>
        📅 Sua assinatura renova automaticamente todo mês. Você pode cancelar quando quiser pelo suporte.
      </div>
      <Link href="/" style={{
        display: 'inline-block', padding: '14px 32px',
        background: 'linear-gradient(135deg, #6c9bd2, #4a7abf)',
        color: 'white', borderRadius: '12px', fontWeight: '700',
        textDecoration: 'none', fontSize: '1rem'
      }}>
        Usar o LaudoClaro →
      </Link>
    </div>
  )
}

export default function PagamentoSucesso() {
  return (
    <main style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f5f0ff 0%, #e8f4fd 100%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '24px', fontFamily: "'Segoe UI', system-ui, sans-serif"
    }}>
      <Suspense fallback={
        <div style={{ color: '#6b7a99', fontSize: '1rem' }}>Carregando...</div>
      }>
        <ConteudoSucesso />
      </Suspense>
    </main>
  )
}
