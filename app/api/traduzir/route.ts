import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const { laudo } = await request.json()

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.ANTHROPIC_API_KEY!,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: 'claude-opus-4-5',
      max_tokens: 1024,
      messages: [{
        role: 'user',
        content: `Você é um especialista em traduzir laudos médicos de ressonância magnética da coluna para linguagem simples e acessível para pacientes sem formação médica. 

Traduza o seguinte laudo de forma clara, humanizada e organizada, explicando cada achado em linguagem do dia a dia. Use subtítulos simples.

LAUDO:
${laudo}`
      }]
    })
  })

  const data = await response.json()
  const traducao = data.content[0].text

  return NextResponse.json({ traducao })
}
