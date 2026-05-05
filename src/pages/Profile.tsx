import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, LogOut, Mail, Package, User as UserIcon, Loader2 } from "lucide-react";
import { toast } from "sonner";
import Header from "@/components/Header";
import ProfileModal from "@/components/ProfileModal";
import CartSlidePanel from "@/components/CartSlidePanel";
import { useCart } from "@/contexts/CartContext";
import { supabase } from "@/integrations/supabase/client";

interface DbOrder {
  id: string;
  status: string;
  total_price: number;
  payment_method: string;
  created_at: string;
  items: any[];
}

const STATUS_LABELS: Record<string, { label: string; cls: string }> = {
  pending: { label: "Aguardando pagamento", cls: "bg-secondary text-muted-foreground" },
  paid: { label: "Pago", cls: "bg-[hsl(142,70%,40%)]/15 text-[hsl(142,70%,55%)]" },
  failed: { label: "Falhou", cls: "bg-destructive/15 text-destructive" },
  canceled: { label: "Cancelado", cls: "bg-destructive/10 text-destructive" },
};

const Profile = () => {
  const navigate = useNavigate();
  const [profileOpen, setProfileOpen] = useState(false);
  const { cartOpen, setCartOpen } = useCart();

  const [user, setUser] = useState<any>(null);
  const [orders, setOrders] = useState<DbOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        navigate("/auth?redirect=/perfil", { replace: true });
        return;
      }
      setUser(session.user);

      const { data, error } = await supabase
        .from("orders")
        .select("id, status, total_price, payment_method, created_at, items")
        .order("created_at", { ascending: false });

      if (error) {
        toast.error("Erro ao carregar pedidos.");
      } else {
        setOrders((data || []) as DbOrder[]);
      }
      setLoading(false);
    };
    load();
  }, [navigate]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/", { replace: true });
  };

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleString("pt-BR", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });

  const displayName =
    user?.user_metadata?.name || user?.email?.split("@")[0] || "Usuário";

  return (
    <div className="min-h-screen bg-background">
      <Header onProfileClick={() => setProfileOpen(true)} />

      <div className="container py-8">
        <button
          onClick={() => navigate(-1)}
          className="mb-6 flex items-center gap-2 font-body text-xs uppercase tracking-widest text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> Voltar
        </button>

        <h1 className="mb-8 font-display text-2xl font-bold uppercase tracking-wider text-foreground">
          Meu perfil
        </h1>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="grid gap-8 lg:grid-cols-3">
            {/* Sidebar with user info */}
            <aside className="space-y-4 lg:col-span-1">
              <div className="border border-border p-6">
                <div className="mb-4 flex h-14 w-14 items-center justify-center bg-foreground">
                  <span className="font-display text-xl font-bold text-background">
                    {displayName.charAt(0).toUpperCase()}
                  </span>
                </div>
                <p className="font-display text-base font-semibold text-foreground">{displayName}</p>
                <p className="mt-1 flex items-center gap-1 font-body text-xs text-muted-foreground">
                  <Mail className="h-3 w-3" /> {user?.email}
                </p>
                {user?.user_metadata?.phone && (
                  <p className="mt-1 font-body text-xs text-muted-foreground">{user.user_metadata.phone}</p>
                )}
              </div>

              <button
                onClick={handleLogout}
                className="flex w-full items-center justify-center gap-2 border border-border py-3 font-body text-xs uppercase tracking-widest text-muted-foreground transition-colors hover:border-accent hover:text-accent"
              >
                <LogOut className="h-4 w-4" /> Sair da conta
              </button>
            </aside>

            {/* Order history */}
            <section className="lg:col-span-2">
              <h2 className="mb-4 flex items-center gap-2 font-display text-sm font-semibold uppercase tracking-wider text-foreground">
                <Package className="h-4 w-4" /> Histórico de pedidos
              </h2>

              {orders.length === 0 ? (
                <div className="border border-border p-10 text-center">
                  <p className="mb-4 font-body text-sm text-muted-foreground">
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
                <div className="space-y-4">
                  {orders.map((o) => {
                    const st = STATUS_LABELS[o.status] || STATUS_LABELS.pending;
                    const itemsCount = Array.isArray(o.items)
                      ? o.items.reduce((s: number, it: any) => s + (Number(it.quantity) || 0), 0)
                      : 0;
                    return (
                      <button
                        key={o.id}
                        onClick={() => navigate(`/pedido-confirmado?id=${o.id}`)}
                        className="block w-full border border-border p-5 text-left transition-colors hover:border-foreground/30"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div>
                            <p className="font-body text-[10px] uppercase tracking-widest text-muted-foreground">
                              #{o.id.slice(0, 8).toUpperCase()} · {formatDate(o.created_at)}
                            </p>
                            <p className="mt-1 font-body text-sm text-foreground">
                              {itemsCount} {itemsCount === 1 ? "item" : "itens"} · {o.payment_method}
                            </p>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className={`px-2 py-1 font-body text-[10px] font-bold uppercase tracking-wider ${st.cls}`}>
                              {st.label}
                            </span>
                            <span className="font-display text-base font-bold text-foreground">
                              R$ {Number(o.total_price).toLocaleString("pt-BR")}
                            </span>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </section>
          </div>
        )}
      </div>

      <ProfileModal isOpen={profileOpen} onClose={() => setProfileOpen(false)} />
      <CartSlidePanel isOpen={cartOpen} onClose={() => setCartOpen(false)} />
    </div>
  );
};

export default Profile;