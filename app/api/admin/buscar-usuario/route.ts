import { NextRequest, NextResponse } from 'next/server'
import { clerkClient } from '@clerk/nextjs/server'

type Meta = {
  usageCount?: number
  credits?: number
  isPremium?: boolean
  whatsapp?: string
  plano?: string
  assinaturaStatus?: string
}

export async function GET(request: NextRequest) {
  const secret = request.headers.get('x-admin-secret')
  if (!secret || secret !== process.env.ADMIN_SECRET) {
    return NextResponse.json({ erro: 'Não autorizado' }, { status: 401 })
  }

  const email = request.nextUrl.searchParams.get('email')?.trim().toLowerCase()
  if (!email || email.length < 3) {
    return NextResponse.json({ erro: 'Informe pelo menos 3 caracteres.' }, { status: 400 })
  }

  const client = await clerkClient()
  const resultado = await client.users.getUserList({ emailAddress: [email], limit: 10 })

  const usuarios = resultado.data.map(u => ({
    id: u.id,
    email: u.emailAddresses?.[0]?.emailAddress ?? '—',
    criadoEm: new Date(u.createdAt).toLocaleDateString('pt-BR', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    }),
    plano: (u.publicMetadata as Meta)?.plano ?? null,
    laudos: (u.publicMetadata as Meta)?.usageCount ?? 0,
    whatsapp: (u.publicMetadata as Meta)?.whatsapp ?? null,
    isPremium: (u.publicMetadata as Meta)?.isPremium ?? false,
    credits: (u.publicMetadata as Meta)?.credits ?? 0,
  }))

  return NextResponse.json({ usuarios })
}
