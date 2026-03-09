import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { Session, User } from "@supabase/supabase-js";
import { authService } from "../../features/auth/auth.service";
import { profileService } from "../../features/auth/profile.service";
import type { Profile } from "../../types/database";

type AuthContextType = {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  refreshProfile: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | null>(null);

type Props = {
  children: React.ReactNode;
};

export function AuthProvider({ children }: Props) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshProfile = async () => {
    try {
      const nextProfile = await profileService.getMyProfile();
      setProfile(nextProfile);
    } catch (error) {
      console.error("Erro ao buscar profile:", error);
      setProfile(null);
    }
  };

  useEffect(() => {
    let isMounted = true;

    async function bootstrap() {
      try {
        const currentSession = await authService.getSession();

        if (!isMounted) return;

        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        setLoading(false);

        if (currentSession?.user) {
          await refreshProfile();
        } else {
          setProfile(null);
        }
      } catch (error) {
        console.error("Erro ao iniciar autenticação:", error);

        if (!isMounted) return;

        setSession(null);
        setUser(null);
        setProfile(null);
        setLoading(false);
      }
    }

    bootstrap();

    const { data } = authService.onAuthStateChange(
      async (_event, nextSession): Promise<void> => {
        if (!isMounted) return;

        setSession(nextSession);
        setUser(nextSession?.user ?? null);
        setLoading(false);

        if (nextSession?.user) {
          await refreshProfile();
        } else {
          setProfile(null);
        }
      }
    );

    return () => {
      isMounted = false;
      data.subscription.unsubscribe();
    };
  }, []);

  const value = useMemo(
    () => ({
      user,
      session,
      profile,
      loading,
      refreshProfile,
    }),
    [user, session, profile, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth deve ser usado dentro de AuthProvider");
  }

  return context;
}