import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { useQueryClient } from "@tanstack/react-query";

export const Route = createFileRoute("/_authenticated/upload")({
  component: UploadPage,
});

function UploadPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [kind, setKind] = useState<"photo" | "video" | "note">("photo");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [takenAt, setTakenAt] = useState(new Date().toISOString().slice(0, 10));
  const [tags, setTags] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setBusy(true); setError(null);
    try {
      let media_path: string | null = null;
      if (kind !== "note") {
        if (!file) throw new Error("Please choose a file.");
        const ext = file.name.split(".").pop() ?? "bin";
        const path = `${user.id}/${crypto.randomUUID()}.${ext}`;
        const { error: upErr } = await supabase.storage.from("memories").upload(path, file);
        if (upErr) throw upErr;
        media_path = path;
      }
      const { error: insErr } = await supabase.from("memories").insert({
        author_id: user.id,
        kind,
        title: title || null,
        body: body || null,
        media_path,
        taken_at: takenAt,
        tags: tags.split(",").map((t) => t.trim()).filter(Boolean),
      });
      if (insErr) throw insErr;
      qc.invalidateQueries({ queryKey: ["memories"] });
      navigate({ to: "/" });
    } catch (err) {
      setError((err as Error).message);
    } finally { setBusy(false); }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="font-serif italic text-4xl mb-8">Add a memory</h1>
      <form onSubmit={onSubmit} className="space-y-5 bg-card border border-border rounded-md p-8">
        <div className="flex gap-2">
          {(["photo", "video", "note"] as const).map((k) => (
            <button
              type="button" key={k}
              onClick={() => setKind(k)}
              className={`flex-1 py-2 text-sm rounded capitalize transition-colors ${
                kind === k ? "bg-primary text-primary-foreground" : "bg-background border border-border text-muted-foreground hover:text-foreground"
              }`}
            >{k}</button>
          ))}
        </div>

        {kind !== "note" && (
          <div>
            <label className="block text-xs uppercase tracking-wide text-muted-foreground mb-2">File</label>
            <input
              type="file"
              accept={kind === "photo" ? "image/*" : "video/*"}
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              className="w-full text-sm"
              required
            />
          </div>
        )}

        <div>
          <label className="block text-xs uppercase tracking-wide text-muted-foreground mb-2">Title</label>
          <input value={title} onChange={(e) => setTitle(e.target.value)} className="w-full px-3 py-2 bg-background border border-border rounded text-sm" />
        </div>

        <div>
          <label className="block text-xs uppercase tracking-wide text-muted-foreground mb-2">
            {kind === "note" ? "The note" : "Caption"}
          </label>
          <textarea
            value={body} onChange={(e) => setBody(e.target.value)} rows={kind === "note" ? 6 : 3}
            required={kind === "note"}
            className="w-full px-3 py-2 bg-background border border-border rounded text-sm font-serif"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs uppercase tracking-wide text-muted-foreground mb-2">Date</label>
            <input type="date" value={takenAt} onChange={(e) => setTakenAt(e.target.value)} className="w-full px-3 py-2 bg-background border border-border rounded text-sm" />
          </div>
          <div>
            <label className="block text-xs uppercase tracking-wide text-muted-foreground mb-2">Tags (comma separated)</label>
            <input value={tags} onChange={(e) => setTags(e.target.value)} placeholder="park, smile" className="w-full px-3 py-2 bg-background border border-border rounded text-sm" />
          </div>
        </div>

        {error && <p className="text-sm text-destructive">{error}</p>}

        <button disabled={busy} className="w-full bg-primary text-primary-foreground rounded py-2.5 text-sm disabled:opacity-50">
          {busy ? "Saving…" : "Save memory"}
        </button>
      </form>
    </div>
  );
}
