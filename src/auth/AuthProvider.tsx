import * as React from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Session, User } from "@supabase/supabase-js";

/**
 * ScamShield runs a single staff identity store: Supabase Auth users whose
 * profile row lives in `admin_profiles`. There is no public sign-up — a super
 * admin provisions every account through the `create-admin` edge function.
 */
export type Profile = {
  id: string;
  email: string | null;
  full_name: string | null;
  created_at?: string;
  [key: string]: unknown;
};

type SignInResult = { error: string | null };

type SignUpResult = { error: string | null; needsConfirmation: boolean };

type AuthContextValue = {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  error: string | null;
  signIn: (email: string, password: string) => Promise<SignInResult>;
  signUp: (
    email: string,
    password: string,
    fullName?: string
  ) => Promise<SignUpResult>;
  resetPassword: (email: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<{ error: string | null }>;
  updateProfile: (
    fields: Partial<Profile>
  ) => Promise<{ error: string | null }>;
};

const AuthContext = React.createContext<AuthContextValue | null>(null);

type ProfileRow = {
  id: string;
  email: string | null;
  full_name: string | null;
  created_at?: string;
};

function toProfile(row: ProfileRow): Profile {
  return {
    id: row.id,
    email: row.email ?? null,
    full_name: row.full_name ?? null,
    created_at: row.created_at,
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = React.useState<Session | null>(null);
  const [user, setUser] = React.useState<User | null>(null);
  const [profile, setProfile] = React.useState<Profile | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const activeUserIdRef = React.useRef<string | null>(null);

  const loadProfile = React.useCallback(async (userId: string) => {
    // RLS only lets an admin read their own row (plus super admins reading all).
    const { data, error: selectError } = await supabase
      .from("admin_profiles")
      .select("id, email, full_name, created_at")
      .eq("id", userId)
      .maybeSingle();
    if (activeUserIdRef.current !== userId) return;
    if (selectError) {
      setError(selectError.message);
      setProfile(null);
      return;
    }
    setProfile(data ? toProfile(data) : null);
  }, []);

  React.useEffect(() => {
    // Subscribe before the initial read. The listener may deliver a fresher
    // session (INITIAL_SESSION / sign-in) while getSession() is still in
    // flight; once an event has arrived the late read must not overwrite it.
    let gotEvent = false;

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, nextSession) => {
        gotEvent = true;
        setError(null);
        setSession(nextSession);
        setUser(nextSession?.user ?? null);
        activeUserIdRef.current = nextSession?.user?.id ?? null;
        setLoading(false);
        if (nextSession?.user) {
          void loadProfile(nextSession.user.id);
        } else {
          setProfile(null);
        }
      }
    );

    supabase.auth
      .getSession()
      .then(({ data }) => {
        if (gotEvent) return;
        setSession(data.session);
        setUser(data.session?.user ?? null);
        activeUserIdRef.current = data.session?.user?.id ?? null;
        if (data.session?.user) {
          void loadProfile(data.session.user.id);
        }
      })
      .catch((err: unknown) => {
        // Surface the failure instead of swallowing it: leave the user
        // signed-out with the error available on the context.
        if (gotEvent) return;
        setError(err instanceof Error ? err.message : String(err));
      })
      .finally(() => setLoading(false));

    return () => {
      listener.subscription.unsubscribe();
    };
  }, [loadProfile]);

  const signIn = React.useCallback(
    async (email: string, password: string): Promise<SignInResult> => {
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      });
      return { error: error?.message ?? null };
    },
    []
  );

  const signUp = React.useCallback(
    async (): Promise<SignUpResult> => {
      // Sign-up is disabled at the project level and no client code may create
      // accounts: super admins use the create-admin edge function instead.
      return {
        error:
          "Self sign-up is disabled on ScamShield. Ask a super admin to create your staff account.",
        needsConfirmation: false,
      };
    },
    []
  );

  const resetPassword = React.useCallback(
    async (email: string): Promise<{ error: string | null }> => {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(
        email.trim().toLowerCase(),
        { redirectTo: window.location.origin }
      );
      return { error: resetError?.message ?? null };
    },
    []
  );

  const signOut = React.useCallback(
    async (): Promise<{ error: string | null }> => {
      const { error: signOutError } = await supabase.auth.signOut();
      const message = signOutError?.message ?? null;
      if (message) {
        setError(message);
      } else {
        setProfile(null);
      }
      return { error: message };
    },
    []
  );

  const updateProfile = React.useCallback(
    async (fields: Partial<Profile>): Promise<{ error: string | null }> => {
      if (!session?.user) {
        return { error: "Not signed in." };
      }
      // Only the display name is user-editable; role, status and permissions
      // stay server-managed.
      const patch: { full_name?: string } = {};
      if (typeof fields.full_name === "string") {
        patch.full_name = fields.full_name.trim();
      }
      if (!Object.keys(patch).length) {
        return { error: null };
      }
      const { error: updateError } = await supabase
        .from("admin_profiles")
        .update(patch)
        .eq("id", session.user.id);
      if (updateError) {
        return { error: updateError.message };
      }
      setProfile((prev) => (prev ? { ...prev, ...patch } : prev));
      return { error: null };
    },
    [session]
  );

  const value = React.useMemo<AuthContextValue>(
    () => ({
      user,
      session,
      profile,
      loading,
      error,
      signIn,
      signUp,
      resetPassword,
      signOut,
      updateProfile,
    }),
    [
      user,
      session,
      profile,
      loading,
      error,
      signIn,
      signUp,
      resetPassword,
      signOut,
      updateProfile,
    ]
  );

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}