import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Política de Privacidade — LaudoClaro',
  description: 'Como o LaudoClaro coleta, usa e protege seus dados pessoais, em conformidade com a LGPD.',
}

const S = {
  h2: { color: '#2c3e6b', fontSize: '1.05rem', fontWeight: 700, margin: '28px 0 10px' } as const,
  p: { color: '#3a4a6b', lineHeight: 1.75, fontSize: '0.93rem', margin: '0 0 12px' } as const,
  li: { color: '#3a4a6b', lineHeight: 1.75, fontSize: '0.93rem', marginBottom: '6px' } as const,
}

export default function Privacidade() {
  return (
    <main style={{
      minHeight: '100dvh',
      background: 'linear-gradient(135deg, #f5f0ff 0%, #e8f4fd 100%)',
      fontFamily: "'Segoe UI', system-ui, sans-serif",
      padding: '40px 20px',
    }}>
      <div style={{
        maxWidth: '720px', margin: '0 auto', background: 'white',
        borderRadius: '20px', padding: '40px 36px',
        boxShadow: '0 4px 24px rgba(108,155,210,0.12)',
      }}>
        <a href="/" style={{ color: '#6c9bd2', fontSize: '0.88rem', textDecoration: 'none' }}>← Voltar ao LaudoClaro</a>

        <h1 style={{ color: '#2c3e6b', fontSize: '1.5rem', fontWeight: 700, margin: '18px 0 4px' }}>
          Política de Privacidade
        </h1>
        <p style={{ color: '#9aa3b8', fontSize: '0.8rem', margin: '0 0 24px' }}>
          Última atualização: 5 de julho de 2026
        </p>

        <p style={S.p}>
          O <strong>LaudoClaro</strong> (laudoclaro1.vercel.app) é um serviço que explica laudos médicos em
          linguagem simples, com apoio de inteligência artificial. Esta política descreve, em conformidade com a
          Lei Geral de Proteção de Dados (LGPD — Lei nº 13.709/2018), quais dados tratamos, para quê, e quais
          são os seus direitos.
        </p>

        <h2 style={S.h2}>1. Quais dados coletamos</h2>
        <ul style={{ paddingLeft: '20px', margin: '0 0 12px' }}>
          <li style={S.li}><strong>Dados de cadastro:</strong> e-mail (via autenticação Clerk) e número de WhatsApp, informados por você.</li>
          <li style={S.li}><strong>Texto do laudo:</strong> o conteúdo que você cola para receber a explicação. Trata-se de <strong>dado pessoal sensível</strong> (dado de saúde) e é tratado com as salvaguardas descritas abaixo.</li>
          <li style={S.li}><strong>Dados de uso:</strong> quantidade de laudos explicados e créditos disponíveis na sua conta.</li>
          <li style={S.li}><strong>Dados de pagamento:</strong> processados integralmente pelo Mercado Pago. O LaudoClaro <strong>não</strong> tem acesso ao número do seu cartão.</li>
        </ul>

        <h2 style={S.h2}>2. Como o texto do laudo é processado</h2>
        <p style={S.p}>
          Para gerar a explicação, o texto do laudo é enviado de forma segura (criptografia em trânsito) à{' '}
          <strong>Anthropic</strong>, empresa provedora do modelo de inteligência artificial (Claude), com
          servidores nos Estados Unidos. Essa <strong>transferência internacional de dados</strong> ocorre
          exclusivamente para gerar a explicação que você solicitou (art. 33 da LGPD). Pela política da API da
          Anthropic, o conteúdo enviado <strong>não é utilizado para treinar</strong> os modelos de IA.
        </p>
        <p style={S.p}>
          <strong>Recomendação importante:</strong> antes de colar o laudo, remova dados que identifiquem você —
          nome completo, CPF, número de prontuário, data de nascimento. A explicação não precisa desses dados
          e funciona igualmente sem eles.
        </p>

        <h2 style={S.h2}>3. Onde seus dados ficam armazenados</h2>
        <ul style={{ paddingLeft: '20px', margin: '0 0 12px' }}>
          <li style={S.li}>O texto dos laudos e as explicações <strong>não são armazenados nos nossos servidores</strong>.</li>
          <li style={S.li}>O histórico das suas últimas explicações fica salvo <strong>apenas no seu navegador</strong> (armazenamento local do dispositivo). Você pode apagá-lo limpando os dados do navegador.</li>
          <li style={S.li}>E-mail, WhatsApp e contadores de uso ficam na plataforma de autenticação (Clerk).</li>
        </ul>

        <h2 style={S.h2}>4. Para que usamos seus dados</h2>
        <ul style={{ paddingLeft: '20px', margin: '0 0 12px' }}>
          <li style={S.li}>Gerar a explicação do laudo que você solicitou (execução do serviço);</li>
          <li style={S.li}>Controlar créditos e acesso à sua conta;</li>
          <li style={S.li}>Processar pagamentos e creditar seus laudos;</li>
          <li style={S.li}>Eventualmente, comunicar novidades do serviço pelo WhatsApp informado — você pode pedir para não receber mais a qualquer momento.</li>
        </ul>

        <h2 style={S.h2}>5. Com quem compartilhamos</h2>
        <p style={S.p}>
          Compartilhamos dados apenas com os operadores estritamente necessários ao funcionamento do serviço:{' '}
          <strong>Anthropic</strong> (processamento do texto do laudo pela IA), <strong>Clerk</strong>{' '}
          (autenticação e conta), <strong>Mercado Pago</strong> (pagamentos) e <strong>Vercel</strong>{' '}
          (hospedagem). Não vendemos nem cedemos seus dados a terceiros para publicidade.
        </p>

        <h2 style={S.h2}>6. Seus direitos (art. 18 da LGPD)</h2>
        <p style={S.p}>
          Você pode, a qualquer momento, solicitar: confirmação do tratamento, acesso aos dados, correção,
          anonimização, portabilidade, eliminação dos dados e revogação do consentimento. Para exercer qualquer
          direito, escreva para o contato abaixo. A exclusão da conta remove seu e-mail, WhatsApp e dados de uso.
        </p>

        <h2 style={S.h2}>7. Importante: o LaudoClaro não é um serviço médico</h2>
        <p style={S.p}>
          As explicações são geradas por inteligência artificial para fins exclusivamente educativos. Elas não
          constituem laudo, diagnóstico, prescrição ou aconselhamento médico, e não substituem a interpretação
          do profissional de saúde responsável.
        </p>

        <h2 style={S.h2}>8. Contato do controlador</h2>
        <p style={S.p}>
          LaudoClaro — responsável: Dr. Igor Holanda.<br />
          E-mail para assuntos de privacidade: <a href="mailto:igor_mph@yahoo.com.br" style={{ color: '#4a7abf' }}>igor_mph@yahoo.com.br</a>
        </p>

        <p style={{ ...S.p, color: '#9aa3b8', fontSize: '0.8rem', marginTop: '24px' }}>
          Esta política pode ser atualizada. Alterações relevantes serão indicadas pela data no topo desta página.
        </p>
      </div>
    </main>
  )
}
