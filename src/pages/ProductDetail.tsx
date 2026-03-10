import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import Header from "@/components/Header";
import ProfileModal from "@/components/ProfileModal";

import product1 from "@/assets/product-1.jpg";
import product2 from "@/assets/product-2.jpg";
import product3 from "@/assets/product-3.jpg";
import product4 from "@/assets/product-4.jpg";
import product5 from "@/assets/product-5.jpg";

const allProducts = [
  { id: "1", image: product1, name: "Sobretudo Noir", price: "R$ 2.890", tag: "NOVO", description: "Sobretudo oversized em lã premium com forro acetinado. Silhueta ampla que desafia o convencional. Perfeito para transições de estação." },
  { id: "2", image: product2, name: "Blazer Marfim", price: "R$ 2.290", tag: null, description: "Blazer desestruturado em tom marfim com acabamento raw-edge. Corte contemporâneo que transita entre o formal e o streetwear." },
  { id: "3", image: product3, name: "Calça Estrutura", price: "R$ 1.190", tag: "NOVO", description: "Calça de alfaiataria com recortes assimétricos e cintura alta. Tecido com elastano para conforto sem perder a forma." },
  { id: "4", image: product4, name: "Tricot Grafite", price: "R$ 890", tag: null, description: "Tricot pesado em fio 100% algodão egípcio. Textura grossa com caimento perfeito. Peça atemporal para o guarda-roupa underground." },
  { id: "5", image: product5, name: "Camisa Assimétrica", price: "R$ 990", tag: null, description: "Camisa em algodão com barra e colarinho assimétricos. Detalhes em costura aparente. Para quem não segue regras." },
  { id: "6", image: product1, name: "Sobretudo Noir II", price: "R$ 3.190", tag: "ESGOTANDO", description: "Segunda edição do Sobretudo Noir, agora com bolsos internos e forro térmico. Produção limitada — últimas unidades." },
];

const sizes = ["PP", "P", "M", "G", "GG"];

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [profileOpen, setProfileOpen] = useState(false);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);

  const product = allProducts.find((p) => p.id === id);

  if (!product) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <p className="font-body text-muted-foreground">Produto não encontrado.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header onProfileClick={() => setProfileOpen(true)} />

      <div className="container py-8">
        {/* Back */}
        <button
          onClick={() => navigate(-1)}
          className="mb-6 flex items-center gap-2 font-body text-xs uppercase tracking-widest text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar
        </button>

        <div className="grid gap-8 md:grid-cols-2">
          {/* Image */}
          <div className="relative aspect-[3/4] overflow-hidden bg-secondary">
            <img
              src={product.image}
              alt={product.name}
              className="h-full w-full object-cover"
            />
            {product.tag && (
              <span className="absolute left-4 top-4 bg-accent px-3 py-1 font-body text-[10px] font-semibold uppercase tracking-wider text-accent-foreground">
                {product.tag}
              </span>
            )}
          </div>

          {/* Info */}
          <div className="flex flex-col justify-center gap-6">
            <div>
              <h1 className="font-display text-2xl font-bold uppercase tracking-wider text-foreground md:text-3xl">
                {product.name}
              </h1>
              <p className="mt-2 font-display text-xl text-foreground">{product.price}</p>
            </div>

            <p className="font-body text-sm leading-relaxed text-muted-foreground">
              {product.description}
            </p>

            {/* Sizes */}
            <div>
              <p className="mb-3 font-body text-xs uppercase tracking-widest text-muted-foreground">
                Tamanho
              </p>
              <div className="flex gap-2">
                {sizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`flex h-10 w-10 items-center justify-center border font-body text-xs transition-colors ${
                      selectedSize === size
                        ? "border-foreground bg-foreground text-background"
                        : "border-border text-foreground hover:border-foreground"
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Buy button */}
            <button
              disabled={!selectedSize}
              className="mt-2 w-full bg-foreground py-4 font-body text-xs uppercase tracking-widest text-background transition-opacity hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {selectedSize ? "Adicionar ao carrinho" : "Selecione um tamanho"}
            </button>

            {/* Details */}
            <div className="space-y-3 border-t border-border pt-6">
              <div className="flex justify-between font-body text-xs uppercase tracking-widest text-muted-foreground">
                <span>Material</span>
                <span className="text-foreground">Premium</span>
              </div>
              <div className="flex justify-between font-body text-xs uppercase tracking-widest text-muted-foreground">
                <span>Envio</span>
                <span className="text-foreground">5-7 dias úteis</span>
              </div>
              <div className="flex justify-between font-body text-xs uppercase tracking-widest text-muted-foreground">
                <span>Devoluções</span>
                <span className="text-foreground">30 dias</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <ProfileModal isOpen={profileOpen} onClose={() => setProfileOpen(false)} />
    </div>
  );
};

export default ProductDetail;
