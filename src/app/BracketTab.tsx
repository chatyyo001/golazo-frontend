'use client';
import { useEffect, useState } from 'react';

const API = 'https://golazo-api-production.up.railway.app';
const TOURNAMENT_ID = '00000000-0000-0000-0000-000000002026';

const FlagImg = ({ code }: { code: string }) => {
  if (!code || code.length < 2) return <span className="w-6 h-4 bg-gray-700 rounded-sm inline-block" />;
  return <img src={'https://flagcdn.com/24x18/' + code.toLowerCase() + '.png'} alt={code} width={24} height={18} className="rounded-sm" />;
};

function TeamRow({ team, score, isWinner, slot, status }: {
  team: any; score: number | null; isWinner: boolean; slot?: string; status: string;
}) {
  const isPlaceholder = !team || team.is_placeholder;
  return (
    <div className={
      'flex items-center gap-2 px-3 py-2 rounded-lg border ' +
      (isPlaceholder
        ? 'bg-gray-950 border-gray-900'
        : status === 'live'
          ? 'bg-gray-900 border-green-800'
          : 'bg-gray-900 border-gray-800')
    }>
      {!isPlaceholder && <FlagImg code={team.flag} />}
      <span className={
        'text-xs font-bold flex-1 truncate ' +
        (isPlaceholder ? 'text-gray-700 italic' : isWinner ? 'text-yellow-400' : 'text-white')
      }>
        {isPlaceholder ? (slot || 'Por definir') : (team.short_name || team.name)}
      </span>
      {score !== null && score !== undefined && status !== 'scheduled' && (
        <span className={'text-sm font-black ' + (isWinner ? 'text-yellow-400' : 'text-gray-400')}>
          {score}
        </span>
      )}
    </div>
  );
}

function MatchCard({ match }: { match: any }) {
  const hs = match.home_score;
  const as_ = match.away_score;
  const fin = match.status === 'finished';
  const homeWins = fin && hs > as_;
  const awayWins = fin && as_ > hs;

  return (
    <div className="space-y-0.5">
      <div className="text-gray-700 text-xs px-1 mb-1">
        {match.home_bracket_slot && match.away_bracket_slot
          ? match.home_bracket_slot + ' · ' + match.away_bracket_slot
          : 'P' + (match.match_number || '')}
        {match.status === 'live' && (
          <span className="ml-2 text-red-400 font-black animate-pulse">EN VIVO</span>
        )}
      </div>
      <TeamRow team={match.home_team} score={fin || match.status === 'live' ? hs : null}
        isWinner={homeWins} slot={match.home_bracket_slot} status={match.status} />
      <TeamRow team={match.away_team} score={fin || match.status === 'live' ? as_ : null}
        isWinner={awayWins} slot={match.away_bracket_slot} status={match.status} />
    </div>
  );
}

function TBDCard({ slot1, slot2 }: { slot1?: string; slot2?: string }) {
  return (
    <div className="space-y-0.5">
      <div className="text-gray-800 text-xs px-1 mb-1">—</div>
      <div className="flex items-center gap-2 px-3 py-2 rounded-lg border bg-gray-950 border-gray-900">
        <span className="text-xs text-gray-700 italic flex-1 truncate">{slot1 || 'Por definir'}</span>
      </div>
      <div className="flex items-center gap-2 px-3 py-2 rounded-lg border bg-gray-950 border-gray-900">
        <span className="text-xs text-gray-700 italic flex-1 truncate">{slot2 || 'Por definir'}</span>
      </div>
    </div>
  );
}

function BracketColumn({ matches, count, label, tbd }: {
  matches: any[]; count: number; label: string; tbd?: boolean;
}) {
  const items = [...matches];
  while (items.length < count) items.push(null);
  return (
    <div className="flex flex-col" style={{ gap: count === 8 ? '8px' : count === 4 ? '28px' : count === 2 ? '74px' : '166px' }}>
      <div className="text-center">
        <span className="text-yellow-400 text-xs font-black uppercase tracking-widest bg-yellow-400/10 border border-yellow-400/20 rounded-full px-3 py-1">
          {label}
        </span>
      </div>
      {items.map((m, i) =>
        m ? <MatchCard key={m.id || i} match={m} /> : <TBDCard key={i} />
      )}
    </div>
  );
}

export default function BracketTab() {
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch(`${API}/api/matches?tournament_id=${TOURNAMENT_ID}`)
      .then(r => r.json())
      .then(d => {
        const all = d.data || d;
        setMatches(all);
        setLoading(false);
      })
      .catch(e => { setError(e.message); setLoading(false); });
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <p className="text-yellow-400 font-black text-lg animate-pulse">Cargando bracket...</p>
    </div>
  );

  if (error) return (
    <div className="text-center py-16">
      <p className="text-red-400 font-bold text-sm">Error al cargar: {error}</p>
    </div>
  );

  const byRound = (r: string) => matches.filter(m => m.round === r);
  const r32 = byRound('R32');
  const r16 = byRound('R16');
  const qf  = byRound('QF');
  const sf  = byRound('SF');
  const fi  = byRound('F');

  const half = Math.ceil(r32.length / 2);
  const lR32 = r32.slice(0, half);
  const rR32 = r32.slice(half);
  const lR16 = r16.slice(0, Math.ceil(r16.length / 2));
  const rR16 = r16.slice(Math.ceil(r16.length / 2));
  const lQF  = qf.slice(0, Math.ceil(qf.length / 2));
  const rQF  = qf.slice(Math.ceil(qf.length / 2));
  const lSF  = sf.slice(0, 1);
  const rSF  = sf.slice(1, 2);
  const final = fi[0];

  const champion = final?.status === 'finished'
    ? (final.home_score > final.away_score ? final.home_team?.name : final.away_team?.name)
    : null;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-gradient-to-r from-yellow-900/40 via-yellow-800/20 to-yellow-900/40 rounded-xl border border-yellow-800/40 px-4 py-3 text-center">
        <p className="text-yellow-400 font-black text-xs uppercase tracking-widest">Copa Mundial FIFA 2026</p>
        <h2 className="text-white font-black text-xl uppercase mt-1">Bracket Eliminatorias</h2>
        <p className="text-gray-500 text-xs mt-1">
          {r32.length > 0 ? `${r32.length} partidos de 16vos cargados` : 'Fase de grupos en curso'}
        </p>
      </div>

      {/* Bracket scroll horizontal */}
      <div className="bg-gray-950 rounded-xl border border-gray-800 overflow-hidden">
        <div className="overflow-x-auto pb-4">
          <div className="flex items-start gap-3 px-4 pt-4" style={{ minWidth: 'max-content' }}>

            {/* Lado izquierdo */}
            <BracketColumn matches={lR32} count={8} label="16vos" />
            <div className="w-3 flex-shrink-0" />
            <BracketColumn matches={lR16} count={4} label="Octavos" />
            <div className="w-3 flex-shrink-0" />
            <BracketColumn matches={lQF} count={2} label="Cuartos" />
            <div className="w-3 flex-shrink-0" />
            <BracketColumn matches={lSF} count={1} label="Semis" />
            <div className="w-3 flex-shrink-0" />

            {/* Centro - Final */}
            <div className="flex flex-col items-center justify-center px-2" style={{ paddingTop: '36px' }}>
              <span className="text-yellow-400 text-xs font-black uppercase tracking-widest bg-yellow-400/10 border border-yellow-400/20 rounded-full px-3 py-1 mb-4">
                Final
              </span>
              <div className="flex flex-col items-center gap-2">
                <div className="text-5xl">🏆</div>
                <div className="text-center">
                  <p className="text-yellow-400 font-black text-sm uppercase">
                    {champion || 'Campeón'}
                  </p>
                  <p className="text-gray-600 text-xs mt-1">MetLife Stadium</p>
                  <p className="text-gray-600 text-xs">19 Jul 2026</p>
                </div>
                {final && final.status !== 'scheduled' && (
                  <div className="mt-2 space-y-0.5 w-36">
                    <TeamRow team={final.home_team} score={final.home_score}
                      isWinner={final.home_score > final.away_score}
                      slot={final.home_bracket_slot} status={final.status} />
                    <TeamRow team={final.away_team} score={final.away_score}
                      isWinner={final.away_score > final.home_score}
                      slot={final.away_bracket_slot} status={final.status} />
                  </div>
                )}
              </div>
            </div>

            <div className="w-3 flex-shrink-0" />
            {/* Lado derecho */}
            <BracketColumn matches={rSF} count={1} label="Semis" />
            <div className="w-3 flex-shrink-0" />
            <BracketColumn matches={rQF} count={2} label="Cuartos" />
            <div className="w-3 flex-shrink-0" />
            <BracketColumn matches={rR16} count={4} label="Octavos" />
            <div className="w-3 flex-shrink-0" />
            <BracketColumn matches={rR32} count={8} label="16vos" />

          </div>
        </div>

        {/* Leyenda */}
        <div className="flex gap-4 px-4 py-3 border-t border-gray-800 text-xs text-gray-600">
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-gray-900 border border-gray-800 inline-block" />
            Jugado
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-gray-900 border border-green-800 inline-block" />
            En vivo
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-gray-950 border border-gray-900 inline-block" />
            Por jugar
          </span>
        </div>
      </div>

      {/* Info fase grupos si no hay R32 aún */}
      {r32.length === 0 && (
        <div className="bg-gray-900 rounded-xl border border-gray-800 px-4 py-6 text-center">
          <p className="text-3xl mb-3">⏳</p>
          <p className="text-white font-black text-sm uppercase">Fase de grupos en curso</p>
          <p className="text-gray-500 text-xs mt-2">
            Los 16vos de final se definen el 27 de junio cuando terminen los grupos
          </p>
        </div>
      )}
    </div>
  );
}
