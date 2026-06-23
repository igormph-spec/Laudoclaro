'use client'

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

const PLANOS: Record<string, { laudos: string; nome: string }> = {
  starter: { laudos: '5 laudos', nome: 'Starter' },
  familia: { laudos: '20 laudos', nome: 'Família' },
  premium: { laudos: '60 laudos', nome: 'Premium' },
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
        Pagamento confirmado!
      </h1>
      <p style={{ color: '#6b7a99', fontSize: '0.95rem', marginBottom: '16px', lineHeight: '1.6' }}>
        {info
          ? <>Você adquiriu o <strong>Plano {info.nome}</strong> com <strong>{info.laudos}</strong>.</>
          : <>Seu pagamento foi confirmado com sucesso!</>
        }
      </p>
      <div style={{
        background: '#fff8e1', border: '1px solid #ffe082',
        borderRadius: '12px', padding: '14px 18px',
        marginBottom: '24px', fontSize: '0.85rem', color: '#7a5c00', lineHeight: '1.6'
      }}>
        ⏳ <strong>Seus créditos podem levar até 2 minutos para aparecer.</strong><br />
        Se ao entrar no app ainda não estiverem disponíveis, aguarde um momento e recarregue a página.
      </div>
      <Link href="/" style={{
        display: 'inline-block', padding: '14px 32px',
        background: 'linear-gradient(135deg, #6c9bd2, #4a7abf)',
        color: 'white', borderRadius: '12px', fontWeight: '700',
        textDecoration: 'none', fontSize: '1rem'
      }}>
        Ir para o LaudoClaro →
      </Link>
    </div>
  )
}

export default function PagamentoSucesso() {
  return (
    <main style={{
      minHeight: '100dvh',
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
