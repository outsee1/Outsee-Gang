import { useState } from "react";
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
}

const ProfileModal = ({ isOpen, onClose }: ProfileModalProps) => {
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

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 z-40 bg-[hsl(var(--overlay))]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Panel */}
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
                {isLoggedIn ? "Perfil" : mode === "login" ? "Entrar" : "Criar Conta"}
              </h2>
              <button onClick={onClose}>
                <X className="h-5 w-5 text-muted-foreground hover:text-foreground" />
              </button>
            </div>

            {/* Content */}
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
                    onClick={() => setMode(mode === "login" ? "register" : "login")}
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
