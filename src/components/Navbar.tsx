import { LogOut } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.tsx';

export function Navbar() {
  const { logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  const isCatalog = location.pathname === '/produtos';
  const isNew = location.pathname === '/produtos/novo';

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-sm border-b border-zinc-200">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between gap-8">
        <Link
          to="/produtos"
          className="font-display text-xl font-bold tracking-tight text-zinc-900 whitespace-nowrap shrink-0"
        >
          Kroma
        </Link>

        <nav
          aria-label="Navegação principal"
          className="flex items-center gap-6 text-sm font-medium"
        >
          <Link
            to="/produtos"
            className={`py-1 whitespace-nowrap shrink-0 border-b-2 transition-colors duration-150 ${
              isCatalog
                ? 'border-blue-600 text-zinc-900'
                : 'border-transparent text-zinc-600 hover:text-zinc-900'
            }`}
          >
            Catálogo
          </Link>
          <Link
            to="/produtos/novo"
            className={`py-1 whitespace-nowrap shrink-0 border-b-2 transition-colors duration-150 ${
              isNew
                ? 'border-blue-600 text-zinc-900'
                : 'border-transparent text-zinc-600 hover:text-zinc-900'
            }`}
          >
            Cadastrar Produto
          </Link>
        </nav>

        <div className="flex items-center shrink-0">
          <button
            type="button"
            onClick={handleLogout}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-zinc-700 bg-zinc-100 hover:bg-zinc-200 hover:text-zinc-900 rounded-lg transition-colors duration-150 whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
          >
            <LogOut className="w-4 h-4" aria-hidden="true" />
            <span>Sair</span>
          </button>
        </div>
      </div>
    </header>
  );
}
