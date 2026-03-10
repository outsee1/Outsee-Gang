import { useState } from "react";
import { Search, User, X } from "lucide-react";
import brandLogo from "@/assets/brand-logo.png";

interface HeaderProps {
  onProfileClick: () => void;
}

const Header = ({ onProfileClick }: HeaderProps) => {
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/95 backdrop-blur-sm">
      <div className="container flex h-16 items-center justify-between gap-4">
        {/* Logo */}
        <a href="/" className="flex-shrink-0">
          <img src={brandLogo} alt="Logo da marca" className="h-10 w-10 invert" />
        </a>

        {/* Search bar - center */}
        <div className="relative flex max-w-md flex-1 items-center">
          {searchOpen ? (
            <div className="flex w-full items-center gap-2 border-b border-foreground">
              <Search className="h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Buscar peças..."
                autoFocus
                className="w-full bg-transparent py-2 font-body text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
              />
              <button onClick={() => { setSearchOpen(false); setQuery(""); }}>
                <X className="h-4 w-4 text-muted-foreground hover:text-foreground" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setSearchOpen(true)}
              className="flex items-center gap-2 border border-border px-4 py-2 text-sm text-muted-foreground transition-colors hover:border-foreground hover:text-foreground"
            >
              <Search className="h-4 w-4" />
              <span>Buscar</span>
            </button>
          )}
        </div>

        {/* Profile */}
        <button
          onClick={onProfileClick}
          className="flex-shrink-0 border border-border p-2 transition-colors hover:border-foreground hover:text-foreground"
        >
          <User className="h-5 w-5" />
        </button>
      </div>
    </header>
  );
};

export default Header;
