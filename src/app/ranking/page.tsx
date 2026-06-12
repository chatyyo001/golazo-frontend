'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

const API = 'https://golazo-api-production.up.railway.app';

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

  return (
    <main className="min-h-screen bg-black text-white pb-20">
      <header className="bg-black border-b-2 border-yellow-500 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-2xl">⚽</span>
          <div>
            <p className="text-xs text-yellow-500 font-bold uppercase tracking-widest leading-none">Te Lo Sugiero</p>
            <p className="text-lg font-black text-white uppercase leading-none">SPORTS</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <a href="/predicciones" className="text-yellow-400 text-xs font-bold uppercase">Mis Predicciones</a>
          <button onClick={() => { localStorage.clear(); router.push('/login'); }} className="text-gray-500 text-xs uppercase">Salir</button>
        </div>
      </header>

      <div className="bg-gradient-to-r from-yellow-600 via-yellow-500 to-yellow-600 px-4 py-2 text-center">
        <p className="text-black font-black text-sm uppercase">Ranking — Polla Empresarial</p>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6">
        {loading && <p className="text-gray-500 text-center py-10">Cargando ranking...</p>}
        {!loading && ranking.length === 0 && (
          <p className="text-gray-500 text-center py-10">Aun no hay predicciones registradas.</p>
        )}
        {ranking.map((r, i) => (
          <div key={r.user_id} className={'flex items-center gap-4 px-4 py-3 rounded-xl mb-2 border ' + (r.name === user?.name ? 'bg-yellow-900 border-yellow-600' : 'bg-gray-900 border-gray-800')}>
            <div className={'w-8 h-8 rounded-full flex items-center justify-center font-black text-sm ' + (i === 0 ? 'bg-yellow-500 text-black' : i === 1 ? 'bg-gray-400 text-black' : i === 2 ? 'bg-yellow-700 text-white' : 'bg-gray-800 text-gray-400')}>
              {i + 1}
            </div>
            <div className="flex-1">
              <p className="font-bold text-white text-sm">{r.name}</p>
              <p className="text-gray-500 text-xs">{r.correct_picks} acertadas de {r.total_picks}</p>
            </div>
            <div className="text-right">
              <p className="text-yellow-400 font-black text-xl">{r.points}</p>
              <p className="text-gray-500 text-xs uppercase">pts</p>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}