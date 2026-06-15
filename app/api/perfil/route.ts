import { NextResponse } from 'next/server'
import { auth, clerkClient } from '@clerk/nextjs/server'

export async function GET() {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ erro: 'Não autenticado' }, { status: 401 })
    }

    const client = await clerkClient()
    const user = await client.users.getUser(userId)
    const meta = user.publicMetadata as {
      usageCount?: number
      credits?: number
      isPremium?: boolean
      whatsapp?: string
    }

    return NextResponse.json({
      usageCount: meta.usageCount ?? 0,
      credits: meta.credits ?? 0,
      isPremium: meta.isPremium ?? false,
      whatsapp: meta.whatsapp ?? null
    })
  } catch (e: any) {
    return NextResponse.json({ erro: e.message }, { status: 500 })
  }
}
