import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Minus, Plus, X, Loader2 } from "lucide-react";
import { toast } from "sonner";
import Header from "@/components/Header";
import ProfileModal from "@/components/ProfileModal";
import CartSlidePanel from "@/components/CartSlidePanel";
import { useCart } from "@/contexts/CartContext";
import { supabase } from "@/integrations/supabase/client";

const Checkout = () => {
  const navigate = useNavigate();
  const [profileOpen, setProfileOpen] = useState(false);
  const { items, removeItem, updateQuantity, clearCart, totalPrice, cartOpen, setCartOpen } = useCart();

  const [loading, setLoading] = useState(false);

  const handleFinalize = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Faça login para finalizar a compra.");
        setLoading(false);
        navigate("/auth?redirect=/carrinho");
        return;
      }

      // 1. Create order in DB first (status: pending)
      const { data: order, error: orderError } = await supabase
        .from("orders")
        .insert({
          first_name: "Cliente",
          last_name: "",
          items: items as any,
          total_price: totalPrice,
          status: "pending",
          payment_method: "Stripe",
          user_id: user.id,
        })
        .select()
        .single();

      if (orderError) throw orderError;

      const stripeItems = items.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
      }));

      const { data, error } = await supabase.functions.invoke("create-stripe-checkout", {
        body: {
          items: stripeItems,
          orderId: order.id,
          successUrl: `${window.location.origin}/pedido-confirmado?id=${order.id}&session_id={CHECKOUT_SESSION_ID}`,
          cancelUrl: `${window.location.origin}/carrinho`,
        },
      });

      if (error) throw error;
      if (data?.url) {
        // Save session_id to order so webhook can match
        if (data.sessionId) {
          await supabase
            .from("orders")
            .update({ stripe_session_id: data.sessionId })
            .eq("id", order.id);
        }
        clearCart();
        window.location.href = data.url;
      } else {
        throw new Error("URL de pagamento não retornada");
      }
    } catch (err: any) {
      console.error("Stripe checkout error:", err);
      toast.error("Erro ao iniciar pagamento. Tente novamente.");
    } finally {
      setLoading(false);
    }
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
          Carrinho
        </h1>

        {items.length === 0 ? (
          <div className="flex flex-col items-center gap-4 py-16">
            <p className="font-body text-sm text-muted-foreground">Seu carrinho está vazio.</p>
            <button
              onClick={() => navigate("/")}
              className="border border-foreground px-8 py-3 font-body text-xs uppercase tracking-widest text-foreground transition-colors hover:bg-foreground hover:text-background"
            >
              Explorar coleção
            </button>
          </div>
        ) : (
          <div className="grid gap-8 lg:grid-cols-3">
            {/* Items */}
            <div className="space-y-0 divide-y divide-border lg:col-span-2">
              {items.map((item) => (
                <div key={`${item.productId}-${item.size}`} className="flex gap-4 py-6">
                  <div className="h-28 w-20 flex-shrink-0 overflow-hidden bg-secondary">
                    <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                  </div>
                  <div className="flex flex-1 flex-col justify-between">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-body text-sm font-medium text-foreground">{item.name}</h3>
                        <p className="mt-1 font-body text-xs text-muted-foreground">Tamanho: {item.size}</p>
                      </div>
                      <button
                        onClick={() => removeItem(item.productId, item.size)}
                        className="text-muted-foreground transition-colors hover:text-foreground"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 border border-border">
                        <button
                          onClick={() => updateQuantity(item.productId, item.size, item.quantity - 1)}
                          className="p-2 text-muted-foreground transition-colors hover:text-foreground"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="font-body text-sm text-foreground">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.productId, item.size, item.quantity + 1)}
                          className="p-2 text-muted-foreground transition-colors hover:text-foreground"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>
                      <p className="font-body text-sm text-foreground">{item.price}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Summary */}
            <div className="border border-border p-6">
              <h2 className="mb-6 font-display text-sm font-semibold uppercase tracking-wider text-foreground">
                Resumo
              </h2>
              <div className="space-y-3">
                <div className="flex justify-between font-body text-sm text-muted-foreground">
                  <span>Subtotal</span>
                  <span className="text-foreground">
                    R$ {totalPrice.toLocaleString("pt-BR")}
                  </span>
                </div>
                <div className="flex justify-between font-body text-sm text-muted-foreground">
                  <span>Frete</span>
                  <span className="text-foreground">Grátis</span>
                </div>
                <div className="border-t border-border pt-3">
                  <div className="flex justify-between font-display text-lg font-bold text-foreground">
                    <span>Total</span>
                    <span>R$ {totalPrice.toLocaleString("pt-BR")}</span>
                  </div>
                </div>
              </div>
              <button
                onClick={handleFinalize}
                disabled={loading}
                className="mt-6 flex w-full items-center justify-center gap-2 bg-foreground py-4 font-body text-xs uppercase tracking-widest text-background transition-opacity hover:opacity-80 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Processando...
                  </>
                ) : (
                  "Finalizar pedido"
                )}
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

export default Checkout;
