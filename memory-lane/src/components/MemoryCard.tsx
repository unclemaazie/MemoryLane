import { Link } from "@tanstack/react-router";
import type { MemoryWithAuthor } from "@/lib/memories";
import { formatDate } from "@/lib/memories";

function Media({ m, className = "" }: { m: MemoryWithAuthor; className?: string }) {
  if (m.kind === "photo" && m.mediaUrl) {
    return <img src={m.mediaUrl} alt={m.title ?? ""} className={`w-full h-full object-cover ${className}`} loading="lazy" />;
  }
  if (m.kind === "video" && m.mediaUrl) {
    return <video src={m.mediaUrl} className={`w-full h-full object-cover ${className}`} muted playsInline preload="metadata" />;
  }
  return (
    <div className={`w-full h-full bg-card flex items-center justify-center p-6 ${className}`}>
      <p className="font-serif italic text-xl text-foreground/80 line-clamp-6 text-center">
        {m.body ?? m.title ?? "Untitled note"}
      </p>
    </div>
  );
}

export function MemoryCard({ m, aspect = "aspect-[4/5]" }: { m: MemoryWithAuthor; aspect?: string }) {
  return (
    <Link to="/memory/$id" params={{ id: m.id }} className="group block">
      <div className={`relative overflow-hidden rounded-md bg-muted ${aspect}`}>
        <Media m={m} className="transition-transform duration-700 group-hover:scale-[1.03]" />
      </div>
      <div className="pt-3">
        {m.title && <h3 className="font-serif text-lg leading-tight">{m.title}</h3>}
        <p className="text-xs text-muted-foreground mt-1">
          {formatDate(m.taken_at)}
          {m.author?.display_name && <> · {m.author.display_name}</>}
        </p>
      </div>
    </Link>
  );
}

export { Media };
