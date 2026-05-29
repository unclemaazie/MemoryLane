import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { fetchMemories } from "@/lib/memories";
import { LayoutSwitcher, useLayoutPref } from "@/components/LayoutSwitcher";
import {
  TimelineLayout, MasonryLayout, MagazineLayout, GalleryLayout,
} from "@/components/MemoryLayouts";
import { Link } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/")({
  component: Library,
});

function Library() {
  const [layout, setLayout] = useLayoutPref();
  const { data: memories = [], isLoading, error } = useQuery({
    queryKey: ["memories"],
    queryFn: fetchMemories,
  });

  return (
    <div>
      <div className="flex items-end justify-between gap-4 mb-10 flex-wrap">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">A family archive</p>
          <h1 className="font-serif italic text-5xl mt-2">Memory Lane</h1>
        </div>
        <LayoutSwitcher value={layout} onChange={setLayout} />
      </div>

      {error && <p className="text-destructive">{(error as Error).message}</p>}
      {isLoading && <p className="text-muted-foreground">Gathering memories…</p>}

      {!isLoading && memories.length === 0 && (
        <div className="text-center py-24 border border-dashed border-border rounded-md">
          <h2 className="font-serif text-3xl italic">No memories yet</h2>
          <p className="mt-3 text-muted-foreground">Start with a photo, a clip, or a note.</p>
          <Link to="/upload" className="inline-block mt-6 rounded-md bg-primary text-primary-foreground px-5 py-2.5 text-sm">
            Add the first memory
          </Link>
        </div>
      )}

      {memories.length > 0 && (
        <>
          {layout === "timeline" && <TimelineLayout items={memories} />}
          {layout === "masonry" && <MasonryLayout items={memories} />}
          {layout === "magazine" && <MagazineLayout items={memories} />}
          {layout === "gallery" && <GalleryLayout items={memories} />}
        </>
      )}
    </div>
  );
}
