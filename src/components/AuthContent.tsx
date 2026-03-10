import { useState } from "react";
import { motion } from "framer-motion";

type AuthMode = "login" | "register";

interface UserData {
  name: string;
  email: string;
}

const AuthContent = () => {
  const [mode, setMode] = useState<AuthMode>("login");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<UserData | null>(null);
  const [formData, setFormData] = useState({ name: "", email: "", password: "" });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === "register") {
      setUser({ name: formData.name, email: formData.email });
    } else {
      setUser({ name: formData.email.split("@")[0], email: formData.email });
    }
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUser(null);
    setFormData({ name: "", email: "", password: "" });
  };

  if (isLoggedIn && user) {
    return (
      <div className="text-center">
        <h2 className="font-display mb-4 text-2xl uppercase tracking-[0.3em] text-vault-foreground">
          Perfil
        </h2>
        <div className="mb-8 flex flex-col items-center gap-2">
          <div className="flex h-20 w-20 items-center justify-center rounded-full border border-vault-foreground">
            <span className="font-display text-2xl text-vault-foreground">
              {user.name.charAt(0).toUpperCase()}
            </span>
          </div>
          <p className="mt-4 font-body text-lg text-vault-foreground">{user.name}</p>
          <p className="font-body text-sm text-vault-foreground/50">{user.email}</p>
        </div>
        <button
          onClick={handleLogout}
          className="border border-vault-foreground px-8 py-3 font-body text-xs uppercase tracking-[0.2em] text-vault-foreground transition-colors hover:bg-vault-foreground hover:text-vault"
        >
          Sair
        </button>
      </div>
    );
  }

  return (
    <div className="text-center">
      <h2 className="font-display mb-12 text-2xl uppercase tracking-[0.3em] text-vault-foreground">
        {mode === "login" ? "Entrar" : "Criar Conta"}
      </h2>

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        {mode === "register" && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <input
              type="text"
              placeholder="Nome"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              className="w-full border-b border-vault-foreground/30 bg-transparent pb-3 font-body text-lg text-vault-foreground placeholder:text-vault-foreground/30 focus:border-vault-foreground focus:outline-none"
            />
          </motion.div>
        )}

        <input
          type="email"
          placeholder="E-mail"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          required
          className="w-full border-b border-vault-foreground/30 bg-transparent pb-3 font-body text-lg text-vault-foreground placeholder:text-vault-foreground/30 focus:border-vault-foreground focus:outline-none"
        />

        <input
          type="password"
          placeholder="Senha"
          value={formData.password}
          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          required
          minLength={6}
          className="w-full border-b border-vault-foreground/30 bg-transparent pb-3 font-body text-lg text-vault-foreground placeholder:text-vault-foreground/30 focus:border-vault-foreground focus:outline-none"
        />

        <button
          type="submit"
          className="mt-4 w-full border border-vault-foreground py-4 font-body text-xs uppercase tracking-[0.2em] text-vault-foreground transition-colors hover:bg-vault-foreground hover:text-vault"
        >
          {mode === "login" ? "Entrar" : "Criar Conta"}
        </button>
      </form>

      <button
        onClick={() => setMode(mode === "login" ? "register" : "login")}
        className="mt-8 font-body text-xs uppercase tracking-[0.15em] text-vault-foreground/50 transition-colors hover:text-vault-foreground"
      >
        {mode === "login" ? "Não tem conta? Criar uma" : "Já tem conta? Entrar"}
      </button>
    </div>
  );
};

export default AuthContent;
