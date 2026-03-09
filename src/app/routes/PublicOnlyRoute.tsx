import { Navigate } from "react-router-dom";
import { useAuth } from "../providers/AuthProvider";
import { LoadingScreen } from "../../components/common/LoadingScreen";

type Props = {
  children: React.ReactNode;
};

// Evita que usuário logado volte para login/cadastro.
export function PublicOnlyRoute({ children }: Props) {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}