'use client'

import { useEffect, useState } from 'react'

function isIOS() {
  if (typeof navigator === 'undefined') return false
  return /iphone|ipad|ipod/i.test(navigator.userAgent)
}

function isStandalone() {
  if (typeof window === 'undefined') return false
  return (window.navigator as any).standalone === true
}

export default function PWASetup() {
  const [mostrarBanner, setMostrarBanner] = useState(false)

  useEffect(() => {
    // Registrar service worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(() => {})
    }

    // Mostrar banner de instalação só no iOS Safari, fora do modo standalone
    if (isIOS() && !isStandalone()) {
      const jaFechou = sessionStorage.getItem('pwa_banner_fechado')
      if (!jaFechou) setMostrarBanner(true)
    }
  }, [])

  if (!mostrarBanner) return null

  return (
    <div style={{
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      background: 'white',
      borderTop: '1px solid #e8edf5',
      padding: '16px 20px 28px',
      boxShadow: '0 -4px 24px rgba(108,155,210,0.15)',
      zIndex: 9999,
      fontFamily: "'Segoe UI', system-ui, sans-serif"
    }}>
      <button
        onClick={() => { sessionStorage.setItem('pwa_banner_fechado', '1'); setMostrarBanner(false) }}
        style={{
          position: 'absolute', top: '12px', right: '16px',
          background: 'none', border: 'none', fontSize: '1.2rem',
          color: '#9aa3b8', cursor: 'pointer', padding: 0
        }}
      >
        ✕
      </button>

      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
        <svg width="40" height="40" viewBox="0 0 56 56" fill="none">
          <circle cx="28" cy="28" r="28" fill="#6c9bd2"/>
          <text x="28" y="36" textAnchor="middle" fontSize="18" fill="white">🩺</text>
        </svg>
        <div>
          <div style={{ fontWeight: '700', color: '#2c3e6b', fontSize: '0.95rem' }}>
            Instalar o LaudoClaro
          </div>
          <div style={{ color: '#6b7a99', fontSize: '0.82rem' }}>
            Adicione à tela inicial para acesso rápido
          </div>
        </div>
      </div>

      <div style={{ background: '#f5f0ff', borderRadius: '12px', padding: '12px 14px' }}>
        <p style={{ margin: '0 0 6px', color: '#4a5580', fontSize: '0.85rem', fontWeight: '600' }}>
          Como instalar no iPhone:
        </p>
        <ol style={{ margin: 0, paddingLeft: '18px', color: '#6b7a99', fontSize: '0.83rem', lineHeight: '1.7' }}>
          <li>Toque no ícone <strong>compartilhar</strong> <span style={{ fontSize: '1rem' }}>⎋</span> na barra do Safari</li>
          <li>Role para baixo e toque em <strong>"Adicionar à Tela de Início"</strong></li>
          <li>Toque em <strong>"Adicionar"</strong> no canto superior direito</li>
        </ol>
      </div>
    </div>
  )
}
