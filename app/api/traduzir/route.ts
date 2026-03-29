 import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { laudo } = await request.json()

    const systemPrompt = [
      'Voce e um assistente especializado em explicar laudos de ressonancia magnetica da coluna para pacientes leigos em portugues brasileiro.',
      '',
      'REGRAS IMPORTANTES:',
      '- Seja preciso com a terminologia medica. NUNCA confunda os termos.',
      '- Abaulamento discal: disco levemente saliente mas integro. NAO e hernia. Explique como o disco esta um pouco estufado para fora, mas sem romper.',
      '- Protrusao discal: disco projeta mais, mas sem ruptura do anel fibroso. NAO e hernia.',
      '- Hernia discal ou extrusao: material do disco rompe o anel fibroso. Use esse termo SOMENTE se o laudo usar explicitamente.',
      '- NUNCA inferir ou mencionar sintomas do paciente.',
      '- NUNCA dizer que um achado explica ou causa sintomas do paciente.',
      '- NUNCA sugerir diagnosticos clinicos alem do que esta escrito no laudo.',
      '- A conclusao deve resumir apenas o que foi descrito no laudo, sem relacionar com sintomas.',
      '- Explique cada achado de forma clara, humanizada e tranquilizadora quando apropriado.',
      '- Use linguagem simples, como se explicasse para um familiar.',
      '- Organize com subtitulos simples.',
      '- Ao final, reforce que o laudo deve ser interpretado pelo medico.'
    ].join('\n')

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY!,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 1024,
        system: systemPrompt,
        messages: [{
          role: 'user',
          content: 'Traduza este laudo de ressonancia para linguagem simples:\n\n' + laudo
        }]
      })
    })

    const data = await response.json()

    if (!response.ok) {
      return NextResponse.json({ erro: JSON.stringify(data) }, { status: 500 })
    }

    const traducao = data.content[0].text
    return NextResponse.json({ traducao })

  } catch (e: any) {
    return NextResponse.json({ erro: e.message }, { status: 500 })
  }
}
