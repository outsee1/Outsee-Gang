import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type AuthMode = "login" | "register";

interface UserData {
  name: string;
  email: string;
  password: string;
}

const USERS_KEY = "outsee_users";
const SESSION_KEY = "outsee_session";

const getStoredUsers = (): UserData[] => {
  try {
    return JSON.parse(localStorage.getItem(USERS_KEY) || "[]");
  } catch {
    return [];
  }
};

const ProfileModal = ({ isOpen, onClose }: ProfileModalProps) => {
  const [mode, setMode] = useState<AuthMode>("login");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);
  const [formData, setFormData] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

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
    setFormData({ name: "", email: "", password: "" });
  };

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
            <div className="flex items-center justify-between border-b border-border p-6">
              <h2 className="font-display text-lg font-semibold uppercase tracking-wider text-foreground">
                {isLoggedIn ? "Perfil" : mode === "login" ? "Entrar" : "Criar Conta"}
              </h2>
              <button onClick={onClose}>
                <X className="h-5 w-5 text-muted-foreground hover:text-foreground" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              {isLoggedIn && user ? (
                <div className="flex flex-col items-center gap-4 pt-8">
                  <div className="flex h-20 w-20 items-center justify-center border border-foreground">
                    <span className="font-display text-2xl text-foreground">
                      {user.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <p className="font-body text-lg text-foreground">{user.name}</p>
                  <p className="font-body text-sm text-muted-foreground">{user.email}</p>
                  <button
                    onClick={handleLogout}
                    className="mt-6 w-full border border-border py-3 font-body text-xs uppercase tracking-widest text-foreground transition-colors hover:bg-foreground hover:text-background"
                  >
                    Sair da conta
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="flex flex-col gap-5 pt-4">
                  {error && (
                    <p className="font-body text-xs text-accent">{error}</p>
                  )}

                  {mode === "register" && (
                    <div>
                      <label className="mb-2 block font-body text-xs uppercase tracking-widest text-muted-foreground">
                        Nome
                      </label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                        className="w-full border border-border bg-input px-4 py-3 font-body text-sm text-foreground placeholder:text-muted-foreground focus:border-foreground focus:outline-none"
                      />
                    </div>
                  )}

                  <div>
                    <label className="mb-2 block font-body text-xs uppercase tracking-widest text-muted-foreground">
                      E-mail
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                      className="w-full border border-border bg-input px-4 py-3 font-body text-sm text-foreground placeholder:text-muted-foreground focus:border-foreground focus:outline-none"
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
                      className="w-full border border-border bg-input px-4 py-3 font-body text-sm text-foreground placeholder:text-muted-foreground focus:border-foreground focus:outline-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="mt-2 w-full bg-foreground py-3 font-body text-xs uppercase tracking-widest text-background transition-opacity hover:opacity-80"
                  >
                    {mode === "login" ? "Entrar" : "Criar Conta"}
                  </button>

                  <button
                    type="button"
                    onClick={() => { setMode(mode === "login" ? "register" : "login"); setError(""); }}
                    className="font-body text-xs uppercase tracking-wider text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {mode === "login" ? "Não tem conta? Criar uma" : "Já tem conta? Entrar"}
                  </button>
                </form>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default ProfileModal;
