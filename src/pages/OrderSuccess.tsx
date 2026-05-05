import { useNavigate, useSearchParams } from "react-router-dom";
import { CheckCircle, Clock, XCircle, Loader2 } from "lucide-react";
import Header from "@/components/Header";
import ProfileModal from "@/components/ProfileModal";
import CartSlidePanel from "@/components/CartSlidePanel";
import { useCart } from "@/contexts/CartContext";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface OrderItem {
  name: string;
  size?: string;
  quantity: number;
  price: string;
  priceNum: number;
  image: string;
}

const OrderSuccess = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get("id");
  const [profileOpen, setProfileOpen] = useState(false);
  const { cartOpen, setCartOpen } = useCart();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!orderId) {
      setLoading(false);
      return;
    }

    const fetchOrder = async () => {
      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/get-order-status?id=${encodeURIComponent(orderId)}`,
        { headers: { apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY } }
      );
      const json = await res.json().catch(() => ({}));
      if (json?.order) setOrder(json.order);
      setLoading(false);
    };

    fetchOrder();

    // Poll every 3s for up to ~30s in case webhook hasn't arrived yet
    const interval = setInterval(async () => {
      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/get-order-status?id=${encodeURIComponent(orderId)}`,
        { headers: { apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY } }
      );
      const json = await res.json().catch(() => ({}));
      if (json?.order) {
        setOrder(json.order);
        if (json.order.status === "paid" || json.order.status === "failed") {
          clearInterval(interval);
        }
      }
    }, 3000);

    setTimeout(() => clearInterval(interval), 30000);
    return () => clearInterval(interval);
  }, [orderId]);

  const status = order?.status ?? "pending";
  const items: OrderItem[] = Array.isArray(order?.items) ? order.items : [];

  const StatusIcon = () => {
    if (status === "paid") return <CheckCircle className="mb-6 h-16 w-16 text-[hsl(142,70%,40%)]" />;
    if (status === "failed" || status === "canceled") return <XCircle className="mb-6 h-16 w-16 text-destructive" />;
    return <Clock className="mb-6 h-16 w-16 text-muted-foreground" />;
  };

  const statusLabel =
    status === "paid"
      ? "Pedido Confirmado"
      : status === "failed"
        ? "Pagamento Falhou"
        : status === "canceled"
          ? "Pedido Cancelado"
          : "Aguardando Pagamento";

  const statusMessage =
    status === "paid"
      ? "Seu pedido foi confirmado! Você receberá atualizações sobre o envio."
      : status === "failed"
        ? "Houve um problema no pagamento. Tente novamente."
        : status === "canceled"
          ? "Este pedido foi cancelado."
          : "Estamos aguardando a confirmação do seu pagamento (Pix/Boleto podem levar alguns minutos).";

  return (
    <div className="min-h-screen bg-background">
      <Header onProfileClick={() => setProfileOpen(true)} />

      <div className="container py-12">
        <div className="mx-auto max-w-2xl">
          <div className="flex flex-col items-center text-center">
            {loading ? (
              <Loader2 className="mb-6 h-16 w-16 animate-spin text-muted-foreground" />
            ) : (
              <StatusIcon />
            )}

            <h1 className="mb-3 font-display text-3xl font-bold uppercase tracking-wider text-foreground">
              {loading ? "Carregando..." : statusLabel}
            </h1>

            <p className="mb-2 max-w-md font-body text-sm text-muted-foreground">
              {!loading && statusMessage}
            </p>

            {orderId && (
              <p className="mb-8 font-body text-xs text-muted-foreground">
                Código do pedido:{" "}
                <span className="font-medium text-foreground">
                  {orderId.slice(0, 8).toUpperCase()}
                </span>
              </p>
            )}
          </div>

          {order && items.length > 0 && (
            <div className="mb-8 border border-border p-6">
              <h2 className="mb-6 font-display text-sm font-semibold uppercase tracking-wider text-foreground">
                Detalhes da compra
              </h2>
              <div className="space-y-4 divide-y divide-border">
                {items.map((item, idx) => (
                  <div key={idx} className="flex gap-4 pt-4 first:pt-0">
                    <div className="h-20 w-16 flex-shrink-0 overflow-hidden bg-secondary">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="flex flex-1 flex-col justify-between">
                      <div>
                        <p className="font-body text-sm text-foreground">{item.name}</p>
                        {item.size && (
                          <p className="mt-1 font-body text-xs text-muted-foreground">
                            Tamanho: {item.size} · Qtd: {item.quantity}
                          </p>
                        )}
                      </div>
                      <p className="font-body text-sm text-foreground">{item.price}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-6 flex justify-between border-t border-border pt-4 font-display text-base font-bold text-foreground">
                <span>Total</span>
                <span>R$ {Number(order.total_price).toLocaleString("pt-BR")}</span>
              </div>
            </div>
          )}

          <div className="flex flex-col justify-center gap-3 sm:flex-row">
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
              Meus pedidos
            </button>
          </div>
        </div>
      </div>

      <ProfileModal isOpen={profileOpen} onClose={() => setProfileOpen(false)} />
      <CartSlidePanel isOpen={cartOpen} onClose={() => setCartOpen(false)} />
    </div>
  );
};

export default OrderSuccess;
