import { NextRequest, NextResponse } from 'next/server'
import { clerkClient } from '@clerk/nextjs/server'

export async function POST(request: NextRequest) {
  const secret = request.headers.get('x-admin-secret')
  if (!secret || secret !== process.env.ADMIN_SECRET) {
    return NextResponse.json({ erro: 'Não autorizado' }, { status: 401 })
  }

  const { userId, liberar } = await request.json()
  if (!userId) {
    return NextResponse.json({ erro: 'userId obrigatório' }, { status: 400 })
  }

  const client = await clerkClient()
  const user = await client.users.getUser(userId)
  const meta = user.publicMetadata as Record<string, unknown>

  await client.users.updateUserMetadata(userId, {
    publicMetadata: {
      ...meta,
      isPremium: liberar !== false,
      // Garante pelo menos 999 créditos para não travar em nenhuma verificação
      credits: liberar !== false ? 999 : (meta.credits ?? 0),
      plano: liberar !== false ? 'admin' : meta.plano,
      assinaturaStatus: liberar !== false ? 'authorized' : meta.assinaturaStatus,
    }
  })

  return NextResponse.json({ ok: true })
}
