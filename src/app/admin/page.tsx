'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

const API = 'https://golazo-api-production.up.railway.app';

function formatFecha(dateStr: string) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString('es-CO', { day: '2-digit', month: 'short', timeZone: 'America/Bogota' }) +
    ' ' + d.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit', timeZone: 'America/Bogota' });
}

const STATUS_COLORS: any = {
  scheduled: 'bg-gray-700 text-gray-300',
  live: 'bg-green-600 text-white',
  finished: 'bg-blue-800 text-blue-200',
};

const STATUS_LABELS: any = {
  scheduled: 'Programado',
  live: '🔴 En Vivo',
  finished: '✓ Finalizado',
};

export default function Admin() {
  const [partidos, setPartidos] = useState<any[]>([]);
  const [token, setToken] = useState('');
  const [loggedIn, setLoggedIn] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [updating, setUpdating] = useState<string | null>(null);
  const [mensaje, setMensaje] = useState<{ id: string; text: string; ok: boolean } | null>(null);
  const [scores, setScores] = useState<{ [key: string]: { home: string; away: string; status: string; minute: string } }>({});
  const [filtro, setFiltro] = useState<'todos' | 'scheduled' | 'live' | 'finished'>('todos');

  const login = async () => {
    setError('');
    const res = await fetch(API + '/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) { setError(data.error); return; }
    if (!['admin', 'moderator'].includes(data.user.role)) { setError('No tienes permisos de admin'); return; }
    setToken(data.token);
    setLoggedIn(true);
  };

  const cargarPartidos = () => {
    fetch(API + '/api/matches')
      .then(r => r.json())
      .then(d => {
        const p = d.data || [];
        setPartidos(p);
        const map: any = {};
        p.forEach((m: any) => {
          map[m.id] = {
            home: String(m.home_score ?? 0),
            away: String(m.away_score ?? 0),
            status: m.status,
            minute: String(m.minute || ''),
          };
        });
        setScores(map);
      });
  };

  useEffect(() => {
    if (!loggedIn) return;
    cargarPartidos();
  }, [loggedIn]);

  const mostrarMensaje = (id: string, text: string, ok: boolean) => {
    setMensaje({ id, text, ok });
    setTimeout(() => setMensaje(null), 3000);
  };

  const guardar = async (matchId: string) => {
    const s = scores[matchId];
    setUpdating(matchId);
    try {
      if (s.status === 'finished') {
        // Usar /finish para calcular puntos automáticamente
        const res = await fetch(API + '/api/matches/' + matchId + '/finish', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token },
          body: JSON.stringify({ home_score: Number(s.home), away_score: Number(s.away) }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
        mostrarMensaje(matchId, `✓ Finalizado · ${data.predictions_updated} predicciones actualizadas`, true);
      } else if (s.status === 'live') {
        // Poner en vivo + marcador
        await fetch(API + '/api/matches/' + matchId + '/score', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token },
          body: JSON.stringify({ home_score: Number(s.home), away_score: Number(s.away), minute: s.minute || null, status: 'live' }),
        });
        mostrarMensaje(matchId, '🔴 Partido en vivo actualizado', true);
      } else {
        // Solo actualizar marcador/estado
        await fetch(API + '/api/matches/' + matchId + '/score', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token },
          body: JSON.stringify({ home_score: Number(s.home), away_score: Number(s.away), minute: null, status: s.status }),
        });
        mostrarMensaje(matchId, '✓ Guardado', true);
      }
      cargarPartidos();
    } catch (err: any) {
      mostrarMensaje(matchId, '✗ Error: ' + err.message, false);
    } finally {
      setUpdating(null);
    }
  };

  const setScore = (id: string, field: string, val: string) => {
    setScores(prev => ({ ...prev, [id]: { ...prev[id], [field]: val } }));
  };

  const partidosFiltrados = partidos.filter(p => filtro === 'todos' ? true : p.status === filtro);

  if (!loggedIn) return (
    <main className="min-h-screen bg-black text-white flex items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-4">
        <div className="text-center mb-6">
          <span className="text-4xl">⚽</span>
          <h1 className="text-2xl font-black text-yellow-400 uppercase mt-2">Panel Admin</h1>
          <p className="text-gray-500 text-xs uppercase">Te Lo Sugiero Sports</p>
        </div>
        <input type="email" value={email} onChange={e => setEmail(e.target.value)}
          placeholder="Email admin" className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-yellow-500" />
        <input type="password" value={password} onChange={e => setPassword(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && login()}
          placeholder="Contraseña" className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-yellow-500" />
        {error && <p className="text-red-400 text-sm text-center">{error}</p>}
        <button onClick={login} className="w-full bg-yellow-500 text-black font-black py-3 rounded-xl uppercase hover:bg-yellow-400 transition-colors">
          Entrar
        </button>
      </div>
    </main>
  );

  return (
    <main className="min-h-screen bg-black text-white pb-20">
      <header className="bg-black border-b-2 border-yellow-500 px-4 py-3 flex items-center justify-between">
        <div>
          <p className="text-xs text-yellow-500 uppercase tracking-widest">Te Lo Sugiero Sports</p>
          <p className="text-lg font-black uppercase">Panel Admin</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={cargarPartidos} className="text-gray-400 text-xs uppercase">↻ Refrescar</button>
          <a href="/" className="text-yellow-400 text-xs font-bold uppercase">Ver App</a>
        </div>
      </header>

      {/* Filtros */}
      <div className="flex gap-2 px-4 py-3 bg-gray-950 border-b border-gray-800 overflow-x-auto">
        {(['todos', 'scheduled', 'live', 'finished'] as const).map(f => (
          <button key={f} onClick={() => setFiltro(f)}
            className={'px-3 py-1.5 rounded-full text-xs font-black uppercase whitespace-nowrap transition-colors ' +
              (filtro === f ? 'bg-yellow-500 text-black' : 'bg-gray-800 text-gray-400')}>
            {f === 'todos' ? `Todos (${partidos.length})` :
             f === 'scheduled' ? `Programados (${partidos.filter(p => p.status === 'scheduled').length})` :
             f === 'live' ? `En Vivo (${partidos.filter(p => p.status === 'live').length})` :
             `Finalizados (${partidos.filter(p => p.status === 'finished').length})`}
          </button>
        ))}
      </div>

      <div className="max-w-4xl mx-auto px-4 py-4 space-y-3">
        {partidosFiltrados.length === 0 && (
          <p className="text-gray-500 text-center py-10">No hay partidos en esta categoría.</p>
        )}
        {partidosFiltrados.map(p => {
          const s = scores[p.id] || { home: '0', away: '0', status: 'scheduled', minute: '' };
          const msg = mensaje?.id === p.id ? mensaje : null;
          return (
            <div key={p.id} className={'bg-gray-900 rounded-xl border overflow-hidden ' + (s.status === 'live' ? 'border-green-700' : s.status === 'finished' ? 'border-blue-900' : 'border-gray-800')}>
              {/* Header partido */}
              <div className="px-4 py-2 bg-gray-950 flex items-center justify-between">
                <div>
                  <p className="font-black text-white text-sm">{p.home_team?.name} vs {p.away_team?.name}</p>
                  <p className="text-gray-500 text-xs">Grupo {p.groups?.name} · {formatFecha(p.match_date)}</p>
                </div>
                <span className={'text-xs font-bold px-2 py-1 rounded-full ' + STATUS_COLORS[p.status]}>
                  {STATUS_LABELS[p.status]}
                </span>
              </div>

              {/* Controles */}
              <div className="px-4 py-3 flex items-center gap-3 flex-wrap">
                {/* Marcador */}
                <div className="flex items-center gap-2">
                  <input type="number" min="0" value={s.home} onChange={e => setScore(p.id, 'home', e.target.value)}
                    className="w-14 h-12 bg-gray-800 border border-gray-700 rounded-lg text-center text-xl font-black text-white focus:outline-none focus:border-yellow-500" />
                  <span className="text-gray-500 font-black text-xl">-</span>
                  <input type="number" min="0" value={s.away} onChange={e => setScore(p.id, 'away', e.target.value)}
                    className="w-14 h-12 bg-gray-800 border border-gray-700 rounded-lg text-center text-xl font-black text-white focus:outline-none focus:border-yellow-500" />
                </div>

                {/* Minuto (solo live) */}
                {s.status === 'live' && (
                  <input type="text" value={s.minute} onChange={e => setScore(p.id, 'minute', e.target.value)}
                    placeholder="Min" className="w-16 h-12 bg-gray-800 border border-gray-700 rounded-lg text-center text-sm text-white focus:outline-none focus:border-yellow-500" />
                )}

                {/* Status selector */}
                <select value={s.status} onChange={e => setScore(p.id, 'status', e.target.value)}
                  className="h-12 bg-gray-800 text-white text-xs rounded-lg px-3 border border-gray-700 focus:outline-none focus:border-yellow-500">
                  <option value="scheduled">Programado</option>
                  <option value="live">En Vivo</option>
                  <option value="finished">Finalizado</option>
                </select>

                {/* Botón guardar */}
                <button onClick={() => guardar(p.id)} disabled={updating === p.id}
                  className={'flex-1 min-w-[120px] font-black py-3 rounded-lg uppercase text-sm transition-colors disabled:opacity-50 ' +
                    (s.status === 'finished' ? 'bg-blue-600 hover:bg-blue-500 text-white' :
                     s.status === 'live' ? 'bg-green-600 hover:bg-green-500 text-white' :
                     'bg-yellow-500 hover:bg-yellow-400 text-black')}>
                  {updating === p.id ? 'Guardando...' :
                   s.status === 'finished' ? '✓ Finalizar + Puntos' :
                   s.status === 'live' ? '🔴 Actualizar Live' :
                   'Guardar'}
                </button>
              </div>

              {/* Mensaje feedback */}
              {msg && (
                <div className={'px-4 py-2 text-xs font-bold ' + (msg.ok ? 'text-green-400 bg-green-950' : 'text-red-400 bg-red-950')}>
                  {msg.text}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </main>
  );
}
