'use client';
import { useEffect, useState } from 'react';
import { API } from '@/lib/config';

const RONDAS: Record<string, string> = {
  R16: 'Octavos de final',
  QF: 'Cuartos de final',
  SF: 'Semifinales',
  F: 'Final',
};

const ORDEN = ['R16', 'QF', 'SF', 'F'];

type Equipo = { id: string; name: string; short_name?: string; flag?: string; shield_url?: string };
type Partido = {
  id: string; home_team_id: string; away_team_id: string;
  home_score: number | null; away_score: number | null;
  home_penalties: number | null; away_penalties: number | null;
  status: string; match_date: string; stadium?: string;
};
type Llave = {
  id: string; round: string; position: number;
  team_a?: Equipo; team_b?: Equipo; winner?: Equipo;
  leg1?: Partido; leg2?: Partido;
  aggregate?: {
    team_a_goals: number; team_b_goals: number; complete: boolean;
    penalties: { team_a: number; team_b: number } | null;
    winner_team_id: string | null;
  } | null;
};

function Escudo({ e }: { e?: Equipo }) {
  if (e?.shield_url) return <img src={e.shield_url} alt={e.name} className="w-6 h-6 object-contain" />;
  if (e?.flag) return <img src={`https://flagcdn.com/24x18/${e.flag.toLowerCase()}.png`} alt={e.name} width={24} height={18} className="rounded-sm" />;
  return <span className="w-6 h-6 rounded-full bg-gray-200 inline-block" />;
}

function MarcadorLeg({ leg, teamAId, etiqueta }: { leg?: Partido; teamAId?: string; etiqueta: string }) {
  if (!leg) {
    return <p className="text-[11px] text-gray-400">{etiqueta}: por definir</p>;
  }
  const jugado = leg.status === 'finished';
  const aEsLocal = leg.home_team_id === teamAId;
  const golesA = aEsLocal ? leg.home_score : leg.away_score;
  const golesB = aEsLocal ? leg.away_score : leg.home_score;
  const fecha = new Date(leg.match_date).toLocaleDateString('es-CO', { day: 'numeric', month: 'short' });

  return (
    <p className="text-[11px] text-gray-500">
      {etiqueta}:{' '}
      {jugado
        ? <span className="font-bold text-gray-800">{golesA} - {golesB}</span>
        : <span>{fecha}</span>}
      {leg.status === 'live' && <span className="ml-1 text-red-600 font-bold">● EN VIVO</span>}
    </p>
  );
}

export default function LlavesTab({ torneoId }: { torneoId?: string }) {
  const [llaves, setLlaves] = useState<Llave[]>([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    if (!torneoId) return;
    setCargando(true);
    fetch(API + '/api/tournaments/' + torneoId + '/ties')
      .then(r => r.json())
      .then(d => setLlaves(Array.isArray(d) ? d : []))
      .catch(() => setLlaves([]))
      .finally(() => setCargando(false));
  }, [torneoId]);

  if (cargando) return <p className="text-center text-gray-400 text-sm py-8">Cargando llaves...</p>;
  if (llaves.length === 0) {
    return (
      <div className="text-center py-10">
        <p className="text-4xl mb-2">🏆</p>
        <p className="text-gray-500 text-sm">Este torneo aún no tiene llaves eliminatorias.</p>
      </div>
    );
  }

  const porRonda = ORDEN.map(r => ({ ronda: r, items: llaves.filter(l => l.round === r) })).filter(g => g.items.length > 0);

  return (
    <div className="space-y-6">
      {porRonda.map(({ ronda, items }) => (
        <div key={ronda}>
          <p className="text-yellow-600 font-black text-xs uppercase tracking-widest mb-2">{RONDAS[ronda] || ronda}</p>
          <div className="space-y-2">
            {items.map(l => {
              const agg = l.aggregate;
              const ganadorA = agg?.winner_team_id && agg.winner_team_id === l.team_a?.id;
              const ganadorB = agg?.winner_team_id && agg.winner_team_id === l.team_b?.id;
              const porDefinir = !l.team_a || !l.team_b;

              return (
                <div key={l.id} className="bg-white rounded-xl border border-gray-200 shadow-sm px-4 py-3">
                  {porDefinir ? (
                    <p className="text-gray-400 text-sm text-center py-2">Equipos por definir</p>
                  ) : (
                    <>
                      <div className="flex items-center gap-3">
                        <div className="flex-1 flex items-center gap-2 min-w-0">
                          <Escudo e={l.team_a} />
                          <span className={'text-sm truncate ' + (ganadorA ? 'font-black text-gray-900' : 'font-medium text-gray-600')}>
                            {l.team_a?.name}
                          </span>
                          {ganadorA && <span className="text-xs">✅</span>}
                        </div>

                        {agg && (
                          <div className="text-center flex-shrink-0">
                            <p className="font-black text-lg text-gray-900 leading-none tabular-nums">
                              {agg.team_a_goals} - {agg.team_b_goals}
                            </p>
                            <p className="text-[9px] uppercase tracking-wider text-gray-400">Global</p>
                          </div>
                        )}

                        <div className="flex-1 flex items-center gap-2 justify-end min-w-0">
                          {ganadorB && <span className="text-xs">✅</span>}
                          <span className={'text-sm truncate text-right ' + (ganadorB ? 'font-black text-gray-900' : 'font-medium text-gray-600')}>
                            {l.team_b?.name}
                          </span>
                          <Escudo e={l.team_b} />
                        </div>
                      </div>

                      <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-100">
                        <MarcadorLeg leg={l.leg1} teamAId={l.team_a?.id} etiqueta="Ida" />
                        {l.round !== 'F' && <MarcadorLeg leg={l.leg2} teamAId={l.team_a?.id} etiqueta="Vuelta" />}
                      </div>

                      {agg?.penalties && (
                        <p className="text-[11px] text-yellow-700 font-bold mt-1">
                          Penales: {agg.penalties.team_a} - {agg.penalties.team_b}
                        </p>
                      )}
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
