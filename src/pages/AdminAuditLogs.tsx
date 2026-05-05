import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Loader2, Shield } from "lucide-react";
import { toast } from "sonner";
import Header from "@/components/Header";
import ProfileModal from "@/components/ProfileModal";
import CartSlidePanel from "@/components/CartSlidePanel";
import { useCart } from "@/contexts/CartContext";
import { useAdminAuth } from "@/hooks/useAdmin";
import { supabase } from "@/integrations/supabase/client";

interface AuditLog {
  id: string;
  function_name: string;
  user_id: string | null;
  ip: string | null;
  metadata: any;
  created_at: string;
}

const AdminAuditLogs = () => {
  const navigate = useNavigate();
  const { isAdmin, loading: authLoading } = useAdminAuth();
  const [profileOpen, setProfileOpen] = useState(false);
  const { cartOpen, setCartOpen } = useCart();

  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [fnFilter, setFnFilter] = useState("");
  const [userFilter, setUserFilter] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  useEffect(() => {
    if (authLoading) return;
    if (!isAdmin) {
      navigate("/", { replace: true });
      return;
    }
    const load = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("audit_logs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(500);
      if (error) toast.error("Erro ao carregar logs.");
      else setLogs((data || []) as AuditLog[]);
      setLoading(false);
    };
    load();
  }, [authLoading, isAdmin, navigate]);

  const functions = useMemo(
    () => Array.from(new Set(logs.map((l) => l.function_name))).sort(),
    [logs]
  );

  const filtered = useMemo(() => {
    return logs.filter((l) => {
      if (fnFilter && l.function_name !== fnFilter) return false;
      if (userFilter && !(l.user_id || "").toLowerCase().includes(userFilter.toLowerCase())) return false;
      const ts = new Date(l.created_at).getTime();
      if (from && ts < new Date(from).getTime()) return false;
      if (to && ts > new Date(to).getTime() + 86_399_000) return false;
      return true;
    });
  }, [logs, fnFilter, userFilter, from, to]);

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit", second: "2-digit" });

  const inputClass =
    "border border-border bg-input px-3 py-2 font-body text-xs text-foreground focus:border-foreground focus:outline-none";

  return (
    <div className="min-h-screen bg-background">
      <Header onProfileClick={() => setProfileOpen(true)} />

      <div className="container py-8">
        <button
          onClick={() => navigate("/admin")}
          className="mb-6 flex items-center gap-2 font-body text-xs uppercase tracking-widest text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> Painel admin
        </button>

        <div className="mb-8 flex items-center gap-3">
          <Shield className="h-6 w-6 text-accent" />
          <h1 className="font-display text-2xl font-bold uppercase tracking-wider text-foreground">
            Logs de auditoria
          </h1>
        </div>

        <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <select value={fnFilter} onChange={(e) => setFnFilter(e.target.value)} className={inputClass}>
            <option value="">Todas as funções</option>
            {functions.map((f) => (
              <option key={f} value={f}>{f}</option>
            ))}
          </select>
          <input
            type="text"
            placeholder="Filtrar por user_id..."
            value={userFilter}
            onChange={(e) => setUserFilter(e.target.value)}
            className={inputClass}
          />
          <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className={inputClass} />
          <input type="date" value={to} onChange={(e) => setTo(e.target.value)} className={inputClass} />
        </div>

        {loading || authLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <>
            <p className="mb-3 font-body text-xs text-muted-foreground">
              {filtered.length} de {logs.length} registros
            </p>
            <div className="overflow-x-auto border border-border">
              <table className="w-full font-body text-xs">
                <thead className="bg-secondary text-muted-foreground">
                  <tr>
                    <th className="px-3 py-2 text-left uppercase tracking-widest">Data</th>
                    <th className="px-3 py-2 text-left uppercase tracking-widest">Função</th>
                    <th className="px-3 py-2 text-left uppercase tracking-widest">Usuário</th>
                    <th className="px-3 py-2 text-left uppercase tracking-widest">IP</th>
                    <th className="px-3 py-2 text-left uppercase tracking-widest">Metadata</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((l) => (
                    <tr key={l.id} className="border-t border-border align-top">
                      <td className="px-3 py-2 text-muted-foreground">{formatDate(l.created_at)}</td>
                      <td className="px-3 py-2 text-foreground">{l.function_name}</td>
                      <td className="px-3 py-2 font-mono text-[11px] text-muted-foreground">
                        {l.user_id ? l.user_id.slice(0, 8) + "..." : "—"}
                      </td>
                      <td className="px-3 py-2 font-mono text-[11px] text-muted-foreground">{l.ip || "—"}</td>
                      <td className="px-3 py-2">
                        <pre className="max-w-md overflow-hidden whitespace-pre-wrap break-all font-mono text-[10px] text-muted-foreground">
                          {JSON.stringify(l.metadata)}
                        </pre>
                      </td>
                    </tr>
                  ))}
                  {filtered.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-3 py-8 text-center text-muted-foreground">
                        Nenhum registro com esses filtros.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      <ProfileModal isOpen={profileOpen} onClose={() => setProfileOpen(false)} />
      <CartSlidePanel isOpen={cartOpen} onClose={() => setCartOpen(false)} />
    </div>
  );
};

export default AdminAuditLogs;