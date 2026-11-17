import { Lock, Mail, User as UserIcon } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { ProductImage } from '../components/ProductImage.tsx';
import { useAuth } from '../context/AuthContext.tsx';

export function RegisterPage() {
  const { user, loading, register } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!loading && user) {
    return <Navigate to="/produtos" replace />;
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (name.trim().length < 2) {
      setError('Informe seu nome completo.');
      return;
    }
    if (password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres.');
      return;
    }
    if (password !== confirmPassword) {
      setError('As senhas digitadas não conferem.');
      return;
    }

    setSubmitting(true);
    try {
      await register(name.trim(), email.trim(), password);
      navigate('/produtos', { replace: true });
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Não foi possível concluir seu cadastro.',
      );
    } finally {
      setSubmitting(false);
    }
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
              Crie sua conta para operar o catálogo de produtos.
            </h1>
            <p className="text-base text-zinc-400 leading-relaxed">
              Novos usuários são validados e salvos com criptografia no servidor
              antes da liberação da área interna.
            </p>
          </div>
        </div>

        <div className="space-y-6 max-w-lg">
          <div className="rounded-xl overflow-hidden border border-zinc-800 bg-zinc-950">
            <ProductImage
              src="/src/assets/images/product_dac_amplifier_1794944557890.jpg"
              alt="DAC & Amplificador Desktop A1 Precision"
              className="aspect-[4/3]"
            />
          </div>

          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-zinc-400">
            <span>Hash scrypt no servidor</span>
            <span aria-hidden="true">·</span>
            <span>Sessão por token assinado</span>
            <span aria-hidden="true">·</span>
            <span>Rotas protegidas</span>
          </div>
        </div>
      </section>

      <section className="lg:col-span-6 flex items-center justify-center p-6 sm:p-12 lg:p-16 bg-white">
        <div className="w-full max-w-md space-y-8">
          <div className="space-y-2">
            <h2 className="font-display text-2xl font-bold tracking-tight text-zinc-900">
              Cadastro de novo usuário
            </h2>
            <p className="text-sm text-zinc-600">
              Preencha os campos abaixo para criar seu acesso.
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

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="reg-name"
                className="block text-sm font-medium text-zinc-800 mb-1.5"
              >
                Nome completo
              </label>
              <div className="relative">
                <UserIcon
                  className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                  aria-hidden="true"
                />
                <input
                  id="reg-name"
                  type="text"
                  autoComplete="name"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Maria Oliveira"
                  className="w-full pl-10 pr-3.5 py-2.5 text-sm bg-white border border-zinc-300 rounded-lg text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="reg-email"
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
                  id="reg-email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="maria@exemplo.com"
                  className="w-full pl-10 pr-3.5 py-2.5 text-sm bg-white border border-zinc-300 rounded-lg text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="reg-password"
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
                  id="reg-password"
                  type="password"
                  autoComplete="new-password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                  className="w-full pl-10 pr-3.5 py-2.5 text-sm bg-white border border-zinc-300 rounded-lg text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="reg-confirm"
                className="block text-sm font-medium text-zinc-800 mb-1.5"
              >
                Confirmar senha
              </label>
              <div className="relative">
                <Lock
                  className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                  aria-hidden="true"
                />
                <input
                  id="reg-confirm"
                  type="password"
                  autoComplete="new-password"
                  required
                  minLength={6}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repita sua senha"
                  className="w-full pl-10 pr-3.5 py-2.5 text-sm bg-white border border-zinc-300 rounded-lg text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-2.5 px-4 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed rounded-lg transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
            >
              {submitting ? 'Criando conta...' : 'Criar conta e entrar'}
            </button>
          </form>

          <div className="pt-5 border-t border-zinc-200">
            <p className="text-sm text-zinc-600">
              Já possui uma conta?{' '}
              <Link
                to="/login"
                className="font-medium text-blue-600 hover:text-blue-700"
              >
                Voltar para o login
              </Link>
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
