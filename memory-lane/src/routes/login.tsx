import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";

export const Route = createFileRoute("/login")({
  component: LoginPage,
});

function LoginPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => { if (user) navigate({ to: "/" }); }, [user, navigate]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null); setLoading(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email, password,
          options: { data: { display_name: name || email.split("@")[0] }, emailRedirectTo: window.location.origin },
        });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
      navigate({ to: "/" });
    } catch (err) {
      setError((err as Error).message);
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6 grain">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">A family archive</p>
          <h1 className="font-serif italic text-5xl mt-2">Memory Lane</h1>
        </div>
        <form onSubmit={onSubmit} className="bg-card border border-border rounded-md p-8 space-y-4">
          <h2 className="font-serif text-2xl">{mode === "signin" ? "Welcome back" : "Create your account"}</h2>
          {mode === "signup" && (
            <input
              type="text" value={name} onChange={(e) => setName(e.target.value)}
              placeholder="Your name (Mum, Dad, …)"
              className="w-full px-3 py-2 bg-background border border-border rounded text-sm"
            />
          )}
          <input
            type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            className="w-full px-3 py-2 bg-background border border-border rounded text-sm"
          />
          <input
            type="password" required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)}
            placeholder="Password (min 8 chars)"
            className="w-full px-3 py-2 bg-background border border-border rounded text-sm"
          />
          {error && <p className="text-sm text-destructive">{error}</p>}
          <button
            disabled={loading}
            className="w-full bg-primary text-primary-foreground rounded py-2.5 text-sm disabled:opacity-50"
          >
            {loading ? "Please wait…" : mode === "signin" ? "Sign in" : "Create account"}
          </button>
          <button
            type="button"
            onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
            className="block w-full text-center text-xs text-muted-foreground hover:text-foreground"
          >
            {mode === "signin" ? "Don't have an account? Create one" : "Already have an account? Sign in"}
          </button>
        </form>
        <p className="text-center text-xs text-muted-foreground mt-6">
          Invite-only. Ask the family owner to add your email first.
        </p>
      </div>
    </div>
  );
}
