import { Navigate } from "react-router-dom";
import { useAuth } from "../providers/AuthProvider";
import { LoadingScreen } from "../../components/common/LoadingScreen";

type Props = {
  children: React.ReactNode;
};

// Protege páginas privadas.
// Enquanto carrega sessão, mostra loading.
// Se não houver usuário, redireciona ao login.
export function ProtectedRoute({ children }: Props) {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}