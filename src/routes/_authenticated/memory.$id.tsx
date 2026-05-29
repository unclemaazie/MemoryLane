import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchMemory, formatDate } from "@/lib/memories";
import { Media } from "@/components/MemoryCard";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/memory/$id")({
  component: MemoryDetail,
});

function MemoryDetail() {
  const { id } = Route.useParams();
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { data: m, isLoading } = useQuery({
    queryKey: ["memory", id],
    queryFn: () => fetchMemory(id),
  });

  if (isLoading) return <p className="text-muted-foreground">Loading…</p>;
  if (!m) return <p className="text-muted-foreground">Memory not found.</p>;

  const canDelete = user && (m.author_id === user.id || profile?.is_owner);

  const onDelete = async () => {
    if (!confirm("Delete this memory? This can't be undone.")) return;
    if (m.media_path) await supabase.storage.from("memories").remove([m.media_path]);
    await supabase.from("memories").delete().eq("id", m.id);
    qc.invalidateQueries({ queryKey: ["memories"] });
    navigate({ to: "/" });
  };

  return (
    <article className="max-w-4xl mx-auto">
      <Link to="/" className="text-xs text-muted-foreground hover:text-foreground">← Back to library</Link>
      <div className="mt-6 rounded-md overflow-hidden bg-muted aspect-[16/10] max-h-[75vh]">
        {m.kind === "photo" && m.mediaUrl && <img src={m.mediaUrl} alt={m.title ?? ""} className="w-full h-full object-contain" />}
        {m.kind === "video" && m.mediaUrl && <video src={m.mediaUrl} controls className="w-full h-full" />}
        {m.kind === "note" && <Media m={m} />}
      </div>
      <div className="mt-8">
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
          {formatDate(m.taken_at)}{m.author?.display_name && ` · added by ${m.author.display_name}`}
        </p>
        {m.title && <h1 className="font-serif italic text-5xl mt-3">{m.title}</h1>}
        {m.kind !== "note" && m.body && <p className="mt-4 text-lg text-foreground/85 font-serif">{m.body}</p>}
        {m.tags.length > 0 && (
          <div className="mt-6 flex flex-wrap gap-2">
            {m.tags.map((t) => (
              <span key={t} className="text-xs px-2.5 py-1 rounded-full bg-card border border-border text-muted-foreground">#{t}</span>
            ))}
          </div>
        )}
        {canDelete && (
          <button onClick={onDelete} className="mt-10 text-xs text-destructive hover:underline">Delete this memory</button>
        )}
      </div>
    </article>
  );
}
