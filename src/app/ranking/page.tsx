'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

import { API } from '@/lib/config';

function Medal({ pos }: { pos: number }) {
  if (pos === 1) return <span className="text-2xl">🥇</span>;
  if (pos === 2) return <span className="text-2xl">🥈</span>;
  if (pos === 3) return <span className="text-2xl">🥉</span>;
  return (
    <div className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center font-black text-sm text-gray-400">
      {pos}
    </div>
  );
}

export default function Ranking() {
  const router = useRouter();
  const [ranking, setRanking] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) setUser(JSON.parse(userData));
    fetch(API + '/api/predictions/ranking')
      .then(r => r.json())
      .then(d => { setRanking(d || []); setLoading(false); });
  }, []);

  const miPosicion = ranking.findIndex(r => r.name === user?.name);
  const top3 = ranking.slice(0, 3);

  return (
    <main className="min-h-screen bg-black text-white pb-20">
      {/* Header */}
      <header className="bg-black border-b-2 border-yellow-500 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-2xl">⚽</span>
          <div>
            <p className="text-xs text-yellow-500 font-bold uppercase tracking-widest leading-none">Te Lo Sugiero</p>
            <p className="text-lg font-black text-white uppercase leading-none">SPORTS</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <a href="/predicciones" className="text-yellow-400 text-xs font-bold uppercase">Predecir</a>
          <button onClick={() => { localStorage.clear(); router.push('/login'); }} className="text-gray-500 text-xs uppercase">Salir</button>
        </div>
      </header>

      {/* Banner */}
      <div className="bg-gradient-to-r from-yellow-600 via-yellow-500 to-yellow-600 px-4 py-2 text-center">
        <p className="text-black font-black text-sm uppercase">🏆 Ranking — Polla Empresarial</p>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6">
        {loading && <p className="text-gray-500 text-center py-10">Cargando ranking...</p>}

        {!loading && ranking.length === 0 && (
          <p className="text-gray-500 text-center py-10">Aún no hay predicciones registradas.</p>
        )}

        {/* Podio top 3 */}
        {!loading && top3.length > 0 && (
          <div className="flex items-end justify-center gap-3 mb-8 pt-4">
            {/* 2do lugar */}
            {top3[1] && (
              <div className="flex flex-col items-center flex-1">
                <p className="text-2xl mb-1">🥈</p>
                <div className="bg-gray-700 rounded-t-xl w-full py-4 text-center">
                  <p className="font-black text-white text-xs truncate px-1">{top3[1].name.split(' ')[0]}</p>
                  <p className="text-gray-300 font-black text-xl">{top3[1].points}</p>
                  <p className="text-gray-500 text-xs">pts</p>
                </div>
              </div>
            )}
            {/* 1er lugar */}
            {top3[0] && (
              <div className="flex flex-col items-center flex-1">
                <p className="text-3xl mb-1">🥇</p>
                <div className="bg-yellow-600 rounded-t-xl w-full py-6 text-center">
                  <p className="font-black text-black text-xs truncate px-1">{top3[0].name.split(' ')[0]}</p>
                  <p className="text-black font-black text-2xl">{top3[0].points}</p>
                  <p className="text-yellow-900 text-xs">pts</p>
                </div>
              </div>
            )}
            {/* 3er lugar */}
            {top3[2] && (
              <div className="flex flex-col items-center flex-1">
                <p className="text-2xl mb-1">🥉</p>
                <div className="bg-yellow-900 rounded-t-xl w-full py-3 text-center">
                  <p className="font-black text-white text-xs truncate px-1">{top3[2].name.split(' ')[0]}</p>
                  <p className="text-yellow-200 font-black text-xl">{top3[2].points}</p>
                  <p className="text-yellow-700 text-xs">pts</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Mi posición destacada (si no estoy en top 3) */}
        {!loading && miPosicion > 2 && (
          <div className="bg-yellow-900 border-2 border-yellow-500 rounded-xl px-4 py-3 mb-4 flex items-center gap-4">
            <Medal pos={miPosicion + 1} />
            <div className="flex-1">
              <p className="font-black text-yellow-400 text-sm">TU POSICIÓN</p>
              <p className="font-bold text-white text-sm">{ranking[miPosicion]?.name}</p>
              <p className="text-gray-400 text-xs">{ranking[miPosicion]?.correct_picks} acertadas de {ranking[miPosicion]?.total_picks}</p>
            </div>
            <div className="text-right">
              <p className="text-yellow-400 font-black text-2xl">{ranking[miPosicion]?.points}</p>
              <p className="text-gray-500 text-xs uppercase">pts</p>
            </div>
          </div>
        )}

        {/* Lista completa */}
        {!loading && ranking.length > 0 && (
          <div className="space-y-2">
            <p className="text-gray-600 text-xs uppercase font-bold mb-3">Tabla completa</p>
            {ranking.map((r, i) => {
              const esMio = r.name === user?.name;
              return (
                <div
                  key={r.user_id}
                  className={'flex items-center gap-4 px-4 py-3 rounded-xl border transition-colors ' +
                    (esMio ? 'bg-yellow-900/50 border-yellow-600' : 'bg-gray-900 border-gray-800')}
                >
                  <Medal pos={i + 1} />
                  <div className="flex-1 min-w-0">
                    <p className={'font-bold text-sm truncate ' + (esMio ? 'text-yellow-400' : 'text-white')}>
                      {r.name} {esMio && <span className="text-xs text-yellow-600">(tú)</span>}
                    </p>
                    <p className="text-gray-500 text-xs">
                      {r.correct_picks} acertadas · {r.total_picks} predicciones
                    </p>
                  </div>
                  <div className="text-right">
                    <p className={'font-black text-xl ' + (esMio ? 'text-yellow-400' : 'text-white')}>{r.points}</p>
                    <p className="text-gray-600 text-xs uppercase">pts</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
