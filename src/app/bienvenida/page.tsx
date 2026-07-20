'use client';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

// Landing de bienvenida de Golazo: explica qué es y cómo se gana, con video.
// Se muestra en la primera visita (ver el flag en la home); "Entrar" marca
// que ya se vio y lleva al sitio de partidos.
export default function Bienvenida() {
  const router = useRouter();

  useEffect(() => {
    try { localStorage.setItem('golazo_bienvenida_vista', '1'); } catch {}
  }, []);

  const entrar = () => router.push('/');

  const pasos = [
    { n: '1', icon: '🔮', title: 'Predice', desc: 'Elige el marcador de los partidos antes de que empiecen. Mundial, Libertadores y más.' },
    { n: '2', icon: '🎯', title: 'Acierta y suma', desc: 'Ganas más puntos si clavas el marcador exacto, y algunos por acertar el ganador.' },
    { n: '3', icon: '🏆', title: 'Sube y canjea', desc: 'Compite en el ranking y tus puntos van a tu billetera TeLoSugiero para canjear.' },
  ];

  return (
    <main className="min-h-screen bg-black text-white">
      <header className="flex items-center justify-between px-5 py-4">
        <div className="flex items-center gap-2.5">
          <span className="text-2xl">⚽</span>
          <div>
            <p className="text-[10px] text-yellow-500 font-bold uppercase tracking-[0.3em] leading-none">Te Lo Sugiero</p>
            <p className="text-lg font-black uppercase leading-none">Golazo</p>
          </div>
        </div>
        <button onClick={entrar} className="text-sm text-gray-400 hover:text-white">Saltar →</button>
      </header>

      <section className="mx-auto max-w-5xl px-5 pb-16 pt-6">
        <div className="text-center">
          <p className="inline-flex rounded-full border border-yellow-500/30 bg-yellow-500/10 px-3 py-1 text-xs font-bold uppercase tracking-widest text-yellow-400">
            ⚡ Polla de predicciones
          </p>
          <h1 className="mx-auto mt-5 max-w-3xl text-4xl font-black uppercase leading-none sm:text-5xl lg:text-6xl">
            Predice, acierta y <span className="text-yellow-400">gana</span>.
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-8 text-gray-400 sm:text-lg">
            Vive cada partido prediciendo el marcador. Suma puntos por tu olfato futbolero y
            canjéalos en TeLoSugiero.
          </p>
          <p className="mx-auto mt-3 inline-flex items-center gap-2 rounded-full border border-green-500/30 bg-green-500/10 px-4 py-1.5 text-xs font-bold uppercase tracking-wide text-green-400">
            🎮 Juego de habilidad · Sin apuestas de dinero · Solo diversión
          </p>
        </div>

        {/* Video promocional */}
        <div className="mx-auto mt-10 max-w-3xl overflow-hidden rounded-3xl border border-yellow-600/40 shadow-[0_30px_80px_-40px_rgba(234,179,8,0.5)]">
          <video
            src="/golazo-promo.mp4"
            poster="/golazo-promo-poster.jpg"
            autoPlay muted loop playsInline controls
            className="w-full"
          />
        </div>

        {/* CTA */}
        <div className="mx-auto mt-8 flex max-w-md flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <button
            onClick={entrar}
            className="w-full rounded-2xl bg-yellow-500 px-8 py-4 text-center text-lg font-black uppercase tracking-wide text-black transition-colors hover:bg-yellow-400 sm:w-auto shadow-[0_0_40px_rgba(234,179,8,0.35)]"
          >
            Entrar a Golazo →
          </button>
        </div>

        {/* Cómo funciona */}
        <div className="mt-20">
          <h2 className="text-center text-2xl font-black uppercase sm:text-3xl">Cómo funciona</h2>
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {pasos.map((p) => (
              <div key={p.n} className="rounded-2xl border border-gray-800 bg-gray-900/60 p-6">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{p.icon}</span>
                  <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-yellow-500 text-sm font-black text-black">{p.n}</span>
                </div>
                <p className="mt-4 text-lg font-black uppercase text-white">{p.title}</p>
                <p className="mt-1.5 text-sm leading-6 text-gray-400">{p.desc}</p>
              </div>
            ))}
          </div>
          <p className="mx-auto mt-8 max-w-2xl text-center text-xs leading-6 text-gray-500">
            Golazo es un juego de predicciones basado en habilidad y conocimiento futbolístico.
            No es una casa de apuestas ni implica dinero real: los puntos son un premio dentro
            del ecosistema TeLoSugiero.
          </p>
        </div>
      </section>
    </main>
  );
}
