'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getAnalisis } from '../analisis';

import { API } from '@/lib/config';
import { getAccessToken, supabase } from '@/lib/supabase';
const TOTAL_PARTIDOS = 72;
const WA_NUMBER = '573057572968';
const WA_MSG_GENERAL = encodeURIComponent('Hola, quiero información sobre la Polla Empresarial del Mundial 2026 para mi empresa 🏆');
const WA_MSG_PREMIUM = encodeURIComponent('Hola! Quiero desbloquear las predicciones IA completas del Mundial 2026 🤖⚽');
const WA_LINK = `https://wa.me/${WA_NUMBER}?text=${WA_MSG_GENERAL}`;
const WA_PREMIUM = `https://wa.me/${WA_NUMBER}?text=${WA_MSG_PREMIUM}`;

// ─── Marcadores sugeridos por partido (fuente: modelo estadístico Golgoritmo/Monte Carlo) ───
// Clave: "home_team_id-away_team_id" o fallback por nombres
const SUGERENCIAS_IA: Record<string, { home: number; away: number; confianza: number }> = {
  // Grupo A
  'mexico-sudafrica': { home: 2, away: 0, confianza: 78 },
  'corea del sur-rep. chequia': { home: 1, away: 1, confianza: 45 },
  'sudafrica-rep. chequia': { home: 0, away: 2, confianza: 62 },
  'mexico-corea del sur': { home: 1, away: 1, confianza: 47 },
  'mexico-rep. chequia': { home: 2, away: 0, confianza: 68 },
  'sudafrica-corea del sur': { home: 0, away: 2, confianza: 62 },
  // Grupo B
  'canada-bosnia': { home: 1, away: 1, confianza: 48 },
  'qatar-suiza': { home: 1, away: 1, confianza: 45 },
  'canada-qatar': { home: 2, away: 0, confianza: 72 },
  'bosnia-suiza': { home: 0, away: 2, confianza: 55 },
  // Grupo C
  'brasil-marruecos': { home: 2, away: 1, confianza: 61 },
  'haiti-escocia': { home: 0, away: 2, confianza: 72 },
  'brasil-haiti': { home: 4, away: 0, confianza: 83 },
  'marruecos-escocia': { home: 2, away: 0, confianza: 64 },
  'brasil-escocia': { home: 3, away: 0, confianza: 79 },
  'marruecos-haiti': { home: 3, away: 0, confianza: 82 },
  // Grupo D
  'estados unidos-paraguay': { home: 3, away: 1, confianza: 66 },
  'australia-turquia': { home: 2, away: 0, confianza: 58 },
  'estados unidos-australia': { home: 2, away: 0, confianza: 63 },
  'paraguay-turquia': { home: 1, away: 2, confianza: 52 },
  // Grupo E
  'alemania-curacao': { home: 5, away: 0, confianza: 91 },
  'costa de marfil-ecuador': { home: 1, away: 1, confianza: 44 },
  'alemania-costa de marfil': { home: 3, away: 0, confianza: 75 },
  'curacao-ecuador': { home: 0, away: 3, confianza: 76 },
  'alemania-ecuador': { home: 2, away: 1, confianza: 70 },
  'curacao-costa de marfil': { home: 0, away: 3, confianza: 79 },
  // Grupo F
  'paises bajos-japon': { home: 2, away: 1, confianza: 63 },
  'suecia-tunez': { home: 2, away: 0, confianza: 60 },
  'paises bajos-suecia': { home: 2, away: 0, confianza: 65 },
  'japon-tunez': { home: 2, away: 0, confianza: 62 },
  // Grupo G
  'belgica-egipto': { home: 2, away: 0, confianza: 71 },
  'iran-nueva zelanda': { home: 2, away: 0, confianza: 72 },
  'belgica-iran': { home: 2, away: 0, confianza: 68 },
  'egipto-nueva zelanda': { home: 2, away: 0, confianza: 70 },
  // Grupo H
  'españa-cabo verde': { home: 4, away: 0, confianza: 84 },
  'arabia saudita-uruguay': { home: 0, away: 2, confianza: 70 },
  'españa-arabia saudita': { home: 3, away: 0, confianza: 82 },
  'cabo verde-uruguay': { home: 0, away: 3, confianza: 74 },
  'españa-uruguay': { home: 2, away: 1, confianza: 67 },
  // Grupo I
  'francia-senegal': { home: 2, away: 0, confianza: 73 },
  'irak-noruega': { home: 0, away: 2, confianza: 71 },
  'francia-irak': { home: 3, away: 0, confianza: 84 },
  'senegal-noruega': { home: 1, away: 2, confianza: 55 },
  'francia-noruega': { home: 2, away: 0, confianza: 75 },
  // Grupo J
  'argentina-argelia': { home: 3, away: 0, confianza: 78 },
  'austria-jordania': { home: 2, away: 0, confianza: 68 },
  'argentina-austria': { home: 2, away: 0, confianza: 74 },
  'argelia-jordania': { home: 2, away: 0, confianza: 65 },
  'argentina-jordania': { home: 4, away: 0, confianza: 84 },
  // Grupo K
  'portugal-congo': { home: 3, away: 0, confianza: 76 },
  'uzbekistan-colombia': { home: 0, away: 2, confianza: 66 },
  'portugal-uzbekistan': { home: 3, away: 0, confianza: 82 },
  'congo-colombia': { home: 0, away: 2, confianza: 65 },
  'portugal-colombia': { home: 2, away: 1, confianza: 58 },
  'congo-uzbekistan': { home: 1, away: 2, confianza: 52 },
  // Grupo L
  'inglaterra-croacia': { home: 2, away: 0, confianza: 69 },
  'ghana-panama': { home: 2, away: 0, confianza: 64 },
  'inglaterra-ghana': { home: 3, away: 0, confianza: 76 },
  'croacia-panama': { home: 2, away: 0, confianza: 68 },
  'inglaterra-panama': { home: 3, away: 0, confianza: 79 },
  'croacia-ghana': { home: 2, away: 1, confianza: 61 },
};

// Calcula probabilidades 1/X/2 desde la confianza del modelo
// La confianza apunta al resultado del marcador sugerido (local gana, empate, o visitante gana)
function calcProbs(sug: { home: number; away: number; confianza: number }) {
  const c = sug.confianza;
  const resto = 100 - c;
  if (sug.home > sug.away) {
    // Local gana
    const empate = Math.round(resto * 0.55);
    const away = resto - empate;
    return { p1: c, px: empate, p2: away };
  } else if (sug.away > sug.home) {
    // Visitante gana
    const empate = Math.round(resto * 0.55);
    const home = resto - empate;
    return { p1: home, px: empate, p2: c };
  } else {
    // Empate
    const lado = Math.round(resto * 0.5);
    return { p1: lado, px: c, p2: resto - lado };
  }
}

function getSugerencia(homeTeam: string, awayTeam: string) {
  const normalize = (s: string) => s?.toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/rep\./g, '').trim();
  const h = normalize(homeTeam || '');
  const a = normalize(awayTeam || '');
  const key = `${h}-${a}`;
  const keyRev = `${a}-${h}`;
  if (SUGERENCIAS_IA[key]) return { ...SUGERENCIAS_IA[key], reversed: false };
  if (SUGERENCIAS_IA[keyRev]) return { home: SUGERENCIAS_IA[keyRev].away, away: SUGERENCIAS_IA[keyRev].home, confianza: SUGERENCIAS_IA[keyRev].confianza, reversed: true };
  // Partial match
  for (const [k, v] of Object.entries(SUGERENCIAS_IA)) {
    const [kh, ka] = k.split('-');
    if (h.includes(kh) && a.includes(ka)) return { ...v, reversed: false };
    if (a.includes(kh) && h.includes(ka)) return { home: v.away, away: v.home, confianza: v.confianza, reversed: true };
  }
  return null;
}

// ─── Componentes base ─────────────────────────────────────────────────────────

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

function BarraProgreso({ completadas, total }: { completadas: number; total: number }) {
  const pct = total > 0 ? Math.round((completadas / total) * 100) : 0;
  const color = pct === 100 ? 'bg-green-500' : pct >= 50 ? 'bg-yellow-500' : 'bg-yellow-600';
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl px-4 py-3 mb-4">
      <div className="flex justify-between items-center mb-2">
        <p className="text-xs font-black text-gray-400 uppercase tracking-wide">
          {pct === 100 ? '🎉 ¡Completaste todos los partidos!' : `⚽ Predicciones completadas`}
        </p>
        <p className="text-xs font-black text-yellow-400">{completadas} / {total}</p>
      </div>
      <div className="w-full bg-gray-800 rounded-full h-3 overflow-hidden">
        <div className={`h-3 rounded-full transition-all duration-500 ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <p className="text-right text-xs text-gray-600 mt-1">{pct}%</p>
    </div>
  );
}

// ─── Chip de confianza IA ─────────────────────────────────────────────────────

function ConfianzaBar({ pct }: { pct: number }) {
  const color = pct >= 75 ? 'bg-green-500' : pct >= 55 ? 'bg-yellow-500' : 'bg-orange-500';
  const label = pct >= 75 ? 'Alta' : pct >= 55 ? 'Media' : 'Baja';
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 bg-gray-800 rounded-full h-1.5 overflow-hidden">
        <div className={`h-1.5 rounded-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs text-gray-500 w-8 text-right">{label}</span>
    </div>
  );
}

// ─── Bloqueo Premium ──────────────────────────────────────────────────────────

function PremiumOverlay() {
  return (
    <div className="absolute inset-0 z-10 flex flex-col items-center justify-center rounded-xl"
      style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.97) 40%)' }}>
      <div className="px-5 py-4 text-center space-y-3 w-full">
        <div className="inline-flex items-center gap-1.5 bg-yellow-500/10 border border-yellow-500/30 rounded-full px-3 py-1">
          <span className="text-yellow-400 text-xs font-black uppercase tracking-wide">🤖 IA Premium</span>
        </div>
        <p className="text-white font-black text-base leading-tight">
          Desbloquea todas las predicciones IA
        </p>
        <p className="text-gray-400 text-xs leading-relaxed">
          72 partidos · Marcadores exactos · Análisis por equipo · Confianza del modelo
        </p>
        <a href={WA_PREMIUM} target="_blank" rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 w-full bg-yellow-500 hover:bg-yellow-400 text-black font-black py-3 rounded-xl text-sm uppercase transition-colors">
          <svg viewBox="0 0 24 24" className="w-4 h-4 fill-black">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
            <path d="M12 0C5.373 0 0 5.373 0 12c0 2.123.554 4.122 1.524 5.855L.057 23.886a.5.5 0 00.614.665l6.218-1.63A11.94 11.94 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.9a9.878 9.878 0 01-5.031-1.378l-.361-.214-3.741.981.999-3.648-.235-.374A9.861 9.861 0 012.1 12C2.1 6.533 6.533 2.1 12 2.1S21.9 6.533 21.9 12 17.467 21.9 12 21.9z" />
          </svg>
          Pedir acceso por WhatsApp
        </a>
        <p className="text-gray-600 text-xs">Te Lo Sugiero Sports · $70.000 COP · Todo el Mundial</p>
      </div>
    </div>
  );
}

// ─── Tarjeta IA inline ─────────────────────────────────────────────────────────

function IACard({
  homeTeam, awayTeam, locked, onUsar
}: {
  homeTeam: string;
  awayTeam: string;
  locked: boolean;
  onUsar: (home: number, away: number) => void;
}) {
  const sug = getSugerencia(homeTeam, awayTeam);
  const analisis = getAnalisis(homeTeam, awayTeam);

  if (!sug && !analisis) return null;

  return (
    <div className={`relative mt-2 rounded-xl border border-yellow-900/50 bg-gray-950/80 overflow-hidden ${locked ? 'min-h-[120px]' : ''}`}>
      {locked && <PremiumOverlay />}

      <div className={`px-3 py-3 space-y-2 ${locked ? 'blur-sm select-none pointer-events-none' : ''}`}>
        {/* Header */}
        <div className="flex items-center gap-1.5">
          <span className="text-yellow-400 text-xs">🤖</span>
          <span className="text-yellow-400 text-xs font-black uppercase tracking-wide">IA sugiere</span>
          {sug && (
            <span className="ml-auto text-xs text-gray-600">
              Modelo estadístico · Monte Carlo
            </span>
          )}
        </div>

        {/* Probabilidades 1 / X / 2 */}
        {sug && (() => {
          const { p1, px, p2 } = calcProbs(sug);
          const max = Math.max(p1, px, p2);
          const colorFor = (v: number) =>
            v === max ? 'text-green-400' : v >= max - 10 ? 'text-yellow-400' : 'text-red-400';
          return (
            <div className="grid grid-cols-3 gap-2 my-1">
              {[
                { label: '1', val: p1, desc: homeTeam },
                { label: 'X', val: px, desc: 'Empate' },
                { label: '2', val: p2, desc: awayTeam },
              ].map(({ label, val, desc }) => (
                <div key={label} className="bg-gray-900 rounded-lg py-2 text-center border border-gray-800">
                  <p className="text-gray-500 text-xs font-bold uppercase mb-1">{label}</p>
                  <p className={`text-lg font-black ${colorFor(val)}`}>{val}%</p>
                  <p className="text-gray-600 text-[10px] truncate px-1">{desc}</p>
                </div>
              ))}
            </div>
          );
        })()}

        {/* Marcador sugerido */}
        {sug && (
          <div className="flex items-center gap-3 mt-1">
            <div className="flex items-center gap-2 flex-1 justify-end">
              <span className="text-xs text-gray-500 text-right truncate max-w-[80px]">Sugiere</span>
            </div>
            <div className="flex items-center gap-1.5 bg-gray-900 border border-yellow-700/50 rounded-lg px-3 py-1.5">
              <span className="text-yellow-300 font-black text-lg">{sug.home}</span>
              <span className="text-gray-600 font-black">-</span>
              <span className="text-yellow-300 font-black text-lg">{sug.away}</span>
            </div>
            <div className="flex items-center gap-2 flex-1">
              <span className="text-xs text-gray-500 truncate max-w-[80px]">Marcador</span>
            </div>
          </div>
        )}

        {/* Veredicto corto */}
        {analisis && (
          <p className="text-xs text-gray-500 leading-relaxed border-t border-gray-800 pt-2">
            {analisis.emoji} {analisis.veredicto}
          </p>
        )}

        {/* Botón usar */}
        {sug && !locked && (
          <button
            onClick={() => onUsar(sug.home, sug.away)}
            className="w-full bg-yellow-500/10 hover:bg-yellow-500/20 border border-yellow-700/40 text-yellow-400 text-xs font-black uppercase py-2 rounded-lg transition-colors">
            ↑ Usar esta predicción
          </button>
        )}
      </div>
    </div>
  );
}

// ─── CTA Empresarial ──────────────────────────────────────────────────────────

function CTAWhatsApp() {
  return (
    <div className="mt-8 rounded-2xl overflow-hidden border border-yellow-700 bg-gradient-to-br from-gray-900 to-black">
      <div className="bg-yellow-500 px-4 py-2 text-center">
        <p className="text-black font-black text-xs uppercase tracking-widest">🏢 Polla Empresarial</p>
      </div>
      <div className="px-5 py-5 text-center space-y-3">
        <p className="text-white font-black text-lg leading-tight">¿Quieres esto para tu empresa?</p>
        <p className="text-gray-400 text-sm">Ranking privado · Usuarios ilimitados · Marca personalizada</p>
        <div className="flex flex-col gap-2 text-sm text-gray-400">
          <span>✅ Gestión de partidos en tiempo real</span>
          <span>✅ Tabla de posiciones automática</span>
          <span>✅ Puntos calculados al instante</span>
        </div>
        <a href={WA_LINK} target="_blank" rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 w-full bg-green-500 hover:bg-green-400 text-white font-black py-4 rounded-xl uppercase text-sm transition-colors mt-2">
          <svg viewBox="0 0 24 24" className="w-5 h-5 fill-white">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
            <path d="M12 0C5.373 0 0 5.373 0 12c0 2.123.554 4.122 1.524 5.855L.057 23.886a.5.5 0 00.614.665l6.218-1.63A11.94 11.94 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.9a9.878 9.878 0 01-5.031-1.378l-.361-.214-3.741.981.999-3.648-.235-.374A9.861 9.861 0 012.1 12C2.1 6.533 6.533 2.1 12 2.1S21.9 6.533 21.9 12 17.467 21.9 12 21.9z" />
          </svg>
          Contactar por WhatsApp
        </a>
        <p className="text-gray-600 text-xs">Te Lo Sugiero Sports · @telosugiero</p>
      </div>
    </div>
  );
}

// ─── Banner IA Freemium ───────────────────────────────────────────────────────

function BannerIAFreemium({ libres, total }: { libres: number; total: number }) {
  return (
    <div className="bg-gray-900 border border-yellow-800/50 rounded-xl px-4 py-3 mb-4 flex items-center justify-between gap-3">
      <div className="flex items-center gap-2">
        <span className="text-xl">🤖</span>
        <div>
          <p className="text-yellow-400 font-black text-xs uppercase tracking-wide">Predicciones IA activas</p>
          <p className="text-gray-500 text-xs">{libres} de {total} gratis · Resto premium</p>
        </div>
      </div>
      <a href={WA_PREMIUM} target="_blank" rel="noopener noreferrer"
        className="shrink-0 bg-yellow-500 text-black text-xs font-black px-3 py-1.5 rounded-lg uppercase whitespace-nowrap">
        Ver todo
      </a>
    </div>
  );
}

// ─── Página principal ─────────────────────────────────────────────────────────

const IA_GRATIS = 6; // primeros N partidos con IA desbloqueada

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
  const [iaExpandido, setIaExpandido] = useState<string | null>(null);

  useEffect(() => {
    void (async () => {
    const token = await getAccessToken();
    const { data: { user: authUser } } = await supabase.auth.getUser();
    if (!token || !authUser) { router.push('/login'); return; }
    setUser({ id: authUser.id, name: authUser.user_metadata.name || authUser.email });
    const headers = { Authorization: 'Bearer ' + token };
    Promise.all([
      fetch(API + '/api/matches?status=scheduled', { headers }).then(r => r.json()),
      fetch(API + '/api/predictions/me', { headers }).then(r => r.json()),
    ]).then(([matchesData, predsData]) => {
      setPartidos(matchesData.data || []);
      setMisPredicciones(predsData || []);
      setLoading(false);
    });
    })();
  }, []);

  useEffect(() => {
    const map: { [key: string]: { home: string; away: string } } = {};
    misPredicciones.forEach(p => {
      map[p.match_id] = { home: String(p.home_score), away: String(p.away_score) };
    });
    setPreds(map);
  }, [misPredicciones]);

  const guardar = async (matchId: string) => {
    const token = await getAccessToken();
    if (!token) { router.push('/login'); return; }
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
    setPreds(prev => ({
      ...prev,
      [matchId]: { home: prev[matchId]?.home || '', away: prev[matchId]?.away || '', [side]: val }
    }));
  };

  const usarSugerencia = (matchId: string, home: number, away: number) => {
    setPreds(prev => ({ ...prev, [matchId]: { home: String(home), away: String(away) } }));
  };

  const historial = misPredicciones.filter(p => p.matches?.status === 'finished');
  const totalPts = historial.reduce((sum, p) => sum + (p.points || 0), 0);
  const exactas = historial.filter(p => p.points === 3).length;
  const ganador = historial.filter(p => p.points === 1).length;
  const completadas = misPredicciones.length;

  // Cuántos partidos tienen sugerencia IA disponible
  const conIA = partidos.filter(p => getSugerencia(p.home_team?.name, p.away_team?.name) !== null).length;

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
          <button onClick={() => { supabase.auth.signOut(); router.push('/login'); }} className="text-gray-500 text-xs uppercase">Salir</button>
        </div>
      </header>

      {/* Banner */}
      <div className="bg-gradient-to-r from-yellow-600 via-yellow-500 to-yellow-600 px-4 py-2 text-center">
        <p className="text-black font-black text-sm uppercase">Hola {user?.name} — Mundial 2026</p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-800 bg-gray-950">
        <button onClick={() => setTab('predecir')}
          className={'flex-1 py-3 text-sm font-black uppercase tracking-wide transition-colors ' + (tab === 'predecir' ? 'text-yellow-400 border-b-2 border-yellow-400' : 'text-gray-500')}>
          Predecir
        </button>
        <button onClick={() => setTab('historial')}
          className={'flex-1 py-3 text-sm font-black uppercase tracking-wide transition-colors ' + (tab === 'historial' ? 'text-yellow-400 border-b-2 border-yellow-400' : 'text-gray-500')}>
          Mis Resultados {historial.length > 0 && <span className="ml-1 text-xs bg-yellow-500 text-black px-1.5 py-0.5 rounded-full">{historial.length}</span>}
        </button>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">

        {/* Barra progreso */}
        {!loading && <BarraProgreso completadas={completadas} total={TOTAL_PARTIDOS} />}

        {/* ── TAB PREDECIR ── */}
        {tab === 'predecir' && (
          <>
            {/* Banner IA */}
            {!loading && conIA > 0 && (
              <BannerIAFreemium libres={IA_GRATIS} total={conIA} />
            )}

            {loading && <p className="text-gray-500 text-center py-10">Cargando partidos...</p>}
            {!loading && partidos.length === 0 && (
              <p className="text-gray-500 text-center py-10">No hay partidos disponibles para predecir.</p>
            )}

            {partidos.map((p, idx) => {
              const pred = preds[p.id];
              const yaGuardado = misPredicciones.find(m => m.match_id === p.id);
              const sug = getSugerencia(p.home_team?.name, p.away_team?.name);
              const tieneSug = sug !== null;
              const iaLocked = tieneSug && idx >= IA_GRATIS;
              const mostrarIA = tieneSug;

              return (
                <div key={p.id} className={'bg-gray-900 rounded-xl border overflow-hidden ' + (yaGuardado ? 'border-yellow-700' : 'border-gray-800')}>
                  {/* Cabecera */}
                  <div className="px-4 py-2 bg-gray-950 flex justify-between text-xs text-gray-500 border-b border-gray-800">
                    <span className="text-yellow-700 font-bold">Grupo {p.groups?.name}</span>
                    <div className="flex items-center gap-2">
                      {tieneSug && (
                        <span className="text-yellow-600 text-xs">🤖 IA</span>
                      )}
                      <span>{formatFecha(p.match_date)}</span>
                    </div>
                  </div>

                  {/* Equipos + inputs */}
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

                  {/* IA Card inline */}
                  {mostrarIA && (
                    <div className="px-4 pb-3">
                      <IACard
                        homeTeam={p.home_team?.name}
                        awayTeam={p.away_team?.name}
                        locked={iaLocked}
                        onUsar={(h, a) => usarSugerencia(p.id, h, a)}
                      />
                    </div>
                  )}

                  {/* Botón guardar */}
                  <div className="px-4 pb-4">
                    <button onClick={() => guardar(p.id)} disabled={guardando === p.id}
                      className={'w-full py-2 rounded-lg text-sm font-black uppercase transition-colors ' + (guardado === p.id ? 'bg-green-600 text-white' : 'bg-yellow-500 hover:bg-yellow-400 text-black')}>
                      {guardado === p.id ? '✓ Guardado!' : guardando === p.id ? 'Guardando...' : yaGuardado ? 'Actualizar predicción' : 'Guardar predicción'}
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
