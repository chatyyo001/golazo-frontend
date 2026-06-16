'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

const API = 'https://golazo-api-production.up.railway.app';

export default function Registro() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [empresa, setEmpresa] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegistro = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(API + '/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name, password, company_code: empresa }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Error al registrarse'); return; }
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      router.push('/predicciones');
    } catch {
      setError('Error de conexion');
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

      <div className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <p className="text-yellow-400 text-xs uppercase tracking-widest font-bold mb-1">Polla Empresarial</p>
            <h1 className="text-3xl font-black text-white uppercase">Registro</h1>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-gray-400 text-xs uppercase tracking-wide block mb-1">Tu nombre</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-yellow-500"
                placeholder="Juan Perez"
              />
            </div>
            <div>
              <label className="text-gray-400 text-xs uppercase tracking-wide block mb-1">Código de empresa (opcional)</label>
              <input
                type="text"
                value={empresa}
                onChange={e => setEmpresa(e.target.value.toUpperCase())}
                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-yellow-500"
                placeholder="Ej: ACME2026"
              />
              <p className="text-gray-600 text-xs mt-1">Pídelo a tu empresa si participas en una Polla Empresarial</p>
            </div>
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
                onKeyDown={e => e.key === 'Enter' && handleRegistro()}
                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-yellow-500"
                placeholder="Min 6 caracteres"
              />
            </div>

            {error && <p className="text-red-400 text-sm text-center">{error}</p>}

            <button
              onClick={handleRegistro}
              disabled={loading}
              className="w-full bg-yellow-500 hover:bg-yellow-400 text-black font-black py-4 rounded-xl text-lg uppercase tracking-wide transition-colors disabled:opacity-50"
            >
              {loading ? 'Registrando...' : 'Crear cuenta'}
            </button>

            <p className="text-center text-gray-500 text-sm">
              Ya tienes cuenta?{' '}
              <a href="/login" className="text-yellow-400 font-bold hover:underline">Inicia sesion</a>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}