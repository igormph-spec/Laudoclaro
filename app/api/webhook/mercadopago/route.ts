import { NextRequest, NextResponse } from 'next/server'
import { clerkClient } from '@clerk/nextjs/server'

const CREDITOS_PLANO = 20

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // MP envia notificações de tipos diferentes — só processar pagamentos
    if (body.type !== 'payment') {
      return NextResponse.json({ ok: true })
    }

    const paymentId = body.data?.id
    if (!paymentId) {
      return NextResponse.json({ erro: 'ID de pagamento ausente' }, { status: 400 })
    }

    // Verificar o pagamento diretamente na API do MP (não confiar só no webhook)
    const res = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
      headers: { Authorization: `Bearer ${process.env.MP_ACCESS_TOKEN}` }
    })

    if (!res.ok) {
      return NextResponse.json({ erro: 'Falha ao verificar pagamento' }, { status: 500 })
    }

    const payment = await res.json()

    if (payment.status !== 'approved') {
      return NextResponse.json({ ok: true })
    }

    const userId = payment.external_reference
    if (!userId) {
      return NextResponse.json({ erro: 'Usuário não identificado' }, { status: 400 })
    }

    const client = await clerkClient()
    const user = await client.users.getUser(userId)
    const meta = user.publicMetadata as {
      usageCount?: number
      credits?: number
      isPremium?: boolean
      whatsapp?: string
    }

    const creditsAtuais = meta.credits ?? 0

    await client.users.updateUserMetadata(userId, {
      publicMetadata: {
        ...meta,
        credits: creditsAtuais + CREDITOS_PLANO
      }
    })

    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ erro: e.message }, { status: 500 })
  }
}
