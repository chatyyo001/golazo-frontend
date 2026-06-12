import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const { home, away, grupo } = await req.json();
  
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.ANTHROPIC_KEY || '',
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 300,
      messages: [{ role: 'user', content: `Eres analista de futbol. Partido Copa Mundial 2026 Grupo ${grupo}: ${home} vs ${away}. Responde SOLO JSON sin backticks: {"marcador":"X-X","ganador":"nombre o Empate","confianza":"Alta/Media/Baja","analisis":"2 oraciones en español"}` }]
    })
  });
  
  const data = await response.json();
  const text = data.content?.[0]?.text || '{}';
  try {
    return NextResponse.json(JSON.parse(text.trim()));
  } catch {
    return NextResponse.json({ marcador: '1-1', ganador: 'Empate', confianza: 'Media', analisis: 'Análisis no disponible.' });
  }
}