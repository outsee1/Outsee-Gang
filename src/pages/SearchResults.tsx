import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Loader2, Search } from "lucide-react";
import Header from "@/components/Header";
import ProfileModal from "@/components/ProfileModal";
import CartSlidePanel from "@/components/CartSlidePanel";
import { useCart } from "@/contexts/CartContext";
import { useProducts } from "@/hooks/useProducts";

const SearchResults = () => {
  const [params, setParams] = useSearchParams();
  const initial = params.get("q") || "";
  const [query, setQuery] = useState(initial);
  const [profileOpen, setProfileOpen] = useState(false);
  const { cartOpen, setCartOpen } = useCart();
  const { data: products, isLoading } = useProducts();
  const navigate = useNavigate();

  useEffect(() => {
    const t = setTimeout(() => {
      if (query) setParams({ q: query }, { replace: true });
      else setParams({}, { replace: true });
    }, 200);
    return () => clearTimeout(t);
  }, [query, setParams]);

  const q = (params.get("q") || "").trim().toLowerCase();
  const results = useMemo(() => {
    if (!q) return products || [];
    return (products || []).filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        (p.description || "").toLowerCase().includes(q)
    );
  }, [products, q]);

  return (
    <div className="min-h-screen bg-background">
      <Header onProfileClick={() => setProfileOpen(true)} />
      <div className="container py-10">
        <h1 className="mb-2 font-display text-3xl font-bold uppercase tracking-wider text-foreground">
          Resultados da busca
        </h1>
        <p className="mb-6 font-body text-xs uppercase tracking-widest text-muted-foreground">
          {isLoading ? "Carregando..." : `${results.length} produto(s)`}{q ? ` para "${q}"` : ""}
        </p>

        <div className="mb-8 flex max-w-xl items-center gap-2 border-b border-foreground">
          <Search className="h-4 w-4 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar peças..."
            className="w-full bg-transparent py-2 font-body text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
          />
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : results.length === 0 ? (
          <div className="border border-border p-10 text-center font-body text-sm text-muted-foreground">
            Nenhum produto encontrado{q ? ` para "${q}"` : ""}.
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-4">
            {results.map((p) => (
              <button
                key={p.id}
                onClick={() => navigate(`/produto/${p.id}`)}
                className="group text-left"
              >
                <div className="aspect-square overflow-hidden bg-secondary">
                  {p.image_url && (
                    <img
                      src={p.image_url}
                      alt={p.name}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  )}
                </div>
                <p className="mt-3 font-body text-sm text-foreground">{p.name}</p>
                <p className="font-body text-[10px] uppercase tracking-widest text-muted-foreground">
                  {p.category}
                </p>
                <p className="mt-1 font-display text-sm font-bold text-foreground">
                  R$ {p.price.toLocaleString("pt-BR")}
                </p>
              </button>
            ))}
          </div>
        )}
      </div>
      <ProfileModal isOpen={profileOpen} onClose={() => setProfileOpen(false)} />
      <CartSlidePanel isOpen={cartOpen} onClose={() => setCartOpen(false)} />
    </div>
  );
};

export default SearchResults;