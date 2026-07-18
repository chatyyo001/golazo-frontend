import { ImageResponse } from 'next/og';

// Flyer vertical 1080x1920 (estados de WhatsApp / stories).
// Se descarga abriendo golazo.telosugiero.com/final/flyer-estado
export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'radial-gradient(ellipse at 50% 12%, #4a3c00 0%, #000000 55%)',
          color: 'white',
          fontFamily: 'sans-serif',
          padding: '110px 60px',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ display: 'flex', color: '#eab308', fontSize: 32, letterSpacing: 18, textTransform: 'uppercase', fontWeight: 700 }}>
            Te Lo Sugiero Sports
          </div>
          <div style={{ display: 'flex', fontSize: 118, fontWeight: 900, textTransform: 'uppercase', color: '#facc15', marginTop: 14 }}>
            La Gran Final
          </div>
          <div style={{ display: 'flex', fontSize: 38, color: '#d1d5db', marginTop: 10 }}>
            Domingo · 3:00 p.m. (Colombia)
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 56 }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>
            <img src="https://flagcdn.com/w320/es.png" width={420} style={{ borderRadius: 22 }} />
            <div style={{ display: 'flex', fontSize: 56, fontWeight: 900, textTransform: 'uppercase' }}>España</div>
          </div>
          <div style={{ display: 'flex', fontSize: 90, fontWeight: 900, color: '#eab308', fontStyle: 'italic' }}>VS</div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>
            <img src="https://flagcdn.com/w320/ar.png" width={420} style={{ borderRadius: 22 }} />
            <div style={{ display: 'flex', fontSize: 56, fontWeight: 900, textTransform: 'uppercase' }}>Argentina</div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 30 }}>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              background: 'rgba(250, 204, 21, 0.08)',
              border: '2px solid rgba(250, 204, 21, 0.5)',
              borderRadius: 30,
              padding: '36px 54px',
              gap: 12,
            }}
          >
            <div style={{ display: 'flex', fontSize: 48, fontWeight: 900, textTransform: 'uppercase', color: '#facc15' }}>
              Predice el marcador
            </div>
            <div style={{ display: 'flex', fontSize: 32, color: '#e5e7eb' }}>
              Gratis · Sin apuestas · Acumula puntos
            </div>
            <div style={{ display: 'flex', fontSize: 26, color: '#9ca3af' }}>
              Canjeables muy pronto en TeLoSugiero
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 34 }}>
            <img
              src="https://api.qrserver.com/v1/create-qr-code/?size=240x240&margin=10&data=https%3A%2F%2Fgolazo.telosugiero.com%2Ffinal"
              width={210}
              height={210}
              style={{ borderRadius: 16 }}
            />
            <div style={{ display: 'flex', fontSize: 40, fontWeight: 900, color: '#facc15', maxWidth: 480 }}>
              golazo.telosugiero.com/final
            </div>
          </div>
        </div>
      </div>
    ),
    { width: 1080, height: 1920 }
  );
}
