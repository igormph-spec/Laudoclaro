import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'LaudoClaro',
  description: 'Entenda seu laudo de ressonância em linguagem simples',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  )
}
