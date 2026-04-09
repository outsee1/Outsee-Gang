import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, Package, User, LogOut, Mail, Shield, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getOrders, Order } from "@/utils/orderHistory";

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type AuthMode = "login" | "register";

interface UserData {
  name: string;
  email: string;
  password: string;
  phone?: string;
}

const USERS_KEY = "outsee_users";
const SESSION_KEY = "outsee_session";
const ADMIN_SESSION_KEY = "outsee_admin_session";

const getStoredUsers = (): UserData[] => {
  try {
    return JSON.parse(localStorage.getItem(USERS_KEY) || "[]");
  } catch {
    return [];
  }
};

const ProfileModal = ({ isOpen, onClose }: ProfileModalProps) => {
  const navigate = useNavigate();
  const [mode, setMode] = useState<AuthMode>("login");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);
  const [formData, setFormData] = useState({ name: "", email: "", password: "", phone: "" });
  const [error, setError] = useState("");
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    const session = localStorage.getItem(SESSION_KEY);
    if (session) {
      try {
        const parsed = JSON.parse(session);
        setUser(parsed);
        setIsLoggedIn(true);
      } catch {}
    }
  }, []);

  useEffect(() => {
    if (isOpen && isLoggedIn) {
      setOrders(getOrders());
    }
  }, [isOpen, isLoggedIn]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Admin login check
    if (mode === "login" && formData.email === "Admin" && formData.password === "Outsee@2026") {
      localStorage.setItem(ADMIN_SESSION_KEY, "true");
      onClose();
      navigate("/admin");
      return;
    }

    if (mode === "register") {
      const users = getStoredUsers();
      if (users.find((u) => u.email === formData.email)) {
        setError("E-mail já cadastrado.");
        return;
      }
      const newUser: UserData = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
      };
      localStorage.setItem(USERS_KEY, JSON.stringify([...users, newUser]));
      const session = { name: newUser.name, email: newUser.email };
      localStorage.setItem(SESSION_KEY, JSON.stringify(session));
      setUser(session);
      setIsLoggedIn(true);
    } else {
      const users = getStoredUsers();
      const found = users.find(
        (u) => u.email === formData.email && u.password === formData.password
      );
      if (!found) {
        setError("E-mail ou senha incorretos.");
        return;
      }
      const session = { name: found.name, email: found.email };
      localStorage.setItem(SESSION_KEY, JSON.stringify(session));
      setUser(session);
      setIsLoggedIn(true);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem(SESSION_KEY);
    setIsLoggedIn(false);
    setUser(null);
    setFormData({ name: "", email: "", password: "", phone: "" });
  };

  const recentOrders = orders.slice(0, 3);

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
  };

  const inputClass =
    "w-full border border-border bg-input px-4 py-3 font-body text-sm text-foreground placeholder:text-muted-foreground focus:border-foreground focus:outline-none transition-colors";

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className="fixed inset-0 z-40 bg-[hsl(var(--overlay))]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          <motion.div
            className="fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col border-l border-border bg-card"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "tween", duration: 0.3 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-border p-6">
              <h2 className="font-display text-lg font-semibold uppercase tracking-wider text-foreground">
                {isLoggedIn ? "Minha Conta" : mode === "login" ? "Entrar" : "Criar Conta"}
              </h2>
              <button onClick={onClose} className="p-1 transition-colors hover:text-foreground">
                <X className="h-5 w-5 text-muted-foreground" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto">
              {isLoggedIn && user ? (
                <div className="flex flex-col">
                  {/* Profile header */}
                  <div className="flex items-center gap-4 border-b border-border p-6">
                    <div className="flex h-14 w-14 items-center justify-center bg-foreground">
                      <span className="font-display text-xl font-bold text-background">
                        {user.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1">
                      <p className="font-display text-base font-semibold text-foreground">
                        {user.name}
                      </p>
                      <p className="flex items-center gap-1 font-body text-xs text-muted-foreground">
                        <Mail className="h-3 w-3" />
                        {user.email}
                      </p>
                    </div>
                  </div>

                  {/* Menu items */}
                  <div className="border-b border-border">
                    <button
                      onClick={() => { onClose(); navigate("/meus-pedidos"); }}
                      className="flex w-full items-center justify-between px-6 py-4 transition-colors hover:bg-secondary"
                    >
                      <div className="flex items-center gap-3">
                        <Package className="h-4 w-4 text-muted-foreground" />
                        <span className="font-body text-sm text-foreground">Meus Pedidos</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {orders.length > 0 && (
                          <span className="flex h-5 min-w-[20px] items-center justify-center bg-accent px-1.5 font-body text-[10px] font-bold text-accent-foreground">
                            {orders.length}
                          </span>
                        )}
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      </div>
                    </button>

                    <button
                      className="flex w-full items-center justify-between px-6 py-4 transition-colors hover:bg-secondary"
                    >
                      <div className="flex items-center gap-3">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span className="font-body text-sm text-foreground">Dados Pessoais</span>
                      </div>
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </button>

                    <button
                      className="flex w-full items-center justify-between px-6 py-4 transition-colors hover:bg-secondary"
                    >
                      <div className="flex items-center gap-3">
                        <Shield className="h-4 w-4 text-muted-foreground" />
                        <span className="font-body text-sm text-foreground">Segurança</span>
                      </div>
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </button>
                  </div>

                  {/* Recent orders preview */}
                  {recentOrders.length > 0 && (
                    <div className="border-b border-border p-6">
                      <h3 className="mb-4 font-body text-[10px] uppercase tracking-widest text-muted-foreground">
                        Pedidos Recentes
                      </h3>
                      <div className="space-y-3">
                        {recentOrders.map((order) => (
                          <div
                            key={order.id}
                            className="flex items-center justify-between border border-border p-3 transition-colors hover:border-foreground/20"
                          >
                            <div className="flex items-center gap-3">
                              {order.items[0]?.image && (
                                <div className="h-10 w-10 overflow-hidden bg-secondary">
                                  <img
                                    src={order.items[0].image}
                                    alt=""
                                    className="h-full w-full object-cover"
                                  />
                                </div>
                              )}
                              <div>
                                <p className="font-body text-xs text-foreground">
                                  {order.items.length} {order.items.length === 1 ? "item" : "itens"}
                                </p>
                                <p className="font-body text-[10px] text-muted-foreground">
                                  {formatDate(order.date)}
                                </p>
                              </div>
                            </div>
                            <span className="font-display text-sm font-bold text-foreground">
                              R$ {order.totalPrice.toLocaleString("pt-BR")}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Logout */}
                  <div className="p-6">
                    <button
                      onClick={handleLogout}
                      className="flex w-full items-center justify-center gap-2 border border-border py-3 font-body text-xs uppercase tracking-widest text-muted-foreground transition-colors hover:border-accent hover:text-accent"
                    >
                      <LogOut className="h-4 w-4" />
                      Sair da conta
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-6">
                  <form onSubmit={handleSubmit} className="flex flex-col gap-5 pt-2">
                    {error && (
                      <div className="border border-accent/30 bg-accent/10 px-4 py-3">
                        <p className="font-body text-xs text-accent">{error}</p>
                      </div>
                    )}

                    {mode === "register" && (
                      <>
                        <div>
                          <label className="mb-2 block font-body text-xs uppercase tracking-widest text-muted-foreground">
                            Nome completo
                          </label>
                          <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            required
                            placeholder="Seu nome"
                            className={inputClass}
                          />
                        </div>

                        <div>
                          <label className="mb-2 block font-body text-xs uppercase tracking-widest text-muted-foreground">
                            Telefone
                          </label>
                          <input
                            type="tel"
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            placeholder="(00) 00000-0000"
                            className={inputClass}
                          />
                        </div>
                      </>
                    )}

                    <div>
                      <label className="mb-2 block font-body text-xs uppercase tracking-widest text-muted-foreground">
                        {mode === "login" ? "E-mail ou Usuário" : "E-mail"}
                      </label>
                      <input
                        type={mode === "register" ? "email" : "text"}
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        required
                        placeholder={mode === "login" ? "seu@email.com" : "seu@email.com"}
                        className={inputClass}
                      />
                    </div>

                    <div>
                      <label className="mb-2 block font-body text-xs uppercase tracking-widest text-muted-foreground">
                        Senha
                      </label>
                      <input
                        type="password"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        required
                        minLength={6}
                        placeholder="Mínimo 6 caracteres"
                        className={inputClass}
                      />
                    </div>

                    <button
                      type="submit"
                      className="mt-2 w-full bg-foreground py-4 font-body text-xs uppercase tracking-widest text-background transition-opacity hover:opacity-80 active:scale-[0.98]"
                    >
                      {mode === "login" ? "Entrar" : "Criar Conta"}
                    </button>

                    <div className="flex items-center gap-4">
                      <div className="h-px flex-1 bg-border" />
                      <span className="font-body text-[10px] uppercase tracking-widest text-muted-foreground">ou</span>
                      <div className="h-px flex-1 bg-border" />
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setMode(mode === "login" ? "register" : "login");
                        setError("");
                      }}
                      className="w-full border border-border py-3 font-body text-xs uppercase tracking-widest text-foreground transition-colors hover:bg-secondary"
                    >
                      {mode === "login" ? "Criar uma conta" : "Já tenho conta"}
                    </button>
                  </form>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default ProfileModal;
