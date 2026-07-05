import { NextResponse } from 'next/server'
import { auth, clerkClient } from '@clerk/nextjs/server'

// Cancela a assinatura mensal do próprio usuário no Mercado Pago.
// Os créditos restantes do mês já pago são mantidos — só a renovação para.
export async function POST() {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ erro: 'Não autenticado' }, { status: 401 })
    }

    const client = await clerkClient()
    const user = await client.users.getUser(userId)
    const meta = user.publicMetadata as { assinaturaId?: string; assinaturaStatus?: string }

    if (!meta.assinaturaId || meta.assinaturaStatus !== 'authorized') {
      return NextResponse.json({ erro: 'Nenhuma assinatura ativa encontrada' }, { status: 400 })
    }

    const res = await fetch(`https://api.mercadopago.com/preapproval/${meta.assinaturaId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.MP_ACCESS_TOKEN}`
      },
      body: JSON.stringify({ status: 'cancelled' })
    })

    const data = await res.json()

    if (!res.ok) {
      console.error('[cancelar-assinatura] Erro MP:', res.status, JSON.stringify(data))
      return NextResponse.json({ erro: 'Não foi possível cancelar. Tente novamente.' }, { status: 500 })
    }

    // Atualiza o status imediatamente (o webhook confirma depois).
    // Créditos restantes são mantidos: o usuário pagou por eles.
    await client.users.updateUserMetadata(userId, {
      publicMetadata: {
        ...user.publicMetadata,
        assinaturaStatus: 'cancelled',
      }
    })

    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ erro: e.message }, { status: 500 })
  }
}
