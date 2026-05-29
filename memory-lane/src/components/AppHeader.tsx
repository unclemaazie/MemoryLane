import { Link, useRouterState } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth-context";

export function AppHeader() {
  const { profile, signOut } = useAuth();
  const path = useRouterState({ select: (s) => s.location.pathname });
  const navItem = (to: string, label: string) => (
    <Link
      to={to}
      className={`text-xs sm:text-sm tracking-wide transition-colors whitespace-nowrap ${
        path === to ? "text-foreground" : "text-muted-foreground hover:text-foreground"
      }`}
    >
      {label}
    </Link>
  );
  return (
    <header className="sticky top-0 z-30 backdrop-blur-md bg-background/80 border-b border-border/60">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-3 sm:py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-6">
        <Link to="/" className="font-serif text-xl sm:text-2xl italic">Memory Lane</Link>
        <nav className="flex flex-wrap items-center gap-3 sm:gap-6 w-full sm:w-auto">
          {navItem("/", "Library")}
          {navItem("/upload", "Add")}
          {profile?.is_owner && navItem("/family", "Family")}
          <div className="flex items-center gap-2 sm:gap-3 sm:pl-6 sm:border-l border-border/60">
            <span className="text-xs text-muted-foreground hidden sm:inline">
              {profile?.display_name ?? profile?.email}
            </span>
            <button onClick={signOut} className="text-xs text-muted-foreground hover:text-foreground">
              Sign out
            </button>
          </div>
        </nav>
      </div>
    </header>
  );
}
