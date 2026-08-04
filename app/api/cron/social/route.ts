import { NextRequest, NextResponse } from 'next/server'

// Chamado pelo Vercel Cron — seg, ter, qui, sex, sáb às 12h BRT (15:00 UTC)
export async function GET(request: NextRequest) {
  const auth = request.headers.get('authorization')
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ erro: 'Não autorizado' }, { status: 401 })
  }

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://laudoclaro1.vercel.app'

  const res = await fetch(`${baseUrl}/api/social/publicar`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-social-secret': process.env.SOCIAL_SECRET ?? '',
    },
    body: JSON.stringify({}),
  })

  const data = await res.json()
  console.log('[cron/social]', data)
  return NextResponse.json(data)
}
