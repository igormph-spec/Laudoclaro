import { NextRequest, NextResponse } from 'next/server'
import { clerkClient } from '@clerk/nextjs/server'
import { createHmac } from 'crypto'

function validarAssinaturaMP(request: NextRequest, body: string): boolean {
  const secret = process.env.MP_WEBHOOK_SECRET
  // Se não houver secret configurado, passa (compatibilidade)
  if (!secret) return true

  const xSignature = request.headers.get('x-signature') ?? ''
  const xRequestId = request.headers.get('x-request-id') ?? ''
  const dataId = new URL(request.url).searchParams.get('data.id') ?? ''

  // Formato: ts=...,v1=...
  const parts = Object.fromEntries(xSignature.split(',').map(p => p.split('=')))
  const ts = parts['ts']
  const v1 = parts['v1']
  if (!ts || !v1) return false

  const manifest = `id:${dataId};request-id:${xRequestId};ts:${ts};`
  const hmac = createHmac('sha256', secret).update(manifest).digest('hex')
  return hmac === v1
}

const CREDITOS_PLANO: Record<string, number> = {
  starter: 5,
  familia: 20,
  premium: 999,
}

type UserMeta = {
  usageCount?: number
  credits?: number
  isPremium?: boolean
  whatsapp?: string
  plano?: string
  assinaturaId?: string
  assinaturaStatus?: string
}

async function creditarAssinatura(userId: string, plano: string, assinaturaId: string) {
  const client = await clerkClient()
  const user = await client.users.getUser(userId)
  const meta = user.publicMetadata as UserMeta

  const creditos = CREDITOS_PLANO[plano] ?? 0
  const isPremium = plano === 'premium'

  await client.users.updateUserMetadata(userId, {
    publicMetadata: {
      ...meta,
      credits: creditos,
      isPremium,
      plano,
      assinaturaId,
      assinaturaStatus: 'authorized',
    }
  })
}

async function atualizarStatusAssinatura(assinaturaId: string, status: string) {
  // Buscar preapproval para obter external_reference
  const res = await fetch(`https://api.mercadopago.com/preapproval/${assinaturaId}`, {
    headers: { Authorization: `Bearer ${process.env.MP_ACCESS_TOKEN}` }
  })
  if (!res.ok) return

  const preapproval = await res.json()
  const externalRef: string = preapproval.external_reference ?? ''
  const [userId, plano] = externalRef.split('|')
  if (!userId) return

  const client = await clerkClient()
  const user = await client.users.getUser(userId)
  const meta = user.publicMetadata as UserMeta

  const novoStatus = status === 'authorized' ? 'authorized' : status === 'cancelled' ? 'cancelled' : 'paused'

  await client.users.updateUserMetadata(userId, {
    publicMetadata: {
      ...meta,
      plano: novoStatus === 'authorized' ? plano : meta.plano,
      assinaturaId,
      assinaturaStatus: novoStatus,
      // Se cancelou, zera créditos restantes
      ...(novoStatus === 'cancelled' ? { credits: 0, isPremium: false } : {})
    }
  })
}

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text()
    if (!validarAssinaturaMP(request, rawBody)) {
      return NextResponse.json({ erro: 'Assinatura inválida' }, { status: 401 })
    }
    const body = JSON.parse(rawBody)

    // Pagamento único via Checkout Pro
    if (body.type === 'payment') {
      const paymentId = body.data?.id
      if (!paymentId) return NextResponse.json({ ok: true })

      const res = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
        headers: { Authorization: `Bearer ${process.env.MP_ACCESS_TOKEN}` }
      })
      if (!res.ok) return NextResponse.json({ erro: 'Falha ao verificar pagamento' }, { status: 500 })

      const payment = await res.json()
      if (payment.status !== 'approved') return NextResponse.json({ ok: true })

      // external_reference pode ser "userId|plano" ou somente "userId" (legado)
      const extRef: string = payment.external_reference ?? ''
      const [userId, planoId] = extRef.includes('|') ? extRef.split('|') : [extRef, 'familia']
      if (!userId) return NextResponse.json({ erro: 'Usuário não identificado' }, { status: 400 })

      const creditosPorPlano: Record<string, number> = { starter: 5, familia: 20, premium: 60 }
      const creditosAdicionados = creditosPorPlano[planoId] ?? 20

      const client = await clerkClient()
      const user = await client.users.getUser(userId)
      const meta = user.publicMetadata as UserMeta
      const creditsAtuais = meta.credits ?? 0

      await client.users.updateUserMetadata(userId, {
        publicMetadata: {
          ...meta,
          credits: creditsAtuais + creditosAdicionados,
          plano: planoId,
          assinaturaStatus: 'authorized',
        }
      })

      return NextResponse.json({ ok: true })
    }

    // Cobrança mensal da assinatura processada
    if (body.type === 'subscription_authorized_payment') {
      const authorizedPaymentId = body.data?.id
      if (!authorizedPaymentId) return NextResponse.json({ ok: true })

      const resAp = await fetch(`https://api.mercadopago.com/authorized_payments/${authorizedPaymentId}`, {
        headers: { Authorization: `Bearer ${process.env.MP_ACCESS_TOKEN}` }
      })
      if (!resAp.ok) return NextResponse.json({ erro: 'Falha ao verificar cobrança' }, { status: 500 })

      const ap = await resAp.json()
      if (ap.status !== 'processed') return NextResponse.json({ ok: true })

      const preapprovalId: string = ap.preapproval_id
      if (!preapprovalId) return NextResponse.json({ ok: true })

      const resPreapproval = await fetch(`https://api.mercadopago.com/preapproval/${preapprovalId}`, {
        headers: { Authorization: `Bearer ${process.env.MP_ACCESS_TOKEN}` }
      })
      if (!resPreapproval.ok) return NextResponse.json({ erro: 'Falha ao buscar assinatura' }, { status: 500 })

      const preapproval = await resPreapproval.json()
      const externalRef: string = preapproval.external_reference ?? ''
      const [userId, plano] = externalRef.split('|')
      if (!userId || !plano) return NextResponse.json({ ok: true })

      await creditarAssinatura(userId, plano, preapprovalId)
      return NextResponse.json({ ok: true })
    }

    // Mudança de status da assinatura (cancelamento, pausa, reativação)
    if (body.type === 'subscription_preapproval') {
      const preapprovalId = body.data?.id
      if (!preapprovalId) return NextResponse.json({ ok: true })

      const res = await fetch(`https://api.mercadopago.com/preapproval/${preapprovalId}`, {
        headers: { Authorization: `Bearer ${process.env.MP_ACCESS_TOKEN}` }
      })
      if (!res.ok) return NextResponse.json({ ok: true })

      const preapproval = await res.json()
      await atualizarStatusAssinatura(preapprovalId, preapproval.status)
      return NextResponse.json({ ok: true })
    }

    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ erro: e.message }, { status: 500 })
  }
}
