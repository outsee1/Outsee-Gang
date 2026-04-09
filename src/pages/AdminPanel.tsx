import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Package, Users, TrendingUp, Eye } from "lucide-react";
import Header from "@/components/Header";
import ProfileModal from "@/components/ProfileModal";
import CartSlidePanel from "@/components/CartSlidePanel";
import { useCart } from "@/contexts/CartContext";
import { getOrders, Order } from "@/utils/orderHistory";

const ADMIN_SESSION_KEY = "outsee_admin_session";

const AdminPanel = () => {
  const navigate = useNavigate();
  const [profileOpen, setProfileOpen] = useState(false);
  const { cartOpen, setCartOpen } = useCart();
  const [isAuthed, setIsAuthed] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    const session = localStorage.getItem(ADMIN_SESSION_KEY);
    if (session === "true") {
      setIsAuthed(true);
      setOrders(getOrders());
    } else {
      navigate("/");
    }
  }, [navigate]);

  const totalRevenue = orders.reduce((sum, o) => sum + o.totalPrice, 0);
  const totalItems = orders.reduce((sum, o) => sum + o.items.reduce((s, i) => s + i.quantity, 0), 0);

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" });

  const handleLogout = () => {
    localStorage.removeItem(ADMIN_SESSION_KEY);
    navigate("/");
  };

  if (!isAuthed) return null;

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
                  <div className="flex items-center gap-4">
                    <div className="flex -space-x-2">
                      {order.items.slice(0, 3).map((item, idx) => (
                        <div key={idx} className="h-10 w-10 overflow-hidden border-2 border-background bg-secondary">
                          <img src={item.image} alt="" className="h-full w-full object-cover" />
                        </div>
                      ))}
                    </div>
                    <div>
                      <p className="font-body text-sm font-medium text-foreground">
                        {order.firstName} {order.lastName}
                      </p>
                      <p className="font-body text-xs text-muted-foreground">
                        {order.items.length} {order.items.length === 1 ? "item" : "itens"} · {formatDate(order.date)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="font-body text-xs text-muted-foreground">{order.payment}</span>
                    <span className="font-display text-sm font-bold text-foreground">
                      R$ {order.totalPrice.toLocaleString("pt-BR")}
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
