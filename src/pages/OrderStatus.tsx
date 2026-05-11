import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { CheckCircle, Clock, XCircle, Loader2, CreditCard, Package, Truck } from "lucide-react";
import Header from "@/components/Header";
import ProfileModal from "@/components/ProfileModal";
import CartSlidePanel from "@/components/CartSlidePanel";
import { useCart } from "@/contexts/CartContext";
import { supabase } from "@/integrations/supabase/client";

type Status = "pending" | "paid" | "canceled" | "failed";

const STEPS: { key: Status; label: string; Icon: any }[] = [
  { key: "pending", label: "Aguardando", Icon: Clock },
  { key: "paid", label: "Confirmado", Icon: CreditCard },
  { key: "paid", label: "Em preparação", Icon: Package },
  { key: "paid", label: "Enviado", Icon: Truck },
];

const fetchOrder = async (id: string) => {
  const res = await fetch(
    `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/get-order-status?id=${encodeURIComponent(id)}`,
    { headers: { apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY } }
  );
  const json = await res.json().catch(() => ({}));
  return json?.order ?? null;
};

const OrderStatus = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [profileOpen, setProfileOpen] = useState(false);
  const { cartOpen, setCartOpen } = useCart();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }
    let active = true;
    fetchOrder(id).then((o) => {
      if (!active) return;
      setOrder(o);
      setLoading(false);
    });

    // Realtime subscription (works for owner/admin via RLS)
    const channel = supabase
      .channel(`order-${id}`)
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "orders", filter: `id=eq.${id}` },
        (payload) => setOrder((prev: any) => ({ ...(prev || {}), ...payload.new }))
      )
      .subscribe();

    // Polling fallback (covers guests / missed events)
    const interval = setInterval(async () => {
      const o = await fetchOrder(id);
      if (!active) return;
      if (o) setOrder(o);
      if (o && ["paid", "failed", "canceled"].includes(o.status)) {
        clearInterval(interval);
      }
    }, 4000);
    const stopAt = setTimeout(() => clearInterval(interval), 120_000);

    return () => {
      active = false;
      clearInterval(interval);
      clearTimeout(stopAt);
      supabase.removeChannel(channel);
    };
  }, [id]);

  const status: Status = (order?.status as Status) ?? "pending";
  const items = Array.isArray(order?.items) ? order.items : [];

  const activeIndex = useMemo(() => {
    if (status === "canceled" || status === "failed") return -1;
    if (status === "paid") return 1; // confirmed; further steps not yet tracked
    return 0;
  }, [status]);

  return (
    <div className="min-h-screen bg-background">
      <Header onProfileClick={() => setProfileOpen(true)} />
      <div className="container py-12">
        <div className="mx-auto max-w-3xl">
          <h1 className="mb-2 font-display text-3xl font-bold uppercase tracking-wider text-foreground">
            Status do pedido
          </h1>
          {id && (
            <p className="mb-10 font-body text-xs uppercase tracking-widest text-muted-foreground">
              Código: <span className="text-foreground">{id.slice(0, 8).toUpperCase()}</span>
            </p>
          )}

          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-10 w-10 animate-spin text-muted-foreground" />
            </div>
          ) : !order ? (
            <div className="border border-border p-8 text-center font-body text-sm text-muted-foreground">
              Pedido não encontrado.
            </div>
          ) : (
            <>
              {(status === "canceled" || status === "failed") ? (
                <div className="mb-10 flex items-center gap-3 border border-destructive/40 bg-destructive/10 p-5 text-destructive">
                  <XCircle className="h-6 w-6" />
                  <div>
                    <p className="font-display text-sm font-semibold uppercase tracking-wider">
                      {status === "canceled" ? "Pedido cancelado" : "Pagamento falhou"}
                    </p>
                    <p className="font-body text-xs">
                      Entre em contato pelo WhatsApp se precisar de ajuda.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="mb-10 border border-border p-6">
                  <div className="flex items-start justify-between gap-2">
                    {STEPS.map((s, idx) => {
                      const reached = idx <= activeIndex;
                      const isCurrent = idx === activeIndex;
                      const Icon = reached ? CheckCircle : s.Icon;
                      return (
                        <div key={idx} className="flex flex-1 flex-col items-center text-center">
                          <div
                            className={`flex h-10 w-10 items-center justify-center border-2 ${
                              reached
                                ? "border-accent bg-accent text-accent-foreground"
                                : "border-border bg-background text-muted-foreground"
                            } ${isCurrent ? "animate-pulse" : ""}`}
                          >
                            <Icon className="h-5 w-5" />
                          </div>
                          <p
                            className={`mt-2 font-body text-[10px] uppercase tracking-widest ${
                              reached ? "text-foreground" : "text-muted-foreground"
                            }`}
                          >
                            {s.label}
                          </p>
                          {idx < STEPS.length - 1 && (
                            <div
                              className={`absolute mt-5 hidden h-0.5 ${
                                idx < activeIndex ? "bg-accent" : "bg-border"
                              }`}
                            />
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {items.length > 0 && (
                <div className="mb-8 border border-border p-6">
                  <h2 className="mb-4 font-display text-sm font-semibold uppercase tracking-wider text-foreground">
                    Itens
                  </h2>
                  <div className="divide-y divide-border">
                    {items.map((item: any, idx: number) => (
                      <div key={idx} className="flex gap-4 py-3 first:pt-0 last:pb-0">
                        {item.image && (
                          <div className="h-16 w-14 flex-shrink-0 overflow-hidden bg-secondary">
                            <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                          </div>
                        )}
                        <div className="flex flex-1 items-center justify-between">
                          <div>
                            <p className="font-body text-sm text-foreground">{item.name}</p>
                            <p className="font-body text-xs text-muted-foreground">
                              {item.size ? `Tam ${item.size} · ` : ""}Qtd {item.quantity}
                            </p>
                          </div>
                          <p className="font-body text-sm text-foreground">{item.price}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 flex justify-between border-t border-border pt-4 font-display text-sm font-bold text-foreground">
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
            </>
          )}
        </div>
      </div>
      <ProfileModal isOpen={profileOpen} onClose={() => setProfileOpen(false)} />
      <CartSlidePanel isOpen={cartOpen} onClose={() => setCartOpen(false)} />
    </div>
  );
};

export default OrderStatus;