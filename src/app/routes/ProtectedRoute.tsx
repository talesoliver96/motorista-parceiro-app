import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../providers/AuthProvider";
import { AppSkeleton } from "../../components/common/AppSkeleton";
import { usePublicAppSettings } from "../../features/app-settings/usePublicAppSettings";
import { MaintenancePage } from "../../pages/MaintenancePage";

type Props = {
  children: React.ReactNode;
};

export function ProtectedRoute({ children }: Props) {
  const { user, profile, loading } = useAuth();
  const location = useLocation();
  const { loading: settingsLoading, settings } = usePublicAppSettings();

  if (loading || settingsLoading) {
    return <AppSkeleton />;
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  const isAdmin = Boolean(profile?.is_admin);

  if (settings.maintenanceMode.enabled && !isAdmin) {
    return <MaintenancePage message={settings.maintenanceMode.message} />;
  }

  return <>{children}</>;
}