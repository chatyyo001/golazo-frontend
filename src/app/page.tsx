'use client';
import { useEffect, useState } from 'react';
import { getAnalisis } from './analisis';
import BracketTab from './BracketTab';
import LlavesTab from './LlavesTab';

import { API } from '@/lib/config';
import { getAccessToken, supabase } from '@/lib/supabase';

const FlagImg = ({ code }: { code: string }) => {
  if (!code || code.length < 2) return <span className="w-8 h-6 bg-gray-700 rounded-sm inline-block" />;
  return <img src={'https://flagcdn.com/32x24/' + code.toLowerCase() + '.png'} alt={code} width={32} height={24} className="rounded-sm" />;
};

const FlagLg = ({ code }: { code: string }) => {
  if (!code || code.length < 2) return <span className="w-16 h-12 bg-gray-700 rounded inline-block" />;
  return <img src={'https://flagcdn.com/64x48/' + code.toLowerCase() + '.png'} alt={code} width={64} height={48} className="rounded drop-shadow-lg" />;
};

const WA_DEMO = 'https://wa.me/573057572968?text=Hola!%20Quiero%20una%20demo%20de%20la%20Polla%20Empresarial%20Mundial%202026';

const formatFecha = (dateStr: string) => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString('es-CO', { day: '2-digit', month: 'short' }) + ' ' + d.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' });
};

// ─── Torneo activo: todo el texto sale de la base, nada hardcodeado ───────────

const ESTADO_TORNEO: Record<string, string> = {
  active: 'En curso',
  upcoming: 'Próximamente',
  finished: 'Finalizado',
};

// Nombre corto para espacios estrechos: "Copa Mundial de la FIFA 2026" → "Mundial 2026"
function nombreCorto(t: any) {
  if (!t?.name) return '';
  return t.name
    .replace(/^Copa\s+/i, '')
    .replace(/\s+de\s+la\s+FIFA/i, '')
    .replace(/CONMEBOL\s+/i, '')
    .trim();
}

function rangoFechas(t: any) {
  if (!t?.start_date) return '';
  const fmt = (d: string) =>
    new Date(d + 'T12:00:00').toLocaleDateString('es-CO', { day: 'numeric', month: 'short' });
  return t.end_date ? `${fmt(t.start_date)} - ${fmt(t.end_date)}` : fmt(t.start_date);
}

const GROUP_COLORS: Record<string, string> = {
  A:'#ef4444',B:'#3b82f6',C:'#22c55e',D:'#f97316',E:'#a855f7',F:'#06b6d4',
  G:'#ec4899',H:'#eab308',I:'#14b8a6',J:'#f43f5e',K:'#8b5cf6',L:'#84cc16'
};

const ROUND_LABELS: Record<string, string> = {
  R32: 'Dieciseisavos', R16: 'Octavos', QF: 'Cuartos de Final', SF: 'Semifinal', F: 'Final',
};

// ─── ESTADÍSTICAS GOLAZO ──────────────────────────────────────────────────────
// Antes esto era data hardcodeada a mano (copiada de ESPN). Ahora se conecta
// al API real: /api/tournaments/:id/scorers (ya corregido) + partidos/equipos
// que llegan como props desde el componente padre.

type Goleador = { player_name: string; goals: number; team?: { name: string; flag: string } };

function GolazoStats({ torneoId, torneoNombre, partidos, equipos }: { torneoId?: string; torneoNombre?: string; partidos: any[]; equipos: any[] }) {
  const [statsTab, setStatsTab] = useState<'goles'|'equipos'>('goles');
  const [open, setOpen] = useState(false);
  const [goleadores, setGoleadores] = useState<Goleador[]>([]);

  useEffect(() => {
    if (!torneoId) return;
    fetch(API + '/api/tournaments/' + torneoId + '/scorers?limit=10')
      .then(r => r.json())
      .then(d => setGoleadores(Array.isArray(d) ? d : []))
      .catch(() => setGoleadores([]));
  }, [torneoId]);

  const partidosFinalizados = partidos.filter(p => p.status === 'finished');
  const totalGoles = partidosFinalizados.reduce((acc, p) => acc + (p.home_score || 0) + (p.away_score || 0), 0);
  const promedio = partidosFinalizados.length ? (totalGoles / partidosFinalizados.length).toFixed(1) : '0.0';
  const faseActual = partidosFinalizados.some(p => p.round) ? 'Eliminación directa' : 'Fase de grupos';

  // Goles por equipo, calculado de los partidos reales
  const golesPorEquipo: Record<string, { name: string; flag: string; g: number }> = {};
  partidosFinalizados.forEach(p => {
    if (p.home_team) {
      const id = p.home_team.id;
      if (!golesPorEquipo[id]) golesPorEquipo[id] = { name: p.home_team.name, flag: p.home_team.flag, g: 0 };
      golesPorEquipo[id].g += p.home_score || 0;
    }
    if (p.away_team) {
      const id = p.away_team.id;
      if (!golesPorEquipo[id]) golesPorEquipo[id] = { name: p.away_team.name, flag: p.away_team.flag, g: 0 };
      golesPorEquipo[id].g += p.away_score || 0;
    }
  });
  const equiposTop = Object.values(golesPorEquipo).sort((a, b) => b.g - a.g).slice(0, 10);

  const maxGoles = goleadores[0]?.goals || 1;

  const renderBar = (v: number, max: number, color: string) => (
    <div style={{ height: 4, background: '#f3f4f6', borderRadius: 2, marginTop: 3 }}>
      <div style={{ height: 4, borderRadius: 2, background: color, width: `${Math.round(v/max*100)}%`, transition: 'width 0.4s' }} />
    </div>
  );

  return (
    <div className="mb-6">
      {/* Header colapsable */}
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-3 bg-white rounded-xl border border-gray-200 shadow-sm mb-1"
      >
        <div className="flex items-center gap-2">
          <span className="text-base">📊</span>
          <span className="font-black text-sm uppercase tracking-wide text-gray-900">Estadísticas{torneoNombre ? ` · ${torneoNombre}` : ''}</span>
          <span className="text-xs text-gray-400 font-normal">{faseActual}</span>
        </div>
        <span className="text-xs text-gray-400">{open ? '▲' : '▼'}</span>
      </button>

      {open && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          {/* Summary */}
          <div className="grid grid-cols-4 gap-0 border-b border-gray-100">
            {[[String(partidosFinalizados.length),'Partidos'],[String(totalGoles),'Goles'],[promedio,'Prom.'],[String(equipos.length),'Equipos']].map(([v,l],i) => (
              <div key={i} className="text-center py-3 border-r last:border-0 border-gray-100">
                <div className="text-lg font-black text-gray-900">{v}</div>
                <div className="text-xs text-gray-400">{l}</div>
              </div>
            ))}
          </div>

          {/* Tabs */}
          <div className="flex border-b border-gray-100">
            {(['goles','equipos'] as const).map(t => (
              <button key={t} onClick={() => setStatsTab(t)}
                className={'flex-1 py-2 text-xs font-black uppercase transition-colors border-b-2 ' +
                  (statsTab===t ? 'text-gray-900 border-red-600' : 'text-gray-400 border-transparent')}>
                {t === 'goles' ? 'Goleadores' : 'Equipos'}
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="px-4 py-2">
            {statsTab === 'goles' && (goleadores.length === 0 ? (
              <p className="text-xs text-gray-400 py-4 text-center">Cargando goleadores...</p>
            ) : goleadores.map((d, i) => (
              <div key={i} style={{ display:'flex', alignItems:'center', gap:8, padding:'7px 0', borderBottom:'0.5px solid #f3f4f6' }}>
                <span style={{ fontSize:13, fontWeight:700, minWidth:20, textAlign:'center', color: i===0?'#b8860b':i<3?'#888':'#ccc' }}>{i+1}</span>
                <img src={`https://flagcdn.com/20x15/${d.team?.flag || ''}.png`} alt={d.team?.name} width={20} height={15} className="rounded-sm" />
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:12, fontWeight:600 }}>{d.player_name}</div>
                  <div style={{ fontSize:10, color:'#9ca3af' }}>{d.team?.name}</div>
                  {renderBar(d.goals, maxGoles, '#c8102e')}
                </div>
                <div style={{ fontSize:18, fontWeight:700, minWidth:24, textAlign:'right' }}>{d.goals}</div>
              </div>
            )))}
            {statsTab === 'equipos' && equiposTop.map((e, i) => (
              <div key={i} style={{ display:'flex', alignItems:'center', gap:8, padding:'7px 0', borderBottom:'0.5px solid #f3f4f6' }}>
                <span style={{ fontSize:13, color:'#ccc', minWidth:20, textAlign:'center' }}>{i+1}</span>
                <img src={`https://flagcdn.com/20x15/${e.flag}.png`} alt={e.name} width={20} height={15} className="rounded-sm" />
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:12, fontWeight:600 }}>{e.name}</div>
                  <div style={{ display:'flex', gap:4, marginTop:2 }}>
                    <span style={{ fontSize:10, padding:'1px 6px', borderRadius:3, background:'#dcfce7', color:'#15803d', fontWeight:700 }}>⚽ {e.g}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="px-4 py-2 border-t border-gray-100">
            <p className="text-xs text-gray-400">Datos en vivo{torneoNombre ? ` · ${torneoNombre}` : ''}</p>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── ANÁLISIS IA ──────────────────────────────────────────────────────────────

function AnalisisIA({ homeTeam, awayTeam }: { homeTeam: any; awayTeam: any }) {
  const [open, setOpen] = useState(false);
  const analisis = getAnalisis(homeTeam?.name || '', awayTeam?.name || '');
  if (!analisis) return null;

  return (
    <div className="mt-2 border-t border-gray-100">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-2 text-xs font-bold text-yellow-400 hover:bg-gray-50 transition-colors"
      >
        <span>⚡ Análisis IA · Te Lo Sugiero Sports</span>
        <span>{open ? '▲' : '▼'}</span>
      </button>
      {open && (
        <div className="px-4 pb-4 space-y-3">
          <p className="text-gray-300 text-sm leading-relaxed">{analisis.prediccion}</p>
          <div className="space-y-1">
            <p className="text-yellow-400 text-xs font-black uppercase">Claves del partido</p>
            {analisis.claves.map((c, i) => (
              <div key={i} className="flex gap-2 text-xs text-gray-400">
                <span className="text-yellow-600 flex-shrink-0">→</span>
                <span>{c}</span>
              </div>
            ))}
          </div>
          <div className="bg-yellow-900/30 border border-yellow-700 rounded-lg px-3 py-2">
            <p className="text-yellow-400 text-xs font-black uppercase mb-1">Veredicto</p>
            <p className="text-white text-sm font-bold">{analisis.veredicto}</p>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── PARTIDO DESTACADO COLOMBIA ───────────────────────────────────────────────

function PartidoColombiaHero({ partidos }: { partidos: any[] }) {
  const colMatches = partidos.filter(p =>
    p.home_team?.name?.toLowerCase().includes('colombia') ||
    p.away_team?.name?.toLowerCase().includes('colombia')
  );
  if (colMatches.length === 0) return null;

  const live = colMatches.find(p => p.status === 'live');
  const upcoming = colMatches
    .filter(p => p.status === 'scheduled')
    .sort((a, b) => new Date(a.match_date).getTime() - new Date(b.match_date).getTime())[0];

  // Colombia ya fue eliminada: si no hay partido en vivo ni programado, no mostrar el hero.
  const col = live || upcoming;
  if (!col) return null;

  const esCasa = col.home_team?.name?.toLowerCase().includes('colombia');
  const rivalTeam = esCasa ? col.away_team : col.home_team;
  const colTeam = esCasa ? col.home_team : col.away_team;
  const colScore = esCasa ? col.home_score : col.away_score;
  const rivScore = esCasa ? col.away_score : col.home_score;
  const isLive = col.status === 'live';
  const isFinished = col.status === 'finished';

  return (
    <div className="mb-4 rounded-2xl overflow-hidden border border-yellow-700 shadow-2xl shadow-yellow-900/30"
      style={{ background: 'linear-gradient(135deg, #1a1200 0%, #0a0a0a 50%, #001a0a 100%)' }}>
      <div className="flex items-center justify-between px-4 py-2 border-b border-yellow-900/40">
        <div className="flex items-center gap-2">
          <span className="text-yellow-400 text-xs">🇨🇴</span>
          <span className="text-yellow-400 font-black text-xs uppercase tracking-widest">Partido Colombia</span>
        </div>
        {isLive && <span className="bg-red-600 text-white text-xs font-black px-2 py-0.5 rounded-full animate-pulse">⚡ EN VIVO {col.minute}&apos;</span>}
        {isFinished && <span className="bg-gray-700 text-gray-300 text-xs font-bold px-2 py-0.5 rounded-full">✓ Final</span>}
        {!isLive && !isFinished && <span className="text-yellow-600 text-xs font-bold">{formatFecha(col.match_date)}</span>}
      </div>
      <div className="px-6 py-5 flex items-center justify-between gap-4">
        <div className="flex flex-col items-center gap-2 flex-1">
          <FlagLg code={colTeam?.flag} />
          <span className="text-white font-black text-sm text-center">Colombia</span>
        </div>
        <div className="text-center flex-shrink-0">
          {isFinished || isLive ? (
            <div>
              <div className="text-4xl font-black text-white tracking-wider">
                {colScore ?? 0} <span className="text-yellow-500">–</span> {rivScore ?? 0}
              </div>
              {isLive && <div className="text-red-400 text-xs font-bold mt-1">En curso</div>}
            </div>
          ) : (
            <div>
              <div className="text-yellow-500 font-black text-2xl">VS</div>
              <div className="text-gray-400 text-xs mt-1">{col.round || 'R32'}</div>
            </div>
          )}
        </div>
        <div className="flex flex-col items-center gap-2 flex-1">
          <FlagLg code={rivalTeam?.flag} />
          <span className="text-white font-black text-sm text-center">{rivalTeam?.short_name || rivalTeam?.name}</span>
        </div>
      </div>
      <AnalisisIA homeTeam={col.home_team} awayTeam={col.away_team} />
      <div className="px-4 py-2 border-t border-yellow-900/30 flex justify-between text-xs text-gray-600">
        <span>{col.round || 'Eliminatoria de 32'}</span>
        <span>{col.stadium}</span>
      </div>
    </div>
  );
}

// ─── CTA POLLA EMPRESARIAL ────────────────────────────────────────────────────

function CTAEmpresarial({ torneoNombre }: { torneoNombre?: string }) {
  return (
    <a href={WA_DEMO} target="_blank" rel="noopener noreferrer"
      className="block mb-4 rounded-xl overflow-hidden border border-yellow-600 hover:border-yellow-400 transition-all hover:scale-[1.01]"
      style={{ background: 'linear-gradient(90deg, #78350f 0%, #1c1c1c 100%)' }}>
      <div className="flex items-center justify-between px-4 py-3 gap-3">
        <div className="flex items-center gap-3">
          <span className="text-2xl">🏆</span>
          <div>
            <p className="text-yellow-400 font-black text-sm uppercase leading-none">Polla Empresarial</p>
            <p className="text-gray-400 text-xs mt-0.5">Tu empresa en {torneoNombre || 'el torneo'} · Pide tu demo</p>
          </div>
        </div>
        <div className="bg-green-500 text-white text-xs font-black px-3 py-2 rounded-lg whitespace-nowrap flex-shrink-0">
          WhatsApp →
        </div>
      </div>
    </a>
  );
}

// ─── BANNER LA GRAN FINAL ─────────────────────────────────────────────────────

const TORNEO_MUNDIAL = '00000000-0000-0000-0000-000000002026';

function BannerFinal({ torneo }: { torneo?: any }) {
  if (torneo && torneo.id !== TORNEO_MUNDIAL) return null;
  const [final, setFinal] = useState<any>(null);
  useEffect(() => {
    const load = () => fetch(API + '/api/matches/00000000-0000-0000-0000-000000000104')
      .then(r => r.json()).then(m => { if (m?.id) setFinal(m); }).catch(() => {});
    load();
    const t = setInterval(load, 60000);
    return () => clearInterval(t);
  }, []);

  const terminado = final?.status === 'finished';
  const campeon = terminado
    ? (final.home_score !== final.away_score
        ? (final.home_score > final.away_score ? final.home_team : final.away_team)
        : (final.home_penalties != null && final.away_penalties != null && final.home_penalties !== final.away_penalties
            ? (final.home_penalties > final.away_penalties ? final.home_team : final.away_team)
            : null))
    : null;

  // Modo campeón: la copa, la bandera y el marcador final
  if (campeon) {
    return (
      <a href="/final"
        className="block mb-4 rounded-xl overflow-hidden border border-yellow-500 hover:border-yellow-300 transition-all hover:scale-[1.01] relative bg-black">
        {/* Estadio de fondo + velo para que el texto dorado se lea */}
        <img src="/estadio.jpg" alt="" aria-hidden
          className="absolute inset-0 w-full h-full object-cover" />
        <div aria-hidden className="absolute inset-0"
          style={{ background: 'radial-gradient(ellipse at 50% 55%, rgba(0,0,0,0.78) 0%, rgba(0,0,0,0.55) 55%, rgba(0,0,0,0.65) 100%)' }} />
        <style>{`
          @keyframes confettiCae { 0% { transform:translateY(-12%) rotate(0); opacity:0 } 10% { opacity:1 } 100% { transform:translateY(420px) rotate(720deg); opacity:0 } }
        `}</style>

        <div aria-hidden className="absolute inset-0 pointer-events-none overflow-hidden">
          {Array.from({ length: 26 }).map((_, i) => (
            <span key={i} className="absolute block w-1.5 h-2.5 rounded-sm"
              style={{ left: `${(i * 37) % 100}%`, background: i % 3 === 0 ? '#facc15' : i % 3 === 1 ? '#fff' : '#f59e0b',
                animation: `confettiCae ${4 + (i % 4)}s linear ${(i % 8) * 0.6}s infinite` }} />
          ))}
        </div>

        <div className="relative z-10 flex flex-col items-center text-center gap-2 px-4 py-14">
          <p className="text-yellow-500 text-[10px] sm:text-xs font-bold uppercase tracking-[0.45em]">Campeón del Mundo</p>
          <div className="flex items-center gap-3 mt-1">
            <img src={`https://flagcdn.com/w160/${campeon.flag}.png`} alt={campeon.name}
              className="w-16 sm:w-24 rounded-lg ring-2 ring-yellow-500/60 shadow-[0_0_35px_rgba(234,179,8,0.5)]" />
            <p className="text-yellow-400 font-black text-3xl sm:text-5xl uppercase drop-shadow-[0_0_25px_rgba(234,179,8,0.6)]">
              {campeon.name}
            </p>
          </div>
          <p className="text-white/90 font-bold text-sm sm:text-base mt-2">
            {final.home_team.name} {final.home_score} – {final.away_score} {final.away_team.name}
            {final.home_penalties != null && final.away_penalties != null &&
              ` (${final.home_penalties}-${final.away_penalties} pen.)`}
          </p>
          <p className="text-gray-400 text-[11px] sm:text-xs">{torneo?.name || ''} · Ver resultados y ranking →</p>
        </div>
      </a>
    );
  }

  // Antes/durante el partido: banderas + cuenta regresiva
  return <BannerCuentaRegresiva enJuego={final?.status === 'live'} />;
}

function BannerCuentaRegresiva({ enJuego }: { enJuego?: boolean }) {
  const KICKOFF = new Date('2026-07-19T20:00:00Z').getTime();
  const [ahora, setAhora] = useState(() => Date.now());
  useEffect(() => {
    const t = setInterval(() => setAhora(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);
  const diff = Math.max(0, KICKOFF - ahora);
  const h = Math.floor(diff / 3600000);
  const m = Math.floor(diff / 60000) % 60;
  const s = Math.floor(diff / 1000) % 60;
  const empezo = diff === 0 || enJuego;

  return (
    <a href="/final"
      className="block mb-4 rounded-xl overflow-hidden border border-yellow-600 hover:border-yellow-400 transition-all hover:scale-[1.01]"
      style={{ background: 'radial-gradient(ellipse at 50% 0%, #3b3000 0%, #000 70%)' }}>
      <div className="flex items-center justify-center gap-4 sm:gap-10 px-4 py-8">
        <div className="flex flex-col items-center gap-2">
          <img src="https://flagcdn.com/w160/es.png" alt="España" className="w-20 sm:w-32 rounded-lg shadow-[0_0_30px_rgba(234,179,8,0.3)] ring-1 ring-white/20" />
          <p className="text-white font-black text-xs sm:text-sm uppercase">España</p>
        </div>

        <div className="flex flex-col items-center gap-1">
          {empezo ? (
            <p className="text-yellow-400 font-black text-2xl sm:text-4xl uppercase animate-pulse">¡En juego!</p>
          ) : (
            <div className="flex items-center gap-1.5 tabular-nums">
              {[[h, 'hrs'], [m, 'min'], [s, 'seg']].map(([v, l]) => (
                <div key={String(l)} className="flex flex-col items-center">
                  <span className="bg-white/10 border border-yellow-500/40 rounded-lg px-2 py-1.5 sm:px-3 sm:py-2 text-yellow-300 font-black text-xl sm:text-3xl min-w-[46px] sm:min-w-[64px] text-center">
                    {String(v).padStart(2, '0')}
                  </span>
                  <span className="text-[9px] uppercase tracking-widest text-gray-500 mt-1">{String(l)}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex flex-col items-center gap-2">
          <img src="https://flagcdn.com/w160/ar.png" alt="Argentina" className="w-20 sm:w-32 rounded-lg shadow-[0_0_30px_rgba(56,189,248,0.3)] ring-1 ring-white/20" />
          <p className="text-white font-black text-xs sm:text-sm uppercase">Argentina</p>
        </div>
      </div>
    </a>
  );
}

// ─── CHIP DE PUNTOS (wallet de la Plataforma) ─────────────────────────────────

function PuntosChipHeader() {
  const [points, setPoints] = useState<number | null>(null);
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) return;
      supabase.from('wallets').select('points').maybeSingle()
        .then(({ data }) => { if (data) setPoints(data.points); });
    });
  }, []);

  if (points === null) return null;
  return (
    <a href="https://telosugiero.com/wallet" target="_blank" rel="noopener noreferrer"
      className="flex items-center gap-1.5 bg-yellow-500 hover:bg-yellow-400 transition-colors rounded-full px-3 py-1.5">
      <span className="text-sm">🪙</span>
      <span className="text-black font-black text-sm tabular-nums">{points}</span>
      <span className="text-black/70 text-[10px] font-bold uppercase">pts</span>
    </a>
  );
}

// ─── GOLEADORES DESTACADO ─────────────────────────────────────────────────────

function GoleadoresDestacado({ torneoId, torneoNombre, esMundial }: { torneoId?: string; torneoNombre?: string; esMundial?: boolean }) {
  const [scorers, setScorers] = useState<any[]>([]);
  useEffect(() => {
    if (!torneoId) return;
    fetch(API + '/api/tournaments/' + torneoId + '/scorers?limit=5')
      .then(r => r.json())
      .then(d => setScorers(Array.isArray(d) ? d : []))
      .catch(() => {});
  }, [torneoId]);

  if (scorers.length === 0) return null;
  const podio = scorers.slice(0, 3);
  const resto = scorers.slice(3);
  const iniciales = (n: string) => n.split(' ').map((w: string) => w[0]).slice(0, 2).join('');

  // Orden visual del podio: 2° a la izquierda, 1° al centro, 3° a la derecha
  const orden = [podio[1], podio[0], podio[2]].filter(Boolean);
  const estilo = (s: any) => {
    if (s === podio[0]) return { ring: '#facc15', bg: '#facc15', texto: '#000', alto: 'h-6', avatar: 'w-9 h-9 text-xs', medalla: '👑', num: '1' };
    if (s === podio[1]) return { ring: '#d1d5db', bg: '#d1d5db', texto: '#000', alto: 'h-4', avatar: 'w-8 h-8 text-[10px]', medalla: '🥈', num: '2' };
    return { ring: '#d97706', bg: '#d97706', texto: '#000', alto: 'h-3', avatar: 'w-8 h-8 text-[10px]', medalla: '🥉', num: '3' };
  };

  return (
    <div className="mb-4 rounded-2xl overflow-hidden border border-yellow-600/70 relative"
      style={{ background: 'linear-gradient(135deg, #0b1120 0%, #1c1508 60%, #2b1f04 100%)' }}>
      {/* Luces de estadio de fondo */}
      <div aria-hidden className="absolute inset-0 opacity-40"
        style={{ background: 'radial-gradient(ellipse at 75% 15%, rgba(250,204,21,0.28) 0%, transparent 55%), radial-gradient(ellipse at 20% 80%, rgba(217,119,6,0.18) 0%, transparent 60%)' }} />

      {/* Banner del Mundial: pieza gráfica completa. En otros torneos se usa el
          encabezado con el trofeo, que no lleva textos fijos. */}
      {esMundial && (
        <img src="/botin-banner.jpg" alt="Botín de Oro"
          className="relative w-full block" />
      )}

      <div className="relative flex items-stretch gap-3 px-3 pt-4 pb-2">
        {!esMundial && (
          <img src="/botin-oro.jpg" alt="Trofeo Botín de Oro"
            className="w-24 sm:w-36 object-contain flex-shrink-0 self-center rounded-xl"
            style={{ filter: 'drop-shadow(0 0 22px rgba(250,204,21,0.35))' }} />
        )}

        <div className="flex-1 min-w-0">
          {!esMundial && (
            <>
              <p className="text-yellow-400 font-black text-lg sm:text-2xl uppercase tracking-wide leading-none">
                👑 Botín de Oro
              </p>
              <p className="text-gray-400 text-[10px] sm:text-xs mt-1 uppercase tracking-wider">
                Máximos goleadores{torneoNombre ? ` · ${torneoNombre}` : ''}
              </p>
            </>
          )}

          {/* Podio top 3 (en el Mundial ya viene en el banner) */}
          <div className={'mt-3 grid-cols-3 items-end gap-2 ' + (esMundial ? 'hidden' : 'grid')}>
        {orden.map((s: any) => {
          const e = estilo(s);
          return (
            <div key={s.player_name} className="flex flex-col items-center gap-0.5">
              <span className="text-xs leading-none">{e.medalla}</span>
              <div className="relative">
                <div className={`${e.avatar} rounded-full flex items-center justify-center font-black`}
                  style={{ background: e.bg, color: e.texto, boxShadow: `0 0 12px ${e.ring}55`, border: `2px solid ${e.ring}` }}>
                  {iniciales(s.player_name)}
                </div>
                <img src={`https://flagcdn.com/16x12/${s.team?.flag}.png`} alt={s.team?.name}
                  width={16} height={12} className="rounded-sm absolute -bottom-0.5 -right-1 ring-1 ring-black" />
              </div>
              <p className="text-white font-bold text-[9px] text-center leading-tight">{s.player_name}</p>
              <p className="font-black text-[11px] leading-none" style={{ color: e.ring }}>{s.goals} ⚽</p>
              <div className={`w-full ${e.alto} rounded-t-md flex items-start justify-center`}
                style={{ background: `linear-gradient(180deg, ${e.ring}40 0%, ${e.ring}10 100%)`, borderTop: `2px solid ${e.ring}` }}>
                <span className="font-black text-[10px]" style={{ color: e.ring }}>{e.num}</span>
              </div>
            </div>
          );
        })}
          </div>
        </div>
      </div>

      {/* Resto del top */}
      {resto.length > 0 && (
        <div className="relative mx-3 mb-3 rounded-xl overflow-hidden bg-black/40 border border-white/5">
          {resto.map((s, i) => (
            <div key={s.player_name + i} className="px-3 py-2 flex items-center gap-3 border-b border-white/5 last:border-b-0">
              <span className="w-6 text-center text-xs text-gray-400 flex-shrink-0">{i + 4}°</span>
              <img src={`https://flagcdn.com/20x15/${s.team?.flag}.png`} alt="" width={20} height={15} className="rounded-sm flex-shrink-0" />
              <p className="flex-1 text-gray-200 text-sm font-bold truncate">{s.player_name}</p>
              <p className="text-yellow-400 font-black text-sm flex-shrink-0">{s.goals} ⚽</p>
            </div>
          ))}
        </div>
      )}

    </div>
  );
}

// ─── PARTIDO CARD ─────────────────────────────────────────────────────────────

function PartidoCard({ p, predicciones, setLineupMatch }: { p: any; predicciones: Record<string,boolean>; setLineupMatch: (m:any)=>void }) {
  const color = GROUP_COLORS[p.groups?.name] || '#e5e7eb';
  return (
    <div className="relative bg-white rounded-xl shadow-sm overflow-hidden transition-colors"
      style={{ borderLeft: `4px solid ${color}`, borderTop:'0.5px solid #e5e7eb', borderBottom:'0.5px solid #e5e7eb', borderRight:'0.5px solid #e5e7eb' }}>
      {predicciones[p.id] && (
        <div className="absolute top-2 right-2 z-10 w-2.5 h-2.5 rounded-full bg-green-500 shadow-sm" title="Pronosticado" />
      )}
      <div className="flex items-center px-4 py-3 gap-3">
        <FlagImg code={p.home_team?.flag} />
        <span className="text-sm font-bold text-right flex-1 text-gray-900">{p.home_team?.name}</span>
        <div className={'px-4 py-2 rounded-lg text-center min-w-16 ' + (p.status === 'live' ? 'bg-red-600' : 'bg-yellow-400')}>
          {p.status === 'finished' && <span className="font-black text-lg text-gray-900">{p.home_score} - {p.away_score}</span>}
          {p.status === 'live' && <span className="font-black text-white text-xs">VIVO {p.minute}&apos;</span>}
          {p.status === 'scheduled' && <span className="text-yellow-600 text-xs font-bold">VS</span>}
        </div>
        <span className="text-sm font-bold flex-1 text-gray-900">{p.away_team?.name}</span>
        <FlagImg code={p.away_team?.flag} />
      </div>
      <div className="flex justify-between px-4 py-2 text-xs border-t"
        style={{ background:`${color}15`, borderTopColor:`${color}40` }}>
        <span className="font-bold" style={{ color }}>
          {p.groups?.name ? `Grupo ${p.groups.name}` : (ROUND_LABELS[p.round] || p.round || '')}
        </span>
        <span className="text-gray-600">{p.stadium}</span>
        <span>{formatFecha(p.match_date)}</span>
      </div>
      <AnalisisIA homeTeam={p.home_team} awayTeam={p.away_team} />
      {(SQUAD_TEAMS.includes(p.home_team?.name) || SQUAD_TEAMS.includes(p.away_team?.name)) && (
        <button onClick={(e) => { e.stopPropagation(); setLineupMatch(p); }}
          className="w-full px-4 py-2 text-xs font-black text-yellow-400 border-t border-gray-100 hover:bg-gray-50 transition-colors flex items-center justify-center gap-2">
          ⚽ Armar XI Titular
        </button>
      )}
    </div>
  );
}

// ─── LINEUP MODAL ─────────────────────────────────────────────────────────────

const FORMATIONS: Record<string, string[][]> = {
  '4-3-3': [['ST','ST','ST'],['CM','CDM','CM'],['LB','CB','CB','RB'],['GK']],
  '4-2-3-1': [['ST'],['LW','CAM','RW'],['CDM','CDM'],['LB','CB','CB','RB'],['GK']],
  '3-5-2': [['ST','ST'],['LW','CM','CDM','CM','RW'],['CB','CB','CB'],['GK']],
};

function LineupModal({ match, onClose }: { match: any; onClose: () => void }) {
  const [formation, setFormation] = useState('4-3-3');
  const [squad, setSquad] = useState<any[]>([]);
  const [lineup, setLineup] = useState<Record<string, any>>({});
  const [dragging, setDragging] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const homeIsSquad = SQUAD_TEAMS.includes(match.home_team?.name);
  const awayIsSquad = SQUAD_TEAMS.includes(match.away_team?.name);
  const [side, setSide] = useState<'home' | 'away'>(homeIsSquad ? 'home' : 'away');
  const teamId = side === 'home' ? match.home_team?.id : match.away_team?.id;
  const teamName = side === 'home' ? match.home_team?.name : match.away_team?.name;

  useEffect(() => {
    if (!teamId) return;
    setSquad([]); setLineup({});
    fetch(API + '/api/teams/' + teamId + '/squad').then(r => r.json()).then(d => setSquad(d));
  }, [teamId]);

  const rows = FORMATIONS[formation];
  const usedIds = new Set(Object.values(lineup).map((p: any) => p?.id).filter(Boolean));
  const available = squad.filter(p => !usedIds.has(p.id));

  const handleDrop = (slotKey: string) => { if (!dragging) return; setLineup(prev => ({ ...prev, [slotKey]: dragging })); setDragging(null); };
  const removeFromSlot = (slotKey: string) => { setLineup(prev => { const n = { ...prev }; delete n[slotKey]; return n; }); };

  const handleSave = async () => {
    const token = await getAccessToken();
    if (!token) return;
    setSaving(true);
    await fetch(API + '/api/lineup-picks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token },
      body: JSON.stringify({ match_id: match.id, team_id: teamId, formation, players: lineup })
    });
    setSaving(false); setSaved(true); setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/80" onClick={onClose}>
      <div className="bg-white w-full max-w-lg rounded-t-2xl border-t border-yellow-700 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800">
          <div>
            <p className="text-yellow-400 font-black text-sm uppercase">Armar XI Titular</p>
            <p className="text-gray-500 text-xs">{teamName} · {match.home_team?.name} vs {match.away_team?.name}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 text-xl">✕</button>
        </div>
        {homeIsSquad && awayIsSquad && (
          <div className="flex gap-2 px-4 py-2 border-b border-gray-800">
            {(['home','away'] as const).map(s => (
              <button key={s} onClick={() => setSide(s)}
                className={'flex-1 py-1.5 rounded text-xs font-black ' + (side===s ? 'bg-yellow-500 text-black' : 'bg-gray-100 text-gray-500')}>
                {s==='home' ? match.home_team?.name : match.away_team?.name}
              </button>
            ))}
          </div>
        )}
        <div className="flex gap-2 px-4 py-2 border-b border-gray-800">
          {Object.keys(FORMATIONS).map(f => (
            <button key={f} onClick={() => setFormation(f)}
              className={'px-3 py-1 rounded text-xs font-black ' + (formation===f ? 'bg-yellow-500 text-black' : 'bg-gray-100 text-gray-500')}>
              {f}
            </button>
          ))}
        </div>
        <div className="relative mx-4 my-3 rounded-xl overflow-hidden"
          style={{ background:'repeating-linear-gradient(180deg,#1a3a1a 0px,#1a3a1a 40px,#163216 40px,#163216 80px)', minHeight:'320px' }}>
          <div className="relative z-10 py-3 space-y-2">
            {rows.map((row, ri) => (
              <div key={ri} className="flex justify-center gap-2">
                {row.map((pos, pi) => {
                  const key = `${ri}-${pi}`;
                  const player = lineup[key];
                  return (
                    <div key={key}
                      onDragOver={e => e.preventDefault()} onDrop={() => handleDrop(key)}
                      onClick={() => player && removeFromSlot(key)}
                      className={'w-16 h-16 rounded-lg border-2 flex flex-col items-center justify-center cursor-pointer transition-all ' +
                        (player ? 'border-yellow-500 bg-yellow-900/40' : 'border-gray-600 bg-black/30 border-dashed hover:border-yellow-600')}>
                      {player ? (
                        <>
                          <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-black" style={{ background:'#78350f', color:'#FCD116' }}>
                            {player.name.split(' ').map((n: string) => n[0]).slice(0,2).join('')}
                          </div>
                          <p className="text-white text-xs font-bold mt-0.5 truncate w-14 text-center">{player.short_name}</p>
                        </>
                      ) : (
                        <p className="text-gray-500 text-xs font-bold">{pos}</p>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
        <div className="px-4 pb-2">
          <p className="text-gray-500 text-xs font-black uppercase mb-2">Arrastra jugadores a la cancha</p>
          <div className="grid grid-cols-3 gap-1 max-h-40 overflow-y-auto">
            {available.map(p => (
              <div key={p.id} draggable onDragStart={() => setDragging(p)} onDragEnd={() => setDragging(null)}
                className={'flex items-center gap-1 bg-gray-100 rounded px-2 py-1.5 cursor-grab active:cursor-grabbing border ' +
                  (dragging?.id===p.id ? 'border-yellow-500 opacity-50' : 'border-gray-700')}>
                <span className="text-yellow-600 text-xs font-black w-4">{p.number}</span>
                <span className="text-white text-xs truncate">{p.short_name}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="px-4 pb-4">
          <button onClick={handleSave} disabled={saving}
            className={'w-full py-3 rounded-xl font-black text-sm uppercase transition-colors ' +
              (saved ? 'bg-green-600 text-white' : 'bg-yellow-500 text-black hover:bg-yellow-400')}>
            {saved ? '✅ Guardado' : saving ? 'Guardando...' : 'Guardar Alineación'}
          </button>
        </div>
      </div>
    </div>
  );
}

const SQUAD_TEAMS = ['Colombia','Brasil','Argentina','España','Francia','Portugal','Inglaterra','Alemania'];
const POS_ORDER: Record<string,number> = {GK:1,CB:2,RB:3,LB:4,CDM:5,CM:6,CAM:7,RM:8,LM:9,RW:10,LW:11,ST:12};

// ─── EQUIPOS TAB ──────────────────────────────────────────────────────────────

function EquiposTab({ equipos }: { equipos: any[] }) {
  const [selectedTeam, setSelectedTeam] = useState<any>(null);
  const [squad, setSquad] = useState<any[]>([]);
  const [loadingSquad, setLoadingSquad] = useState(false);

  const squadTeams = equipos.filter(e => SQUAD_TEAMS.includes(e.name));
  const otherTeams = equipos.filter(e => !e.is_placeholder && !SQUAD_TEAMS.includes(e.name));

  const loadSquad = async (team: any) => {
    if (selectedTeam?.id === team.id) { setSelectedTeam(null); setSquad([]); return; }
    setSelectedTeam(team); setLoadingSquad(true);
    const res = await fetch(API + '/api/teams/' + team.id + '/squad');
    const data = await res.json();
    setSquad(data.sort((a: any, b: any) => (POS_ORDER[a.position]||99) - (POS_ORDER[b.position]||99)));
    setLoadingSquad(false);
  };

  const posByGroup: Record<string, any[]> = {};
  squad.forEach(p => {
    const g = p.position==='GK' ? 'Porteros'
      : ['CB','RB','LB'].includes(p.position) ? 'Defensas'
      : ['CDM','CM','CAM','RM','LM'].includes(p.position) ? 'Mediocampistas'
      : 'Delanteros';
    if (!posByGroup[g]) posByGroup[g] = [];
    posByGroup[g].push(p);
  });

  return (
    <div className="space-y-4">
      <p className="text-yellow-400 text-xs font-black uppercase tracking-widest">Equipos con squad completo</p>
      <div className="grid grid-cols-2 gap-2">
        {squadTeams.map(e => (
          <button key={e.id} onClick={() => loadSquad(e)}
            className={'rounded-lg p-3 flex items-center gap-3 border transition-colors w-full text-left ' +
              (selectedTeam?.id===e.id ? 'bg-yellow-900/30 border-yellow-500' : 'bg-gray-900 border-gray-800 hover:border-yellow-700')}>
            <FlagImg code={e.flag} />
            <div>
              <p className="font-bold text-sm text-white">{e.name}</p>
              <p className="text-gray-500 text-xs">{e.short_name} · {e.confederation}</p>
            </div>
          </button>
        ))}
      </div>
      {selectedTeam && (
        <div className="bg-white rounded-xl border border-yellow-300 shadow-sm overflow-hidden">
          <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 border-b border-gray-200">
            <FlagLg code={selectedTeam.flag} />
            <div>
              <p className="font-black text-white text-lg">{selectedTeam.name}</p>
              <p className="text-gray-500 text-xs">{selectedTeam.confederation}</p>
            </div>
          </div>
          {loadingSquad ? <p className="text-gray-500 text-center py-8">Cargando squad...</p> : (
            <div className="divide-y divide-gray-100">
              {['Porteros','Defensas','Mediocampistas','Delanteros'].map(group => posByGroup[group] && (
                <div key={group}>
                  <p className="px-4 py-2 text-yellow-600 text-xs font-black uppercase tracking-widest bg-gray-50">{group}</p>
                  {posByGroup[group].map((p: any) => (
                    <div key={p.id} className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition-colors">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-black flex-shrink-0"
                        style={{ background: p.name.charCodeAt(0) % 2 === 0 ? '#78350f' : '#1e3a5f', color:'#FCD116' }}>
                        {p.name.split(' ').map((n: string) => n[0]).slice(0,2).join('')}
                      </div>
                      <span className="text-gray-600 text-xs font-bold w-6 text-right">{p.number}</span>
                      <span className="bg-gray-800 text-yellow-400 text-xs font-black px-1.5 py-0.5 rounded w-10 text-center">{p.position}</span>
                      <span className="text-gray-900 text-sm font-bold flex-1">{p.name}</span>
                      <span className="text-gray-500 text-xs">{p.club}</span>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
      <p className="text-gray-600 text-xs font-black uppercase tracking-widest pt-2">Todos los equipos</p>
      <div className="grid grid-cols-2 gap-2">
        {otherTeams.map(e => (
          <div key={e.id} className="bg-gray-900 rounded-lg p-3 flex items-center gap-3 border border-gray-800">
            <FlagImg code={e.flag} />
            <div>
              <p className="font-bold text-sm text-white">{e.name}</p>
              <p className="text-gray-500 text-xs">{e.short_name} · {e.confederation}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────

export default function Home() {
  const [torneo, setTorneo] = useState<any>(null);
  const [equipos, setEquipos] = useState<any[]>([]);
  const [partidos, setPartidos] = useState<any[]>([]);
  const [posiciones, setPosiciones] = useState<any[]>([]);
  const [grupoActivo, setGrupoActivo] = useState<string>('A');
  const [tab, setTab] = useState('partidos');
  const [predicciones, setPredicciones] = useState<Record<string,boolean>>({});
  const [lineupMatch, setLineupMatch] = useState<any>(null);
  const [resultadosOpen, setResultadosOpen] = useState(false);

  // Lista de torneos disponibles (para el selector)
  const [torneos, setTorneos] = useState<any[]>([]);

  useEffect(() => {
    // El API ordena: activo > próximos > terminados. El primero es el vigente.
    fetch(API + '/api/tournaments').then(r => r.json()).then(d => {
      const lista = d.data || [];
      setTorneos(lista);
      // Por defecto, el primero que ya tenga partidos cargados: evita aterrizar
      // en un torneo próximo cuyo calendario aún no se ha sincronizado.
      const inicial = lista.find((t: any) => (t.matches_count ?? 0) > 0) || lista[0];
      if (inicial) setTorneo(inicial);
    });
    void getAccessToken().then(token => {
    if (token) {
      fetch(API + '/api/predictions/me', { headers: { Authorization: 'Bearer ' + token } })
        .then(r => r.json())
        .then(data => {
          const map: Record<string,boolean> = {};
          (data || []).forEach((p: any) => { map[p.match_id] = true; });
          setPredicciones(map);
        });
    }
    });
  }, []);

  // Al cambiar de torneo, recargar partidos, equipos y posiciones
  useEffect(() => {
    if (!torneo?.id) return;
    setPartidos([]); setEquipos([]); setPosiciones([]);
    fetch(API + '/api/tournaments/' + torneo.id + '/standings').then(r => r.json()).then(d => setPosiciones(Array.isArray(d) ? d : []));
    fetch(API + '/api/teams?tournament_id=' + torneo.id).then(r => r.json()).then(d => setEquipos(d.data || d || []));
    fetch(API + '/api/matches?tournament_id=' + torneo.id).then(r => r.json()).then(d => setPartidos(d.data || []));
  }, [torneo?.id]);

  const esMundial = !torneo || torneo.id === TORNEO_MUNDIAL;

  // Si el torneo activo no tiene la pestaña abierta (p.ej. Posiciones en un
  // torneo de solo eliminatorias), volver a Partidos.
  useEffect(() => {
    if (!esMundial && (tab === 'posiciones' || tab === 'bracket')) setTab('partidos');
    if (esMundial && tab === 'llaves') setTab('partidos');
  }, [esMundial, tab]);

  const grupoActualData = posiciones.find(g => g.group?.name === grupoActivo);
  const grupos = posiciones.map(g => g.group?.name).filter(Boolean).sort();

  // Separar partidos
  const partidosFinalizados = partidos.filter(p => p.status === 'finished')
    .sort((a,b) => new Date(b.match_date).getTime() - new Date(a.match_date).getTime());
  const partidosPendientes = partidos.filter(p => p.status !== 'finished')
    .sort((a,b) => new Date(a.match_date).getTime() - new Date(b.match_date).getTime());

  return (
    <main className="min-h-screen bg-zinc-100 text-gray-900 pb-24">

      <header className="bg-white border-b-2 border-yellow-500 shadow-sm px-4 py-3 flex items-center gap-3">
        <div className="flex items-center gap-2 flex-1">
          <span className="text-2xl">⚽</span>
          <div>
            <p className="text-xs text-yellow-500 font-bold uppercase tracking-widest leading-none">Te Lo Sugiero</p>
            <p className="text-xl font-black text-gray-900 uppercase leading-none">SPORTS</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <PuntosChipHeader />
          <div className="text-right">
            <p className="text-yellow-500 font-black text-sm uppercase tracking-wider">{nombreCorto(torneo) || 'Golazo'}</p>
            <p className="text-gray-500 text-xs">{ESTADO_TORNEO[torneo?.status] || ''}</p>
          </div>
        </div>
      </header>

      <div className="bg-gradient-to-r from-yellow-600 via-yellow-500 to-yellow-600 px-4 py-2">
        {torneos.length > 1 ? (
          <div className="flex items-center justify-center gap-2 flex-wrap">
            {torneos.map(t => (
              <button key={t.id} onClick={() => setTorneo(t)}
                className={'px-3 py-1 rounded-full text-xs font-black uppercase tracking-wide transition-colors ' +
                  (torneo?.id === t.id
                    ? 'bg-black text-yellow-400'
                    : 'bg-black/15 text-black/70 hover:bg-black/25')}>
                {nombreCorto(t)}
                {t.status === 'upcoming' && <span className="ml-1 opacity-70">· pronto</span>}
              </button>
            ))}
          </div>
        ) : (
          <p className="text-black font-black text-sm uppercase tracking-widest text-center">
            {torneo ? `${nombreCorto(torneo)}${rangoFechas(torneo) ? ' · ' + rangoFechas(torneo) : ''}` : 'Golazo · Te Lo Sugiero Sports'}
          </p>
        )}
      </div>

      <div className="flex border-b border-gray-200 bg-white overflow-x-auto shadow-sm">
        {[
          { id:'partidos', label:'Partidos' },
          ...(esMundial ? [{ id:'posiciones', label:'Posiciones' }, { id:'bracket', label:'Bracket' }] : [{ id:'llaves', label:'Llaves' }]),
          { id:'equipos', label:'Equipos' },
          { id:'polla', label:'Empresarial' },
          { id:'torneo', label:'Torneo' },
        ].map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={'px-4 py-3 text-xs font-bold uppercase tracking-wide transition-colors flex-1 whitespace-nowrap ' +
              (tab===t.id ? 'text-yellow-600 border-b-2 border-yellow-500 bg-zinc-50' : 'text-gray-400 hover:text-gray-700')}>
            {t.label}
          </button>
        ))}
      </div>

      <div className="max-w-3xl mx-auto px-4 py-6">

        {tab === 'partidos' && (
          <div>
            {/* 0. Banner de la final con video */}
            <BannerFinal torneo={torneo} />

            {/* 1. Hero Colombia */}
            <PartidoColombiaHero partidos={partidos} />

            {/* 2. CTA Empresarial */}
            <CTAEmpresarial torneoNombre={nombreCorto(torneo)} />

            {/* 2b. Goleadores destacados */}
            <GoleadoresDestacado torneoId={torneo?.id} torneoNombre={nombreCorto(torneo)} esMundial={esMundial} />

            {/* 3. Estadísticas colapsables */}
            <GolazoStats torneoId={torneo?.id} torneoNombre={nombreCorto(torneo)} partidos={partidos} equipos={equipos} />

            {/* 4. Próximos partidos / en vivo */}
            {partidosPendientes.length > 0 && (
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-yellow-500 font-black text-xs uppercase tracking-widest">⚡ Próximos partidos</span>
                  <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">{partidosPendientes.length}</span>
                </div>
                <div className="space-y-3">
                  {partidosPendientes.map(p => (
                    <PartidoCard key={p.id} p={p} predicciones={predicciones} setLineupMatch={setLineupMatch} />
                  ))}
                </div>
              </div>
            )}

            {/* 5. Resultados colapsados */}
            {partidosFinalizados.length > 0 && (
              <div>
                <button
                  onClick={() => setResultadosOpen(!resultadosOpen)}
                  className="w-full flex items-center justify-between px-4 py-3 bg-white rounded-xl border border-gray-200 shadow-sm mb-2"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-sm">✓</span>
                    <span className="font-black text-sm text-gray-500 uppercase tracking-wide">Resultados fase de grupos</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">{partidosFinalizados.length} partidos</span>
                    <span className="text-xs text-gray-400">{resultadosOpen ? '▲' : '▼'}</span>
                  </div>
                </button>
                {resultadosOpen && (
                  <div className="space-y-3">
                    {partidosFinalizados.map(p => (
                      <PartidoCard key={p.id} p={p} predicciones={predicciones} setLineupMatch={setLineupMatch} />
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {tab === 'posiciones' && (
          <div className="space-y-4">
            <CTAEmpresarial torneoNombre={nombreCorto(torneo)} />
            <div className="flex gap-1 flex-wrap">
              {grupos.map(g => (
                <button key={g} onClick={() => setGrupoActivo(g)}
                  className={'px-3 py-1.5 rounded-lg text-xs font-black uppercase transition-colors ' +
                    (grupoActivo===g ? 'bg-yellow-500 text-black' : 'bg-gray-100 text-gray-700 hover:text-gray-900')}>
                  {g}
                </button>
              ))}
            </div>
            {grupoActualData ? (
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="px-4 py-3 bg-gray-50 border-b border-gray-200 flex items-center gap-2">
                  <span className="text-yellow-400 font-black text-lg">Grupo {grupoActualData.group.name}</span>
                  {grupoActualData.group.host_city && <span className="text-gray-500 text-xs">· {grupoActualData.group.host_city}</span>}
                </div>
                <div className="grid grid-cols-[2rem_1fr_2rem_2rem_2rem_2rem_2rem_2.5rem] gap-1 px-3 py-2 text-xs text-gray-600 font-bold uppercase border-b border-gray-200">
                  <span className="text-center">#</span><span>Equipo</span>
                  <span className="text-center">PJ</span><span className="text-center">PG</span>
                  <span className="text-center">PE</span><span className="text-center">PP</span>
                  <span className="text-center">DG</span><span className="text-center text-yellow-400">PTS</span>
                </div>
                {grupoActualData.rows.map((row: any, i: number) => (
                  <div key={row.team.id}
                    className={'grid grid-cols-[2rem_1fr_2rem_2rem_2rem_2rem_2rem_2.5rem] gap-1 px-3 py-3 items-center text-sm border-b border-gray-100 last:border-0 ' +
                      (i < 2 ? 'bg-green-50' : '')}>
                    <div className="flex items-center justify-center">
                      <span className={'w-5 h-5 rounded-full flex items-center justify-center text-xs font-black ' +
                        (i===0 ? 'bg-yellow-500 text-black' : i===1 ? 'bg-gray-600 text-white' : 'text-gray-500')}>{i+1}</span>
                    </div>
                    <div className="flex items-center gap-2 min-w-0">
                      <FlagImg code={row.team.flag} />
                      <div className="min-w-0">
                        <p className="font-bold text-white text-xs truncate">{row.team.name}</p>
                        <p className="text-gray-600 text-xs">{row.team.short_name}</p>
                      </div>
                    </div>
                    <span className="text-center text-gray-900 text-xs font-bold">{row.pj}</span>
                    <span className="text-center text-gray-900 text-xs font-bold">{row.pg}</span>
                    <span className="text-center text-gray-900 text-xs font-bold">{row.pe}</span>
                    <span className="text-center text-gray-900 text-xs font-bold">{row.pp}</span>
                    <span className={'text-center text-xs font-bold ' + (row.dg>0 ? 'text-green-600' : row.dg<0 ? 'text-red-600' : 'text-gray-600')}>
                      {row.dg>0 ? '+' : ''}{row.dg}
                    </span>
                    <span className="text-center font-black text-yellow-400">{row.pts}</span>
                  </div>
                ))}
                <div className="px-3 py-2 flex gap-4 text-xs text-gray-600 border-t border-gray-100">
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-700 inline-block" /> Clasifican</span>
                  <span className="text-gray-700">PJ PG PE PP DG PTS</span>
                </div>
              </div>
            ) : <p className="text-gray-500 text-center py-10">Cargando posiciones...</p>}
          </div>
        )}

        {tab === 'bracket' && esMundial && <BracketTab />}
        {tab === 'llaves' && <LlavesTab torneoId={torneo?.id} />}
        {tab === 'equipos' && <EquiposTab equipos={equipos} />}

        {tab === 'polla' && (
          <div className="space-y-6">
            <div className="bg-gradient-to-br from-yellow-900 to-gray-900 rounded-2xl p-6 border border-yellow-700">
              <div className="text-center mb-6">
                <p className="text-yellow-400 text-xs uppercase tracking-widest font-bold mb-1">{nombreCorto(torneo) || 'Golazo'}</p>
                <h2 className="text-3xl font-black text-white uppercase">Polla Empresarial</h2>
                <p className="text-gray-600 text-sm mt-2">La experiencia definitiva para equipos de trabajo</p>
              </div>
              <div className="space-y-3 mb-6">
                {['Tabla de posiciones en tiempo real','Predicciones partido a partido','Rankings y estadisticas de tu empresa','Notificaciones de goles y resultados','Bracket personalizado por empresa'].map((item, i) => (
                  <div key={i} className="flex items-center gap-3 bg-white/10 rounded-lg px-4 py-3">
                    <span className="text-yellow-400 font-black">+</span>
                    <p className="text-white text-sm font-semibold">{item}</p>
                  </div>
                ))}
              </div>
              <a href={WA_DEMO} target="_blank" rel="noopener noreferrer"
                className="block w-full bg-green-500 hover:bg-green-400 text-white font-black text-center py-4 rounded-xl text-lg uppercase tracking-wide transition-colors">
                Solicitar Demo - WhatsApp
              </a>
              <p className="text-center text-gray-500 text-xs mt-3">305 757 2968 · Respuesta inmediata</p>
            </div>
            <div className="grid grid-cols-3 gap-3 text-center">
              {[['48','Equipos'],['72','Partidos'],['39','Dias']].map((s, i) => (
                <div key={i} className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
                  <p className="text-yellow-400 font-black text-2xl">{s[0]}</p>
                  <p className="text-gray-600 text-xs uppercase">{s[1]}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === 'torneo' && torneo && (
          <div className="bg-white rounded-xl p-6 border border-yellow-200 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <span className="text-4xl">🏆</span>
              <div>
                <p className="text-xs text-yellow-500 uppercase tracking-widest">{ESTADO_TORNEO[torneo?.status] || 'Torneo'}</p>
                <h1 className="text-2xl font-black text-gray-900">{torneo.name}</h1>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              {[['Inicio',torneo.start_date],['Final',torneo.end_date],['Premio',torneo.prize],['Estado',torneo.status]].map(([l,v],i) => (
                <div key={i} className="bg-gray-100 rounded-lg p-3">
                  <p className="text-gray-500 text-xs uppercase">{l}</p>
                  <p className="font-bold text-gray-900">{v}</p>
                </div>
              ))}
            </div>
            <div className="mt-6 pt-4 border-t border-gray-100 text-center">
              <p className="text-gray-500 text-xs">Presentado por</p>
              <p className="text-yellow-500 font-black uppercase tracking-widest">Te Lo Sugiero Sports</p>
            </div>
          </div>
        )}

      </div>

      {lineupMatch && <LineupModal match={lineupMatch} onClose={() => setLineupMatch(null)} />}

      <footer className="border-t border-gray-100 py-4 text-center mt-8">
        <p className="text-yellow-600 font-black text-sm uppercase tracking-widest">Te Lo Sugiero Sports</p>
        <p className="text-gray-600 text-xs mt-1">{torneo?.name || ''}</p>
      </footer>

    </main>
  );
}
