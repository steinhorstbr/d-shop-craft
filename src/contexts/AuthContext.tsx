import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User, Session } from "@supabase/supabase-js";

type UserRole = "super_admin" | "store_admin" | null;

interface AuthContextType {
  user: User | null;
  session: Session | null;
  role: UserRole;
  storeId: string | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [role, setRole] = useState<UserRole>(null);
  const [storeId, setStoreId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUserRole = async (userId: string) => {
    const { data } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .single();
    
    if (data) {
      setRole(data.role as UserRole);
    }
  };

  const fetchStoreId = async (userId: string) => {
    const { data } = await supabase
      .from("stores")
      .select("id")
      .eq("user_id", userId)
      .single();
    
    if (data) {
      setStoreId(data.id);
    }
  };

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          await fetchUserRole(session.user.id);
          await fetchStoreId(session.user.id);
        } else {
          setRole(null);
          setStoreId(null);
        }
        setLoading(false);
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchUserRole(session.user.id);
        fetchStoreId(session.user.id);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error as Error | null };
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
        emailRedirectTo: window.location.origin,
      },
    });

    if (!error && data.user) {
      // Manually create profile, role, and store since triggers are not set up
      const userId = data.user.id;

      // Create profile
      await supabase.from("profiles").upsert({
        user_id: userId,
        full_name: fullName,
        email,
      }, { onConflict: "user_id" });

      // Create store_admin role
      await supabase.from("user_roles").upsert({
        user_id: userId,
        role: "store_admin" as const,
      }, { onConflict: "user_id" });

      // Get trial plan and create store
      const { data: trialPlan } = await supabase
        .from("subscription_plans")
        .select("id")
        .eq("is_trial", true)
        .eq("is_active", true)
        .limit(1)
        .single();

      await supabase.from("stores").insert({
        user_id: userId,
        name: "Minha Loja 3D",
        subscription_plan_id: trialPlan?.id || null,
        subscription_status: "trial",
      });
    }

    return { error: error as Error | null };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setRole(null);
    setStoreId(null);
  };

  return (
    <AuthContext.Provider value={{ user, session, role, storeId, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}
