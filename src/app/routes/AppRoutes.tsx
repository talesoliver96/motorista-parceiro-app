import { Navigate, Route, Routes } from "react-router-dom";
import { LandingPage } from "../../pages/LandingPage";
import { LoginPage } from "../../pages/LoginPage";
import { RegisterPage } from "../../pages/RegisterPage";
import { ForgotPasswordPage } from "../../pages/ForgotPasswordPage";
import { ResetPasswordPage } from "../../pages/ResetPasswordPage";
import { DashboardPage } from "../../pages/DashboardPage";
import { EarningsPage } from "../../pages/EarningsPage";
import { ExpensesPage } from "../../pages/ExpensesPage";
import { SettingsPage } from "../../pages/SettingsPage";
import { ContactPage } from "../../pages/ContactPage";
import { PublicContactPage } from "../../pages/PublicContactPage";
import { TermsPage } from "../../pages/TermsPage";
import { SubscriptionPage } from "../../pages/SubscriptionPage";
import { ReportsPage } from "../../pages/ReportsPage";
import { AdminDashboardPage } from "../../pages/AdminDashboardPage";
import { AdminUsersPage } from "../../pages/AdminUsersPage";
import { AppLayout } from "../../components/layout/AppLayout";
import { ProtectedRoute } from "./ProtectedRoute";
import { PublicOnlyRoute } from "./PublicOnlyRoute";
import { AdminSystemSettingsPage } from "../../pages/AdminSystemSettingsPage";

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/contact-public" element={<PublicContactPage />} />
      <Route path="/terms" element={<TermsPage />} />

      <Route
        path="/login"
        element={
          <PublicOnlyRoute>
            <LoginPage />
          </PublicOnlyRoute>
        }
      />

      <Route
        path="/register"
        element={
          <PublicOnlyRoute>
            <RegisterPage />
          </PublicOnlyRoute>
        }
      />

      <Route
        path="/forgot-password"
        element={
          <PublicOnlyRoute>
            <ForgotPasswordPage />
          </PublicOnlyRoute>
        }
      />

      <Route path="/reset-password" element={<ResetPasswordPage />} />

      <Route
        path="/subscription"
        element={
          <ProtectedRoute>
            <AppLayout>
              <SubscriptionPage />
            </AppLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <AppLayout>
              <DashboardPage />
            </AppLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/earnings"
        element={
          <ProtectedRoute>
            <AppLayout>
              <EarningsPage />
            </AppLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/expenses"
        element={
          <ProtectedRoute>
            <AppLayout>
              <ExpensesPage />
            </AppLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/settings"
        element={
          <ProtectedRoute>
            <AppLayout>
              <SettingsPage />
            </AppLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/contact"
        element={
          <ProtectedRoute>
            <AppLayout>
              <ContactPage />
            </AppLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/reports"
        element={
          <ProtectedRoute>
            <AppLayout>
              <ReportsPage />
            </AppLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin"
        element={
          <ProtectedRoute>
            <AppLayout>
              <AdminDashboardPage />
            </AppLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/users"
        element={
          <ProtectedRoute>
            <AppLayout>
              <AdminUsersPage />
            </AppLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/system"
        element={
          <ProtectedRoute>
            <AppLayout>
              <AdminSystemSettingsPage />
            </AppLayout>
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}