'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

import { supabase } from '@/lib/supabase';

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    setError('');
    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
      const res = { ok: !signInError };
      const data = { error: signInError?.message };
      if (!res.ok) { setError(data.error || 'Error al iniciar sesión'); return; }
     router.push('/');
    } catch {
      setError('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-black text-white flex flex-col">
      <header className="bg-black border-b-2 border-yellow-500 px-4 py-3 flex items-center gap-3">
        <span className="text-2xl">⚽</span>
        <div>
          <p className="text-xs text-yellow-500 font-bold uppercase tracking-widest leading-none">Te Lo Sugiero</p>
          <p className="text-xl font-black text-white uppercase leading-none">SPORTS</p>
        </div>
      </header>

      <div className="flex-1 flex items-center justify-center px-4">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <p className="text-yellow-400 text-xs uppercase tracking-widest font-bold mb-1">Polla Empresarial</p>
            <h1 className="text-3xl font-black text-white uppercase">Iniciar Sesion</h1>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-gray-400 text-xs uppercase tracking-wide block mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-yellow-500"
                placeholder="tu@empresa.com"
              />
            </div>
            <div>
              <label className="text-gray-400 text-xs uppercase tracking-wide block mb-1">Contrasena</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleLogin()}
                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-yellow-500"
                placeholder="••••••••"
              />
            </div>

            {error && <p className="text-red-400 text-sm text-center">{error}</p>}

            <button
              onClick={handleLogin}
              disabled={loading}
              className="w-full bg-yellow-500 hover:bg-yellow-400 text-black font-black py-4 rounded-xl text-lg uppercase tracking-wide transition-colors disabled:opacity-50"
            >
              {loading ? 'Entrando...' : 'Entrar'}
            </button>

            <p className="text-center text-gray-500 text-sm">
              No tienes cuenta?{' '}
              <a href="/registro" className="text-yellow-400 font-bold hover:underline">Registrate</a>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
