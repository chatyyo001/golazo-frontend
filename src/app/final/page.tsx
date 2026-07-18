'use client';
import { useEffect, useMemo, useState } from 'react';
import { API } from '@/lib/config';

const FINAL_MATCH_ID = '00000000-0000-0000-0000-000000000104';
const KICKOFF = '2026-07-19T20:00:00Z';

type Team = { id: string; name: string; flag: string; short_name: string };
type Scorer = { id: string; player_name: string; minute: number; team_id: string; is_own_goal: boolean };
type Match = {
  id: string; status: 'scheduled' | 'live' | 'finished';
  home_score: number | null; away_score: number | null;
  home_penalties: number | null; away_penalties: number | null;
  minute: number | null; match_date: string;
  home_team: Team; away_team: Team; scorers: Scorer[];
};

function useCountdown(target: string) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);
  const diff = Math.max(0, new Date(target).getTime() - now);
  return {
    days: Math.floor(diff / 86400000),
    hours: Math.floor(diff / 3600000) % 24,
    minutes: Math.floor(diff / 60000) % 60,
    seconds: Math.floor(diff / 1000) % 60,
    started: diff === 0,
  };
}

function Flag({ code, size }: { code: string; size: number }) {
  return (
    <img
      src={`https://flagcdn.com/w320/${code.toLowerCase()}.png`}
      alt={code}
      style={{ width: size, height: 'auto' }}
      className="rounded-lg shadow-[0_0_60px_rgba(234,179,8,0.25)] ring-1 ring-white/20"
    />
  );
}

function TimeBox({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center">
      <div className="bg-white/5 backdrop-blur border border-yellow-500/30 rounded-2xl px-4 py-3 min-w-[76px] text-center shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
        <span className="text-4xl md:text-5xl font-black tabular-nums bg-gradient-to-b from-yellow-200 to-yellow-500 bg-clip-text text-transparent">
          {String(value).padStart(2, '0')}
        </span>
      </div>
      <span className="text-[10px] uppercase tracking-[0.25em] text-gray-400 mt-2">{label}</span>
    </div>
  );
}

type Stats = { total: number; home_win: number; away_win: number; draw: number; top_scores: { score: string; count: number }[] };

export default function FinalPage() {
  const [match, setMatch] = useState<Match | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const cd = useCountdown(KICKOFF);

  useEffect(() => {
    const load = () => {
      fetch(API + '/api/matches/' + FINAL_MATCH_ID)
        .then(r => r.json())
        .then(m => { if (m && m.id) setMatch(m); })
        .catch(() => {});
      fetch(API + '/api/matches/' + FINAL_MATCH_ID + '/prediction-stats')
        .then(r => r.json())
        .then(s => { if (s && typeof s.total === 'number') setStats(s); })
        .catch(() => {});
    };
    load();
    const t = setInterval(load, 30000);
    return () => clearInterval(t);
  }, []);

  const pct = (n: number) => (stats && stats.total > 0 ? Math.round((n / stats.total) * 100) : 0);

  const home = match?.home_team;
  const away = match?.away_team;
  const live = match?.status === 'live';
  const finished = match?.status === 'finished';

  const winner = useMemo(() => {
    if (!match || match.status !== 'finished' || match.home_score == null || match.away_score == null) return null;
    if (match.home_score !== match.away_score) return match.home_score > match.away_score ? home : away;
    if (match.home_penalties != null && match.away_penalties != null && match.home_penalties !== match.away_penalties)
      return match.home_penalties > match.away_penalties ? home : away;
    return null;
  }, [match, home, away]);

  // Goles a favor: los de jugadores propios más los autogoles del rival.
  const goles = (teamId?: string) =>
    (match?.scorers || [])
      .filter(s => (s.is_own_goal ? s.team_id !== teamId : s.team_id === teamId))
      .sort((a, b) => a.minute - b.minute);

  return (
    <main
      className="min-h-screen bg-black text-white overflow-hidden relative"
      onMouseMove={e => {
        const { innerWidth, innerHeight } = window;
        setTilt({ x: (e.clientX / innerWidth - 0.5) * 30, y: (e.clientY / innerHeight - 0.5) * 30 });
      }}
    >
      <style>{`
        @keyframes shimmer { 0% { background-position: -200% center } 100% { background-position: 200% center } }
        @keyframes floatglow { 0%,100% { opacity:.45; transform:translateY(0) } 50% { opacity:.8; transform:translateY(-14px) } }
        @keyframes pulseLive { 0%,100% { box-shadow:0 0 0 0 rgba(239,68,68,.6) } 50% { box-shadow:0 0 0 10px rgba(239,68,68,0) } }
        @keyframes confetti { 0% { transform:translateY(-10vh) rotate(0) } 100% { transform:translateY(110vh) rotate(720deg) } }
        @keyframes beam {
          0%,100% { transform: rotate(-18deg) translateX(-8%); opacity:.14 }
          50% { transform: rotate(-10deg) translateX(8%); opacity:.32 }
        }
        @keyframes beam2 {
          0%,100% { transform: rotate(16deg) translateX(6%); opacity:.10 }
          50% { transform: rotate(24deg) translateX(-6%); opacity:.26 }
        }
        @keyframes barGrow { from { width: 0 } }
        .stat-bar { animation: barGrow 1.2s cubic-bezier(.2,.8,.2,1); transition: width .8s cubic-bezier(.2,.8,.2,1) }
        .title-shimmer {
          background: linear-gradient(110deg, #facc15 20%, #fff7d6 40%, #facc15 60%);
          background-size: 200% auto;
          -webkit-background-clip: text; background-clip: text; color: transparent;
          animation: shimmer 5s linear infinite;
        }
      `}</style>

      {/* Luces de estadio con parallax */}
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none"
        style={{ transform: `translate(${tilt.x * -0.4}px, ${tilt.y * -0.4}px)`, transition: 'transform .4s ease-out' }}
      >
        <div className="absolute -top-40 left-1/4 w-[60rem] h-[60rem] rounded-full bg-yellow-500/10 blur-[140px]" />
        <div className="absolute -bottom-52 right-1/5 w-[50rem] h-[50rem] rounded-full bg-amber-600/10 blur-[160px]" />
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[70rem] h-[26rem] bg-gradient-to-b from-yellow-200/10 to-transparent blur-3xl" style={{ animation: 'floatglow 7s ease-in-out infinite' }} />
        {/* Reflectores en barrido */}
        <div className="absolute -top-32 left-[8%] w-40 h-[130vh] origin-top bg-gradient-to-b from-yellow-100/25 via-yellow-200/8 to-transparent blur-2xl" style={{ animation: 'beam 9s ease-in-out infinite' }} />
        <div className="absolute -top-32 right-[10%] w-48 h-[130vh] origin-top bg-gradient-to-b from-amber-100/20 via-amber-200/6 to-transparent blur-2xl" style={{ animation: 'beam2 11s ease-in-out infinite' }} />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_35%,rgba(0,0,0,0.9)_100%)]" />
      </div>

      {/* Confeti al coronar campeón */}
      {winner && (
        <div aria-hidden className="absolute inset-0 pointer-events-none">
          {Array.from({ length: 40 }).map((_, i) => (
            <span
              key={i}
              className="absolute block w-2 h-3 rounded-sm"
              style={{
                left: `${(i * 53) % 100}%`,
                background: i % 3 === 0 ? '#facc15' : i % 3 === 1 ? '#ffffff' : '#f59e0b',
                animation: `confetti ${5 + (i % 5)}s linear ${(i % 10) * 0.7}s infinite`,
              }}
            />
          ))}
        </div>
      )}

      <header className="relative z-10 border-b border-yellow-500/30 px-5 py-4 flex items-center justify-between">
        <a href="/" className="flex items-center gap-3">
          <span className="text-2xl">⚽</span>
          <div>
            <p className="text-[10px] text-yellow-500 font-bold uppercase tracking-[0.3em] leading-none">Te Lo Sugiero</p>
            <p className="text-lg font-black uppercase leading-none">Sports</p>
          </div>
        </a>
        <a href="/ranking" className="text-yellow-400 text-xs font-bold uppercase tracking-widest hover:underline">Ranking</a>
      </header>

      <section className="relative z-10 max-w-5xl mx-auto px-4 pt-12 pb-20 text-center">
        <p className="text-yellow-500/80 text-xs font-bold uppercase tracking-[0.5em] mb-3">Copa Mundial FIFA 2026</p>
        <h1 className="title-shimmer text-5xl md:text-7xl font-black uppercase leading-none mb-2">La Gran Final</h1>
        <p className="text-gray-400 text-sm md:text-base">
          MetLife Stadium · Nueva York — 19 de julio · 3:00 p.m. (Colombia)
        </p>

        {/* Duelo */}
        <div className="mt-12 grid grid-cols-[1fr_auto_1fr] items-center gap-4 md:gap-10">
          <div className="flex flex-col items-center gap-4">
            <Flag code={home?.flag || 'es'} size={200} />
            <p className="text-2xl md:text-4xl font-black uppercase">{home?.name || 'España'}</p>
            {(live || finished) && (
              <ul className="text-gray-300 text-xs space-y-1">
                {goles(home?.id).map(s => (
                  <li key={s.id}>⚽ {s.player_name} {s.minute}&apos; {s.is_own_goal ? '(AG)' : ''}</li>
                ))}
              </ul>
            )}
          </div>

          <div className="flex flex-col items-center gap-3">
            {live || finished ? (
              <>
                {live && (
                  <span className="flex items-center gap-2 bg-red-600 text-white text-[11px] font-black uppercase tracking-widest px-3 py-1 rounded-full" style={{ animation: 'pulseLive 1.6s infinite' }}>
                    ● En vivo {match?.minute != null ? `· ${match.minute}'` : ''}
                  </span>
                )}
                <div className="text-6xl md:text-8xl font-black tabular-nums tracking-tight">
                  {match?.home_score ?? 0}<span className="text-yellow-500 mx-2">–</span>{match?.away_score ?? 0}
                </div>
                {match?.home_penalties != null && match?.away_penalties != null && (
                  <p className="text-yellow-400 text-sm font-bold uppercase tracking-widest">
                    Penales {match.home_penalties}–{match.away_penalties}
                  </p>
                )}
              </>
            ) : (
              <div className="text-yellow-500 text-4xl md:text-6xl font-black italic drop-shadow-[0_0_25px_rgba(234,179,8,0.6)]">VS</div>
            )}
          </div>

          <div className="flex flex-col items-center gap-4">
            <Flag code={away?.flag || 'ar'} size={200} />
            <p className="text-2xl md:text-4xl font-black uppercase">{away?.name || 'Argentina'}</p>
            {(live || finished) && (
              <ul className="text-gray-300 text-xs space-y-1">
                {goles(away?.id).map(s => (
                  <li key={s.id}>⚽ {s.player_name} {s.minute}&apos; {s.is_own_goal ? '(AG)' : ''}</li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Campeón */}
        {winner && (
          <div className="mt-14">
            <p className="text-yellow-500 text-xs font-bold uppercase tracking-[0.5em] mb-2">🏆 Campeón del mundo</p>
            <p className="title-shimmer text-4xl md:text-6xl font-black uppercase">{winner.name}</p>
          </div>
        )}

        {/* Cuenta regresiva */}
        {!live && !finished && (
          <div className="mt-14">
            <p className="text-gray-400 text-xs uppercase tracking-[0.35em] mb-5">El mundo se detiene en</p>
            <div className="flex justify-center gap-3 md:gap-5">
              <TimeBox value={cd.days} label="Días" />
              <TimeBox value={cd.hours} label="Horas" />
              <TimeBox value={cd.minutes} label="Min" />
              <TimeBox value={cd.seconds} label="Seg" />
            </div>
          </div>
        )}

        {/* Termómetro de la hinchada (predicciones reales, anónimas) */}
        <div className="mt-16 max-w-2xl mx-auto text-left">
          <div className="flex items-baseline justify-between mb-3">
            <p className="text-yellow-500 text-xs font-bold uppercase tracking-[0.35em]">La hinchada dice</p>
            {stats && stats.total > 0 && (
              <p className="text-gray-500 text-xs">{stats.total} {stats.total === 1 ? 'predicción' : 'predicciones'} y contando</p>
            )}
          </div>

          {stats && stats.total > 0 ? (
            <>
              <div className="flex h-10 rounded-2xl overflow-hidden border border-white/10 bg-white/5">
                <div className="stat-bar bg-gradient-to-r from-red-600 to-red-500 flex items-center justify-start pl-3" style={{ width: `${Math.max(pct(stats.home_win), 6)}%` }}>
                  <span className="text-[11px] font-black whitespace-nowrap">🇪🇸 {pct(stats.home_win)}%</span>
                </div>
                <div className="stat-bar bg-white/15 flex items-center justify-center" style={{ width: `${Math.max(pct(stats.draw), 6)}%` }}>
                  <span className="text-[11px] font-black text-gray-300 whitespace-nowrap">= {pct(stats.draw)}%</span>
                </div>
                <div className="stat-bar bg-gradient-to-r from-sky-500 to-sky-400 flex items-center justify-end pr-3" style={{ width: `${Math.max(pct(stats.away_win), 6)}%` }}>
                  <span className="text-[11px] font-black text-black whitespace-nowrap">{pct(stats.away_win)}% 🇦🇷</span>
                </div>
              </div>
              {stats.top_scores.length > 0 && (
                <div className="flex items-center gap-2 mt-4 flex-wrap">
                  <span className="text-gray-500 text-xs uppercase tracking-widest">Marcadores más jugados:</span>
                  {stats.top_scores.map(s => (
                    <span key={s.score} className="bg-yellow-500/10 border border-yellow-500/40 text-yellow-300 text-sm font-black px-3 py-1 rounded-full">
                      {s.score.replace('-', ' – ')}
                    </span>
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="border border-dashed border-yellow-500/40 rounded-2xl p-5 text-center">
              <p className="text-gray-300 text-sm">Aún nadie predice la final — <span className="text-yellow-400 font-bold">sé el primero</span> y presume tu olfato ⚽</p>
            </div>
          )}
        </div>

        {/* Cualquiera puede jugar */}
        {!finished && (
          <div className="mt-14 max-w-3xl mx-auto">
            <p className="text-gray-400 text-xs uppercase tracking-[0.35em] mb-5">Juega gratis · Sin costo, sin apuestas</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-left">
              {[
                ['1', 'Crea tu cuenta', 'Solo correo y contraseña. Gratis, en 30 segundos.'],
                ['2', 'Predice el marcador', 'Puedes cambiarlo hasta el pitazo inicial.'],
                ['3', 'Gana puntos', 'Exacto +3 · Ganador +1. Canjeables en TeLoSugiero.'],
              ].map(([n, t, d]) => (
                <div key={n} className="bg-white/5 backdrop-blur border border-white/10 rounded-2xl p-4 hover:border-yellow-500/50 transition-colors">
                  <span className="inline-flex w-7 h-7 items-center justify-center rounded-full bg-yellow-500 text-black text-sm font-black mb-2">{n}</span>
                  <p className="font-black uppercase text-sm">{t}</p>
                  <p className="text-gray-400 text-xs mt-1">{d}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* CTA */}
        <div className="mt-14 flex flex-col items-center gap-3">
          {!finished && (
            <a
              href="/predicciones"
              className="bg-yellow-500 hover:bg-yellow-400 text-black font-black uppercase tracking-widest px-10 py-4 rounded-2xl text-lg transition-colors shadow-[0_0_40px_rgba(234,179,8,0.35)]"
            >
              {live ? 'Sigue tu predicción' : 'Haz tu predicción'}
            </a>
          )}
          {!finished && (
            <p className="text-gray-400 text-sm">
              ¿Primera vez? <a href="/registro" className="text-yellow-400 font-bold hover:underline">Crea tu cuenta gratis</a> y juega en 30 segundos
            </p>
          )}
          <p className="text-gray-500 text-xs">
            Marcador exacto +3 pts · Ganador +1 pt · Puntos canjeables en TeLoSugiero
          </p>
        </div>
      </section>
    </main>
  );
}
