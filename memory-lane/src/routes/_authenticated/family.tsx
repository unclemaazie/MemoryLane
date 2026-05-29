import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";

export const Route = createFileRoute("/_authenticated/family")({
  component: FamilyPage,
});

type Invite = { id: string; email: string; label: string | null; created_at: string };

function FamilyPage() {
  const { profile, user } = useAuth();
  const qc = useQueryClient();
  const [email, setEmail] = useState("");
  const [label, setLabel] = useState("");
  const [error, setError] = useState<string | null>(null);

  const { data: invites = [], isLoading } = useQuery({
    queryKey: ["invites"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("family_invites")
        .select("*")
        .order("created_at", { ascending: true });
      if (error) throw error;
      return data as Invite[];
    },
  });

  if (!profile?.is_owner) {
    return <p className="text-muted-foreground">Only the family owner can manage invites.</p>;
  }

  const add = async (e: React.FormEvent) => {
    e.preventDefault(); setError(null);
    const { error } = await supabase.from("family_invites").insert({
      email: email.trim().toLowerCase(),
      label: label.trim() || null,
      invited_by: user!.id,
    });
    if (error) setError(error.message);
    else {
      setEmail(""); setLabel("");
      qc.invalidateQueries({ queryKey: ["invites"] });
    }
  };

  const remove = async (id: string) => {
    await supabase.from("family_invites").delete().eq("id", id);
    qc.invalidateQueries({ queryKey: ["invites"] });
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="font-serif italic text-4xl">Family</h1>
      <p className="text-muted-foreground mt-2">
        Add an email to invite someone in. They'll sign up at the login page with that exact email.
      </p>

      <form onSubmit={add} className="mt-8 bg-card border border-border rounded-md p-6 space-y-4">
        <div className="grid sm:grid-cols-2 gap-3">
          <input
            type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
            placeholder="email@example.com"
            className="px-3 py-2 bg-background border border-border rounded text-sm"
          />
          <input
            value={label} onChange={(e) => setLabel(e.target.value)}
            placeholder="Label (Mum, Dad, …)"
            className="px-3 py-2 bg-background border border-border rounded text-sm"
          />
        </div>
        {error && <p className="text-sm text-destructive">{error}</p>}
        <button className="bg-primary text-primary-foreground px-4 py-2 rounded text-sm">Add to family</button>
      </form>

      <div className="mt-10">
        <h2 className="font-serif text-2xl mb-4">Invited</h2>
        {isLoading && <p className="text-muted-foreground">Loading…</p>}
        {invites.length === 0 && !isLoading && (
          <p className="text-muted-foreground italic">No one invited yet.</p>
        )}
        <ul className="divide-y divide-border border border-border rounded-md overflow-hidden bg-card">
          {invites.map((i) => (
            <li key={i.id} className="flex items-center justify-between px-4 py-3">
              <div>
                <p className="text-sm text-foreground">{i.label ?? i.email}</p>
                {i.label && <p className="text-xs text-muted-foreground">{i.email}</p>}
              </div>
              <button onClick={() => remove(i.id)} className="text-xs text-destructive hover:underline">Remove</button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
