'use client';
import { useEffect, useState } from 'react';

// Motion poster para estados de WhatsApp: abrir en el celular, grabar la
// pantalla ~15s y subir el video como estado. El ciclo completo dura 14s.
const KICKOFF = '2026-07-19T20:00:00Z';

function useCountdown(target: string) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);
  const diff = Math.max(0, new Date(target).getTime() - now);
  return {
    hours: Math.floor(diff / 3600000),
    minutes: Math.floor(diff / 60000) % 60,
    seconds: Math.floor(diff / 1000) % 60,
  };
}

export default function FinalTvPage() {
  const cd = useCountdown(KICKOFF);
  return (
    <main className="fixed inset-0 bg-black text-white overflow-hidden select-none">
      <style>{`
        @keyframes beamTv { 0%,100% { transform:rotate(-14deg) translateX(-10%); opacity:.15 } 50% { transform:rotate(-6deg) translateX(10%); opacity:.4 } }
        @keyframes beamTv2 { 0%,100% { transform:rotate(12deg) translateX(8%); opacity:.12 } 50% { transform:rotate(20deg) translateX(-8%); opacity:.32 } }
        @keyframes gold { 0%,100% { opacity:.5 } 50% { opacity:1 } }
        @keyframes spark { 0% { transform:translateY(0); opacity:0 } 12% { opacity:.9 } 100% { transform:translateY(-105vh); opacity:0 } }
        @keyframes shimmerTv { 0% { background-position:-200% center } 100% { background-position:200% center } }
        .gold-text {
          background: linear-gradient(110deg,#facc15 25%,#fff7d6 45%,#facc15 65%);
          background-size:200% auto; -webkit-background-clip:text; background-clip:text; color:transparent;
          animation: shimmerTv 4s linear infinite;
        }
        /* Escenas del ciclo de 14s */
        @keyframes esc1 { 0%{opacity:0; transform:scale(.7)} 4%{opacity:1; transform:scale(1)} 19%{opacity:1; transform:scale(1.04)} 23%{opacity:0; transform:scale(1.1)} 100%{opacity:0} }
        @keyframes esc2L { 0%,21%{opacity:0; transform:translateX(-70vw)} 27%{opacity:1; transform:translateX(0)} 47%{opacity:1} 52%{opacity:0; transform:translateX(-16vw)} 100%{opacity:0} }
        @keyframes esc2R { 0%,21%{opacity:0; transform:translateX(70vw)} 27%{opacity:1; transform:translateX(0)} 47%{opacity:1} 52%{opacity:0; transform:translateX(16vw)} 100%{opacity:0} }
        @keyframes esc2V { 0%,24%{opacity:0; transform:scale(3)} 29%{opacity:1; transform:scale(1)} 47%{opacity:1} 52%{opacity:0} 100%{opacity:0} }
        @keyframes esc3 { 0%,50%{opacity:0; transform:translateY(9vh)} 56%{opacity:1; transform:translateY(0)} 71%{opacity:1} 76%{opacity:0; transform:translateY(-4vh)} 100%{opacity:0} }
        @keyframes esc4 { 0%,74%{opacity:0; transform:scale(.85)} 80%{opacity:1; transform:scale(1)} 97%{opacity:1} 100%{opacity:0} }
        .esc { position:absolute; inset:0; display:flex; flex-direction:column; align-items:center; justify-content:center; text-align:center; padding:0 7vw }
      `}</style>

      {/* Fondo permanente: reflectores y chispas doradas */}
      <div aria-hidden className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-40 left-1/4 w-[80vw] h-[80vw] rounded-full bg-yellow-500/15 blur-[90px]" style={{ animation: 'gold 5s ease-in-out infinite' }} />
        <div className="absolute -bottom-40 right-0 w-[70vw] h-[70vw] rounded-full bg-amber-600/15 blur-[110px]" style={{ animation: 'gold 7s ease-in-out infinite' }} />
        <div className="absolute -top-24 left-[6%] w-24 h-[130vh] origin-top bg-gradient-to-b from-yellow-100/35 via-yellow-200/10 to-transparent blur-xl" style={{ animation: 'beamTv 7s ease-in-out infinite' }} />
        <div className="absolute -top-24 right-[8%] w-28 h-[130vh] origin-top bg-gradient-to-b from-amber-100/30 via-amber-200/8 to-transparent blur-xl" style={{ animation: 'beamTv2 9s ease-in-out infinite' }} />
        {Array.from({ length: 18 }).map((_, i) => (
          <span
            key={i}
            className="absolute bottom-0 w-1.5 h-1.5 rounded-full bg-yellow-300"
            style={{ left: `${(i * 41) % 100}%`, animation: `spark ${6 + (i % 5)}s linear ${(i % 9) * 1.1}s infinite` }}
          />
        ))}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_30%,rgba(0,0,0,0.92)_100%)]" />
      </div>

      {/* Escena 1: MAÑANA + cuenta regresiva viva */}
      <div className="esc" style={{ animation: 'esc1 14s ease-in-out infinite' }}>
        <p className="text-yellow-500 text-sm font-bold uppercase tracking-[0.5em] mb-4">Te Lo Sugiero Sports</p>
        <h1 className="gold-text text-[19vw] leading-none font-black uppercase">Mañana</h1>
        <p className="text-white text-[6vw] font-black uppercase mt-3">La Gran Final</p>
        <div className="flex gap-3 mt-8 tabular-nums">
          {[[cd.hours, 'Horas'], [cd.minutes, 'Min'], [cd.seconds, 'Seg']].map(([v, l]) => (
            <div key={String(l)} className="flex flex-col items-center">
              <span className="bg-white/10 border border-yellow-500/40 rounded-2xl px-4 py-2 text-[9vw] font-black text-yellow-300">
                {String(v).padStart(2, '0')}
              </span>
              <span className="text-[2.6vw] uppercase tracking-[0.3em] text-gray-400 mt-2">{String(l)}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Escena 2: el duelo */}
      <div className="esc">
        <div className="flex flex-col items-center gap-2" style={{ animation: 'esc2L 14s ease-in-out infinite' }}>
          <img src="https://flagcdn.com/w320/es.png" alt="España" className="w-[52vw] rounded-2xl shadow-[0_0_70px_rgba(234,179,8,0.4)]" />
          <p className="text-[7vw] font-black uppercase">España</p>
        </div>
        <p className="gold-text text-[13vw] font-black italic my-2" style={{ animation: 'esc2V 14s ease-in-out infinite' }}>VS</p>
        <div className="flex flex-col items-center gap-2" style={{ animation: 'esc2R 14s ease-in-out infinite' }}>
          <img src="https://flagcdn.com/w320/ar.png" alt="Argentina" className="w-[52vw] rounded-2xl shadow-[0_0_70px_rgba(56,189,248,0.35)]" />
          <p className="text-[7vw] font-black uppercase">Argentina</p>
        </div>
      </div>

      {/* Escena 3: el reto */}
      <div className="esc" style={{ animation: 'esc3 14s ease-in-out infinite' }}>
        <p className="gold-text text-[11vw] leading-tight font-black uppercase">¿Te atreves a predecir el marcador?</p>
        <p className="text-gray-200 text-[4.5vw] font-bold mt-6 uppercase tracking-widest">Juega gratis · Sin apuestas</p>
        <p className="text-yellow-400 text-[5vw] font-black mt-3">Marcador exacto +3 pts 🎯</p>
      </div>

      {/* Escena 4: llamado final */}
      <div className="esc" style={{ animation: 'esc4 14s ease-in-out infinite' }}>
        <p className="text-white text-[6vw] font-black uppercase mb-6">Entra ya</p>
        <p className="gold-text text-[6.5vw] font-black break-all">golazo.telosugiero.com/final</p>
        <img
          src="https://api.qrserver.com/v1/create-qr-code/?size=300x300&margin=10&data=https%3A%2F%2Fgolazo.telosugiero.com%2Ffinal"
          alt="QR"
          className="w-[40vw] rounded-2xl mt-8"
        />
        <p className="text-gray-400 text-[3.4vw] mt-6">Acumula puntos · Canjeables muy pronto en TeLoSugiero</p>
      </div>
    </main>
  );
}
