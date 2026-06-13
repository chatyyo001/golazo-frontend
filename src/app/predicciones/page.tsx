'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

const API = 'https://golazo-api-production.up.railway.app';

const FlagImg = ({ code }: { code: string }) => {
  if (!code || code.length < 2) return <span className="w-8 h-6 bg-gray-700 rounded-sm inline-block" />;
  return <img src={'https://flagcdn.com/32x24/' + code.toLowerCase() + '.png'} alt={code} width={32} height={24} className="rounded-sm" />;
};

function formatFecha(dateStr: string) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString('es-CO', { day: '2-digit', month: 'short', timeZone: 'America/Bogota' }) +
    ' ' + d.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit', timeZone: 'America/Bogota' });
}

function PuntosChip({ pts }: { pts: number | null }) {
  if (pts === null || pts === undefined) return <span className="text-xs text-gray-600 uppercase">Pendiente</span>;
  if (pts === 3) return <span className="bg-green-600 text-white text-xs font-black px-2 py-1 rounded-full">+3 EXACTO</span>;
  if (pts === 1) return <span className="bg-yellow-600 text-black text-xs font-black px-2 py-1 rounded-full">+1 GANADOR</span>;
  return <span className="bg-gray-800 text-gray-400 text-xs font-black px-2 py-1 rounded-full">0 pts</span>;
}

export default function Predicciones() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [tab, setTab] = useState<'predecir' | 'historial'>('predecir');
  const [partidos, setPartidos] = useState<any[]>([]);
  const [misPredicciones, setMisPredicciones] = useState<any[]>([]);
  const [preds, setPreds] = useState<{ [key: string]: { home: string; away: string } }>({});
  const [guardando, setGuardando] = useState<string | null>(null);
  const [guardado, setGuardado] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    if (!token || !userData) { router.push('/login'); return; }
    setUser(JSON.parse(userData));

    const headers = { Authorization: 'Bearer ' + token };

    Promise.all([
      fetch(API + '/api/matches?status=scheduled', { headers }).then(r => r.json()),
      fetch(API + '/api/predictions/me', { headers }).then(r => r.json()),
    ]).then(([matchesData, predsData]) => {
      setPartidos(matchesData.data || []);
      setMisPredicciones(predsData || []);
      setLoading(false);
    });
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
      // Refrescar predicciones
      const headers = { Authorization: 'Bearer ' + token };
      fetch(API + '/api/predictions/me', { headers }).then(r => r.json()).then(d => setMisPredicciones(d || []));
    } finally {
      setGuardando(null);
    }
  };

  const setPred = (matchId: string, side: 'home' | 'away', val: string) => {
    setPreds(prev => ({ ...prev, [matchId]: { ...prev[matchId], home: prev[matchId]?.home || '', away: prev[matchId]?.away || '', [side]: val } }));
  };

  // Historial: predicciones de partidos terminados
  const historial = misPredicciones.filter(p => p.matches?.status === 'finished');
  const totalPts = historial.reduce((sum, p) => sum + (p.points || 0), 0);
  const exactas = historial.filter(p => p.points === 3).length;
  const ganador = historial.filter(p => p.points === 1).length;

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
          <a href="/ranking" className="text-yellow-400 text-xs font-bold uppercase">Ranking</a>
          <button onClick={() => { localStorage.clear(); router.push('/login'); }} className="text-gray-500 text-xs uppercase">Salir</button>
        </div>
      </header>

      {/* Banner usuario */}
      <div className="bg-gradient-to-r from-yellow-600 via-yellow-500 to-yellow-600 px-4 py-2 text-center">
        <p className="text-black font-black text-sm uppercase">Hola {user?.name} — Polla Empresarial</p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-800 bg-gray-950">
        <button
          onClick={() => setTab('predecir')}
          className={'flex-1 py-3 text-sm font-black uppercase tracking-wide transition-colors ' + (tab === 'predecir' ? 'text-yellow-400 border-b-2 border-yellow-400' : 'text-gray-500')}
        >
          Predecir
        </button>
        <button
          onClick={() => setTab('historial')}
          className={'flex-1 py-3 text-sm font-black uppercase tracking-wide transition-colors ' + (tab === 'historial' ? 'text-yellow-400 border-b-2 border-yellow-400' : 'text-gray-500')}
        >
          Mis Resultados {historial.length > 0 && <span className="ml-1 text-xs bg-yellow-500 text-black px-1.5 py-0.5 rounded-full">{historial.length}</span>}
        </button>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">

        {/* ── TAB PREDECIR ── */}
        {tab === 'predecir' && (
          <>
            {loading && <p className="text-gray-500 text-center py-10">Cargando partidos...</p>}
            {!loading && partidos.length === 0 && (
              <p className="text-gray-500 text-center py-10">No hay partidos disponibles para predecir.</p>
            )}
            {partidos.map(p => {
              const pred = preds[p.id];
              const yaGuardado = misPredicciones.find(m => m.match_id === p.id);
              return (
                <div key={p.id} className={'bg-gray-900 rounded-xl border overflow-hidden ' + (yaGuardado ? 'border-yellow-700' : 'border-gray-800')}>
                  <div className="px-4 py-2 bg-gray-950 flex justify-between text-xs text-gray-500 border-b border-gray-800">
                    <span className="text-yellow-700 font-bold">Grupo {p.groups?.name}</span>
                    <span>{formatFecha(p.match_date)}</span>
                  </div>
                  <div className="flex items-center px-4 py-4 gap-3">
                    <div className="flex items-center gap-2 flex-1 justify-end">
                      <span className="text-sm font-bold text-right">{p.home_team?.name}</span>
                      <FlagImg code={p.home_team?.flag} />
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="number" min="0" max="20"
                        value={pred?.home || ''}
                        onChange={e => setPred(p.id, 'home', e.target.value)}
                        className="w-12 h-12 bg-gray-800 border border-gray-700 rounded-lg text-center text-xl font-black text-white focus:outline-none focus:border-yellow-500"
                      />
                      <span className="text-gray-500 font-black">-</span>
                      <input
                        type="number" min="0" max="20"
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
                      {guardado === p.id ? '✓ Guardado!' : guardando === p.id ? 'Guardando...' : yaGuardado ? 'Actualizar prediccion' : 'Guardar prediccion'}
                    </button>
                  </div>
                </div>
              );
            })}
          </>
        )}

        {/* ── TAB HISTORIAL ── */}
        {tab === 'historial' && (
          <>
            {/* Resumen de puntos */}
            {historial.length > 0 && (
              <div className="grid grid-cols-3 gap-3 mb-2">
                <div className="bg-gray-900 border border-yellow-700 rounded-xl p-3 text-center">
                  <p className="text-yellow-400 font-black text-2xl">{totalPts}</p>
                  <p className="text-gray-500 text-xs uppercase">Pts Total</p>
                </div>
                <div className="bg-gray-900 border border-green-800 rounded-xl p-3 text-center">
                  <p className="text-green-400 font-black text-2xl">{exactas}</p>
                  <p className="text-gray-500 text-xs uppercase">Exactas</p>
                </div>
                <div className="bg-gray-900 border border-gray-700 rounded-xl p-3 text-center">
                  <p className="text-white font-black text-2xl">{ganador}</p>
                  <p className="text-gray-500 text-xs uppercase">Ganador</p>
                </div>
              </div>
            )}

            {historial.length === 0 && (
              <p className="text-gray-500 text-center py-10">Aún no hay partidos terminados con tus predicciones.</p>
            )}

            {historial.map(p => {
              const m = p.matches;
              return (
                <div key={p.id} className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
                  <div className="px-4 py-2 bg-gray-950 flex justify-between text-xs text-gray-500 border-b border-gray-800">
                    <span className="text-yellow-700 font-bold">Grupo {m?.groups?.name}</span>
                    <span>{formatFecha(m?.match_date)}</span>
                  </div>
                  <div className="px-4 py-3">
                    {/* Resultado real */}
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2 flex-1 justify-end">
                        <span className="text-sm font-bold">{m?.home_team?.name}</span>
                        <FlagImg code={m?.home_team?.flag} />
                      </div>
                      <div className="mx-3 text-center">
                        <p className="text-xs text-gray-500 uppercase mb-0.5">Resultado</p>
                        <p className="text-xl font-black text-white">{m?.home_score} - {m?.away_score}</p>
                      </div>
                      <div className="flex items-center gap-2 flex-1">
                        <FlagImg code={m?.away_team?.flag} />
                        <span className="text-sm font-bold">{m?.away_team?.name}</span>
                      </div>
                    </div>
                    {/* Tu predicción */}
                    <div className="flex items-center justify-between pt-2 border-t border-gray-800">
                      <p className="text-xs text-gray-500 uppercase">Tu predicción: <span className="text-white font-bold">{p.home_score} - {p.away_score}</span></p>
                      <PuntosChip pts={p.points} />
                    </div>
                  </div>
                </div>
              );
            })}
          </>
        )}
      </div>
    </main>
  );
}
