"use client";

import {
  createContext,
  useMemo,
  useCallback,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";

export type Session = {
  id?: string;
  name?: string | null;
  email?: string;
  role?: string;
  isFounder?: boolean;
  status?: string;
  emailVerified?: boolean;
  emailVerifiedAt?: string | null;
  onboardingCompleted?: boolean;
  onboardingStep?: number;
  brandBriefCompleted?: boolean;
  brandBriefOnboardingCompleted?: boolean;
  calendarOnboardingCompleted?: boolean;
  visualOnboardingCompleted?: boolean;
  fullManagementOnboardingCompleted?: boolean;
  pendingPlanCode?: string | null;
  avatarStorageKey?: string | null;
  avatarUrl?: string | null;
  avatarVersion?: number | null;
  permissions?: string[];
  subscription?: {
    planCode?: string;
    planCategory?: string;
    status?: string;
    priceType?: string;
  } | null;
};

type SessionContextType = {
  session: Session | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  updateSession: (data: Partial<Session>) => void;
};

const SessionContext = createContext<SessionContextType | undefined>(undefined);

export function SessionProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const updateSession = useCallback((data: Partial<Session>) => {
    setSession((prev) => {
      if (!prev) return null;
      const next = { ...prev, ...data };
      
      // Also apply mapping if profile data is provided in the partial update
      if ((data as any)?.profile?.avatar) {
        next.avatarUrl = (data as any).profile.avatar.url;
        next.avatarVersion = (data as any).profile.avatar.version;
      }
      if ((data as any)?.profile?.fullName) {
        next.name = (data as any).profile.fullName;
      } else if ((data as any)?.fullName) {
        next.name = (data as any).fullName;
      }

      if ((data as any)?.business?.name) {
        next.businessName = (data as any).business.name;
      } else if ((data as any)?.businessName) {
        next.businessName = (data as any).businessName;
      }
      
      return next;
    });
  }, []);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/me", {
        cache: "no-store",
        credentials: "include",
      });
      if (!res.ok) {
        if (res.status !== 401) {
          console.error("[SessionProvider] /api/auth/me failed", {
            status: res.status,
            statusText: res.statusText,
          });
        }
        setSession(null);
        setLoading(false);
        return;
      }
      const data = await res.json();
      
      // Map nested avatar data to top-level session properties if it exists
      if (data?.profile?.avatar) {
        data.avatarUrl = data.profile.avatar.url;
        data.avatarVersion = data.profile.avatar.version;
      }
      // Handle various name property names from backend
      if (data?.profile?.fullName) {
        data.name = data.profile.fullName;
      } else if (data?.fullName) {
        data.name = data.fullName;
      }
      
      // Handle business name mapping
      if (data?.business?.name) {
        data.businessName = data.business.name;
      } else if (data?.businessName) {
        data.businessName = data.businessName;
      }
      
      setSession(data);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Unable to load session.";
      console.error("[SessionProvider] /api/auth/me error", { message, err });
      setError(message);
      setSession(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const value = useMemo(
    () => ({ session, loading, error, refresh, updateSession }),
    [session, loading, error, refresh, updateSession]
  );

  return (
    <SessionContext.Provider value={value}>
      {children}
    </SessionContext.Provider>
  );
}

export function useSessionContext() {
  const ctx = useContext(SessionContext);
  if (!ctx) {
    throw new Error("useSessionContext must be used within a SessionProvider");
  }
  return ctx;
}
