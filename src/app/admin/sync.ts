const RAPIDAPI_KEY = '04c917f7b3msh6d84a4e8fd9ebc3p1f7d77jsn8a7da34ad63b';
const GOLAZO_API = 'https://golazo-api-production.up.railway.app';
const ADMIN_TOKEN = ''; // Lo llenamos después

// Mapa de nombres de equipos a short_name en nuestra BD
const TEAM_MAP = {
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

async function getToken() {
  const res = await fetch(GOLAZO_API + '/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'cmaoramirez@gmail.com', password: 'Golazo2026!' }),
  });
  const data = await res.json();
  return data.token;
}

async function getLiveMatches() {
  const res = await fetch('https://free-api-live-football-data.p.rapidapi.com/football-current-live', {
    headers: {
      'x-rapidapi-key': RAPIDAPI_KEY,
      'x-rapidapi-host': 'free-api-live-football-data.p.rapidapi.com',
    },
  });
  const data = await res.json();
  return data.response?.livescores || [];
}

async function getOurMatches(token: string) {
  const res = await fetch(GOLAZO_API + '/api/matches', {
    headers: { Authorization: 'Bearer ' + token },
  });
  const data = await res.json();
  return data.data || [];
}

async function updateMatch(token: string, matchId: string, homeScore: number, awayScore: number, minute: number | null, status: string) {  await fetch(GOLAZO_API + '/api/matches/' + matchId + '/score', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token },
    body: JSON.stringify({ home_score: homeScore, away_score: awayScore, minute, status }),
  });
  console.log('Actualizado partido ' + matchId + ': ' + homeScore + '-' + awayScore + ' min:' + minute);
}

async function sync() {
  console.log('Sincronizando... ' + new Date().toLocaleTimeString());
  try {
    const token = await getToken();
    const [liveMatches, ourMatches] = await Promise.all([getLiveMatches(), getOurMatches(token)]);

    console.log('Partidos en vivo encontrados: ' + liveMatches.length);

    for (const live of liveMatches) {
      const homeShort = TEAM_MAP[live.homeTeam?.name];
      const awayShort = TEAM_MAP[live.awayTeam?.name];
      if (!homeShort || !awayShort) continue;

      const ourMatch = ourMatches.find(m =>
        m.home_team?.short_name === homeShort && m.away_team?.short_name === awayShort
      );
      if (!ourMatch) continue;

      const homeScore = live.score?.home ?? 0;
      const awayScore = live.score?.away ?? 0;
      const minute = live.minute || live.status?.elapsed || '';
      const isFinished = live.status?.type === 'finished';
      const status = isFinished ? 'finished' : 'live';

      await updateMatch(token, ourMatch.id, homeScore, awayScore, String(minute), status);
    }
    console.log('Sincronizacion completada.');
  } catch (err) {
    console.error('Error:', err.message);
  }
}

// Correr cada 5 minutos
sync();
setInterval(sync, 5 * 60 * 1000);
console.log('Sincronizador iniciado — corre cada 5 minutos');