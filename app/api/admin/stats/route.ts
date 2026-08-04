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

  try {
    const client = await clerkClient()

    // Busca todos os usuários com paginação
    const usuarios: any[] = []
    let offset = 0
    const limit = 500
    while (true) {
      const batch = await client.users.getUserList({ limit, offset })
      usuarios.push(...batch.data)
      if (batch.data.length < limit) break
      offset += limit
    }

    const totalUsuarios = usuarios.length

    const porPlano: Record<string, number> = { starter: 0, familia: 0, premium: 0 }
    let totalLaudos = 0
    let totalLeads = 0
    let totalCompradores = 0
    let creditosCirculando = 0

    for (const u of usuarios) {
      const meta = (u.publicMetadata ?? {}) as Meta

      if (meta.whatsapp) totalLeads++
      if ((meta.usageCount ?? 0) > 0) totalLaudos += meta.usageCount ?? 0
      creditosCirculando += meta.credits ?? 0

      if (meta.plano && meta.plano in porPlano) {
        porPlano[meta.plano]++
        totalCompradores++
      }
    }

    // Últimos 10 usuários cadastrados
    const ultimos = usuarios
      .sort((a, b) => b.createdAt - a.createdAt)
      .slice(0, 10)
      .map(u => ({
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
      }))

    return NextResponse.json({
      totalUsuarios,
      totalLeads,
      totalCompradores,
      totalLaudos,
      creditosCirculando,
      porPlano,
      ultimos,
    })
  } catch (e: any) {
    return NextResponse.json({ erro: e.message }, { status: 500 })
  }
}
