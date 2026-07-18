export const ANALISIS_PARTIDOS: Record<string, {
  prediccion: string;
  claves: string[];
  veredicto: string;
  emoji: string;
}> = {
 
  // ─── COLOMBIA ───────────────────────────────────────────────────────────────
 
  'colombia-uzbekistan': {
    emoji: '🇨🇴',
    prediccion: 'Colombia arranca con todo el favoritismo. Uzbekistán es un equipo ordenado pero sin experiencia en mundiales de este nivel. Los cafeteros tienen más calidad individual y deberían dominar el partido desde el primer tiempo.',
    claves: [
      'James Rodríguez: si llega en forma, puede definir el partido solo',
      'Luis Díaz: velocidad y desborde por la banda izquierda serán clave',
      'Uzbekistán juega muy junto — paciencia para abrir espacios',
      'El calor de México puede afectar el ritmo del partido'
    ],
    veredicto: 'Colombia gana 2-0. Debut sólido, los tres puntos son obligatorios.'
  },
 
  'colombia-congo': {
    emoji: '🇨🇴',
    prediccion: 'Congo DR sorprendió en clasificatorias africanas con un fútbol físico y directo. No son un rival fácil. Colombia necesita estar concentrada desde el minuto 1 — un descuido puede costar caro.',
    claves: [
      'Congo tiene delanteros físicos y rápidos — la defensa colombiana debe estar atenta',
      'Borré o Córdoba pueden ser decisivos desde el banco',
      'El mediocampo de Colombia debe recuperar rápido para no dejar espacios',
      'Partido trampa — Colombia puede confiarse por el rival'
    ],
    veredicto: 'Colombia gana 1-0 o 2-1. Partido más difícil de lo que parece.'
  },
 
  'colombia-portugal': {
    emoji: '🇨🇴🇵🇹',
    prediccion: 'El partido más esperado del Grupo K. Portugal con Cristiano, Bruno Fernandes y una generación dorada. Colombia con James, Díaz y Cuadrado. Esto es puro espectáculo. Depende del momento de Colombia — si llegan clasificados pueden rotar, pero si necesitan el resultado, hay equipo para dar pelea.',
    claves: [
      'Cristiano Ronaldo vs la defensa colombiana — duelo épico',
      'James vs Bruno Fernandes en el mediocampo — clase mundial',
      'Luis Díaz puede desequilibrar a cualquier defensa del mundo',
      'Si Colombia clasifica antes, Néstor Lorenzo puede rotar piezas'
    ],
    veredicto: 'Portugal gana 2-1 en un partidazo. Pero Colombia les complica la vida.'
  },
 
  // ─── CANDIDATOS AL TÍTULO ────────────────────────────────────────────────────
 
  'brasil': {
    emoji: '🇧🇷',
    prediccion: 'Brasil llega como uno de los máximos favoritos. Vinicius Jr en modo Balón de Oro, Rodrygo, Endrick. El problema histórico es la presión — Brasil siempre llega pesado al Mundial y a veces explota antes de tiempo.',
    claves: [
      'Vinicius Jr: el mejor jugador del mundo en este momento',
      'Defensa sólida con Marquinhos como líder',
      'Presión enorme de la hinchada — pueden desestabilizarse',
      'El técnico Dorival Jr aún no convence del todo'
    ],
    veredicto: 'Candidato real. Llega a semis mínimo, puede ganar todo.'
  },
 
  'francia': {
    emoji: '🇫🇷',
    prediccion: 'Francia es la selección más completa del mundo en papel. Mbappé como capitán y figura máxima, Tchouaméni, Camavinga. El problema es el vestuario — hay tensiones internas que han afectado en torneos anteriores.',
    claves: [
      'Mbappé: cuando está bien, es imparable',
      'El mediocampo francés es el más completo del torneo',
      'Tensiones internas pueden ser su talón de Aquiles',
      'Defensivamente son muy sólidos'
    ],
    veredicto: 'Favorito número 1 junto con Brasil. Pero los dramas internos los pueden hundir.'
  },
 
  'argentina': {
    emoji: '🇦🇷',
    prediccion: 'Los campeones del mundo defienden título. Con Messi en lo que probablemente sea su último Mundial, Argentina llega con hambre y experiencia ganadora. El equipo sabe cómo ganar torneos.',
    claves: [
      'Messi: último Mundial, motivación máxima',
      'Álvarez y Mac Allister han crecido enormemente',
      'Defensa experimentada que sabe sufrir',
      'Scaloni conoce cómo armar equipos para ganar'
    ],
    veredicto: 'Peligrosísimos. No los descarten jamás mientras Messi juegue.'
  },
 
  'españa': {
    emoji: '🇪🇸',
    prediccion: 'España viene de ganar la Eurocopa 2024 con un fútbol brillante. Yamal, Nico Williams, Pedri — la generación más talentosa desde la época dorada. Son jóvenes pero ya demostraron que saben ganar.',
    claves: [
      'Lamine Yamal: 18 años y ya es el mejor extremo del mundo',
      'Pedri controla el mediocampo con una madurez increíble',
      'Pressing altísimo que asfixia rivales',
      'Poca experiencia mundialista en el grupo joven'
    ],
    veredicto: 'Mi favorito personal. Juegan el mejor fútbol del momento.'
  },
 
  'inglaterra': {
    emoji: '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
    prediccion: 'Inglaterra lleva décadas prometiendo y decepcionando. Bellingham, Kane, Saka — tienen calidad de sobra. El problema es la presión de llevar 60 años sin ganar un Mundial. ¿Esta vez es la definitiva?',
    claves: [
      'Jude Bellingham: el mejor jugador inglés en generaciones',
      'Harry Kane necesita un Mundial para completar su legado',
      'La presión histórica de "el fútbol vuelve a casa"',
      'Southgate ya no está — nuevo técnico, nueva mentalidad'
    ],
    veredicto: 'Tienen equipo para ganar. Pero Inglaterra siempre encuentra la forma de fallar.'
  },
 
  'alemania': {
    emoji: '🇩🇪',
    prediccion: 'Alemania en casa de sus aliados. Vienen de una Eurocopa decente como local y están reconstruyendo el equipo. Müller se retiró, nueva generación liderada por Wirtz y Musiala.',
    claves: [
      'Florian Wirtz: el mejor jugador alemán del momento',
      'Musiala: técnica excepcional para un alemán',
      'Alemania siempre rinde en Mundiales — tienen ADN ganador',
      'La defensa aún tiene dudas'
    ],
    veredicto: 'Cuartos de final mínimo. Candidato a dar sorpresa.'
  },
 
  'portugal': {
    emoji: '🇵🇹',
    prediccion: 'Portugal con Cristiano en modo despedida. Bruno Fernandes tomó las riendas del equipo. Tienen calidad en todos los sectores pero dependen demasiado de CR7 para las grandes ocasiones.',
    claves: [
      'Cristiano Ronaldo: ¿su último Mundial? Viene con hambre histórica',
      'Bruno Fernandes: el verdadero motor del equipo',
      'Rafael Leão puede desequilibrar cualquier partido',
      'Sin Cristiano, ¿tienen liderazgo suficiente?'
    ],
    veredicto: 'Semis como mínimo. Con Cristiano en forma, pueden ganar todo.'
  },
};
 
// Función para encontrar análisis de un partido
export function getAnalisis(homeTeam: string, awayTeam: string) {
  const home = homeTeam?.toLowerCase() || '';
  const away = awayTeam?.toLowerCase() || '';
 
  // Partidos de Colombia
  if (home.includes('colombia') || away.includes('colombia')) {
    const rival = home.includes('colombia') ? away : home;
    if (rival.includes('uzbek')) return ANALISIS_PARTIDOS['colombia-uzbekistan'];
    if (rival.includes('congo')) return ANALISIS_PARTIDOS['colombia-congo'];
    if (rival.includes('portugal')) return ANALISIS_PARTIDOS['colombia-portugal'];
  }
 
  // Candidatos al título
  const CANDIDATOS = ['brasil', 'brazil', 'francia', 'france', 'argentina', 'españa', 'spain', 'inglaterra', 'england', 'alemania', 'germany', 'portugal'];
  
  for (const c of CANDIDATOS) {
    if (home.includes(c) || away.includes(c)) {
      if (c.includes('bras') || c.includes('braz')) return ANALISIS_PARTIDOS['brasil'];
      if (c.includes('fran')) return ANALISIS_PARTIDOS['francia'];
      if (c.includes('arg')) return ANALISIS_PARTIDOS['argentina'];
      if (c.includes('esp') || c.includes('spa')) return ANALISIS_PARTIDOS['españa'];
      if (c.includes('ingl') || c.includes('eng')) return ANALISIS_PARTIDOS['inglaterra'];
      if (c.includes('alem') || c.includes('ger')) return ANALISIS_PARTIDOS['alemania'];
      if (c.includes('port')) return ANALISIS_PARTIDOS['portugal'];
    }
  }
 
  return null;
}
 