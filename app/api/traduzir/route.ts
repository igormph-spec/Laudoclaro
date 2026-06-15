import { NextRequest, NextResponse } from 'next/server'
import { auth, clerkClient } from '@clerk/nextjs/server'

export async function POST(request: NextRequest) {
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

    const usageCount = meta.usageCount ?? 0
    const credits = meta.credits ?? 0
    const isPremium = meta.isPremium ?? false

    // 1º laudo é gratuito; a partir do 2º exige créditos ou premium
    const primeiroLaudoGratis = usageCount === 0
    if (!primeiroLaudoGratis && !isPremium && credits <= 0) {
      return NextResponse.json({ erro: 'sem_creditos' }, { status: 403 })
    }

    const { laudo } = await request.json()
    if (!laudo?.trim()) {
      return NextResponse.json({ erro: 'Laudo vazio' }, { status: 400 })
    }

    const systemPrompt = [
      'Você é um assistente especializado em explicar laudos médicos para pacientes leigos em português brasileiro.',
      '',
      'Você é capaz de interpretar qualquer tipo de exame de imagem ou laudo médico, incluindo:',
      '- Ressonância magnética (RM) de qualquer parte do corpo',
      '- Tomografia computadorizada (TC)',
      '- Ultrassonografia',
      '- Radiografia (Raio-X)',
      '- Ecocardiograma',
      '- Laudos laboratoriais e anatomopatológicos',
      '- Qualquer outro tipo de laudo ou relatório médico',
      '',
      'REGRAS IMPORTANTES:',
      '- Seja preciso com a terminologia médica. NUNCA confunda os termos.',
      '- Explique cada achado de forma clara, humanizada e tranquilizadora quando apropriado.',
      '- Use linguagem simples, como se explicasse para um familiar sem formação médica.',
      '- Organize a resposta com subtítulos simples e parágrafos curtos.',
      '- NUNCA inferir ou mencionar sintomas do paciente.',
      '- NUNCA relacionar achados com sintomas ou diagnósticos clínicos além do que está escrito.',
      '- NUNCA sugerir tratamentos ou condutas médicas.',
      '- Ao final, reforce sempre que o laudo deve ser interpretado pelo médico responsável.',
      '- Se o texto enviado não parecer um laudo médico, informe educadamente.',
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
        max_tokens: 2048,
        system: systemPrompt,
        messages: [{
          role: 'user',
          content: 'Explique este laudo médico em linguagem simples:\n\n' + laudo
        }]
      })
    })

    const data = await response.json()

    if (!response.ok) {
      return NextResponse.json({ erro: JSON.stringify(data) }, { status: 500 })
    }

    // Atualizar contadores: incrementar uso, decrementar crédito se não for o primeiro gratuito
    const novosCredits = primeiroLaudoGratis ? credits : credits - 1
    await client.users.updateUserMetadata(userId, {
      publicMetadata: {
        ...meta,
        usageCount: usageCount + 1,
        credits: novosCredits
      }
    })

    return NextResponse.json({
      traducao: data.content[0].text,
      usageCount: usageCount + 1,
      credits: novosCredits,
      isPremium
    })

  } catch (e: any) {
    return NextResponse.json({ erro: e.message }, { status: 500 })
  }
}
