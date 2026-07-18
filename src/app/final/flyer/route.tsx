import { ImageResponse } from 'next/og';

// Flyer 1080x1350 (formato feed / reenvío en chats de WhatsApp).
// Se descarga abriendo golazo.telosugiero.com/final/flyer
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
          background: 'radial-gradient(ellipse at 50% 0%, #4a3c00 0%, #000000 55%)',
          color: 'white',
          fontFamily: 'sans-serif',
          padding: '70px 60px',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ display: 'flex', color: '#eab308', fontSize: 30, letterSpacing: 16, textTransform: 'uppercase', fontWeight: 700 }}>
            Te Lo Sugiero Sports
          </div>
          <div style={{ display: 'flex', fontSize: 110, fontWeight: 900, textTransform: 'uppercase', color: '#facc15', marginTop: 10 }}>
            La Gran Final
          </div>
          <div style={{ display: 'flex', fontSize: 34, color: '#d1d5db', marginTop: 6 }}>
            Domingo 19 de julio · 3:00 p.m. (Colombia)
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 50 }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 18 }}>
            <img src="https://flagcdn.com/w320/es.png" width={300} style={{ borderRadius: 18 }} />
            <div style={{ display: 'flex', fontSize: 46, fontWeight: 900, textTransform: 'uppercase' }}>España</div>
          </div>
          <div style={{ display: 'flex', fontSize: 84, fontWeight: 900, color: '#eab308', fontStyle: 'italic' }}>VS</div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 18 }}>
            <img src="https://flagcdn.com/w320/ar.png" width={300} style={{ borderRadius: 18 }} />
            <div style={{ display: 'flex', fontSize: 46, fontWeight: 900, textTransform: 'uppercase' }}>Argentina</div>
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            background: 'rgba(250, 204, 21, 0.08)',
            border: '2px solid rgba(250, 204, 21, 0.5)',
            borderRadius: 28,
            padding: '34px 50px',
            gap: 12,
          }}
        >
          <div style={{ display: 'flex', fontSize: 44, fontWeight: 900, textTransform: 'uppercase', color: '#facc15' }}>
            ¿Te atreves a predecir el marcador?
          </div>
          <div style={{ display: 'flex', fontSize: 30, color: '#e5e7eb' }}>
            Juega gratis · Sin apuestas · Gana puntos canjeables
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 34 }}>
          <img
            src="https://api.qrserver.com/v1/create-qr-code/?size=220x220&margin=10&data=https%3A%2F%2Fgolazo.telosugiero.com%2Ffinal"
            width={190}
            height={190}
            style={{ borderRadius: 16 }}
          />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ display: 'flex', fontSize: 30, color: '#9ca3af' }}>Escanea o entra a</div>
            <div style={{ display: 'flex', fontSize: 38, fontWeight: 900, color: '#facc15' }}>
              golazo.telosugiero.com/final
            </div>
          </div>
        </div>
      </div>
    ),
    { width: 1080, height: 1350 }
  );
}
