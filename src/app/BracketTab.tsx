'use client';
import { useEffect, useState } from 'react';

import { API } from '@/lib/config';
const TOURNAMENT_ID = '00000000-0000-0000-0000-000000002026';

const FlagImg = ({ code }: { code: string }) => {
  if (!code || code.length < 2) return <span className="w-5 h-4 bg-gray-600 rounded-sm inline-block" />;
  return <img src={'https://flagcdn.com/20x15/' + code.toLowerCase() + '.png'} alt={code} width={20} height={15} className="rounded-sm flex-shrink-0" />;
};

// Determina el ganador real de un partido.
// Si hay diferencia en el marcador regular, ese es el ganador.
// Si quedó empatado (definido por penales), buscamos en el siguiente partido
// del bracket cuál equipo quedó sentado en el slot correspondiente —
// ese dato ya lo tenemos escrito (next_match_id / next_match_slot).
function getWinnerSide(match: any, allMatches: any[]): 'home' | 'away' | null {
  if (match.status !== 'finished') return null;
  const hs = match.home_score;
  const as_ = match.away_score;

  if (hs > as_) return 'home';
  if (as_ > hs) return 'away';

  // Empate en tiempo regular -> se definió por penales.
  // Revisamos quién quedó propagado al siguiente partido.
  if (match.next_match_id) {
    const nextMatch = allMatches.find(m => m.id === match.next_match_id);
    if (nextMatch) {
      const slotTeamId = match.next_match_slot === 'home'
        ? nextMatch.home_team_id
        : nextMatch.away_team_id;

      if (slotTeamId && slotTeamId === match.home_team?.id) return 'home';
      if (slotTeamId && slotTeamId === match.away_team?.id) return 'away';
    }
  }

  return null; // empate sin propagación todavía (raro, pero por si acaso)
}

function MatchCard({ match, allMatches }: { match: any; allMatches: any[] }) {
  const ht = match.home_team;
  const at = match.away_team;
  const hs = match.home_score;
  const as_ = match.away_score;
  const fin = match.status === 'finished';
  const live = match.status === 'live';

  const winnerSide = getWinnerSide(match, allMatches);
  const homeWins = winnerSide === 'home';
  const awayWins = winnerSide === 'away';
  const decidedByPenalties = fin && hs === as_ && winnerSide !== null;

  const isPlaceholderHome = !ht || ht.is_placeholder;
  const isPlaceholderAway = !at || at.is_placeholder;

  return (
    <div className={`rounded-lg overflow-hidden border ${live ? 'border-green-600' : 'border-gray-700'} bg-gray-900`}>
      <div className="flex items-center justify-between px-2 py-1 bg-gray-800">
        <span className="text-gray-400 text-xs">
          {match.home_bracket_slot && match.away_bracket_slot
            ? `${match.home_bracket_slot} · ${match.away_bracket_slot}`
            : `P${match.match_number || ''}`}
        </span>
        {live && <span className="text-red-400 text-xs font-black animate-pulse">VIVO</span>}
        {fin && (
          <span className="text-gray-500 text-xs">
            {decidedByPenalties ? 'Final (Pen)' : 'Final'}
          </span>
        )}
      </div>
      <div className={`flex items-center gap-2 px-2 py-2 ${homeWins ? 'bg-gray-800' : ''}`}>
        {!isPlaceholderHome && <FlagImg code={ht.flag} />}
        <span className={`text-xs flex-1 truncate font-semibold ${isPlaceholderHome ? 'text-gray-600 italic' : homeWins ? 'text-yellow-400 font-bold' : 'text-gray-100'}`}>
          {isPlaceholderHome ? (match.home_bracket_slot || 'Por definir') : (ht.short_name || ht.name)}
        </span>
        {(fin || live) && (
          <span className={`text-sm font-black ${homeWins ? 'text-yellow-400' : 'text-gray-400'}`}>{hs}</span>
        )}
      </div>
      <div className="border-t border-gray-700 mx-2" />
      <div className={`flex items-center gap-2 px-2 py-2 ${awayWins ? 'bg-gray-800' : ''}`}>
        {!isPlaceholderAway && <FlagImg code={at.flag} />}
        <span className={`text-xs flex-1 truncate font-semibold ${isPlaceholderAway ? 'text-gray-600 italic' : awayWins ? 'text-yellow-400 font-bold' : 'text-gray-100'}`}>
          {isPlaceholderAway ? (match.away_bracket_slot || 'Por definir') : (at.short_name || at.name)}
        </span>
        {(fin || live) && (
          <span className={`text-sm font-black ${awayWins ? 'text-yellow-400' : 'text-gray-400'}`}>{as_}</span>
        )}
      </div>
    </div>
  );
}

export default function BracketTab() {
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [view, setView] = useState<'r32' | 'r16' | 'qf' | 'sf'>('r32');

  useEffect(() => {
    fetch(`${API}/api/matches?tournament_id=${TOURNAMENT_ID}`)
      .then(r => r.json())
      .then(d => { setMatches(d.data || d); setLoading(false); })
      .catch(e => { setError(e.message); setLoading(false); });
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <p className="text-yellow-400 font-black animate-pulse">Cargando bracket...</p>
    </div>
  );

  if (error) return (
    <div className="text-center py-10">
      <p className="text-red-400 text-sm">Error: {error}</p>
    </div>
  );

  const byRound = (r: string) => matches.filter(m => m.round === r);
  const r32 = byRound('R32');
  const r16 = byRound('R16');
  const qf  = byRound('QF');
  const sf  = byRound('SF');
  const fi  = byRound('F');

  const tabs = [
    { id: 'r32', label: '16vos', count: r32.length },
    { id: 'r16', label: 'Octavos', count: r16.length },
    { id: 'qf',  label: 'Cuartos', count: qf.length },
    { id: 'sf',  label: 'Semis+Final', count: sf.length + fi.length },
  ];

  const currentMatches = view === 'r32' ? r32 : view === 'r16' ? r16 : view === 'qf' ? qf : [...sf, ...fi];

  const finalWinnerSide = fi[0] ? getWinnerSide(fi[0], matches) : null;
  const champion = finalWinnerSide
    ? (finalWinnerSide === 'home' ? fi[0].home_team?.name : fi[0].away_team?.name)
    : null;

  return (
    <div className="space-y-4">
      <div className="bg-gray-900 rounded-xl border border-yellow-800/40 px-4 py-3 text-center">
        <p className="text-yellow-400 font-black text-xs uppercase tracking-widest">Copa Mundial FIFA 2026</p>
        <h2 className="text-white font-black text-lg uppercase mt-1">
          {champion ? `Campeón: ${champion}` : 'Bracket Eliminatorias'}
        </h2>
      </div>

      <div className="flex gap-1 bg-gray-900 rounded-xl p-1 border border-gray-800">
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setView(t.id as any)}
            className={`flex-1 py-2 rounded-lg text-xs font-black uppercase transition-colors ${
              view === t.id ? 'bg-yellow-500 text-black' : 'text-gray-400 hover:text-white'
            }`}
          >
            {t.label}
            {t.count > 0 && (
              <span className={`ml-1 text-xs ${view === t.id ? 'text-black/70' : 'text-gray-600'}`}>
                ({t.count})
              </span>
            )}
          </button>
        ))}
      </div>

      {currentMatches.length > 0 ? (
        <div className="grid grid-cols-2 gap-2">
          {currentMatches.map((m, i) => (
            <MatchCard key={m.id || i} match={m} allMatches={matches} />
          ))}
        </div>
      ) : (
        <div className="bg-gray-900 rounded-xl border border-gray-800 px-4 py-8 text-center">
          <p className="text-3xl mb-3">⏳</p>
          <p className="text-white font-black text-sm uppercase">Próximamente</p>
          <p className="text-gray-500 text-xs mt-2">Esta ronda aún no está disponible</p>
        </div>
      )}

      <div className="flex gap-4 text-xs text-gray-600 px-1">
        <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded bg-yellow-400 inline-block" />Ganador</span>
        <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded border border-green-600 inline-block" />En vivo</span>
        <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded bg-gray-700 inline-block" />Por jugar</span>
      </div>
    </div>
  );
}
