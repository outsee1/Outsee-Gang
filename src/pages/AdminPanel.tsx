import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Package, TrendingUp, Users, Loader2 } from "lucide-react";
import Header from "@/components/Header";
import ProfileModal from "@/components/ProfileModal";
import CartSlidePanel from "@/components/CartSlidePanel";
import { useCart } from "@/contexts/CartContext";
import { supabase } from "@/integrations/supabase/client";
import { useAdminAuth } from "@/hooks/useAdmin";

interface DBOrder {
  id: string;
  first_name: string;
  last_name: string;
  items: any[];
  total_price: number;
  payment_method: string;
  status: string;
  created_at: string;
}

const AdminPanel = () => {
  const navigate = useNavigate();
  const [profileOpen, setProfileOpen] = useState(false);
  const { cartOpen, setCartOpen } = useCart();
  const { isAdmin, loading: authLoading, logout } = useAdminAuth();
  const [orders, setOrders] = useState<DBOrder[]>([]);

  useEffect(() => {
    if (!authLoading && !isAdmin) {
      navigate("/");
    }
  }, [authLoading, isAdmin, navigate]);

  useEffect(() => {
    if (isAdmin) fetchOrders();
  }, [isAdmin]);

  const fetchOrders = async () => {
    const { data } = await supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false });
    if (data) setOrders(data as unknown as DBOrder[]);
  };

  const totalRevenue = orders.reduce((sum, o) => sum + Number(o.total_price), 0);
  const totalItems = orders.reduce(
    (sum, o) => sum + (Array.isArray(o.items) ? o.items.reduce((s: number, i: any) => s + (i.quantity || 1), 0) : 0),
    0
  );

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" });

  const statusLabel = (s: string) => {
    const map: Record<string, string> = { pending: "Pendente", paid: "Pago", failed: "Falhou" };
    return map[s] || s;
  };

  const statusColor = (s: string) => {
    if (s === "paid") return "text-green-500";
    if (s === "failed") return "text-red-500";
    return "text-yellow-500";
  };

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!isAdmin) return null;

  return (
    <div className="min-h-screen bg-background">
      <Header onProfileClick={() => setProfileOpen(true)} />

      <div className="container py-8">
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate("/")} className="text-muted-foreground hover:text-foreground">
              <ArrowLeft className="h-5 w-5" />
            </button>
            <h1 className="font-display text-2xl font-bold uppercase tracking-wider text-foreground">
              Painel Admin
            </h1>
          </div>
          <button
            onClick={handleLogout}
            className="border border-border px-6 py-2 font-body text-xs uppercase tracking-widest text-muted-foreground hover:border-accent hover:text-accent"
          >
            Sair do Admin
          </button>
        </div>

        {/* Stats */}
        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="border border-border p-6">
            <div className="flex items-center gap-3 text-muted-foreground">
              <Package className="h-5 w-5" />
              <span className="font-body text-xs uppercase tracking-widest">Pedidos</span>
            </div>
            <p className="mt-2 font-display text-3xl font-bold text-foreground">{orders.length}</p>
          </div>
          <div className="border border-border p-6">
            <div className="flex items-center gap-3 text-muted-foreground">
              <TrendingUp className="h-5 w-5" />
              <span className="font-body text-xs uppercase tracking-widest">Receita Total</span>
            </div>
            <p className="mt-2 font-display text-3xl font-bold text-foreground">
              R$ {totalRevenue.toLocaleString("pt-BR")}
            </p>
          </div>
          <div className="border border-border p-6">
            <div className="flex items-center gap-3 text-muted-foreground">
              <Users className="h-5 w-5" />
              <span className="font-body text-xs uppercase tracking-widest">Itens Vendidos</span>
            </div>
            <p className="mt-2 font-display text-3xl font-bold text-foreground">{totalItems}</p>
          </div>
        </div>

        {/* Orders Table */}
        <div className="border border-border">
          <div className="border-b border-border px-6 py-4">
            <h2 className="font-display text-sm font-semibold uppercase tracking-wider text-foreground">
              Todos os Pedidos
            </h2>
          </div>
          {orders.length === 0 ? (
            <p className="p-6 text-center font-body text-sm text-muted-foreground">Nenhum pedido ainda.</p>
          ) : (
            <div className="divide-y divide-border">
              {orders.map((order) => (
                <div key={order.id} className="flex flex-col gap-3 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="font-body text-sm font-medium text-foreground">
                      {order.first_name} {order.last_name}
                    </p>
                    <p className="font-body text-xs text-muted-foreground">
                      {Array.isArray(order.items) ? order.items.length : 0}{" "}
                      {(Array.isArray(order.items) ? order.items.length : 0) === 1 ? "item" : "itens"} · {formatDate(order.created_at)}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className={`font-body text-xs font-semibold uppercase ${statusColor(order.status)}`}>
                      {statusLabel(order.status)}
                    </span>
                    <span className="font-body text-xs text-muted-foreground">{order.payment_method}</span>
                    <span className="font-display text-sm font-bold text-foreground">
                      R$ {Number(order.total_price).toLocaleString("pt-BR")}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <ProfileModal isOpen={profileOpen} onClose={() => setProfileOpen(false)} />
      <CartSlidePanel isOpen={cartOpen} onClose={() => setCartOpen(false)} />
    </div>
  );
};

export default AdminPanel;
