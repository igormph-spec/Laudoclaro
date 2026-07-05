// Fonte única de verdade dos planos do LaudoClaro.
// Usada pelo checkout (criar-pagamento) e pelo webhook (creditar após pagamento).
// NUNCA duplicar estes valores em outro arquivo.

export const PLANOS = {
  starter: {
    titulo: 'LaudoClaro — Plano Starter (5 laudos)',
    tituloMensal: 'LaudoClaro — Assinatura Starter (5 laudos/mês)',
    preco: 19.90, creditos: 5,
  },
  familia: {
    titulo: 'LaudoClaro — Plano Família (20 laudos)',
    tituloMensal: 'LaudoClaro — Assinatura Família (20 laudos/mês)',
    preco: 39.90, creditos: 20,
  },
  premium: {
    titulo: 'LaudoClaro — Plano Premium (60 laudos)',
    tituloMensal: 'LaudoClaro — Assinatura Premium (60 laudos/mês)',
    preco: 79.90, creditos: 60,
  },
} as const

export type PlanoId = keyof typeof PLANOS

export function creditosDoPlano(plano: string | null | undefined): number {
  if (plano && plano in PLANOS) return PLANOS[plano as PlanoId].creditos
  return 0
}
