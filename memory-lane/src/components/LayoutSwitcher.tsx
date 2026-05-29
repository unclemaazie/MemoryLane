import { useEffect, useState } from "react";

export type LayoutKey = "timeline" | "masonry" | "magazine" | "gallery";

const STORAGE_KEY = "memorylane.layout";

export function useLayoutPref(): [LayoutKey, (l: LayoutKey) => void] {
  const [layout, setLayout] = useState<LayoutKey>("timeline");
  useEffect(() => {
    const stored = typeof window !== "undefined" ? localStorage.getItem(STORAGE_KEY) : null;
    if (stored === "timeline" || stored === "masonry" || stored === "magazine" || stored === "gallery") {
      setLayout(stored);
    }
  }, []);
  const set = (l: LayoutKey) => {
    setLayout(l);
    if (typeof window !== "undefined") localStorage.setItem(STORAGE_KEY, l);
  };
  return [layout, set];
}

const options: { key: LayoutKey; label: string }[] = [
  { key: "timeline", label: "Timeline" },
  { key: "masonry", label: "Masonry" },
  { key: "magazine", label: "Magazine" },
  { key: "gallery", label: "Gallery" },
];

export function LayoutSwitcher({ value, onChange }: { value: LayoutKey; onChange: (l: LayoutKey) => void }) {
  return (
    <div className="inline-flex rounded-full border border-border bg-card p-1 text-xs">
      {options.map((o) => (
        <button
          key={o.key}
          onClick={() => onChange(o.key)}
          className={`px-3 py-1.5 rounded-full transition-all ${
            value === o.key
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
