import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Pencil, Plus } from "lucide-react";
import { useProducts, Product } from "@/hooks/useProducts";
import { isAdminActive } from "@/hooks/useAdmin";
import AdminProductModal from "@/components/AdminProductModal";

const ProductGrid = () => {
  const navigate = useNavigate();
  const { data: products = [], isLoading } = useProducts();
  const admin = isAdminActive();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [createOpen, setCreateOpen] = useState(false);

  const categories = [...new Set(products.map((p) => p.category))];
  const filtered = products.filter((p) => !selectedCategory || p.category === selectedCategory);

  if (isLoading) {
    return (
      <section className="container py-12">
        <p className="text-center font-body text-sm text-muted-foreground">Carregando produtos...</p>
      </section>
    );
  }

  return (
    <section className="container py-12">
      <div className="mb-8 flex items-center justify-between">
        <h2 className="font-display text-xl font-semibold uppercase tracking-wider text-foreground">
          Coleção
        </h2>
        <div className="flex items-center gap-3">
          {admin && (
            <button
              onClick={() => setCreateOpen(true)}
              className="flex items-center gap-2 border border-accent px-4 py-2 font-body text-xs uppercase tracking-widest text-accent transition-colors hover:bg-accent hover:text-accent-foreground"
            >
              <Plus className="h-4 w-4" />
              Adicionar
            </button>
          )}
          <span className="font-body text-xs uppercase tracking-widest text-muted-foreground">
            {filtered.length} peças
          </span>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-8 flex flex-wrap gap-6">
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
          {filtered.map((product) => {
            const mainImage = product.colors.length > 0
              ? product.colors[0].image_url
              : product.image_url;

            return (
              <div
                key={product.id}
                className="group relative cursor-pointer bg-background"
              >
                <div
                  onClick={() => navigate(`/produto/${product.id}`)}
                  className="relative aspect-square overflow-hidden"
                >
                  {mainImage ? (
                    <img
                      src={mainImage}
                      alt={product.name}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      loading="lazy"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-secondary">
                      <span className="font-body text-xs text-muted-foreground">Sem imagem</span>
                    </div>
                  )}
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
                <div className="flex items-center justify-between p-4">
                  <div>
                    <h3 className="font-body text-sm font-medium text-foreground">{product.name}</h3>
                    <p className="mt-1 font-body text-sm text-muted-foreground">
                      R$ {product.price.toLocaleString("pt-BR")}
                    </p>
                  </div>
                  {admin && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditProduct(product);
                      }}
                      className="p-2 text-muted-foreground transition-colors hover:text-foreground"
                      title="Editar produto"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <AdminProductModal
        isOpen={!!editProduct}
        onClose={() => setEditProduct(null)}
        product={editProduct}
      />
      <AdminProductModal
        isOpen={createOpen}
        onClose={() => setCreateOpen(false)}
        product={null}
      />
    </section>
  );
};

export default ProductGrid;
