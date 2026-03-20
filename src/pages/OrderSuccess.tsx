import { useNavigate, useSearchParams } from "react-router-dom";
import { CheckCircle } from "lucide-react";
import Header from "@/components/Header";
import ProfileModal from "@/components/ProfileModal";
import CartSlidePanel from "@/components/CartSlidePanel";
import { useCart } from "@/contexts/CartContext";
import { useState } from "react";

const OrderSuccess = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get("id");
  const [profileOpen, setProfileOpen] = useState(false);
  const { cartOpen, setCartOpen } = useCart();

  return (
    <div className="min-h-screen bg-background">
      <Header onProfileClick={() => setProfileOpen(true)} />

      <div className="container flex flex-col items-center justify-center py-24 text-center">
        <CheckCircle className="mb-6 h-16 w-16 text-[hsl(142,70%,40%)]" />

        <h1 className="mb-3 font-display text-3xl font-bold uppercase tracking-wider text-foreground">
          Pedido Confirmado
        </h1>

        <p className="mb-2 max-w-md font-body text-sm text-muted-foreground">
          Seu pedido foi realizado com sucesso! Você receberá atualizações sobre o envio.
        </p>

        {orderId && (
          <p className="mb-8 font-body text-xs text-muted-foreground">
            Código do pedido: <span className="font-medium text-foreground">{orderId.slice(0, 8).toUpperCase()}</span>
          </p>
        )}

        <div className="flex flex-col gap-3 sm:flex-row">
          <button
            onClick={() => navigate("/")}
            className="border border-foreground px-10 py-4 font-body text-xs uppercase tracking-widest text-foreground transition-colors hover:bg-foreground hover:text-background"
          >
            Início
          </button>
          <button
            onClick={() => navigate("/meus-pedidos")}
            className="bg-foreground px-10 py-4 font-body text-xs uppercase tracking-widest text-background transition-opacity hover:opacity-80"
          >
            Ver compra
          </button>
        </div>
      </div>

      <ProfileModal isOpen={profileOpen} onClose={() => setProfileOpen(false)} />
      <CartSlidePanel isOpen={cartOpen} onClose={() => setCartOpen(false)} />
    </div>
  );
};

export default OrderSuccess;
