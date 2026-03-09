import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
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

  const mountedRef = useRef(true);

  const loadProfile = useCallback(async (nextUser: User | null) => {
    if (!nextUser) {
      if (!mountedRef.current) return;
      setProfile(null);
      return;
    }

    try {
      const nextProfile = await profileService.getProfileByUserId(nextUser.id);

      if (!mountedRef.current) return;
      setProfile(nextProfile);
    } catch (error) {
      console.error("Erro ao carregar profile:", error);

      if (!mountedRef.current) return;
      setProfile(null);
    }
  }, []);

  const refreshProfile = useCallback(async () => {
    if (!user) {
      setProfile(null);
      return;
    }

    await loadProfile(user);
  }, [user, loadProfile]);

  useEffect(() => {
    mountedRef.current = true;

    const bootstrap = async () => {
      try {
        const currentSession = await authService.getSession();

        if (!mountedRef.current) return;

        setSession(currentSession);
        setUser(currentSession?.user ?? null);

        await loadProfile(currentSession?.user ?? null);

        if (!mountedRef.current) return;
        setLoading(false);
      } catch (error) {
        console.error("Erro ao iniciar autenticação:", error);

        if (!mountedRef.current) return;

        setSession(null);
        setUser(null);
        setProfile(null);
        setLoading(false);
      }
    };

    void bootstrap();

    const { data } = authService.onAuthStateChange(
      async (_event, nextSession): Promise<void> => {
        if (!mountedRef.current) return;

        setSession(nextSession);
        setUser(nextSession?.user ?? null);

        await loadProfile(nextSession?.user ?? null);

        if (!mountedRef.current) return;
        setLoading(false);
      }
    );

    return () => {
      mountedRef.current = false;
      data.subscription.unsubscribe();
    };
  }, [loadProfile]);

  const value = useMemo(
    () => ({
      user,
      session,
      profile,
      loading,
      refreshProfile,
    }),
    [user, session, profile, loading, refreshProfile]
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