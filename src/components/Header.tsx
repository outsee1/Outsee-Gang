import { useEffect, useMemo, useRef, useState } from "react";
import { Search, User, ShoppingBag, X, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useCart } from "@/contexts/CartContext";
import { useProducts } from "@/hooks/useProducts";
import brandLogo from "@/assets/brand-logo.png";

interface HeaderProps {
  onProfileClick: () => void;
}

const Header = ({ onProfileClick }: HeaderProps) => {
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [debounced, setDebounced] = useState("");
  const navigate = useNavigate();
  const { totalItems, setCartOpen } = useCart();
  const { data: products, isLoading } = useProducts();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const t = setTimeout(() => setDebounced(query.trim().toLowerCase()), 150);
    return () => clearTimeout(t);
  }, [query]);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setSearchOpen(false);
      }
    };
    if (searchOpen) document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [searchOpen]);

  const results = useMemo(() => {
    if (!debounced) return [];
    return (products || [])
      .filter((p) =>
        p.name.toLowerCase().includes(debounced) ||
        p.category.toLowerCase().includes(debounced) ||
        (p.description || "").toLowerCase().includes(debounced)
      )
      .slice(0, 6);
  }, [products, debounced]);

  const goToProduct = (id: string) => {
    setSearchOpen(false);
    setQuery("");
    navigate(`/produto/${id}`);
  };

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/95 backdrop-blur-sm">
      <div className="container flex h-16 items-center justify-between gap-4">
        <a href="/" className="flex-shrink-0">
          <img src={brandLogo} alt="Outsee" className="h-10 w-auto" />
        </a>

        <div ref={containerRef} className="relative flex max-w-md flex-1 items-center">
          {searchOpen ? (
            <div className="relative w-full">
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

              {debounced && (
                <div className="absolute left-0 right-0 top-full z-40 mt-1 max-h-96 overflow-y-auto border border-border bg-card shadow-lg">
                  {isLoading ? (
                    <div className="flex items-center justify-center gap-2 p-4 font-body text-xs text-muted-foreground">
                      <Loader2 className="h-3 w-3 animate-spin" /> Buscando...
                    </div>
                  ) : results.length === 0 ? (
                    <div className="p-4 text-center font-body text-xs text-muted-foreground">
                      Nenhum produto encontrado para "{debounced}".
                    </div>
                  ) : (
                    results.map((p) => (
                      <button
                        key={p.id}
                        onClick={() => goToProduct(p.id)}
                        className="flex w-full items-center gap-3 border-b border-border p-3 text-left transition-colors last:border-b-0 hover:bg-secondary"
                      >
                        <div className="h-12 w-12 flex-shrink-0 overflow-hidden bg-secondary">
                          {p.image_url && (
                            <img src={p.image_url} alt={p.name} className="h-full w-full object-cover" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="truncate font-body text-sm text-foreground">{p.name}</p>
                          <p className="font-body text-[10px] uppercase tracking-widest text-muted-foreground">
                            {p.category}
                          </p>
                        </div>
                        <span className="font-display text-sm font-bold text-foreground">
                          R$ {p.price.toLocaleString("pt-BR")}
                        </span>
                      </button>
                    ))
                  )}
                </div>
              )}
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

        <div className="flex items-center gap-2">
          <button
            onClick={() => setCartOpen(true)}
            className="relative flex-shrink-0 border border-border p-2 transition-colors hover:border-foreground hover:text-foreground"
          >
            <ShoppingBag className="h-5 w-5" />
            {totalItems > 0 && (
              <span className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center bg-accent font-body text-[10px] font-bold text-accent-foreground">
                {totalItems}
              </span>
            )}
          </button>
          <button
            onClick={onProfileClick}
            className="flex-shrink-0 border border-border p-2 transition-colors hover:border-foreground hover:text-foreground"
          >
            <User className="h-5 w-5" />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
