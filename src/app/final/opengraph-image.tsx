import { ImageResponse } from 'next/og';

export const alt = 'La Gran Final · España vs Argentina — Golazo';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'radial-gradient(ellipse at 50% 0%, #3b3000 0%, #000000 60%)',
          color: 'white',
          fontFamily: 'sans-serif',
        }}
      >
        <div style={{ display: 'flex', color: '#eab308', fontSize: 26, letterSpacing: 14, textTransform: 'uppercase', fontWeight: 700 }}>
          Te Lo Sugiero Sports
        </div>
        <div style={{ display: 'flex', fontSize: 92, fontWeight: 900, textTransform: 'uppercase', marginTop: 14, color: '#facc15' }}>
          La Gran Final
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 40, marginTop: 34 }}>
          <img src="https://flagcdn.com/w320/es.png" width={220} style={{ borderRadius: 14 }} />
          <div style={{ display: 'flex', fontSize: 64, fontWeight: 900, color: '#eab308', fontStyle: 'italic' }}>VS</div>
          <img src="https://flagcdn.com/w320/ar.png" width={220} style={{ borderRadius: 14 }} />
        </div>
        <div style={{ display: 'flex', fontSize: 40, fontWeight: 900, marginTop: 30, textTransform: 'uppercase' }}>
          España · Argentina
        </div>
        <div style={{ display: 'flex', fontSize: 26, color: '#9ca3af', marginTop: 14 }}>
          Predice el marcador gratis y gana puntos · Domingo 3:00 p.m.
        </div>
        <div style={{ display: 'flex', fontSize: 24, color: '#eab308', marginTop: 8, fontWeight: 700 }}>
          golazo.telosugiero.com/final
        </div>
      </div>
    ),
    size
  );
}
