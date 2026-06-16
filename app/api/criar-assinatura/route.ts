import { NextRequest, NextResponse } from 'next/server'
import { auth, clerkClient } from '@clerk/nextjs/server'

const PLANOS = {
  starter: {
    nome: 'LaudoClaro — Plano Starter',
    preco: 19.90,
    creditos: 5,
  },
  familia: {
    nome: 'LaudoClaro — Plano Família',
    preco: 39.90,
    creditos: 20,
  },
  premium: {
    nome: 'LaudoClaro — Plano Premium',
    preco: 79.90,
    creditos: 999,
  },
}

export type PlanoId = keyof typeof PLANOS

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ erro: 'Não autenticado' }, { status: 401 })
    }

    const { plano } = await request.json()
    if (!plano || !(plano in PLANOS)) {
      return NextResponse.json({ erro: 'Plano inválido' }, { status: 400 })
    }

    const client = await clerkClient()
    const user = await client.users.getUser(userId)
    const email = user.emailAddresses[0]?.emailAddress
    if (!email) {
      return NextResponse.json({ erro: 'E-mail do usuário não encontrado' }, { status: 400 })
    }

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://laudoclaro1.vercel.app'
    const planoData = PLANOS[plano as PlanoId]

    const res = await fetch('https://api.mercadopago.com/preapproval', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.MP_ACCESS_TOKEN}`
      },
      body: JSON.stringify({
        reason: planoData.nome,
        auto_recurring: {
          frequency: 1,
          frequency_type: 'months',
          transaction_amount: planoData.preco,
          currency_id: 'BRL'
        },
        back_url: `${baseUrl}/pagamento/sucesso?plano=${plano}`,
        external_reference: `${userId}|${plano}`,
        payer_email: email,
        status: 'pending'
      })
    })

    const data = await res.json()

    if (!res.ok) {
      console.error('[criar-assinatura] Erro MP:', res.status, JSON.stringify(data))
      return NextResponse.json({ erro: `MP ${res.status}: ${JSON.stringify(data)}` }, { status: 500 })
    }

    if (!data.init_point) {
      console.error('[criar-assinatura] init_point ausente:', JSON.stringify(data))
      return NextResponse.json({ erro: `init_point ausente: ${JSON.stringify(data)}` }, { status: 500 })
    }

    return NextResponse.json({ url: data.init_point })
  } catch (e: any) {
    return NextResponse.json({ erro: e.message }, { status: 500 })
  }
}
