import { useState } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { useNavigate } from 'react-router-dom';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const signIn = useAuthStore((s) => s.signIn);
  const navigate = useNavigate();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    const result = await signIn(email, password);
    setLoading(false);
    if (result.error) {
      setError(result.error);
    } else {
      navigate('/', { replace: true });
    }
  }

  return (
    <div className="min-h-screen bg-[#2B2B2B] flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-sm bg-[#3A3A3A] rounded-2xl p-6 shadow-lg">
        <h1 className="text-2xl font-bold text-white text-center mb-6">Entrar no OrçaObra</h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-300 mb-1">E-mail</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full bg-[#4A4A4A] text-white rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-[#FFB800]"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-300 mb-1">Senha</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full bg-[#4A4A4A] text-white rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-[#FFB800]"
            />
          </div>

          {error && <p className="text-red-400 text-sm">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#FFB800] text-black font-semibold rounded-lg py-3 hover:bg-[#E6A600] transition-colors disabled:opacity-50"
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        <p className="text-gray-400 text-sm text-center mt-4">
          Não tem conta?{' '}
          <a href="/cadastro" className="text-[#FFB800] hover:underline">Cadastre-se</a>
        </p>
      </div>
    </div>
  );
}
