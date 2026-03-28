import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { laudo } = await request.json()

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
        messages: [{
          role: 'user',
          content: `Traduza este laudo de ressonância para linguagem simples em português:\n\n${laudo}`
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
