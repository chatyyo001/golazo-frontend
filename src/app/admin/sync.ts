import { API as GOLAZO_API } from '@/lib/config';
import { getAccessToken, supabase } from '@/lib/supabase';

const TEAM_MAP: Record<string, string> = {
  'Mexico': 'MEX', 'South Africa': 'RSA', 'Korea Republic': 'KOR', 'Czech Republic': 'CZE',
  'Canada': 'CAN', 'Bosnia and Herzegovina': 'BIH', 'Qatar': 'QAT', 'Switzerland': 'SUI',
  'Brazil': 'BRA', 'Morocco': 'MAR', 'Haiti': 'HAI', 'Scotland': 'SCO',
  'USA': 'USA', 'Paraguay': 'PAR', 'Australia': 'AUS', 'Turkey': 'TUR',
  'Germany': 'GER', 'Curacao': 'CUW', 'Ivory Coast': 'CIV', 'Ecuador': 'ECU',
  'Netherlands': 'NED', 'Japan': 'JPN', 'Sweden': 'SWE', 'Tunisia': 'TUN',
  'Belgium': 'BEL', 'Egypt': 'EGY', 'Iran': 'IRN', 'New Zealand': 'NZL',
  'Spain': 'ESP', 'Cape Verde': 'CPV', 'Saudi Arabia': 'KSA', 'Uruguay': 'URU',
  'France': 'FRA', 'Senegal': 'SEN', 'Iraq': 'IRQ', 'Norway': 'NOR',
  'Argentina': 'ARG', 'Algeria': 'ALG', 'Austria': 'AUT', 'Jordan': 'JOR',
  'Portugal': 'POR', 'DR Congo': 'COD', 'Uzbekistan': 'UZB', 'Colombia': 'COL',
  'England': 'ENG', 'Croatia': 'CRO', 'Ghana': 'GHA', 'Panama': 'PAN',
};

async function getToken(): Promise<string> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || !['admin', 'moderator'].includes(user.app_metadata.role)) {
    throw new Error('Se requiere una sesión de administrador de TeLoSugiero Platform');
  }
  const token = await getAccessToken();
  if (!token) throw new Error('Sesión no disponible');
  return token;
}

async function getOurMatches(token: string) {
  const res = await fetch(GOLAZO_API + '/api/matches', {
    headers: { Authorization: 'Bearer ' + token },
  });
  const data = await res.json();
  return data.data || [];
}

async function updateMatch(token: string, matchId: string, homeScore: number, awayScore: number, minute: string, status: string) {
  await fetch(GOLAZO_API + '/api/matches/' + matchId + '/score', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token },
    body: JSON.stringify({ home_score: homeScore, away_score: awayScore, minute, status }),
  });
}

async function sync() {
  try {
    const token = await getToken();
    const ourMatches = await getOurMatches(token);
    console.log('Sincronizacion completada.');
  } catch (err: unknown) {
    const error = err as Error;
    console.error('Error:', error.message);
  }
}

sync();
setInterval(sync, 5 * 60 * 1000);
console.log('Sincronizador iniciado - corre cada 5 minutos');
