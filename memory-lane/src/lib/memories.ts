import { supabase } from "@/integrations/supabase/client";

export type Memory = {
  id: string;
  author_id: string;
  kind: "photo" | "video" | "note";
  title: string | null;
  body: string | null;
  media_path: string | null;
  taken_at: string;
  tags: string[];
  created_at: string;
};

export type MemoryWithAuthor = Memory & {
  author?: { display_name: string | null; email: string } | null;
  mediaUrl?: string | null;
};

export async function fetchMemories(): Promise<MemoryWithAuthor[]> {
  const { data: memories, error } = await supabase
    .from("memories")
    .select("*")
    .order("taken_at", { ascending: false });
  if (error) throw error;
  if (!memories?.length) return [];

  const authorIds = Array.from(new Set(memories.map((m) => m.author_id)));
  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, display_name, email")
    .in("id", authorIds);
  const byId = new Map(profiles?.map((p) => [p.id, p]) ?? []);

  const withUrls = await Promise.all(
    memories.map(async (m) => {
      let mediaUrl: string | null = null;
      if (m.media_path) {
        const { data } = await supabase.storage
          .from("memories")
          .createSignedUrl(m.media_path, 60 * 60);
        mediaUrl = data?.signedUrl ?? null;
      }
      const author = byId.get(m.author_id);
      return {
        ...m,
        author: author ? { display_name: author.display_name, email: author.email } : null,
        mediaUrl,
      } as MemoryWithAuthor;
    })
  );
  return withUrls;
}

export async function fetchMemory(id: string): Promise<MemoryWithAuthor | null> {
  const { data: m, error } = await supabase.from("memories").select("*").eq("id", id).maybeSingle();
  if (error) throw error;
  if (!m) return null;
  const { data: author } = await supabase
    .from("profiles")
    .select("display_name, email")
    .eq("id", m.author_id)
    .maybeSingle();
  let mediaUrl: string | null = null;
  if (m.media_path) {
    const { data } = await supabase.storage
      .from("memories")
      .createSignedUrl(m.media_path, 60 * 60);
    mediaUrl = data?.signedUrl ?? null;
  }
  return { ...m, author, mediaUrl } as MemoryWithAuthor;
}

export function formatDate(d: string) {
  return new Date(d).toLocaleDateString(undefined, { day: "numeric", month: "long", year: "numeric" });
}
