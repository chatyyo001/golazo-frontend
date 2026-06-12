'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

const API = 'https://golazo-api-production.up.railway.app';

export default function Admin() {
  const router = useRouter();
  const [partidos, setPartidos] = useState<any[]>([]);
  const [token, setToken] = useState('');
  const [loggedIn, setLoggedIn] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [updating, setUpdating] = useState<string | null>(null);
  const [scores, setScores] = useState<{ [key: string]: { home: string; away: string; status: string; minute: string } }>({});

  const login = async () => {
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

  useEffect(() => {
    if (!loggedIn) return;
    fetch(API + '/api/matches')
      .then(r => r.json())
      .then(d => {
        const p = d.data || [];
        setPartidos(p);
        const map: any = {};
        p.forEach((m: any) => {
          map[m.id] = {
            home: String(m.home_score || 0),
            away: String(m.away_score || 0),
            status: m.status,
            minute: String(m.minute || ''),
          };
        });
        setScores(map);
      });
  }, [loggedIn]);

  const update = async (matchId: string) => {
    const s = scores[matchId];
    setUpdating(matchId);
    await fetch(API + '/api/matches/' + matchId + '/score', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token },
      body: JSON.stringify({
        home_score: Number(s.home),
        away_score: Number(s.away),
        minute: s.minute || null,
        status: s.status,
      }),
    });
    setUpdating(null);
  };

  const setScore = (id: string, field: string, val: string) => {
    setScores(prev => ({ ...prev, [id]: { ...prev[id], [field]: val } }));
  };

  if (!loggedIn) return (
    <main className="min-h-screen bg-black text-white flex items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-4">
        <h1 className="text-2xl font-black text-yellow-400 uppercase text-center">Panel Admin</h1>
        <input type="email" value={email} onChange={e => setEmail(e.target.value)}
          placeholder="Email admin" className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white" />
        <input type="password" value={password} onChange={e => setPassword(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && login()}
          placeholder="Contrasena" className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white" />
        {error && <p className="text-red-400 text-sm text-center">{error}</p>}
        <button onClick={login} className="w-full bg-yellow-500 text-black font-black py-3 rounded-xl uppercase">
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
        <a href="/" className="text-yellow-400 text-xs font-bold uppercase">Ver App</a>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-3">
        {partidos.map(p => {
          const s = scores[p.id] || { home: '0', away: '0', status: 'scheduled', minute: '' };
          return (
            <div key={p.id} className="bg-gray-900 rounded-xl border border-gray-800 p-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="font-black text-white">{p.home_team?.name} vs {p.away_team?.name}</p>
                  <p className="text-gray-500 text-xs">Grupo {p.groups?.name} · {p.stadium} · {p.match_date?.split('T')[0]}</p>
                </div>
                <select value={s.status} onChange={e => setScore(p.id, 'status', e.target.value)}
                  className="bg-gray-800 text-white text-xs rounded px-2 py-1 border border-gray-700">
                  <option value="scheduled">Programado</option>
                  <option value="live">En vivo</option>
                  <option value="finished">Finalizado</option>
                </select>
              </div>
              <div className="flex items-center gap-3">
                <input type="number" min="0" value={s.home} onChange={e => setScore(p.id, 'home', e.target.value)}
                  className="w-16 h-12 bg-gray-800 border border-gray-700 rounded-lg text-center text-xl font-black text-white" />
                <span className="text-gray-500 font-black text-xl">-</span>
                <input type="number" min="0" value={s.away} onChange={e => setScore(p.id, 'away', e.target.value)}
                  className="w-16 h-12 bg-gray-800 border border-gray-700 rounded-lg text-center text-xl font-black text-white" />
                {s.status === 'live' && (
                  <input type="text" value={s.minute} onChange={e => setScore(p.id, 'minute', e.target.value)}
                    placeholder="Min" className="w-16 h-12 bg-gray-800 border border-gray-700 rounded-lg text-center text-sm text-white" />
                )}
                <button onClick={() => update(p.id)} disabled={updating === p.id}
                  className="flex-1 bg-yellow-500 hover:bg-yellow-400 text-black font-black py-3 rounded-lg uppercase text-sm transition-colors disabled:opacity-50">
                  {updating === p.id ? 'Guardando...' : 'Guardar'}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </main>
  );
}