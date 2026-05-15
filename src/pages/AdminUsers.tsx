import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ChevronLeft, ChevronRight, Loader2, Shield, ShieldAlert, UserCog } from "lucide-react";
import { toast } from "sonner";
import Header from "@/components/Header";
import ProfileModal from "@/components/ProfileModal";
import CartSlidePanel from "@/components/CartSlidePanel";
import { useCart } from "@/contexts/CartContext";
import { supabase } from "@/integrations/supabase/client";
import { useAdminAuth } from "@/hooks/useAdmin";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface AdminUserRow {
  id: string;
  email: string | null;
  created_at: string;
  last_sign_in_at: string | null;
  email_confirmed_at: string | null;
  is_admin: boolean;
  admin_source?: "user" | "email" | null;
}

const PAGE_SIZE = 25;

const AdminUsers = () => {
  const navigate = useNavigate();
  const { isAdmin, loading: authLoading, userId } = useAdminAuth();
  const [profileOpen, setProfileOpen] = useState(false);
  const { cartOpen, setCartOpen } = useCart();
  const [users, setUsers] = useState<AdminUserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [pendingChange, setPendingChange] = useState<{ user: AdminUserRow; next: boolean } | null>(null);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search.trim()), 300);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch]);

  const totalPages = useMemo(() => Math.max(1, Math.ceil(total / PAGE_SIZE)), [total]);

  const loadUsers = async () => {
    setLoading(true);
    const { data, error } = await supabase.functions.invoke("admin-users", {
      body: { action: "list", page, perPage: PAGE_SIZE, search: debouncedSearch },
    });

    if (error) {
      toast.error("Erro ao carregar usuários admin.");
      setUsers([]);
      setTotal(0);
    } else {
      setUsers((data?.users || []) as AdminUserRow[]);
      setTotal(Number(data?.total || 0));
    }
    setLoading(false);
  };

  useEffect(() => {
    if (authLoading) return;
    if (!isAdmin) {
      navigate(userId ? "/" : "/auth?redirect=/admin/usuarios", { replace: true });
      return;
    }
    loadUsers();
  }, [authLoading, isAdmin, userId, navigate, page, debouncedSearch]);

  const setAdmin = async (target: AdminUserRow, next: boolean) => {
    setSavingId(target.id);
    const { error } = await supabase.functions.invoke("admin-users", {
      body: { action: "set-admin", userId: target.id, isAdmin: next },
    });

    if (error) {
      toast.error(error.message || "Erro ao alterar permissão.");
    } else {
      toast.success(next ? "Admin ativado." : "Admin removido.");
      await loadUsers();
    }
    setSavingId(null);
  };

  const formatDate = (iso?: string | null) =>
    iso
      ? new Date(iso).toLocaleString("pt-BR", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })
      : "—";

  const inputClass =
    "border border-border bg-input px-3 py-2 font-body text-xs text-foreground placeholder:text-muted-foreground focus:border-foreground focus:outline-none";

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

      <main className="container py-8">
        <button
          onClick={() => navigate("/admin")}
          className="mb-6 flex items-center gap-2 font-body text-xs uppercase tracking-widest text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> Painel admin
        </button>

        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="mb-3 flex items-center gap-3">
              <UserCog className="h-6 w-6 text-accent" />
              <h1 className="font-display text-2xl font-bold uppercase tracking-wider text-foreground">
                Usuários admin
              </h1>
            </div>
            <p className="font-body text-xs text-muted-foreground">
              Gerencie quais contas autenticadas podem acessar painel, produtos e auditorias.
            </p>
          </div>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por e-mail ou ID..."
            className={`${inputClass} w-full sm:w-80`}
          />
        </div>

        <section className="overflow-x-auto border border-border">
          <table className="w-full min-w-[760px] font-body text-xs">
            <thead className="bg-secondary text-muted-foreground">
              <tr>
                <th className="px-4 py-3 text-left uppercase tracking-widest">Usuário</th>
                <th className="px-4 py-3 text-left uppercase tracking-widest">Criado em</th>
                <th className="px-4 py-3 text-left uppercase tracking-widest">Último login</th>
                <th className="px-4 py-3 text-left uppercase tracking-widest">Status</th>
                <th className="px-4 py-3 text-right uppercase tracking-widest">Permissão</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-muted-foreground">
                    <Loader2 className="mx-auto mb-2 h-5 w-5 animate-spin" /> Carregando usuários...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-muted-foreground">
                    Nenhum usuário encontrado.
                  </td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr key={u.id} className="border-t border-border align-middle">
                    <td className="px-4 py-4">
                      <p className="font-body text-sm text-foreground">{u.email || "Sem e-mail"}</p>
                      <p className="mt-1 font-mono text-[10px] text-muted-foreground">{u.id}</p>
                    </td>
                    <td className="px-4 py-4 text-muted-foreground">{formatDate(u.created_at)}</td>
                    <td className="px-4 py-4 text-muted-foreground">{formatDate(u.last_sign_in_at)}</td>
                    <td className="px-4 py-4">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 font-body text-[10px] font-bold uppercase tracking-wider ${
                        u.is_admin ? "bg-accent text-accent-foreground" : "bg-secondary text-muted-foreground"
                      }`}>
                        {u.is_admin && <Shield className="h-3 w-3" />}
                        {u.is_admin ? "Admin" : "Usuário"}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-right">
                      <button
                        disabled={savingId === u.id || (u.id === userId && u.is_admin)}
                        onClick={() => setAdmin(u, !u.is_admin)}
                        className={`inline-flex min-w-36 items-center justify-center gap-2 border px-4 py-2 font-body text-[11px] uppercase tracking-widest transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${
                          u.is_admin
                            ? "border-border text-muted-foreground hover:border-accent hover:text-accent"
                            : "border-accent text-accent hover:bg-accent hover:text-accent-foreground"
                        }`}
                      >
                        {savingId === u.id && <Loader2 className="h-3 w-3 animate-spin" />}
                        {u.is_admin ? "Remover" : "Ativar"}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </section>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <p className="font-body text-xs text-muted-foreground">
            {total.toLocaleString("pt-BR")} usuários • página {page}/{totalPages}
          </p>
          <div className="flex items-center gap-2">
            <button
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="flex items-center gap-1 border border-border px-3 py-2 font-body text-[11px] uppercase tracking-widest text-foreground transition-colors hover:bg-foreground hover:text-background disabled:opacity-40"
            >
              <ChevronLeft className="h-3 w-3" /> Anterior
            </button>
            <button
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="flex items-center gap-1 border border-border px-3 py-2 font-body text-[11px] uppercase tracking-widest text-foreground transition-colors hover:bg-foreground hover:text-background disabled:opacity-40"
            >
              Próxima <ChevronRight className="h-3 w-3" />
            </button>
          </div>
        </div>
      </main>

      <ProfileModal isOpen={profileOpen} onClose={() => setProfileOpen(false)} />
      <CartSlidePanel isOpen={cartOpen} onClose={() => setCartOpen(false)} />
    </div>
  );
};

export default AdminUsers;
