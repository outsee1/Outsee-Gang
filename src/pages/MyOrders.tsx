import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Package, ShoppingBag } from "lucide-react";
import Header from "@/components/Header";
import ProfileModal from "@/components/ProfileModal";
import CartSlidePanel from "@/components/CartSlidePanel";
import { useCart } from "@/contexts/CartContext";
import { getOrders } from "@/utils/orderHistory";

const MyOrders = () => {
  const navigate = useNavigate();
  const [profileOpen, setProfileOpen] = useState(false);
  const { cartOpen, setCartOpen } = useCart();
  const orders = getOrders();

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
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

        <h1 className="mb-8 font-display text-2xl font-bold uppercase tracking-wider text-foreground">
          Meus Pedidos
        </h1>

        {orders.length === 0 ? (
          <div className="flex flex-col items-center gap-4 py-16">
            <Package className="h-12 w-12 text-muted-foreground" />
            <p className="font-body text-sm text-muted-foreground">
              Você ainda não realizou nenhum pedido.
            </p>
            <button
              onClick={() => navigate("/")}
              className="border border-foreground px-8 py-3 font-body text-xs uppercase tracking-widest text-foreground transition-colors hover:bg-foreground hover:text-background"
            >
              Explorar coleção
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div key={order.id} className="border border-border">
                {/* Order header */}
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border bg-card px-6 py-4">
                  <div className="flex items-center gap-3">
                    <ShoppingBag className="h-4 w-4 text-muted-foreground" />
                    <span className="font-body text-xs text-muted-foreground">
                      {formatDate(order.date)}
                    </span>
                  </div>
                  <span className="font-body text-[10px] uppercase tracking-widest text-muted-foreground">
                    #{order.id.slice(0, 8).toUpperCase()}
                  </span>
                </div>

                {/* Items */}
                <div className="divide-y divide-border">
                  {order.items.map((item, i) => (
                    <div key={i} className="flex gap-4 px-6 py-4">
                      <div className="h-20 w-16 flex-shrink-0 overflow-hidden bg-secondary">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div className="flex flex-1 flex-col justify-between">
                        <div>
                          <h3 className="font-body text-sm font-medium text-foreground">
                            {item.name}
                          </h3>
                          <p className="font-body text-xs text-muted-foreground">
                            Tam: {item.size}
                            {item.color ? ` · ${item.color}` : ""}
                          </p>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="font-body text-xs text-muted-foreground">
                            Qtd: {item.quantity}
                          </span>
                          <span className="font-body text-sm text-foreground">
                            {item.price}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Order footer */}
                <div className="border-t border-border bg-card px-6 py-4">
                  <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                    <div className="space-y-1">
                      <p className="font-body text-xs text-muted-foreground">
                        {order.payment}
                      </p>
                      <p className="font-body text-xs text-muted-foreground">
                        {order.address}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-body text-[10px] uppercase tracking-widest text-muted-foreground">
                        Frete: Grátis
                      </p>
                      <p className="font-display text-lg font-bold text-foreground">
                        R$ {order.totalPrice.toLocaleString("pt-BR")}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            <div className="flex justify-center pt-4">
              <button
                onClick={() => navigate("/")}
                className="bg-foreground px-10 py-4 font-body text-xs uppercase tracking-widest text-background transition-opacity hover:opacity-80"
              >
                Explorar mais produtos Outsee
              </button>
            </div>
          </div>
        )}
      </div>

      <ProfileModal isOpen={profileOpen} onClose={() => setProfileOpen(false)} />
      <CartSlidePanel isOpen={cartOpen} onClose={() => setCartOpen(false)} />
    </div>
  );
};

export default MyOrders;
