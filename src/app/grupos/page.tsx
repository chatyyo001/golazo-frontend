'use client';
import { useEffect, useState } from 'react';

import { API } from '@/lib/config';

const FlagImg = ({ code }: { code: string }) => {
  if (!code || code.length < 2) return <span className="w-6 h-4 bg-gray-700 rounded-sm inline-block" />;
  return <img src={'https://flagcdn.com/24x18/' + code.toLowerCase() + '.png'} alt={code} width={24} height={18} className="rounded-sm" />;
};

export default function Grupos() {
  const [standings, setStandings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(API + '/api/tournaments')
      .then(r => r.json())
      .then(d => {
        const id = d.data[0]?.id;
        return fetch(API + '/api/tournaments/' + id + '/standings');
      })
      .then(r => r.json())
      .then(d => { setStandings(d || []); setLoading(false); });
  }, []);

  if (loading) return (
    <main className="min-h-screen bg-black text-white flex items-center justify-center">
      <p className="text-yellow-400 font-black text-xl">Cargando grupos...</p>
    </main>
  );

  return (
    <main className="min-h-screen bg-black text-white pb-20">
      <header className="bg-black border-b-2 border-yellow-500 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-2xl">⚽</span>
          <div>
            <p className="text-xs text-yellow-500 font-bold uppercase tracking-widest leading-none">Te Lo Sugiero</p>
            <p className="text-lg font-black text-white uppercase leading-none">SPORTS</p>
          </div>
        </div>
        <a href="/" className="text-yellow-400 text-xs font-bold uppercase">Inicio</a>
      </header>

      <div className="bg-gradient-to-r from-yellow-600 via-yellow-500 to-yellow-600 px-4 py-2 text-center">
        <p className="text-black font-black text-sm uppercase">Tabla de Posiciones - Mundial 2026</p>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
        {standings.map(({ group, rows }) => (
          <div key={group.id} className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
            <div className="bg-yellow-500 px-4 py-2">
              <h2 className="text-black font-black text-lg uppercase">Grupo {group.name}</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-gray-500 text-xs uppercase border-b border-gray-800">
                    <th className="text-left px-4 py-2">Equipo</th>
                    <th className="text-center px-2 py-2">PJ</th>
                    <th className="text-center px-2 py-2">PG</th>
                    <th className="text-center px-2 py-2">PE</th>
                    <th className="text-center px-2 py-2">PP</th>
                    <th className="text-center px-2 py-2">GF</th>
                    <th className="text-center px-2 py-2">GC</th>
                    <th className="text-center px-2 py-2">DG</th>
                    <th className="text-center px-2 py-2 text-yellow-400">PTS</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r: any, i: number) => (
                    <tr key={r.team.id} className={'border-b border-gray-800 last:border-0 ' + (i < 2 ? 'bg-green-950' : i === 2 ? 'bg-yellow-950' : '')}>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span className={'w-5 h-5 rounded-full flex items-center justify-center text-xs font-black ' + (i < 2 ? 'bg-green-600 text-white' : i === 2 ? 'bg-yellow-600 text-black' : 'bg-gray-700 text-gray-400')}>
                            {i + 1}
                          </span>
                          <FlagImg code={r.team.flag} />
                          <span className="font-semibold">{r.team.name}</span>
                          {r.team.is_host && <span className="text-yellow-500 text-xs">(Local)</span>}
                        </div>
                      </td>
                      <td className="text-center px-2 py-3 text-gray-400">{r.pj}</td>
                      <td className="text-center px-2 py-3 text-gray-400">{r.pg}</td>
                      <td className="text-center px-2 py-3 text-gray-400">{r.pe}</td>
                      <td className="text-center px-2 py-3 text-gray-400">{r.pp}</td>
                      <td className="text-center px-2 py-3 text-gray-400">{r.gf}</td>
                      <td className="text-center px-2 py-3 text-gray-400">{r.gc}</td>
                      <td className="text-center px-2 py-3 text-gray-400">{r.dg > 0 ? '+' + r.dg : r.dg}</td>
                      <td className="text-center px-2 py-3 font-black text-yellow-400 text-base">{r.pts}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="px-4 py-2 bg-gray-950 flex gap-4 text-xs text-gray-500">
              <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-green-600 inline-block"></span> Clasifican</span>
              <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-yellow-600 inline-block"></span> Repechaje</span>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}