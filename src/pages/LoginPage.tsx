import { Eye, EyeOff, Lock, Mail } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { ProductImage } from '../components/ProductImage.tsx';
import { useAuth } from '../context/AuthContext.tsx';

export function LoginPage() {
  const { user, loading, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const redirectTo =
    (location.state as { from?: string } | null)?.from || '/produtos';

  if (!loading && user) {
    return <Navigate to={redirectTo} replace />;
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      await login(email, password);
      navigate(redirectTo, { replace: true });
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Não foi possível validar seu acesso.',
      );
    } finally {
      setSubmitting(false);
    }
  };

  const fillDemoCredentials = () => {
    setEmail('admin@kromastudio.com.br');
    setPassword('kroma2026');
    setError(null);
  };

  return (
    <main className="min-h-screen grid lg:grid-cols-12 items-stretch bg-zinc-50">
      <section className="lg:col-span-6 bg-zinc-900 text-zinc-100 p-8 sm:p-12 lg:p-16 flex flex-col justify-between gap-10">
        <div className="space-y-8">
          <div className="font-display text-2xl font-bold tracking-tight text-white">
            Kroma
          </div>

          <div className="space-y-4 max-w-lg">
            <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-white text-balance leading-[1.15]">
              Catálogo e gestão de inventário para áudio profissional.
            </h1>
            <p className="text-base text-zinc-400 leading-relaxed">
              Acesse a área restrita para cadastrar novos equipamentos, atualizar
              especificações técnicas e acompanhar o estoque em tempo real.
            </p>
          </div>
        </div>

        <div className="space-y-6 max-w-lg">
          <div className="rounded-xl overflow-hidden border border-zinc-800 bg-zinc-950">
            <ProductImage
              src="/src/assets/images/product_studio_monitor_1794944555597.jpg"
              alt="Monitor de Estúdio Kroma Reference M5"
              className="aspect-[4/3]"
            />
          </div>

          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-zinc-400">
            <span>Autenticação validada no backend</span>
            <span aria-hidden="true">·</span>
            <span>Banco de dados NoSQL</span>
            <span aria-hidden="true">·</span>
            <span>Listagem dinâmica</span>
          </div>
        </div>
      </section>

      <section className="lg:col-span-6 flex items-center justify-center p-6 sm:p-12 lg:p-16 bg-white">
        <div className="w-full max-w-md space-y-8">
          <div className="space-y-2">
            <h2 className="font-display text-2xl font-bold tracking-tight text-zinc-900">
              Entrar na plataforma
            </h2>
            <p className="text-sm text-zinc-600">
              Informe seu e-mail e senha cadastrados para acessar o catálogo.
            </p>
          </div>

          {error && (
            <div
              role="alert"
              className="px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700"
            >
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label
                htmlFor="login-email"
                className="block text-sm font-medium text-zinc-800 mb-1.5"
              >
                E-mail
              </label>
              <div className="relative">
                <Mail
                  className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                  aria-hidden="true"
                />
                <input
                  id="login-email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="voce@kromastudio.com.br"
                  className="w-full pl-10 pr-3.5 py-2.5 text-sm bg-white border border-zinc-300 rounded-lg text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="login-password"
                className="block text-sm font-medium text-zinc-800 mb-1.5"
              >
                Senha
              </label>
              <div className="relative">
                <Lock
                  className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                  aria-hidden="true"
                />
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Digite sua senha"
                  className="w-full pl-10 pr-10 py-2.5 text-sm bg-white border border-zinc-300 rounded-lg text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-zinc-400 hover:text-zinc-700"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" aria-hidden="true" />
                  ) : (
                    <Eye className="w-4 h-4" aria-hidden="true" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-2.5 px-4 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed rounded-lg transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
            >
              {submitting ? 'Validando acesso...' : 'Entrar'}
            </button>
          </form>

          <div className="pt-5 border-t border-zinc-200 space-y-4">
            <div className="flex items-center justify-between gap-4 text-xs text-zinc-500">
              <span>Conta de teste: admin@kromastudio.com.br</span>
              <button
                type="button"
                onClick={fillDemoCredentials}
                className="font-medium text-blue-600 hover:text-blue-700 whitespace-nowrap shrink-0"
              >
                Preencher dados
              </button>
            </div>

            <p className="text-sm text-zinc-600">
              Ainda não tem acesso?{' '}
              <Link
                to="/cadastro"
                className="font-medium text-blue-600 hover:text-blue-700"
              >
                Criar conta de usuário
              </Link>
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
