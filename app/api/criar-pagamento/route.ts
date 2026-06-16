import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'

const PLANOS = {
  starter:  { titulo: 'LaudoClaro — Plano Starter (5 laudos)',    preco: 19.90, creditos: 5  },
  familia:  { titulo: 'LaudoClaro — Plano Família (20 laudos)',   preco: 39.90, creditos: 20 },
  premium:  { titulo: 'LaudoClaro — Plano Premium (60 laudos)',   preco: 79.90, creditos: 60 },
}

export type PlanoId = keyof typeof PLANOS

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ erro: 'Não autenticado' }, { status: 401 })
    }

    const body = await request.json().catch(() => ({}))
    const planoId: PlanoId = body.plano && body.plano in PLANOS ? body.plano : 'familia'
    const plano = PLANOS[planoId]

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://laudoclaro1.vercel.app'

    const res = await fetch('https://api.mercadopago.com/checkout/preferences', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.MP_ACCESS_TOKEN}`
      },
      body: JSON.stringify({
        items: [{
          title: plano.titulo,
          quantity: 1,
          unit_price: plano.preco,
          currency_id: 'BRL'
        }],
        external_reference: `${userId}|${planoId}`,
        back_urls: {
          success: `${baseUrl}/pagamento/sucesso?plano=${planoId}`,
          failure: `${baseUrl}`,
          pending: `${baseUrl}/pagamento/pendente`
        },
        auto_return: 'approved',
        notification_url: `${baseUrl}/api/webhook/mercadopago`
      })
    })

    const data = await res.json()

    if (!res.ok) {
      console.error('[criar-pagamento] Erro MP:', res.status, JSON.stringify(data))
      return NextResponse.json({ erro: JSON.stringify(data) }, { status: 500 })
    }

    return NextResponse.json({ url: data.init_point })
  } catch (e: any) {
    return NextResponse.json({ erro: e.message }, { status: 500 })
  }
}
