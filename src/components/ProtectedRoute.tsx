import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.tsx';

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-50 flex flex-col items-center justify-center px-6">
        <div className="w-full max-w-md space-y-4">
          <div className="h-6 w-32 bg-zinc-200 rounded animate-pulse" />
          <div className="h-32 w-full bg-zinc-200/70 rounded-xl animate-pulse" />
          <p className="text-sm text-zinc-500">Validando sessão no servidor...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  return <>{children}</>;
}
