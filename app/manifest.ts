import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'LaudoClaro',
    short_name: 'LaudoClaro',
    description: 'Entenda qualquer laudo médico em linguagem simples',
    start_url: '/',
    display: 'standalone',
    background_color: '#f5f0ff',
    theme_color: '#4a7abf',
    orientation: 'portrait',
    icons: [
      {
        src: '/icon.svg',
        sizes: 'any',
        type: 'image/svg+xml',
        purpose: 'any',
      },
      {
        src: '/icon.svg',
        sizes: 'any',
        type: 'image/svg+xml',
        purpose: 'maskable',
      },
    ],
  }
}
