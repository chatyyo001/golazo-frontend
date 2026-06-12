'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

const API = 'https://golazo-api-production.up.railway.app';

const FlagImg = ({ code }: { code: string }) => {
  if (!code || code.length < 2) return <span className="w-8 h-6 bg-gray-700 rounded-sm inline-block" />;
  return <img src={'https://flagcdn.com/32x24/' + code.toLowerCase() + '.png'} alt={code} width={32} height={24} className="rounded-sm" />;
};

export default function Predicciones() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [partidos, setPartidos] = useState<any[]>([]);
  const [misPredicciones, setMisPredicciones] = useState<any[]>([]);
  const [preds, setPreds] = useState<{ [key: string]: { home: string; away: string } }>({});
  const [guardando, setGuardando] = useState<string | null>(null);
  const [guardado, setGuardado] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    if (!token || !userData) { router.push('/login'); return; }
    setUser(JSON.parse(userData));

    const headers = { Authorization: 'Bearer ' + token };
    fetch(API + '/api/matches?status=scheduled', { headers })
      .then(r => r.json()).then(d => setPartidos(d.data || []));
    fetch(API + '/api/predictions/me', { headers })
      .then(r => r.json()).then(d => setMisPredicciones(d || []));
  }, []);

  useEffect(() => {
    const map: { [key: string]: { home: string; away: string } } = {};
    misPredicciones.forEach(p => {
      map[p.match_id] = { home: String(p.home_score), away: String(p.away_score) };
    });
    setPreds(map);
  }, [misPredicciones]);

  const guardar = async (matchId: string) => {
    const token = localStorage.getItem('token');
    const pred = preds[matchId];
    if (!pred || pred.home === '' || pred.away === '') return;
    setGuardando(matchId);
    try {
      await fetch(API + '/api/predictions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token },
        body: JSON.stringify({ match_id: matchId, home_score: Number(pred.home), away_score: Number(pred.away) }),
      });
      setGuardado(matchId);
      setTimeout(() => setGuardado(null), 2000);
    } finally {
      setGuardando(null);
    }
  };

  const setPred = (matchId: string, side: 'home' | 'away', val: string) => {
    setPreds(prev => ({ ...prev, [matchId]: { ...prev[matchId], home: prev[matchId]?.home || '', away: prev[matchId]?.away || '', [side]: val } }));
  };

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
          <a href="/ranking" className="text-yellow-400 text-xs font-bold uppercase">Ranking</a>
          <button onClick={() => { localStorage.clear(); router.push('/login'); }} className="text-gray-500 text-xs uppercase">Salir</button>
        </div>
      </header>

      <div className="bg-gradient-to-r from-yellow-600 via-yellow-500 to-yellow-600 px-4 py-2 text-center">
        <p className="text-black font-black text-sm uppercase">Hola {user?.name} — Haz tus predicciones</p>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">
        {partidos.length === 0 && (
          <p className="text-gray-500 text-center py-10">No hay partidos disponibles para predecir.</p>
        )}
        {partidos.map(p => {
          const pred = preds[p.id];
          const yaGuardado = misPredicciones.find(m => m.match_id === p.id);
          return (
            <div key={p.id} className={'bg-gray-900 rounded-xl border overflow-hidden ' + (yaGuardado ? 'border-yellow-700' : 'border-gray-800')}>
              <div className="px-4 py-2 bg-gray-950 flex justify-between text-xs text-gray-500 border-b border-gray-800">
                <span className="text-yellow-700 font-bold">Grupo {p.groups?.name}</span>
                <span>{p.match_date?.split('T')[0]}</span>
              </div>
              <div className="flex items-center px-4 py-4 gap-3">
                <div className="flex items-center gap-2 flex-1 justify-end">
                  <span className="text-sm font-bold">{p.home_team?.name}</span>
                  <FlagImg code={p.home_team?.flag} />
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="0"
                    max="20"
                    value={pred?.home || ''}
                    onChange={e => setPred(p.id, 'home', e.target.value)}
                    className="w-12 h-12 bg-gray-800 border border-gray-700 rounded-lg text-center text-xl font-black text-white focus:outline-none focus:border-yellow-500"
                  />
                  <span className="text-gray-500 font-black">-</span>
                  <input
                    type="number"
                    min="0"
                    max="20"
                    value={pred?.away || ''}
                    onChange={e => setPred(p.id, 'away', e.target.value)}
                    className="w-12 h-12 bg-gray-800 border border-gray-700 rounded-lg text-center text-xl font-black text-white focus:outline-none focus:border-yellow-500"
                  />
                </div>
                <div className="flex items-center gap-2 flex-1">
                  <FlagImg code={p.away_team?.flag} />
                  <span className="text-sm font-bold">{p.away_team?.name}</span>
                </div>
              </div>
              <div className="px-4 pb-4">
                <button
                  onClick={() => guardar(p.id)}
                  disabled={guardando === p.id}
                  className={'w-full py-2 rounded-lg text-sm font-black uppercase transition-colors ' + (guardado === p.id ? 'bg-green-600 text-white' : 'bg-yellow-500 hover:bg-yellow-400 text-black')}
                >
                  {guardado === p.id ? 'Guardado!' : guardando === p.id ? 'Guardando...' : yaGuardado ? 'Actualizar prediccion' : 'Guardar prediccion'}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </main>
  );
}