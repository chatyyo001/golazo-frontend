import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'La Gran Final · España vs Argentina | Golazo',
  description:
    'Predice el marcador de la final del Mundial 2026 y acumula puntos — canjeables muy pronto en TeLoSugiero, nuestra plataforma en desarrollo. Gratis, sin apuestas. Domingo 19 de julio, 3:00 p.m. (Colombia).',
  openGraph: {
    title: 'La Gran Final · España 🇪🇸 vs 🇦🇷 Argentina',
    description:
      'Predice el marcador y acumula puntos, canjeables muy pronto en TeLoSugiero. Gratis, sin apuestas. Domingo 3:00 p.m. — ¿quién será campeón del mundo?',
    url: 'https://golazo.telosugiero.com/final',
    siteName: 'Golazo · Te Lo Sugiero Sports',
    locale: 'es_CO',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'La Gran Final · España vs Argentina',
    description: 'Predice el marcador y acumula puntos, canjeables muy pronto en TeLoSugiero. Gratis, sin apuestas.',
  },
};

export default function FinalLayout({ children }: { children: React.ReactNode }) {
  return children;
}
