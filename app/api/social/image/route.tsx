import { ImageResponse } from 'next/og'
import { NextRequest } from 'next/server'

export const runtime = 'edge'

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams
  const tpl = sp.get('t') || 'hook'
  const t1 = sp.get('t1') || 'LaudoClaro'
  const t2 = sp.get('t2') || 'Entenda seu laudo'

  let node: React.ReactNode

  if (tpl === 'hook') {
    node = (
      <div style={{
        width: '100%', height: '100%', background: '#0A0A0A',
        display: 'flex', flexDirection: 'column',
        justifyContent: 'space-between', padding: '90px 80px',
        fontFamily: 'system-ui, sans-serif',
      }}>
        <span style={{ fontSize: 26, color: 'rgba(255,255,255,0.25)', fontWeight: 700, letterSpacing: 8, textTransform: 'uppercase' as const }}>
          laudoclaro_br
        </span>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
          <span style={{ fontSize: 88, fontWeight: 900, color: '#fff', lineHeight: 1.0, textTransform: 'uppercase' as const, letterSpacing: -3 }}>
            {t1}
          </span>
          <span style={{ fontSize: 36, color: '#888', lineHeight: 1.5 }}>
            {t2}
          </span>
        </div>
        <span style={{ fontSize: 24, color: 'rgba(255,255,255,0.2)', fontWeight: 600, letterSpacing: 4 }}>
          laudoclaro1.vercel.app
        </span>
      </div>
    )
  } else if (tpl === 'edu') {
    node = (
      <div style={{
        width: '100%', height: '100%', background: '#1B3F6E',
        display: 'flex', flexDirection: 'column',
        padding: '90px 80px', fontFamily: 'system-ui, sans-serif',
      }}>
        <span style={{ fontSize: 24, color: '#6B9FD4', fontWeight: 700, letterSpacing: 6, textTransform: 'uppercase' as const }}>
          Você sabe o que significa?
        </span>
        <span style={{ fontSize: 78, fontWeight: 900, color: '#fff', marginTop: 28, lineHeight: 1.05 }}>
          {t1}
        </span>
        <span style={{ fontSize: 36, color: '#B8D4F0', marginTop: 40, lineHeight: 1.55, flex: 1 }}>
          {t2}
        </span>
        <span style={{ fontSize: 24, color: '#4B9FE1', fontWeight: 700, letterSpacing: 4, textTransform: 'uppercase' as const }}>
          → O LaudoClaro explica em segundos
        </span>
      </div>
    )
  } else if (tpl === 'prova') {
    node = (
      <div style={{
        width: '100%', height: '100%', background: '#00C896',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        padding: '80px', fontFamily: 'system-ui, sans-serif',
      }}>
        <span style={{ fontSize: 160, fontWeight: 900, color: '#fff', lineHeight: 0.85 }}>
          {t1}
        </span>
        <span style={{ fontSize: 44, fontWeight: 700, color: 'rgba(255,255,255,0.9)', marginTop: 32, textAlign: 'center' as const, lineHeight: 1.3 }}>
          {t2}
        </span>
        <span style={{ fontSize: 26, color: 'rgba(255,255,255,0.55)', marginTop: 32, fontWeight: 600 }}>
          laudoclaro_br
        </span>
      </div>
    )
  } else {
    // cta
    node = (
      <div style={{
        width: '100%', height: '100%', background: '#fff',
        display: 'flex', flexDirection: 'column',
        fontFamily: 'system-ui, sans-serif',
      }}>
        <div style={{ background: '#1B3F6E', padding: '80px 80px 65px', display: 'flex', flexDirection: 'column' }}>
          <span style={{ fontSize: 24, color: '#4B9FE1', fontWeight: 700, letterSpacing: 6, textTransform: 'uppercase' as const, marginBottom: 18 }}>
            Oferta de lançamento
          </span>
          <span style={{ fontSize: 96, fontWeight: 900, color: '#fff', lineHeight: 1.0 }}>
            {t1}
          </span>
        </div>
        <div style={{ padding: '55px 80px', display: 'flex', flexDirection: 'column', flex: 1 }}>
          <span style={{ fontSize: 38, color: '#444', lineHeight: 1.5 }}>
            {t2}
          </span>
          <div style={{
            display: 'flex', background: '#1B3F6E', borderRadius: 50,
            padding: '22px 52px', marginTop: 40, alignSelf: 'flex-start' as const,
          }}>
            <span style={{ fontSize: 30, color: '#fff', fontWeight: 700 }}>Acessar agora →</span>
          </div>
        </div>
      </div>
    )
  }

  return new ImageResponse(node, { width: 1080, height: 1080 })
}
