import { NextRequest, NextResponse } from 'next/server'
import { auth, clerkClient } from '@clerk/nextjs/server'

function validarWhatsapp(numero: string): string | null {
  const digits = numero.replace(/\D/g, '')
  // Aceita com ou sem código do Brasil (55)
  const local = digits.startsWith('55') && digits.length >= 12 ? digits.slice(2) : digits
  // Número brasileiro: DDD (2 dígitos) + 9 dígitos (celular) = 11 dígitos
  if (local.length !== 11) return null
  const ddd = parseInt(local.slice(0, 2))
  if (ddd < 11 || ddd > 99) return null
  if (local[2] !== '9') return null
  return '55' + local
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ erro: 'Não autenticado' }, { status: 401 })
    }

    const { whatsapp } = await request.json()
    const numeroFormatado = validarWhatsapp(whatsapp ?? '')

    if (!numeroFormatado) {
      return NextResponse.json({ erro: 'Número inválido. Use o formato: (XX) 9XXXX-XXXX' }, { status: 400 })
    }

    const client = await clerkClient()
    const user = await client.users.getUser(userId)
    const meta = user.publicMetadata

    await client.users.updateUserMetadata(userId, {
      publicMetadata: { ...meta, whatsapp: numeroFormatado }
    })

    return NextResponse.json({ ok: true, whatsapp: numeroFormatado })
  } catch (e: any) {
    return NextResponse.json({ erro: e.message }, { status: 500 })
  }
}
