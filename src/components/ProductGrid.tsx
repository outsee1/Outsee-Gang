import { useNavigate } from "react-router-dom";
import product1 from "@/assets/product-1.jpg";
import product2 from "@/assets/product-2.jpg";
import product3 from "@/assets/product-3.jpg";
import product4 from "@/assets/product-4.jpg";
import product5 from "@/assets/product-5.jpg";

const products = [
  { id: "1", image: product1, name: "Sobretudo Noir", price: "R$ 2.890", tag: "NOVO" },
  { id: "2", image: product2, name: "Blazer Marfim", price: "R$ 2.290", tag: null },
  { id: "3", image: product3, name: "Calça Estrutura", price: "R$ 1.190", tag: "NOVO" },
  { id: "4", image: product4, name: "Tricot Grafite", price: "R$ 890", tag: null },
  { id: "5", image: product5, name: "Camisa Assimétrica", price: "R$ 990", tag: null },
  { id: "6", image: product1, name: "Sobretudo Noir II", price: "R$ 3.190", tag: "ESGOTANDO" },
];

const ProductGrid = () => {
  const navigate = useNavigate();

  return (
    <section className="container py-12">
      <div className="mb-8 flex items-center justify-between">
        <h2 className="font-display text-xl font-semibold uppercase tracking-wider text-foreground">
          Coleção
        </h2>
        <span className="font-body text-xs uppercase tracking-widest text-muted-foreground">
          {products.length} peças
        </span>
      </div>

      <div className="grid grid-cols-2 gap-px bg-border md:grid-cols-3">
        {products.map((product) => (
          <div
            key={product.id}
            onClick={() => navigate(`/produto/${product.id}`)}
            className="group relative cursor-pointer bg-background"
          >
            <div className="relative aspect-[3/4] overflow-hidden">
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
    </section>
  );
};

export default ProductGrid;
