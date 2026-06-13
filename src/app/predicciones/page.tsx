'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

const API = 'https://golazo-api-production.up.railway.app';
const WA_NUMBER = '573057572968';
const WA_MSG = encodeURIComponent('Hola, quiero información sobre la Polla Empresarial del Mundial 2026 para mi empresa 🏆');
const WA_LINK = `https://wa.me/${WA_NUMBER}?text=${WA_MSG}`;

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

function CTAWhatsApp() {
  return (
    <div className="mt-8 rounded-2xl overflow-hidden border border-yellow-700 bg-gradient-to-br from-gray-900 to-black">
      <div className="bg-yellow-500 px-4 py-2 text-center">
        <p className="text-black font-black text-xs uppercase tracking-widest">🏢 Polla Empresarial</p>
      </div>
      <div className="px-5 py-5 text-center space-y-3">
        <p className="text-white font-black text-lg leading-tight">
          ¿Quieres esto para tu empresa?
        </p>
        <p className="text-gray-400 text-sm">
          Ranking privado · Usuarios ilimitados · Marca personalizada
        </p>
        <div className="flex flex-col gap-2 text-sm text-gray-400">
          <span>✅ Gestión de partidos en tiempo real</span>
          <span>✅ Tabla de posiciones automática</span>
          <span>✅ Puntos calculados al instante</span>
        </div>
        <a
          href={WA_LINK}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 w-full bg-green-500 hover:bg-green-400 text-white font-black py-4 rounded-xl uppercase text-sm transition-colors mt-2"
        >
          <svg viewBox="0 0 24 24" className="w-5 h-5 fill-white">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
            <path d="M12 0C5.373 0 0 5.373 0 12c0 2.123.554 4.122 1.524 5.855L.057 23.886a.5.5 0 00.614.665l6.218-1.63A11.94 11.94 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.9a9.878 9.878 0 01-5.031-1.378l-.361-.214-3.741.981.999-3.648-.235-.374A9.861 9.861 0 012.1 12C2.1 6.533 6.533 2.1 12 2.1S21.9 6.533 21.9 12 17.467 21.9 12 21.9z"/>
          </svg>
          Contactar por WhatsApp
        </a>
        <p className="text-gray-600 text-xs">Te Lo Sugiero Sports · @telosugiero</p>
      </div>
    </div>
  );
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
      const headers = { Authorization: 'Bearer ' + token };
      fetch(API + '/api/predictions/me', { headers }).then(r => r.json()).then(d => setMisPredicciones(d || []));
    } finally {
      setGuardando(null);
    }
  };

  const setPred = (matchId: string, side: 'home' | 'away', val: string) => {
    setPreds(prev => ({ ...prev, [matchId]: { ...prev[matchId], home: prev[matchId]?.home || '', away: prev[matchId]?.away || '', [side]: val } }));
  };

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

      {/* Banner */}
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
                      <input type="number" min="0" max="20" value={pred?.home || ''}
                        onChange={e => setPred(p.id, 'home', e.target.value)}
                        className="w-12 h-12 bg-gray-800 border border-gray-700 rounded-lg text-center text-xl font-black text-white focus:outline-none focus:border-yellow-500" />
                      <span className="text-gray-500 font-black">-</span>
                      <input type="number" min="0" max="20" value={pred?.away || ''}
                        onChange={e => setPred(p.id, 'away', e.target.value)}
                        className="w-12 h-12 bg-gray-800 border border-gray-700 rounded-lg text-center text-xl font-black text-white focus:outline-none focus:border-yellow-500" />
                    </div>
                    <div className="flex items-center gap-2 flex-1">
                      <FlagImg code={p.away_team?.flag} />
                      <span className="text-sm font-bold">{p.away_team?.name}</span>
                    </div>
                  </div>
                  <div className="px-4 pb-4">
                    <button onClick={() => guardar(p.id)} disabled={guardando === p.id}
                      className={'w-full py-2 rounded-lg text-sm font-black uppercase transition-colors ' + (guardado === p.id ? 'bg-green-600 text-white' : 'bg-yellow-500 hover:bg-yellow-400 text-black')}>
                      {guardado === p.id ? '✓ Guardado!' : guardando === p.id ? 'Guardando...' : yaGuardado ? 'Actualizar prediccion' : 'Guardar prediccion'}
                    </button>
                  </div>
                </div>
              );
            })}
            {!loading && <CTAWhatsApp />}
          </>
        )}

        {/* ── TAB HISTORIAL ── */}
        {tab === 'historial' && (
          <>
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
                    <div className="flex items-center justify-between pt-2 border-t border-gray-800">
                      <p className="text-xs text-gray-500 uppercase">Tu predicción: <span className="text-white font-bold">{p.home_score} - {p.away_score}</span></p>
                      <PuntosChip pts={p.points} />
                    </div>
                  </div>
                </div>
              );
            })}
            <CTAWhatsApp />
          </>
        )}
      </div>
    </main>
  );
}
