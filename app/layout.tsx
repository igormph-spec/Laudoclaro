import type { Metadata } from 'next'
import { ClerkProvider } from '@clerk/nextjs'

export const metadata: Metadata = {
  title: 'LaudoClaro',
  description: 'Entenda qualquer laudo médico em linguagem simples',
}

const clerkAppearance = {
  variables: {
    colorPrimary: '#4a7abf',
    colorBackground: '#ffffff',
    colorText: '#2c3e6b',
    colorTextSecondary: '#6b7a99',
    colorInputBackground: '#ffffff',
    colorInputText: '#2c3e6b',
    borderRadius: '12px',
    fontFamily: "'Segoe UI', system-ui, sans-serif",
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClerkProvider appearance={clerkAppearance}>
      <html lang="pt-BR">
        <body>{children}</body>
      </html>
    </ClerkProvider>
  )
}
