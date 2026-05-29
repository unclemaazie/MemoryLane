import type { MemoryWithAuthor } from "@/lib/memories";
import { MemoryCard, Media } from "./MemoryCard";
import { Link } from "@tanstack/react-router";
import { formatDate } from "@/lib/memories";

function groupByMonth(items: MemoryWithAuthor[]) {
  const map = new Map<string, MemoryWithAuthor[]>();
  for (const m of items) {
    const d = new Date(m.taken_at);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const arr = map.get(key) ?? [];
    arr.push(m);
    map.set(key, arr);
  }
  return Array.from(map.entries()).sort((a, b) => (a[0] < b[0] ? 1 : -1));
}

export function TimelineLayout({ items }: { items: MemoryWithAuthor[] }) {
  const groups = groupByMonth(items);
  return (
    <div className="space-y-16">
      {groups.map(([key, ms]) => {
        const d = new Date(`${key}-01`);
        const label = d.toLocaleDateString(undefined, { month: "long", year: "numeric" });
        return (
          <section key={key}>
            <h2 className="font-serif italic text-3xl mb-6 text-foreground/80">{label}</h2>
            <div className="space-y-12">
              {ms.map((m) => (
                <Link key={m.id} to="/memory/$id" params={{ id: m.id }} className="block group">
                  <div className="relative overflow-hidden rounded-md bg-muted aspect-[16/10] max-h-[70vh]">
                    <Media m={m} className="transition-transform duration-700 group-hover:scale-[1.02]" />
                  </div>
                  <div className="pt-4 flex items-baseline justify-between gap-4">
                    <h3 className="font-serif text-2xl">{m.title ?? "Untitled"}</h3>
                    <p className="text-sm text-muted-foreground shrink-0">
                      {formatDate(m.taken_at)}{m.author?.display_name && ` · ${m.author.display_name}`}
                    </p>
                  </div>
                  {m.body && <p className="mt-2 text-foreground/80 max-w-2xl">{m.body}</p>}
                </Link>
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}

export function MasonryLayout({ items }: { items: MemoryWithAuthor[] }) {
  return (
    <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 [column-fill:_balance]">
      {items.map((m, i) => {
        const aspects = ["aspect-[4/5]", "aspect-square", "aspect-[3/4]", "aspect-[4/3]", "aspect-[5/7]"];
        const ar = aspects[i % aspects.length];
        return (
          <div key={m.id} className="mb-6 break-inside-avoid">
            <MemoryCard m={m} aspect={ar} />
          </div>
        );
      })}
    </div>
  );
}

export function MagazineLayout({ items }: { items: MemoryWithAuthor[] }) {
  if (items.length === 0) return null;
  const [hero, ...rest] = items;
  return (
    <div className="space-y-12">
      <Link to="/memory/$id" params={{ id: hero.id }} className="block group">
        <div className="relative overflow-hidden rounded-md bg-muted aspect-[21/9]">
          <Media m={hero} className="transition-transform duration-1000 group-hover:scale-[1.03]" />
        </div>
        <div className="pt-5 max-w-3xl">
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Featured</p>
          <h2 className="font-serif text-4xl mt-2">{hero.title ?? "Untitled"}</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            {formatDate(hero.taken_at)}{hero.author?.display_name && ` · ${hero.author.display_name}`}
          </p>
          {hero.body && <p className="mt-3 text-foreground/80">{hero.body}</p>}
        </div>
      </Link>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {rest.map((m) => <MemoryCard key={m.id} m={m} />)}
      </div>
    </div>
  );
}

export function GalleryLayout({ items }: { items: MemoryWithAuthor[] }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
      {items.map((m) => (
        <Link key={m.id} to="/memory/$id" params={{ id: m.id }} className="group">
          <div className="bg-card p-2 pb-6 shadow-sm rotate-[-0.5deg] hover:rotate-0 transition-transform">
            <div className="aspect-square overflow-hidden bg-muted">
              <Media m={m} />
            </div>
            <p className="font-serif italic text-center mt-2 text-sm text-foreground/70 truncate">
              {m.title ?? formatDate(m.taken_at)}
            </p>
          </div>
        </Link>
      ))}
    </div>
  );
}
