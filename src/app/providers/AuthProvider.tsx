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

  const isMountedRef = useRef(true);

  // Fila única de sincronização.
  // Isso evita corrida entre bootstrap, visibilitychange e onAuthStateChange.
  const authQueueRef = useRef<Promise<void>>(Promise.resolve());

  const applyProfile = useCallback(async (nextUser: User | null) => {
    if (!nextUser) {
      if (!isMountedRef.current) return;
      setProfile(null);
      return;
    }

    try {
      const nextProfile = await profileService.getMyProfile();

      if (!isMountedRef.current) return;
      setProfile(nextProfile);
    } catch (error) {
      console.error("Erro ao carregar profile:", error);

      if (!isMountedRef.current) return;
      setProfile(null);
    }
  }, []);

  const syncAuthState = useCallback(
    async (sessionFromEvent?: Session | null) => {
      authQueueRef.current = authQueueRef.current.finally(async () => {
        try {
          const nextSession =
            sessionFromEvent === undefined
              ? await authService.getSession()
              : sessionFromEvent;

          if (!isMountedRef.current) return;

          setSession(nextSession);
          setUser(nextSession?.user ?? null);

          await applyProfile(nextSession?.user ?? null);

          if (!isMountedRef.current) return;
          setLoading(false);
        } catch (error) {
          console.error("Erro ao sincronizar autenticação:", error);

          if (!isMountedRef.current) return;

          setSession(null);
          setUser(null);
          setProfile(null);
          setLoading(false);
        }
      });

      return authQueueRef.current;
    },
    [applyProfile]
  );

  const refreshProfile = useCallback(async () => {
    await applyProfile(user);
  }, [applyProfile, user]);

  useEffect(() => {
    isMountedRef.current = true;

    void syncAuthState();

    const { data } = authService.onAuthStateChange(
      async (_event, nextSession): Promise<void> => {
        await syncAuthState(nextSession);
      }
    );

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        void syncAuthState();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      isMountedRef.current = false;
      data.subscription.unsubscribe();
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [syncAuthState]);

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