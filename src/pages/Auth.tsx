import { useEffect, useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { Loader2, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";

type Mode = "login" | "register";

const loginSchema = z.object({
  email: z.string().trim().email("E-mail inválido").max(255),
  password: z.string().min(6, "Mínimo 6 caracteres").max(72),
});

const registerSchema = loginSchema.extend({
  name: z.string().trim().min(2, "Informe seu nome").max(100),
  phone: z.string().trim().max(30).optional().or(z.literal("")),
});

const Auth = () => {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const redirect = params.get("redirect") || "/";
  const initialMode = (params.get("mode") as Mode) || "login";

  const [mode, setMode] = useState<Mode>(initialMode);
  const [form, setForm] = useState({ name: "", email: "", password: "", phone: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // If already logged in, bounce to redirect
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) navigate(redirect, { replace: true });
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      if (session?.user) navigate(redirect, { replace: true });
    });
    return () => subscription.unsubscribe();
  }, [navigate, redirect]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const schema = mode === "login" ? loginSchema : registerSchema;
    const parsed = schema.safeParse(form);
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message || "Dados inválidos");
      return;
    }

    setLoading(true);
    try {
      if (mode === "register") {
        const { error: signUpError } = await supabase.auth.signUp({
          email: form.email,
          password: form.password,
          options: {
            data: { name: form.name, phone: form.phone },
            emailRedirectTo: `${window.location.origin}${redirect}`,
          },
        });
        if (signUpError) throw signUpError;
        toast.success("Conta criada! Verifique seu e-mail para confirmar.");
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: form.email,
          password: form.password,
        });
        if (signInError) throw signInError;
        toast.success("Login realizado!");
        navigate(redirect, { replace: true });
      }
    } catch (err: any) {
      setError(err?.message || "Erro na autenticação.");
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "w-full border border-border bg-input px-4 py-3 font-body text-sm text-foreground placeholder:text-muted-foreground focus:border-foreground focus:outline-none transition-colors";

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-md border border-border bg-card p-8">
        <Link
          to="/"
          className="mb-6 flex items-center gap-2 font-body text-xs uppercase tracking-widest text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> Voltar à loja
        </Link>

        <h1 className="mb-2 font-display text-2xl font-bold uppercase tracking-wider text-foreground">
          {mode === "login" ? "Entrar" : "Criar conta"}
        </h1>
        <p className="mb-8 font-body text-xs text-muted-foreground">
          {mode === "login"
            ? "Acesse sua conta para finalizar pedidos."
            : "Rápido e gratuito. Acompanhe pedidos pelo seu perfil."}
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {error && (
            <div className="border border-accent/30 bg-accent/10 px-4 py-3">
              <p className="font-body text-xs text-accent">{error}</p>
            </div>
          )}

          {mode === "register" && (
            <>
              <input
                type="text"
                placeholder="Nome completo"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className={inputClass}
              />
              <input
                type="tel"
                placeholder="Telefone (opcional)"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className={inputClass}
              />
            </>
          )}

          <input
            type="email"
            placeholder="E-mail"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className={inputClass}
          />
          <input
            type="password"
            placeholder="Senha (mínimo 6)"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            className={inputClass}
          />

          <button
            type="submit"
            disabled={loading}
            className="mt-2 flex items-center justify-center gap-2 bg-foreground py-4 font-body text-xs uppercase tracking-widest text-background transition-opacity hover:opacity-80 disabled:opacity-40"
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            {mode === "login" ? "Entrar" : "Criar conta"}
          </button>

          <button
            type="button"
            onClick={() => { setMode(mode === "login" ? "register" : "login"); setError(""); }}
            className="border border-border py-3 font-body text-xs uppercase tracking-widest text-foreground transition-colors hover:bg-secondary"
          >
            {mode === "login" ? "Criar uma conta" : "Já tenho conta"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Auth;