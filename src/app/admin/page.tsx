'use client';
import { useEffect, useState } from 'react';

import { API } from '@/lib/config';
import { getAccessToken, supabase } from '@/lib/supabase';

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
  const [propagating, setPropagating] = useState<string | null>(null);
  const [mensaje, setMensaje] = useState<{ id: string; text: string; ok: boolean } | null>(null);
  const [scores, setScores] = useState<{ [key: string]: { home: string; away: string; status: string; minute: string } }>({});
  const [filtro, setFiltro] = useState<'todos' | 'scheduled' | 'live' | 'finished'>('todos');
  const [golesOpen, setGolesOpen] = useState<string | null>(null);
  const [goleadores, setGoleadores] = useState<{ [matchId: string]: any[] }>({});
  const [nuevoGol, setNuevoGol] = useState<{ team_id: string; player_name: string; minute: string; is_own_goal: boolean }>({ team_id: '', player_name: '', minute: '', is_own_goal: false });

  const login = async () => {
    setError('');
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({ email, password });
    if (signInError || !signInData.user) { setError(signInError?.message || 'No fue posible iniciar sesión'); return; }
    if (!['admin', 'moderator'].includes(signInData.user.app_metadata.role)) { setError('No tienes permisos de admin'); return; }
    const accessToken = await getAccessToken();
    if (!accessToken) { setError('No fue posible obtener la sesión'); return; }
    setToken(accessToken);
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
        const res = await fetch(API + '/api/matches/' + matchId + '/finish', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token },
          body: JSON.stringify({ home_score: Number(s.home), away_score: Number(s.away) }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
        mostrarMensaje(matchId, `✓ Finalizado · ${data.predictions_updated} predicciones actualizadas`, true);
      } else if (s.status === 'live') {
        await fetch(API + '/api/matches/' + matchId + '/score', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token },
          body: JSON.stringify({ home_score: Number(s.home), away_score: Number(s.away), minute: s.minute || null, status: 'live' }),
        });
        mostrarMensaje(matchId, '🔴 Partido en vivo actualizado', true);
      } else {
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

  // ─── PROPAGAR GANADOR AL BRACKET ─────────────────────────────────────────────
  const propagarGanador = async (p: any) => {
    const s = scores[p.id];
    if (!p.next_match_id) {
      mostrarMensaje(p.id, '✗ Este partido no tiene siguiente en el bracket', false);
      return;
    }

    const homeScore = Number(s.home);
    const awayScore = Number(s.away);

    // Determinar ganador
    let winnerId: string | null = null;
    if (homeScore > awayScore) {
      winnerId = p.home_team?.id;
    } else if (awayScore > homeScore) {
      winnerId = p.away_team?.id;
    } else {
      mostrarMensaje(p.id, '✗ Empate — definir por penales antes de propagar', false);
      return;
    }

    if (!winnerId) {
      mostrarMensaje(p.id, '✗ No se pudo determinar el ganador', false);
      return;
    }

    setPropagating(p.id);
    try {
      // Llamar endpoint del bracket para propagar ganador
      const res = await fetch(API + '/api/matches/' + p.next_match_id + '/bracket-slot', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token },
        body: JSON.stringify({
          slot: p.next_match_slot, // 'home' o 'away'
          team_id: winnerId,
        }),
      });

      if (!res.ok) {
        // Si el endpoint no existe en el backend, hacer update directo via Supabase REST
        const field = p.next_match_slot === 'home' ? 'home_team_id' : 'away_team_id';
        const res2 = await fetch(API + '/api/matches/' + p.next_match_id + '/score', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token },
          body: JSON.stringify({ [field]: winnerId }),
        });
        if (!res2.ok) throw new Error('No se pudo actualizar el bracket');
      }

      const winnerName = homeScore > awayScore ? p.home_team?.name : p.away_team?.name;
      mostrarMensaje(p.id, `✓ ${winnerName} propagado al bracket (slot ${p.next_match_slot})`, true);
      cargarPartidos();
    } catch (err: any) {
      // Fallback: mostrar SQL para hacerlo manual
      const field = p.next_match_slot === 'home' ? 'home_team_id' : 'away_team_id';
      const winnerName = homeScore > awayScore ? p.home_team?.name : p.away_team?.name;
      mostrarMensaje(p.id, `⚠ API no soporta bracket-slot. Corre SQL manual para ${winnerName}`, false);
      // Copiar SQL al clipboard
      const sql = `UPDATE matches SET ${field} = '${winnerId}' WHERE id = '${p.next_match_id}';`;
      navigator.clipboard?.writeText(sql);
      console.log('SQL para copiar:', sql);
    } finally {
      setPropagating(null);
    }
  };

  const setScore = (id: string, field: string, val: string) => {
    setScores(prev => ({ ...prev, [id]: { ...prev[id], [field]: val } }));
  };

  const cargarGoleadores = (matchId: string) => {
    fetch(API + '/api/matches/' + matchId + '/scorers')
      .then(r => r.json())
      .then(d => setGoleadores(prev => ({ ...prev, [matchId]: d })));
  };

  const toggleGoles = (p: any) => {
    if (golesOpen === p.id) { setGolesOpen(null); return; }
    setGolesOpen(p.id);
    setNuevoGol({ team_id: p.home_team?.id || '', player_name: '', minute: '', is_own_goal: false });
    if (!goleadores[p.id]) cargarGoleadores(p.id);
  };

  const agregarGol = async (p: any) => {
    if (!nuevoGol.player_name.trim()) return;
    try {
      const res = await fetch(API + '/api/scorers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token },
        body: JSON.stringify({
          match_id: p.id,
          team_id: nuevoGol.team_id,
          player_name: nuevoGol.player_name.trim(),
          minute: nuevoGol.minute ? Number(nuevoGol.minute) : null,
          is_own_goal: nuevoGol.is_own_goal,
        }),
      });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error); }
      setNuevoGol({ team_id: nuevoGol.team_id, player_name: '', minute: '', is_own_goal: false });
      cargarGoleadores(p.id);
      mostrarMensaje(p.id, '⚽ Gol agregado', true);
    } catch (err: any) {
      mostrarMensaje(p.id, '✗ Error: ' + err.message, false);
    }
  };

  const borrarGol = async (matchId: string, scorerId: string) => {
    try {
      const res = await fetch(API + '/api/scorers/' + scorerId, {
        method: 'DELETE',
        headers: { Authorization: 'Bearer ' + token },
      });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error); }
      cargarGoleadores(matchId);
    } catch (err: any) {
      mostrarMensaje(matchId, '✗ Error: ' + err.message, false);
    }
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
          const golesPartido = goleadores[p.id] || [];
          const esFinished = s.status === 'finished';
          const tieneNextMatch = !!p.next_match_id;

          return (
            <div key={p.id} className={'bg-gray-900 rounded-xl border overflow-hidden ' +
              (s.status === 'live' ? 'border-green-700' : s.status === 'finished' ? 'border-blue-900' : 'border-gray-800')}>

              <div className="px-4 py-2 bg-gray-950 flex items-center justify-between">
                <div>
                  <p className="font-black text-white text-sm">{p.home_team?.name} vs {p.away_team?.name}</p>
                  <p className="text-gray-500 text-xs">
                    {p.round ? p.round : `Grupo ${p.groups?.name}`} · {formatFecha(p.match_date)}
                    {tieneNextMatch && <span className="ml-2 text-yellow-600">→ bracket</span>}
                  </p>
                </div>
                <span className={'text-xs font-bold px-2 py-1 rounded-full ' + STATUS_COLORS[p.status]}>
                  {STATUS_LABELS[p.status]}
                </span>
              </div>

              <div className="px-4 py-3 flex items-center gap-3 flex-wrap">
                <div className="flex items-center gap-2">
                  <input type="number" min="0" value={s.home} onChange={e => setScore(p.id, 'home', e.target.value)}
                    className="w-14 h-12 bg-gray-800 border border-gray-700 rounded-lg text-center text-xl font-black text-white focus:outline-none focus:border-yellow-500" />
                  <span className="text-gray-500 font-black text-xl">-</span>
                  <input type="number" min="0" value={s.away} onChange={e => setScore(p.id, 'away', e.target.value)}
                    className="w-14 h-12 bg-gray-800 border border-gray-700 rounded-lg text-center text-xl font-black text-white focus:outline-none focus:border-yellow-500" />
                </div>

                {s.status === 'live' && (
                  <input type="text" value={s.minute} onChange={e => setScore(p.id, 'minute', e.target.value)}
                    placeholder="Min" className="w-16 h-12 bg-gray-800 border border-gray-700 rounded-lg text-center text-sm text-white focus:outline-none focus:border-yellow-500" />
                )}

                <select value={s.status} onChange={e => setScore(p.id, 'status', e.target.value)}
                  className="h-12 bg-gray-800 text-white text-xs rounded-lg px-3 border border-gray-700 focus:outline-none focus:border-yellow-500">
                  <option value="scheduled">Programado</option>
                  <option value="live">En Vivo</option>
                  <option value="finished">Finalizado</option>
                </select>

                <button onClick={() => guardar(p.id)} disabled={updating === p.id}
                  className={'flex-1 min-w-[120px] font-black py-3 rounded-lg uppercase text-sm transition-colors disabled:opacity-50 ' +
                    (s.status === 'finished' ? 'bg-blue-600 hover:bg-blue-500 text-white' :
                     s.status === 'live' ? 'bg-green-600 hover:bg-green-500 text-white' :
                     'bg-yellow-500 hover:bg-yellow-400 text-black')}>
                  {updating === p.id ? 'Guardando...' :
                   s.status === 'finished' ? '✓ Finalizar + Puntos' :
                   s.status === 'live' ? '🔴 Actualizar Live' : 'Guardar'}
                </button>
              </div>

              {/* ─── BOTÓN PROPAGAR GANADOR ─── */}
              {esFinished && tieneNextMatch && (
                <button
                  onClick={() => propagarGanador(p)}
                  disabled={propagating === p.id}
                  className="w-full px-4 py-2.5 text-xs font-black uppercase border-t border-gray-800 transition-colors flex items-center justify-center gap-2 bg-yellow-900/30 hover:bg-yellow-900/50 text-yellow-400 disabled:opacity-50"
                >
                  {propagating === p.id ? 'Propagando...' : (
                    <>
                      🏆 Propagar ganador al bracket
                      <span className="text-yellow-600 font-normal">
                        ({Number(s.home) > Number(s.away) ? p.home_team?.name : p.away_team?.name} → slot {p.next_match_slot})
                      </span>
                    </>
                  )}
                </button>
              )}

              {/* Toggle Goleadores */}
              <button onClick={() => toggleGoles(p)}
                className="w-full px-4 py-2 text-xs font-black text-yellow-400 border-t border-gray-800 hover:bg-gray-800 transition-colors flex items-center justify-center gap-2">
                ⚽ Goleadores {golesOpen === p.id ? '▲' : '▼'}
              </button>

              {golesOpen === p.id && (
                <div className="px-4 py-3 border-t border-gray-800 bg-gray-950 space-y-3">
                  {golesPartido.length > 0 && (
                    <div className="space-y-1">
                      {golesPartido.map((g: any) => (
                        <div key={g.id} className="flex items-center justify-between bg-gray-900 rounded-lg px-3 py-2">
                          <div className="flex items-center gap-2 text-sm">
                            <span className="text-gray-500 text-xs w-8">{g.minute ? g.minute + "'" : '—'}</span>
                            <span className="text-white font-bold">{g.player_name}</span>
                            <span className="text-gray-500 text-xs">{g.teams?.short_name || g.teams?.name}</span>
                            {g.is_own_goal && <span className="text-red-400 text-xs font-bold">(autogol)</span>}
                          </div>
                          <button onClick={() => borrarGol(p.id, g.id)} className="text-red-500 hover:text-red-400 text-xs font-bold">✕</button>
                        </div>
                      ))}
                    </div>
                  )}
                  {golesPartido.length === 0 && <p className="text-gray-600 text-xs text-center py-1">Sin goles registrados</p>}

                  <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-gray-800">
                    <div className="flex gap-1">
                      <button onClick={() => setNuevoGol(prev => ({ ...prev, team_id: p.home_team?.id }))}
                        className={'px-2 py-1.5 rounded text-xs font-bold ' + (nuevoGol.team_id === p.home_team?.id ? 'bg-yellow-500 text-black' : 'bg-gray-800 text-gray-400')}>
                        {p.home_team?.short_name || p.home_team?.name}
                      </button>
                      <button onClick={() => setNuevoGol(prev => ({ ...prev, team_id: p.away_team?.id }))}
                        className={'px-2 py-1.5 rounded text-xs font-bold ' + (nuevoGol.team_id === p.away_team?.id ? 'bg-yellow-500 text-black' : 'bg-gray-800 text-gray-400')}>
                        {p.away_team?.short_name || p.away_team?.name}
                      </button>
                    </div>
                    <input type="text" value={nuevoGol.player_name}
                      onChange={e => setNuevoGol(prev => ({ ...prev, player_name: e.target.value }))}
                      placeholder="Jugador" className="flex-1 min-w-[120px] h-9 bg-gray-800 border border-gray-700 rounded-lg px-2 text-xs text-white focus:outline-none focus:border-yellow-500" />
                    <input type="number" value={nuevoGol.minute}
                      onChange={e => setNuevoGol(prev => ({ ...prev, minute: e.target.value }))}
                      placeholder="Min" className="w-14 h-9 bg-gray-800 border border-gray-700 rounded-lg px-2 text-xs text-white text-center focus:outline-none focus:border-yellow-500" />
                    <label className="flex items-center gap-1 text-xs text-gray-400">
                      <input type="checkbox" checked={nuevoGol.is_own_goal}
                        onChange={e => setNuevoGol(prev => ({ ...prev, is_own_goal: e.target.checked }))} />
                      Autogol
                    </label>
                    <button onClick={() => agregarGol(p)}
                      className="bg-yellow-500 hover:bg-yellow-400 text-black text-xs font-black px-3 py-2 rounded-lg uppercase">
                      + Agregar
                    </button>
                  </div>
                </div>
              )}

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
