import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'

const PLANO = {
  titulo: 'LaudoClaro — 20 laudos médicos',
  preco: 39.90,
  creditos: 20
}

export async function POST() {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ erro: 'Não autenticado' }, { status: 401 })
    }

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://laudoclaro1.vercel.app'

    const res = await fetch('https://api.mercadopago.com/checkout/preferences', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.MP_ACCESS_TOKEN}`
      },
      body: JSON.stringify({
        items: [{
          title: PLANO.titulo,
          quantity: 1,
          unit_price: PLANO.preco,
          currency_id: 'BRL'
        }],
        external_reference: userId,
        back_urls: {
          success: `${baseUrl}/pagamento/sucesso`,
          failure: `${baseUrl}`,
          pending: `${baseUrl}/pagamento/pendente`
        },
        auto_return: 'approved',
        notification_url: `${baseUrl}/api/webhook/mercadopago`
      })
    })

    const data = await res.json()

    if (!res.ok) {
      return NextResponse.json({ erro: JSON.stringify(data) }, { status: 500 })
    }

    return NextResponse.json({ url: data.init_point })
  } catch (e: any) {
    return NextResponse.json({ erro: e.message }, { status: 500 })
  }
}
