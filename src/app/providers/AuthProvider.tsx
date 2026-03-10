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
  const syncInFlightRef = useRef<Promise<void> | null>(null);

  const loadProfileByUser = useCallback(async (nextUser: User | null) => {
    if (!nextUser) {
      if (!mountedRef.current) return;
      setProfile(null);
      return;
    }

    try {
      const nextProfile = await profileService.getProfileByUserId(nextUser.id);

      if (!mountedRef.current) return;

      if (nextProfile?.is_blocked) {
        try {
          await authService.signOut();
        } catch (error) {
          console.error("Erro ao deslogar usuário bloqueado:", error);
        }

        setSession(null);
        setUser(null);
        setProfile(null);
        return;
      }

      setProfile(nextProfile);
    } catch (error) {
      console.error("Erro ao carregar profile:", error);

      if (!mountedRef.current) return;
      setProfile(null);
    }
  }, []);

  const syncSession = useCallback(
    async (nextSession?: Session | null) => {
      if (syncInFlightRef.current) {
        await syncInFlightRef.current;
      }

      const task = (async () => {
        try {
          const resolvedSession =
            nextSession === undefined
              ? await authService.getSession()
              : nextSession;

          if (!mountedRef.current) return;

          setSession(resolvedSession);
          setUser(resolvedSession?.user ?? null);

          await loadProfileByUser(resolvedSession?.user ?? null);

          if (!mountedRef.current) return;
          setLoading(false);
        } catch (error) {
          console.error("Erro ao sincronizar autenticação:", error);

          if (!mountedRef.current) return;

          setSession(null);
          setUser(null);
          setProfile(null);
          setLoading(false);
        }
      })();

      syncInFlightRef.current = task;

      try {
        await task;
      } finally {
        if (syncInFlightRef.current === task) {
          syncInFlightRef.current = null;
        }
      }
    },
    [loadProfileByUser]
  );

  const refreshProfile = useCallback(async () => {
    if (!user) {
      setProfile(null);
      return;
    }

    await loadProfileByUser(user);
  }, [user, loadProfileByUser]);

  useEffect(() => {
    mountedRef.current = true;

    void syncSession();

    const { data } = authService.onAuthStateChange(
      async (_event, nextSession): Promise<void> => {
        queueMicrotask(() => {
          void syncSession(nextSession);
        });
      }
    );

    return () => {
      mountedRef.current = false;
      data.subscription.unsubscribe();
    };
  }, [syncSession]);

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