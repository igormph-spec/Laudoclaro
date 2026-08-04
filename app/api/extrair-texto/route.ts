import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const TIPOS_ACEITOS = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
const TAMANHO_MAX = 5 * 1024 * 1024 // 5 MB

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ erro: 'Não autenticado' }, { status: 401 })
    }

    const formData = await request.formData()
    const arquivo = formData.get('imagem') as File | null

    if (!arquivo) {
      return NextResponse.json({ erro: 'Nenhuma imagem enviada.' }, { status: 400 })
    }

    if (!TIPOS_ACEITOS.includes(arquivo.type)) {
      return NextResponse.json({ erro: 'Formato não suportado. Use JPG, PNG ou WebP.' }, { status: 400 })
    }

    if (arquivo.size > TAMANHO_MAX) {
      return NextResponse.json({ erro: 'Imagem muito grande. Máximo 5 MB.' }, { status: 400 })
    }

    const buffer = await arquivo.arrayBuffer()
    const base64 = Buffer.from(buffer).toString('base64')
    const mediaType = arquivo.type as 'image/jpeg' | 'image/png' | 'image/webp' | 'image/gif'

    const resposta = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 2048,
      messages: [{
        role: 'user',
        content: [
          {
            type: 'image',
            source: { type: 'base64', media_type: mediaType, data: base64 }
          },
          {
            type: 'text',
            text: 'Esta imagem contém um laudo médico ou resultado de exame. Extraia todo o texto visível com fidelidade, preservando valores, unidades e formatação. Retorne apenas o texto extraído, sem comentários ou explicações adicionais.'
          }
        ]
      }]
    })

    const texto = resposta.content[0].type === 'text' ? resposta.content[0].text.trim() : ''

    if (!texto) {
      return NextResponse.json({ erro: 'Não foi possível extrair texto da imagem. Tente uma foto mais nítida.' }, { status: 422 })
    }

    return NextResponse.json({ texto })
  } catch (e: any) {
    return NextResponse.json({ erro: e.message ?? 'Erro interno.' }, { status: 500 })
  }
}
