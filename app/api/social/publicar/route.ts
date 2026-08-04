import { NextRequest, NextResponse } from 'next/server'

// Pilares por dia da semana (0=Dom, 1=Seg, 2=Ter, 4=Qui, 5=Sex, 6=Sáb)
const PILARES: Record<number, { tpl: string; topico: string }> = {
  1: { tpl: 'hook',  topico: 'a frustração de receber um laudo médico e não entender nada do que está escrito' },
  2: { tpl: 'edu',   topico: 'um único termo médico comum que confunde pacientes brasileiros (ex: hemoglobina baixa, VHS elevado, creatinina alterada, ou similar — escolha um relevante)' },
  4: { tpl: 'edu',   topico: 'a ansiedade de esperar o resultado de um exame e como o entendimento do laudo ajuda o paciente a chegar mais preparado na consulta' },
  5: { tpl: 'prova', topico: 'o impacto real que entender um laudo tem na vida do paciente — menos medo, mais controle, melhor comunicação com o médico' },
  6: { tpl: 'cta',   topico: 'o acesso gratuito ao LaudoClaro e como é simples começar a entender os próprios exames hoje mesmo' },
}

async function gerarConteudo(topico: string, tpl: string): Promise<{
  titulo: string; subtitulo: string; legenda: string
}> {
  const instrucoesPorTemplate: Record<string, string> = {
    hook:  'O título deve ser uma pergunta ou afirmação impactante (máx 7 palavras, CAIXA ALTA). O subtítulo deve ser um dado ou complemento curto (máx 12 palavras).',
    edu:   'O título deve ser o próprio termo médico e seu valor (ex: "Hemoglobina 10,8 g/dL"). O subtítulo deve ser a explicação resumida em 1 frase simples (máx 15 palavras).',
    prova: 'O título deve ser um número impactante (ex: "2.847" ou "9 em 10"). O subtítulo deve contextualizar esse número (máx 10 palavras).',
    cta:   'O título deve ser a oferta principal (ex: "Seu 1° laudo é grátis"). O subtítulo deve remover objeções (máx 10 palavras, ex: Sem cartão. Resultado em segundos.).',
  }

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.ANTHROPIC_API_KEY ?? '',
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 600,
      messages: [{
        role: 'user',
        content: `Você cria conteúdo para o Instagram do LaudoClaro — app brasileiro que explica laudos médicos em linguagem simples.

Tema do post: "${topico}"
Tipo de post: ${tpl}
${instrucoesPorTemplate[tpl] ?? ''}

Retorne SOMENTE um JSON válido, sem markdown, sem texto extra:
{
  "titulo": "...",
  "subtitulo": "...",
  "legenda": "legenda completa para Instagram, máx 220 palavras, tom humano e acolhedor, inclua emojis relevantes, termine com CTA (link na bio) e 3-4 hashtags relevantes embutidas no texto"
}`,
      }],
    }),
  })

  const data = await res.json()
  const raw: string = data.content?.[0]?.text ?? '{}'
  const match = raw.match(/\{[\s\S]*\}/)
  if (!match) throw new Error('Resposta da IA inválida')
  return JSON.parse(match[0])
}

async function publicarInstagram(imageUrl: string, caption: string): Promise<string> {
  const accountId = process.env.IG_BUSINESS_ACCOUNT_ID
  const token = process.env.IG_ACCESS_TOKEN
  const base = 'https://graph.facebook.com/v19.0'

  // 1. Criar container de mídia
  const r1 = await fetch(`${base}/${accountId}/media`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ image_url: imageUrl, caption, access_token: token }),
  })
  const d1 = await r1.json()
  if (d1.error) throw new Error(`[Meta container] ${d1.error.message}`)

  // Aguardar processamento (Instagram recomenda ~5s para vídeos, mas imagens são imediatas)
  await new Promise(r => setTimeout(r, 2000))

  // 2. Publicar
  const r2 = await fetch(`${base}/${accountId}/media_publish`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ creation_id: d1.id, access_token: token }),
  })
  const d2 = await r2.json()
  if (d2.error) throw new Error(`[Meta publish] ${d2.error.message}`)

  return d2.id
}

export async function POST(request: NextRequest) {
  const secret = request.headers.get('x-social-secret')
  if (!secret || secret !== process.env.SOCIAL_SECRET) {
    return NextResponse.json({ erro: 'Não autorizado' }, { status: 401 })
  }

  try {
    const body = await request.json().catch(() => ({}))
    // Permite forçar um dia específico via body.dia (para testes)
    const diaSemana: number = body.dia ?? new Date().getDay()

    const pilar = PILARES[diaSemana]
    if (!pilar) {
      return NextResponse.json({ ok: true, msg: 'Sem post programado para hoje.' })
    }

    const { titulo, subtitulo, legenda } = await gerarConteudo(pilar.topico, pilar.tpl)

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://laudoclaro1.vercel.app'
    const imageUrl =
      `${baseUrl}/api/social/image` +
      `?t=${pilar.tpl}` +
      `&t1=${encodeURIComponent(titulo)}` +
      `&t2=${encodeURIComponent(subtitulo)}`

    const postId = await publicarInstagram(imageUrl, legenda)

    console.log(`[social] publicado: ${postId} | ${titulo}`)
    return NextResponse.json({ ok: true, postId, titulo, tpl: pilar.tpl })
  } catch (e: any) {
    console.error('[social/publicar]', e.message)
    return NextResponse.json({ erro: e.message }, { status: 500 })
  }
}
