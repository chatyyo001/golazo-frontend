import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Golazo · Predice, acierta y gana',
  description: 'Predice el marcador de los partidos, suma puntos por tu olfato futbolero y canjéalos en TeLoSugiero. Juego de habilidad, sin apuestas de dinero.',
  openGraph: {
    title: 'Golazo · Predice, acierta y gana',
    description: 'Predice el marcador, gana puntos y canjéalos en TeLoSugiero. Juego de habilidad, sin apuestas de dinero.',
    images: ['/golazo-og.jpg'],
  },
};

export default function BienvenidaLayout({ children }: { children: React.ReactNode }) {
  return children;
}
