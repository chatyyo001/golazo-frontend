'use client';
import { useEffect, useState } from 'react';
import { getAnalisis } from './analisis';

const API = 'https://golazo-api-production.up.railway.app';

const FlagImg = ({ code }: { code: string }) => {
  if (!code || code.length < 2) return <span className="w-8 h-6 bg-gray-700 rounded-sm inline-block" />;
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={'https://flagcdn.com/32x24/' + code.toLowerCase() + '.png'} alt={code} width={32} height={24} className="rounded-sm" />;
};

const FlagLg = ({ code }: { code: string }) => {
  if (!code || code.length < 2) return <span className="w-16 h-12 bg-gray-700 rounded inline-block" />;
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={'https://flagcdn.com/64x48/' + code.toLowerCase() + '.png'} alt={code} width={64} height={48} className="rounded drop-shadow-lg" />;
};

const WA_DEMO = 'https://wa.me/573057572968?text=Hola!%20Quiero%20una%20demo%20de%20la%20Polla%20Empresarial%20Mundial%202026';
const WA_GENERAL = 'https://wa.me/573057572968?text=Hola!%20Vi%20la%20app%20del%20Mundial%202026';

const formatFecha = (dateStr: string) => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString('es-CO', { day: '2-digit', month: 'short' }) + ' ' + d.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' });
};

// ─── ANÁLISIS IA ──────────────────────────────────────────────────────────────

function AnalisisIA({ homeTeam, awayTeam }: { homeTeam: any; awayTeam: any }) {
  const [open, setOpen] = useState(false);
  const analisis = getAnalisis(homeTeam?.name || '', awayTeam?.name || '');
  if (!analisis) return null;

  return (
    <div className="mt-2 border-t border-gray-800">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-2 text-xs font-bold text-yellow-400 hover:bg-gray-800 transition-colors"
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
  const col = partidos.find(p =>
    p.home_team?.name?.toLowerCase().includes('colombia') ||
    p.away_team?.name?.toLowerCase().includes('colombia')
  );
  if (!col) return null;

  const esCasa = col.home_team?.name?.toLowerCase().includes('colombia');
  const rivalTeam = esCasa ? col.away_team : col.home_team;
  const colTeam = esCasa ? col.home_team : col.away_team;
  const colScore = esCasa ? col.home_score : col.away_score;
  const rivScore = esCasa ? col.away_score : col.home_score;

  const isLive = col.status === 'live';
  const isFinished = col.status === 'finished';

  return (
    <div className="mb-6 rounded-2xl overflow-hidden border border-yellow-700 shadow-2xl shadow-yellow-900/30"
      style={{ background: 'linear-gradient(135deg, #1a1200 0%, #0a0a0a 50%, #001a0a 100%)' }}>
      <div className="flex items-center justify-between px-4 py-2 border-b border-yellow-900/40">
        <div className="flex items-center gap-2">
          <span className="text-yellow-400 text-xs">🇨🇴</span>
          <span className="text-yellow-400 font-black text-xs uppercase tracking-widest">Partido Colombia</span>
        </div>
        {isLive && (
          <span className="bg-red-600 text-white text-xs font-black px-2 py-0.5 rounded-full animate-pulse">
            ⚡ EN VIVO {col.minute}&apos;
          </span>
        )}
        {isFinished && (
          <span className="bg-gray-700 text-gray-300 text-xs font-bold px-2 py-0.5 rounded-full">
            ✓ Final
          </span>
        )}
        {!isLive && !isFinished && (
          <span className="text-yellow-600 text-xs font-bold">{formatFecha(col.match_date)}</span>
        )}
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
              <div className="text-gray-400 text-xs mt-1">Grupo {col.groups?.name}</div>
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
        <span>Grupo {col.groups?.name}</span>
        <span>{col.stadium}</span>
      </div>
    </div>
  );
}

// ─── CTA POLLA EMPRESARIAL ────────────────────────────────────────────────────

function CTAEmpresarial() {
  return (
    <a href={WA_DEMO} target="_blank" rel="noopener noreferrer"
      className="block mb-6 rounded-xl overflow-hidden border border-yellow-600 hover:border-yellow-400 transition-all hover:scale-[1.01]"
      style={{ background: 'linear-gradient(90deg, #78350f 0%, #1c1c1c 100%)' }}>
      <div className="flex items-center justify-between px-4 py-3 gap-3">
        <div className="flex items-center gap-3">
          <span className="text-2xl">🏆</span>
          <div>
            <p className="text-yellow-400 font-black text-sm uppercase leading-none">Polla Empresarial</p>
            <p className="text-gray-400 text-xs mt-0.5">Tu empresa en el Mundial · Pide tu demo</p>
          </div>
        </div>
        <div className="bg-green-500 text-white text-xs font-black px-3 py-2 rounded-lg whitespace-nowrap flex-shrink-0">
          WhatsApp →
        </div>
      </div>
    </a>
  );
}
// ─── LINEUP MODAL ─────────────────────────────────────────────────────────────

const FORMATIONS: Record<string, string[][]> = {
  '4-3-3': [['ST','ST','ST'],['CM','CDM','CM'],['LB','CB','CB','RB'],['GK']],
  '4-2-3-1': [['ST'],['LW','CAM','RW'],['CDM','CDM'],['LB','CB','CB','RB'],['GK']],
  '3-5-2': [['ST','ST'],['LW','CM','CDM','CM','RW'],['CB','CB','CB'],['GK']],
}

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
    setSquad([]);
    setLineup({});
    fetch(API + '/api/teams/' + teamId + '/squad')
      .then(r => r.json())
      .then(d => setSquad(d));
  }, [teamId]);

  const rows = FORMATIONS[formation];
  const usedIds = new Set(Object.values(lineup).map((p: any) => p?.id).filter(Boolean));
  const available = squad.filter(p => !usedIds.has(p.id));

  const handleDrop = (slotKey: string) => {
    if (!dragging) return;
    setLineup(prev => ({ ...prev, [slotKey]: dragging }));
    setDragging(null);
  };

  const removeFromSlot = (slotKey: string) => {
    setLineup(prev => { const n = { ...prev }; delete n[slotKey]; return n; });
  };

  const handleSave = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    setSaving(true);
    await fetch(API + '/api/lineup-picks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token },
      body: JSON.stringify({ match_id: match.id, team_id: teamId, formation, players: lineup })
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/80" onClick={onClose}>
      <div className="bg-gray-950 w-full max-w-lg rounded-t-2xl border-t border-yellow-700 max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800">
          <div>
            <p className="text-yellow-400 font-black text-sm uppercase">Armar XI Titular</p>
            <p className="text-gray-500 text-xs">{teamName} · {match.home_team?.name} vs {match.away_team?.name}</p>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-white text-xl">✕</button>
        </div>

        {homeIsSquad && awayIsSquad && (
          <div className="flex gap-2 px-4 py-2 border-b border-gray-800">
            <button onClick={() => setSide('home')}
              className={'flex-1 py-1.5 rounded text-xs font-black ' + (side === 'home' ? 'bg-yellow-500 text-black' : 'bg-gray-800 text-gray-400')}>
              {match.home_team?.name}
            </button>
            <button onClick={() => setSide('away')}
              className={'flex-1 py-1.5 rounded text-xs font-black ' + (side === 'away' ? 'bg-yellow-500 text-black' : 'bg-gray-800 text-gray-400')}>
              {match.away_team?.name}
            </button>
          </div>
        )}

        <div className="flex gap-2 px-4 py-2 border-b border-gray-800">
          {Object.keys(FORMATIONS).map(f => (
            <button key={f} onClick={() => setFormation(f)}
              className={'px-3 py-1 rounded text-xs font-black ' + (formation === f ? 'bg-yellow-500 text-black' : 'bg-gray-800 text-gray-400')}>
              {f}
            </button>
          ))}
        </div>

        {/* CANCHA */}
        <div className="relative mx-4 my-3 rounded-xl overflow-hidden"
          style={{ background: 'repeating-linear-gradient(180deg, #1a3a1a 0px, #1a3a1a 40px, #163216 40px, #163216 80px)', minHeight: '320px' }}>
          <div className="absolute inset-0 opacity-10">
            <svg viewBox="0 0 300 400" className="w-full h-full">
              <rect x="10" y="10" width="280" height="380" fill="none" stroke="white" strokeWidth="2"/>
              <line x1="10" y1="200" x2="290" y2="200" stroke="white" strokeWidth="1"/>
              <circle cx="150" cy="200" r="40" fill="none" stroke="white" strokeWidth="1"/>
              <rect x="80" y="10" width="140" height="60" fill="none" stroke="white" strokeWidth="1"/>
              <rect x="80" y="330" width="140" height="60" fill="none" stroke="white" strokeWidth="1"/>
            </svg>
          </div>
          <div className="relative z-10 py-3 space-y-2">
            {rows.map((row, ri) => (
              <div key={ri} className="flex justify-center gap-2">
                {row.map((pos, pi) => {
                  const key = `${ri}-${pi}`;
                  const player = lineup[key];
                  return (
                    <div key={key}
                      onDragOver={e => e.preventDefault()}
                      onDrop={() => handleDrop(key)}
                      onClick={() => player && removeFromSlot(key)}
                      className={'w-16 h-16 rounded-lg border-2 flex flex-col items-center justify-center cursor-pointer transition-all ' +
                        (player ? 'border-yellow-500 bg-yellow-900/40' : 'border-gray-600 bg-black/30 border-dashed hover:border-yellow-600')}>
                      {player ? (
                        <>
                          <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-black"
                            style={{ background: '#78350f', color: '#FCD116' }}>
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

        {/* JUGADORES DISPONIBLES */}
        <div className="px-4 pb-2">
          <p className="text-gray-500 text-xs font-black uppercase mb-2">Arrastra jugadores a la cancha</p>
          <div className="grid grid-cols-3 gap-1 max-h-40 overflow-y-auto">
            {available.map(p => (
              <div key={p.id} draggable
                onDragStart={() => setDragging(p)}
                onDragEnd={() => setDragging(null)}
                className={'flex items-center gap-1 bg-gray-800 rounded px-2 py-1.5 cursor-grab active:cursor-grabbing border ' +
                  (dragging?.id === p.id ? 'border-yellow-500 opacity-50' : 'border-gray-700')}>
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

function EquiposTab({ equipos }: { equipos: any[] }) {
  const [selectedTeam, setSelectedTeam] = useState<any>(null);
  const [squad, setSquad] = useState<any[]>([]);
  const [loadingSquad, setLoadingSquad] = useState(false);

  const squadTeams = equipos.filter(e => SQUAD_TEAMS.includes(e.name));
  const otherTeams = equipos.filter(e => !e.is_placeholder && !SQUAD_TEAMS.includes(e.name));

  const loadSquad = async (team: any) => {
    if (selectedTeam?.id === team.id) { setSelectedTeam(null); setSquad([]); return; }
    setSelectedTeam(team);
    setLoadingSquad(true);
    const res = await fetch(API + '/api/teams/' + team.id + '/squad');
    const data = await res.json();
    setSquad(data.sort((a: any, b: any) => (POS_ORDER[a.position]||99) - (POS_ORDER[b.position]||99)));
    setLoadingSquad(false);
  };

  const posByGroup: Record<string, any[]> = {};
  squad.forEach(p => {
    const g = p.position === 'GK' ? 'Porteros'
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
              (selectedTeam?.id === e.id ? 'bg-yellow-900/30 border-yellow-500' : 'bg-gray-900 border-gray-800 hover:border-yellow-700')}>
            <FlagImg code={e.flag} />
            <div>
              <p className="font-bold text-sm text-white">{e.name}</p>
              <p className="text-gray-500 text-xs">{e.short_name} · {e.confederation}</p>
            </div>
          </button>
        ))}
      </div>

      {selectedTeam && (
        <div className="bg-gray-900 rounded-xl border border-yellow-800 overflow-hidden">
          <div className="flex items-center gap-3 px-4 py-3 bg-gray-950 border-b border-gray-800">
            <FlagLg code={selectedTeam.flag} />
            <div>
              <p className="font-black text-white text-lg">{selectedTeam.name}</p>
              <p className="text-gray-500 text-xs">{selectedTeam.confederation}</p>
            </div>
          </div>
          {loadingSquad ? (
            <p className="text-gray-500 text-center py-8">Cargando squad...</p>
          ) : (
            <div className="divide-y divide-gray-800">
              {['Porteros','Defensas','Mediocampistas','Delanteros'].map(group => posByGroup[group] && (
                <div key={group}>
                  <p className="px-4 py-2 text-yellow-600 text-xs font-black uppercase tracking-widest bg-gray-950">{group}</p>
                  {posByGroup[group].map((p: any) => (
                    <div key={p.id} className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-800 transition-colors">
                     <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-black flex-shrink-0" style={{ background: p.name.charCodeAt(0) % 2 === 0 ? '#78350f' : '#1e3a5f', color: '#FCD116' }}>
  {p.name.split(' ').map((n: string) => n[0]).slice(0,2).join('')}
</div>
<span className="text-gray-600 text-xs font-bold w-6 text-right">{p.number}</span>
                      <span className="bg-gray-800 text-yellow-400 text-xs font-black px-1.5 py-0.5 rounded w-10 text-center">{p.position}</span>
                      <span className="text-white text-sm font-bold flex-1">{p.name}</span>
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
  useEffect(() => {
    fetch(API + '/api/tournaments').then(r => r.json()).then(d => {
      const t = d.data[0];
      setTorneo(t);
      if (t) {
        fetch(API + '/api/tournaments/' + t.id + '/standings')
          .then(r => r.json())
          .then(d => setPosiciones(d));
      }
    });
    fetch(API + '/api/teams').then(r => r.json()).then(d => setEquipos(d.data || d));
    fetch(API + '/api/matches').then(r => r.json()).then(d => setPartidos(d.data || []));
    const token = localStorage.getItem('token');
if (token) {
  fetch(API + '/api/predictions/me', { headers: { Authorization: 'Bearer ' + token } })
    .then(r => r.json())
    .then(data => {
      const map: Record<string,boolean> = {};
      (data || []).forEach((p: any) => { map[p.match_id] = true; });
      setPredicciones(map);
    });
}
  }, []);

  const grupoActualData = posiciones.find(g => g.group?.name === grupoActivo);
  const grupos = posiciones.map(g => g.group?.name).filter(Boolean).sort();

  return (
    <main className="min-h-screen bg-black text-white pb-24">

      <header className="bg-black border-b-2 border-yellow-500 px-4 py-3 flex items-center gap-3">
        <div className="flex items-center gap-2 flex-1">
          <span className="text-2xl">⚽</span>
          <div>
            <p className="text-xs text-yellow-500 font-bold uppercase tracking-widest leading-none">Te Lo Sugiero</p>
            <p className="text-xl font-black text-white uppercase leading-none">SPORTS</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-yellow-500 font-black text-sm uppercase tracking-wider">Mundial 2026</p>
          <p className="text-gray-500 text-xs">CO US MX CA</p>
        </div>
      </header>

      <div className="bg-gradient-to-r from-yellow-600 via-yellow-500 to-yellow-600 px-4 py-2 text-center">
        <p className="text-black font-black text-sm uppercase tracking-widest">Copa Mundial FIFA 2026 - 11 Jun - 19 Jul</p>
      </div>

      <div className="flex border-b border-gray-800 bg-gray-950 overflow-x-auto">
        {[
          { id: 'partidos', label: 'Partidos' },
          { id: 'posiciones', label: 'Posiciones' },
          { id: 'equipos', label: 'Equipos' },
          { id: 'polla', label: 'Empresarial' },
          { id: 'torneo', label: 'Torneo' },
        ].map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={'px-4 py-3 text-xs font-bold uppercase tracking-wide transition-colors flex-1 whitespace-nowrap ' + (tab === t.id ? 'text-yellow-400 border-b-2 border-yellow-400 bg-gray-900' : 'text-gray-500 hover:text-white')}>
            {t.label}
          </button>
        ))}
      </div>

      <div className="max-w-3xl mx-auto px-4 py-6">

        {tab === 'partidos' && (
  <div style={{ backgroundImage: 'url(/estadio.jpg)', backgroundSize: 'cover', backgroundPosition: 'center top', backgroundAttachment: 'fixed' }} className="relative">
    <div className="absolute inset-0 bg-black/40 pointer-events-none" />
    <div className="relative z-10">
          <div>
            <PartidoColombiaHero partidos={partidos} />
            <CTAEmpresarial />
            <div className="space-y-3">
              {partidos.length === 0 && <p className="text-gray-500 text-center py-10">No hay partidos programados.</p>}
              {partidos.map(p => (
               <div key={p.id} className="relative bg-gray-900 rounded-xl border border-gray-800 overflow-hidden hover:border-yellow-800 transition-colors">
                 {predicciones[p.id] && (
  <div className="absolute top-2 right-2 z-10 bg-yellow-900/40 border border-yellow-600 text-yellow-400 text-xs font-black px-2 py-0.5 rounded-full flex items-center gap-1">
    ✅ Pronosticado
  </div>
)}
                 <div className="flex items-center px-4 py-3 gap-3">
                    <FlagImg code={p.home_team?.flag} />
                    <span className="text-sm font-bold text-right flex-1">{p.home_team?.name}</span>
                    <div className={'px-4 py-2 rounded-lg text-center min-w-16 ' + (p.status === 'live' ? 'bg-red-600' : 'bg-gray-800')}>
                      {p.status === 'finished' && <span className="font-black text-lg text-white">{p.home_score} - {p.away_score}</span>}
                      {p.status === 'live' && <span className="font-black text-white text-xs">VIVO {p.minute}&apos;</span>}
                      {p.status === 'scheduled' && <span className="text-yellow-400 text-xs font-bold">VS</span>}
                    </div>
                    <span className="text-sm font-bold flex-1">{p.away_team?.name}</span>
                    <FlagImg code={p.away_team?.flag} />
                  </div>
                  <div className="flex justify-between px-4 py-2 bg-gray-950 text-xs text-gray-500 border-t border-gray-800">
                    <span className="text-yellow-700 font-bold">Grupo {p.groups?.name}</span>
                    <span className="text-gray-600">{p.stadium}</span>
                    <span>{formatFecha(p.match_date)}</span>
                  </div>
                  <AnalisisIA homeTeam={p.home_team} awayTeam={p.away_team} /> 
                 {SQUAD_TEAMS.includes(p.home_team?.name) || SQUAD_TEAMS.includes(p.away_team?.name) ? (
  <button
    onClick={(e) => { e.stopPropagation(); setLineupMatch(p); }}
    className="w-full px-4 py-2 text-xs font-black text-yellow-400 border-t border-gray-800 hover:bg-gray-800 transition-colors flex items-center justify-center gap-2">
    ⚽ Armar XI Titular
  </button>
) : null}
                </div>
              ))}
        </div>
        </div>
        </div>
        </div>
        )}

        {tab === 'posiciones' && (
          <div className="space-y-4">
            <CTAEmpresarial />
            <div className="flex gap-1 flex-wrap">
              {grupos.map(g => (
                <button key={g} onClick={() => setGrupoActivo(g)}
                  className={'px-3 py-1.5 rounded-lg text-xs font-black uppercase transition-colors ' +
                    (grupoActivo === g ? 'bg-yellow-500 text-black' : 'bg-gray-800 text-gray-400 hover:text-white')}>
                  {g}
                </button>
              ))}
            </div>

            {grupoActualData ? (
              <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
                <div className="px-4 py-3 bg-gray-950 border-b border-gray-800 flex items-center gap-2">
                  <span className="text-yellow-400 font-black text-lg">Grupo {grupoActualData.group.name}</span>
                  {grupoActualData.group.host_city && (
                    <span className="text-gray-500 text-xs">· {grupoActualData.group.host_city}</span>
                  )}
                </div>
                <div className="grid grid-cols-[2rem_1fr_2rem_2rem_2rem_2rem_2rem_2.5rem] gap-1 px-3 py-2 text-xs text-gray-500 font-bold uppercase border-b border-gray-800">
                  <span className="text-center">#</span>
                  <span>Equipo</span>
                  <span className="text-center">PJ</span>
                  <span className="text-center">PG</span>
                  <span className="text-center">PE</span>
                  <span className="text-center">PP</span>
                  <span className="text-center">DG</span>
                  <span className="text-center text-yellow-400">PTS</span>
                </div>
                {grupoActualData.rows.map((row: any, i: number) => (
                  <div key={row.team.id}
                    className={'grid grid-cols-[2rem_1fr_2rem_2rem_2rem_2rem_2rem_2.5rem] gap-1 px-3 py-3 items-center text-sm border-b border-gray-800 last:border-0 ' +
                      (i < 2 ? 'bg-green-950 bg-opacity-30' : '')}>
                    <div className="flex items-center justify-center">
                      <span className={'w-5 h-5 rounded-full flex items-center justify-center text-xs font-black ' +
                        (i === 0 ? 'bg-yellow-500 text-black' : i === 1 ? 'bg-gray-600 text-white' : 'text-gray-500')}>
                        {i + 1}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 min-w-0">
                      <FlagImg code={row.team.flag} />
                      <div className="min-w-0">
                        <p className="font-bold text-white text-xs truncate">{row.team.name}</p>
                        <p className="text-gray-600 text-xs">{row.team.short_name}</p>
                      </div>
                    </div>
                    <span className="text-center text-gray-400 text-xs">{row.pj}</span>
                    <span className="text-center text-gray-400 text-xs">{row.pg}</span>
                    <span className="text-center text-gray-400 text-xs">{row.pe}</span>
                    <span className="text-center text-gray-400 text-xs">{row.pp}</span>
                    <span className={'text-center text-xs font-bold ' + (row.dg > 0 ? 'text-green-400' : row.dg < 0 ? 'text-red-400' : 'text-gray-400')}>
                      {row.dg > 0 ? '+' : ''}{row.dg}
                    </span>
                    <span className="text-center font-black text-yellow-400">{row.pts}</span>
                  </div>
                ))}
                <div className="px-3 py-2 flex gap-4 text-xs text-gray-600 border-t border-gray-800">
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-700 inline-block" /> Clasifican</span>
                  <span className="text-gray-700">PJ=Jugados PG=Ganados PE=Empatados PP=Perdidos DG=Diferencia PTS=Puntos</span>
                </div>
              </div>
            ) : (
              <p className="text-gray-500 text-center py-10">Cargando posiciones...</p>
            )}
          </div>
        )}

        {tab === 'equipos' && (
  <EquiposTab equipos={equipos} />
)}

        {tab === 'polla' && (
          <div className="space-y-6">
            <div className="bg-gradient-to-br from-yellow-900 to-gray-900 rounded-2xl p-6 border border-yellow-700">
              <div className="text-center mb-6">
                <p className="text-yellow-400 text-xs uppercase tracking-widest font-bold mb-1">Mundial 2026</p>
                <h2 className="text-3xl font-black text-white uppercase">Polla Empresarial</h2>
                <p className="text-gray-400 text-sm mt-2">La experiencia definitiva para equipos de trabajo</p>
              </div>
              <div className="space-y-3 mb-6">
                {[
                  'Tabla de posiciones en tiempo real',
                  'Predicciones partido a partido',
                  'Rankings y estadisticas de tu empresa',
                  'Notificaciones de goles y resultados',
                  'Bracket personalizado por empresa',
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3 bg-black bg-opacity-30 rounded-lg px-4 py-3">
                    <span className="text-yellow-400 font-black">+</span>
                    <p className="text-white text-sm font-semibold">{item}</p>
                  </div>
                ))}
              </div>
              <a href={WA_DEMO} target="_blank" rel="noopener noreferrer" className="block w-full bg-green-500 hover:bg-green-400 text-white font-black text-center py-4 rounded-xl text-lg uppercase tracking-wide transition-colors">
                Solicitar Demo - WhatsApp
              </a>
              <p className="text-center text-gray-500 text-xs mt-3">305 757 2968 · Respuesta inmediata</p>
            </div>
            <div className="grid grid-cols-3 gap-3 text-center">
              {[['48', 'Equipos'], ['72', 'Partidos'], ['39', 'Dias']].map((s, i) => (
                <div key={i} className="bg-gray-900 rounded-xl p-4 border border-gray-800">
                  <p className="text-yellow-400 font-black text-2xl">{s[0]}</p>
                  <p className="text-gray-400 text-xs uppercase">{s[1]}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === 'torneo' && torneo && (
          <div className="bg-gray-900 rounded-xl p-6 border border-yellow-900">
            <div className="flex items-center gap-3 mb-6">
              <span className="text-4xl">🏆</span>
              <div>
                <p className="text-xs text-yellow-500 uppercase tracking-widest">Copa Mundial FIFA</p>
                <h1 className="text-2xl font-black text-white">{torneo.name}</h1>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="bg-gray-800 rounded-lg p-3">
                <p className="text-gray-400 text-xs uppercase">Inicio</p>
                <p className="font-bold text-white">{torneo.start_date}</p>
              </div>
              <div className="bg-gray-800 rounded-lg p-3">
                <p className="text-gray-400 text-xs uppercase">Final</p>
                <p className="font-bold text-white">{torneo.end_date}</p>
              </div>
              <div className="bg-gray-800 rounded-lg p-3">
                <p className="text-gray-400 text-xs uppercase">Premio</p>
                <p className="font-bold text-yellow-400">{torneo.prize}</p>
              </div>
              <div className="bg-gray-800 rounded-lg p-3">
                <p className="text-gray-400 text-xs uppercase">Estado</p>
                <span className="bg-yellow-500 text-black px-2 py-1 rounded text-xs font-black uppercase">{torneo.status}</span>
              </div>
            </div>
            <div className="mt-6 pt-4 border-t border-gray-800 text-center">
              <p className="text-gray-500 text-xs">Presentado por</p>
              <p className="text-yellow-500 font-black uppercase tracking-widest">Te Lo Sugiero Sports</p>
            </div>
          </div>
        )}

      </div>
{lineupMatch && <LineupModal match={lineupMatch} onClose={() => setLineupMatch(null)} />}
      <footer className="border-t border-gray-800 py-4 text-center mt-8">
        <p className="text-yellow-600 font-black text-sm uppercase tracking-widest">Te Lo Sugiero Sports</p>
        <p className="text-gray-600 text-xs mt-1">Copa Mundial FIFA 2026</p>
      </footer>

    </main>
  );
}
