import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Loader2, Shield, Download, ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import Header from "@/components/Header";
import ProfileModal from "@/components/ProfileModal";
import CartSlidePanel from "@/components/CartSlidePanel";
import { useCart } from "@/contexts/CartContext";
import { useAdminAuth } from "@/hooks/useAdmin";
import { supabase } from "@/integrations/supabase/client";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

interface AuditLog {
  id: string;
  function_name: string;
  user_id: string | null;
  ip: string | null;
  metadata: any;
  created_at: string;
}

const PAGE_SIZE = 50;

const AdminAuditLogs = () => {
  const navigate = useNavigate();
  const { isAdmin, loading: authLoading, userId } = useAdminAuth();
  const [profileOpen, setProfileOpen] = useState(false);
  const { cartOpen, setCartOpen } = useCart();

  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [page, setPage] = useState(0);
  const [total, setTotal] = useState(0);
  const [functions, setFunctions] = useState<string[]>([]);

  // Filters
  const [fnFilter, setFnFilter] = useState("");
  const [userFilter, setUserFilter] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [debouncedUser, setDebouncedUser] = useState("");

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search.trim()), 300);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedUser(userFilter.trim()), 300);
    return () => clearTimeout(t);
  }, [userFilter]);

  useEffect(() => {
    setPage(0);
  }, [fnFilter, debouncedUser, from, to, debouncedSearch]);

  const buildQuery = () => {
    let q = supabase.from("audit_logs").select("*", { count: "exact" });
    if (fnFilter) q = q.eq("function_name", fnFilter);
    if (debouncedUser) q = q.ilike("user_id", `%${debouncedUser}%`);
    if (from) q = q.gte("created_at", new Date(from).toISOString());
    if (to) {
      const end = new Date(to);
      end.setHours(23, 59, 59, 999);
      q = q.lte("created_at", end.toISOString());
    }
    if (debouncedSearch) {
      const s = debouncedSearch.replace(/[%_,()]/g, "");
      q = q.or(`function_name.ilike.%${s}%,ip.ilike.%${s}%`);
    }
    return q;
  };

  useEffect(() => {
    if (authLoading) return;
    if (!isAdmin) {
      navigate(userId ? "/" : "/auth?redirect=/admin/audit-logs", { replace: true });
      return;
    }
    const load = async () => {
      setLoading(true);
      const fromIdx = page * PAGE_SIZE;
      const toIdx = fromIdx + PAGE_SIZE - 1;
      const { data, error, count } = await buildQuery()
        .order("created_at", { ascending: false })
        .range(fromIdx, toIdx);
      if (error) toast.error("Erro ao carregar logs.");
      else {
        setLogs((data || []) as AuditLog[]);
        setTotal(count ?? 0);
      }
      setLoading(false);
    };
    load();
  }, [authLoading, isAdmin, userId, navigate, page, fnFilter, debouncedUser, from, to, debouncedSearch]);

  // Load distinct function names (one-shot)
  useEffect(() => {
    if (!isAdmin) return;
    supabase
      .from("audit_logs")
      .select("function_name")
      .order("function_name", { ascending: true })
      .limit(1000)
      .then(({ data }) => {
        if (data) setFunctions(Array.from(new Set(data.map((r: any) => r.function_name))).sort());
      });
  }, [isAdmin]);

  const fetchAllFiltered = async (): Promise<AuditLog[]> => {
    const cap = 5000;
    const { data, error } = await buildQuery()
      .order("created_at", { ascending: false })
      .range(0, cap - 1);
    if (error) throw error;
    return (data || []) as AuditLog[];
  };

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit", second: "2-digit" });

  const exportCSV = async () => {
    setExporting(true);
    try {
      const rows = await fetchAllFiltered();
      const header = ["created_at", "function_name", "user_id", "ip", "metadata"];
      const escape = (v: any) => {
        const s = v === null || v === undefined ? "" : typeof v === "object" ? JSON.stringify(v) : String(v);
        return `"${s.replace(/"/g, '""')}"`;
      };
      const csv = [header.join(",")]
        .concat(rows.map((r) => [r.created_at, r.function_name, r.user_id, r.ip, r.metadata].map(escape).join(",")))
        .join("\n");
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `audit-logs-${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success(`${rows.length} registros exportados.`);
    } catch (e) {
      toast.error("Falha ao exportar CSV.");
    } finally {
      setExporting(false);
    }
  };

  const exportPDF = async () => {
    setExporting(true);
    try {
      const rows = await fetchAllFiltered();
      const doc = new jsPDF({ orientation: "landscape" });
      doc.setFontSize(14);
      doc.text("Audit Logs - Outsee", 14, 14);
      doc.setFontSize(9);
      doc.text(
        `Gerado em ${new Date().toLocaleString("pt-BR")} • ${rows.length} registros`,
        14,
        20
      );
      autoTable(doc, {
        startY: 24,
        head: [["Data", "Função", "Usuário", "IP", "Metadata"]],
        body: rows.map((r) => [
          formatDate(r.created_at),
          r.function_name,
          r.user_id ?? "—",
          r.ip ?? "—",
          JSON.stringify(r.metadata).slice(0, 200),
        ]),
        styles: { fontSize: 7, cellPadding: 1.5, overflow: "linebreak" },
        headStyles: { fillColor: [20, 20, 20] },
        columnStyles: { 4: { cellWidth: 110 } },
      });
      doc.save(`audit-logs-${new Date().toISOString().slice(0, 10)}.pdf`);
      toast.success(`${rows.length} registros exportados.`);
    } catch (e) {
      toast.error("Falha ao exportar PDF.");
    } finally {
      setExporting(false);
    }
  };

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

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

        <div className="mb-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          <input
            type="text"
            placeholder="Buscar (função/IP/metadata)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={inputClass}
          />
          <select value={fnFilter} onChange={(e) => setFnFilter(e.target.value)} className={inputClass}>
            <option value="">Todas as funções</option>
            <option value="admin-users">admin-users</option>
            {functions.map((f) => (
              f !== "admin-users" && <option key={f} value={f}>{f}</option>
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

        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div className="flex gap-2">
            <button
              disabled={exporting}
              onClick={exportCSV}
              className="flex items-center gap-2 border border-border bg-secondary px-3 py-2 font-body text-[11px] uppercase tracking-widest text-foreground transition-colors hover:bg-foreground hover:text-background disabled:opacity-50"
            >
              {exporting ? <Loader2 className="h-3 w-3 animate-spin" /> : <Download className="h-3 w-3" />}
              CSV
            </button>
            <button
              disabled={exporting}
              onClick={exportPDF}
              className="flex items-center gap-2 border border-border bg-secondary px-3 py-2 font-body text-[11px] uppercase tracking-widest text-foreground transition-colors hover:bg-foreground hover:text-background disabled:opacity-50"
            >
              {exporting ? <Loader2 className="h-3 w-3 animate-spin" /> : <Download className="h-3 w-3" />}
              PDF
            </button>
          </div>
          <p className="font-body text-xs text-muted-foreground">
            {total.toLocaleString("pt-BR")} registros • página {page + 1}/{totalPages}
          </p>
        </div>

        {loading || authLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <>
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
                  {logs.map((l) => (
                    <tr key={l.id} className="border-t border-border align-top">
                      <td className="px-3 py-2 text-muted-foreground">{formatDate(l.created_at)}</td>
                      <td className="px-3 py-2 text-foreground">
                        <div>{l.function_name}</div>
                        {l.function_name === "admin-users" && (
                          <span className="mt-1 inline-flex border border-accent px-2 py-0.5 font-body text-[10px] uppercase tracking-wider text-accent">
                            Permissão admin
                          </span>
                        )}
                      </td>
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
                  {logs.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-3 py-8 text-center text-muted-foreground">
                        Nenhum registro com esses filtros.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="mt-4 flex items-center justify-end gap-2">
              <button
                disabled={page === 0}
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                className="flex items-center gap-1 border border-border px-3 py-2 font-body text-[11px] uppercase tracking-widest text-foreground transition-colors hover:bg-foreground hover:text-background disabled:opacity-40"
              >
                <ChevronLeft className="h-3 w-3" /> Anterior
              </button>
              <button
                disabled={page + 1 >= totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="flex items-center gap-1 border border-border px-3 py-2 font-body text-[11px] uppercase tracking-widest text-foreground transition-colors hover:bg-foreground hover:text-background disabled:opacity-40"
              >
                Próxima <ChevronRight className="h-3 w-3" />
              </button>
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