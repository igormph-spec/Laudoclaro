import type { Metadata } from 'next'
import { ClerkProvider } from '@clerk/nextjs'
import { ptBR } from '@clerk/localizations'

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
  elements: {
    card: {
      boxShadow: '0 4px 24px rgba(108,155,210,0.15)',
      borderRadius: '20px',
      border: 'none',
    },
    headerTitle: {
      color: '#2c3e6b',
      fontWeight: '700',
    },
    headerSubtitle: {
      color: '#6b7a99',
    },
    formButtonPrimary: {
      background: 'linear-gradient(135deg, #6c9bd2, #4a7abf)',
      borderRadius: '12px',
      fontWeight: '600',
      fontSize: '1rem',
      '&:hover': {
        background: 'linear-gradient(135deg, #5a8bc2, #3a6aaf)',
      },
    },
    formFieldInput: {
      borderColor: '#d8e4f0',
      borderRadius: '12px',
      color: '#2c3e6b',
      '&:focus': {
        borderColor: '#6c9bd2',
      },
    },
    footerActionLink: {
      color: '#4a7abf',
      fontWeight: '600',
    },
    identityPreviewText: {
      color: '#2c3e6b',
    },
    socialButtonsBlockButton: {
      borderRadius: '12px',
      borderColor: '#d8e4f0',
      color: '#2c3e6b',
    },
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClerkProvider localization={ptBR} appearance={clerkAppearance}>
      <html lang="pt-BR">
        <body>{children}</body>
      </html>
    </ClerkProvider>
  )
}
