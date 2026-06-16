import type { Metadata, Viewport } from 'next'
import { ClerkProvider } from '@clerk/nextjs'

export const metadata: Metadata = {
  title: 'LaudoClaro',
  description: 'Entenda qualquer laudo médico em linguagem simples',
  manifest: '/manifest.webmanifest',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'LaudoClaro',
  },
  icons: {
    icon: '/icon.svg',
    apple: '/icon.svg',
  },
}

export const viewport: Viewport = {
  themeColor: '#4a7abf',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
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
