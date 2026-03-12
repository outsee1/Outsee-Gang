import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import Header from "@/components/Header";
import ProfileModal from "@/components/ProfileModal";
import { useCart } from "@/contexts/CartContext";
import CartSlidePanel from "@/components/CartSlidePanel";
import { products } from "@/data/products";

const sizes = ["PP", "P", "M", "G", "GG"];

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [profileOpen, setProfileOpen] = useState(false);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const { addItem } = useCart();

  const product = products.find((p) => p.id === id);

  if (!product) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <p className="font-body text-muted-foreground">Produto não encontrado.</p>
      </div>
    );
  }

  const handleAddToCart = () => {
    if (!selectedSize) return;
    addItem({
      productId: product.id,
      name: product.name,
      price: product.price,
      priceNum: product.priceNum,
      size: selectedSize,
      image: product.image,
    });
    toast.success(`${product.name} (${selectedSize}) adicionado ao carrinho`);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header onProfileClick={() => setProfileOpen(true)} />

      <div className="container py-8">
        <button
          onClick={() => navigate(-1)}
          className="mb-6 flex items-center gap-2 font-body text-xs uppercase tracking-widest text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar
        </button>

        <div className="grid gap-8 md:grid-cols-2">
          <div className="relative aspect-square overflow-hidden bg-secondary">
            <img src={product.image} alt={product.name} className="h-full w-full object-cover" />
            {product.tag && (
              <span className="absolute left-4 top-4 bg-accent px-3 py-1 font-body text-[10px] font-semibold uppercase tracking-wider text-accent-foreground">
                {product.tag}
              </span>
            )}
          </div>

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

            <div>
              <p className="mb-3 font-body text-xs uppercase tracking-widest text-muted-foreground">Tamanho</p>
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

            <button
              onClick={handleAddToCart}
              disabled={!selectedSize}
              className="mt-2 w-full bg-foreground py-4 font-body text-xs uppercase tracking-widest text-background transition-opacity hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {selectedSize ? "Adicionar ao carrinho" : "Selecione um tamanho"}
            </button>

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
