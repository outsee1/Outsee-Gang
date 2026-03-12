import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { products, categories } from "@/data/products";

const ProductGrid = () => {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const filtered = products.filter((p) => {
    return !selectedCategory || p.category === selectedCategory;
  });

  return (
    <section className="container py-12">
      <div className="mb-8 flex items-center justify-between">
        <h2 className="font-display text-xl font-semibold uppercase tracking-wider text-foreground">
          Coleção
        </h2>
        <span className="font-body text-xs uppercase tracking-widest text-muted-foreground">
          {filtered.length} peças
        </span>
      </div>

      {/* Filters */}
      <div className="mb-8 flex flex-wrap gap-6">
        {/* Category */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-body text-xs uppercase tracking-widest text-muted-foreground">Categoria:</span>
          <button
            onClick={() => setSelectedCategory(null)}
            className={`border px-3 py-1.5 font-body text-xs uppercase tracking-wider transition-colors ${
              !selectedCategory
                ? "border-foreground bg-foreground text-background"
                : "border-border text-muted-foreground hover:border-foreground hover:text-foreground"
            }`}
          >
            Todas
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`border px-3 py-1.5 font-body text-xs uppercase tracking-wider transition-colors ${
                selectedCategory === cat
                  ? "border-foreground bg-foreground text-background"
                  : "border-border text-muted-foreground hover:border-foreground hover:text-foreground"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

      </div>

      {filtered.length === 0 ? (
        <p className="py-12 text-center font-body text-sm text-muted-foreground">
          Nenhuma peça encontrada com os filtros selecionados.
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-px bg-border md:grid-cols-3">
          {filtered.map((product) => (
            <div
              key={product.id}
              onClick={() => navigate(`/produto/${product.id}`)}
              className="group relative cursor-pointer bg-background"
            >
              <div className="relative aspect-square overflow-hidden">
                <img
                  src={product.image}
                  alt={product.name}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-background/0 transition-colors duration-300 group-hover:bg-background/40" />
                <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                  <span className="border border-foreground px-6 py-2 font-body text-xs uppercase tracking-widest text-foreground">
                    Ver peça
                  </span>
                </div>
                {product.tag && (
                  <span className="absolute left-3 top-3 bg-accent px-2 py-1 font-body text-[10px] font-semibold uppercase tracking-wider text-accent-foreground">
                    {product.tag}
                  </span>
                )}
              </div>
              <div className="p-4">
                <h3 className="font-body text-sm font-medium text-foreground">{product.name}</h3>
                <p className="mt-1 font-body text-sm text-muted-foreground">{product.price}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
};

export default ProductGrid;
