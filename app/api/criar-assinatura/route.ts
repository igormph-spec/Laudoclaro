import { NextRequest, NextResponse } from 'next/server'
import { auth, clerkClient } from '@clerk/nextjs/server'
import { PLANOS, PlanoId } from '../../lib/planos'

// Cria uma assinatura mensal (preapproval) no Mercado Pago.
// O crédito dos laudos acontece no webhook, a cada cobrança mensal processada
// (evento subscription_authorized_payment) — nunca aqui.
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ erro: 'Não autenticado' }, { status: 401 })
    }

    const body = await request.json().catch(() => ({}))
    const planoId: PlanoId = body.plano && body.plano in PLANOS ? body.plano : 'familia'
    const plano = PLANOS[planoId]

    // O preapproval exige o e-mail do pagador
    const client = await clerkClient()
    const user = await client.users.getUser(userId)
    const email =
      user.emailAddresses.find(e => e.id === user.primaryEmailAddressId)?.emailAddress ??
      user.emailAddresses[0]?.emailAddress
    if (!email) {
      return NextResponse.json({ erro: 'Conta sem e-mail cadastrado' }, { status: 400 })
    }

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://laudoclaro1.vercel.app'

    const res = await fetch('https://api.mercadopago.com/preapproval', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.MP_ACCESS_TOKEN}`
      },
      body: JSON.stringify({
        reason: plano.tituloMensal,
        external_reference: `${userId}|${planoId}`,
        payer_email: email,
        auto_recurring: {
          frequency: 1,
          frequency_type: 'months',
          transaction_amount: plano.preco,
          currency_id: 'BRL'
        },
        back_url: `${baseUrl}/pagamento/sucesso?plano=${planoId}&tipo=assinatura`,
        status: 'pending'
      })
    })

    const data = await res.json()

    if (!res.ok) {
      console.error('[criar-assinatura] Erro MP:', res.status, JSON.stringify(data))
      return NextResponse.json({ erro: JSON.stringify(data) }, { status: 500 })
    }

    return NextResponse.json({ url: data.init_point })
  } catch (e: any) {
    return NextResponse.json({ erro: e.message }, { status: 500 })
  }
}
