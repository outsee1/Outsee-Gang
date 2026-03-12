import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, Minus, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useCart } from "@/contexts/CartContext";
import brandLogo from "@/assets/brand-logo.png";

interface CartSlidePanelProps {
  isOpen: boolean;
  onClose: () => void;
}

type Step = "cart" | "checkout";

const CartSlidePanel = ({ isOpen, onClose }: CartSlidePanelProps) => {
  const navigate = useNavigate();
  const { items, removeItem, updateQuantity, clearCart, totalPrice, totalItems } = useCart();
  const [step, setStep] = useState<Step>("cart");
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    cep: "",
    payment: "",
  });

  const handleClose = () => {
    setStep("cart");
    onClose();
  };

  const handleFinalize = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Pedido realizado com sucesso!");
    clearCart();
    setStep("cart");
    onClose();
    navigate("/");
  };

  const formatCep = (value: string) => {
    const digits = value.replace(/\D/g, "").slice(0, 8);
    if (digits.length > 5) return `${digits.slice(0, 5)}-${digits.slice(5)}`;
    return digits;
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
            onClick={handleClose}
          />

          <motion.div
            className="fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col border-l border-border bg-card"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "tween", duration: 0.3 }}
          >
            {step === "cart" ? (
              <>
                <div className="flex items-center justify-between border-b border-border p-6">
                  <h2 className="font-display text-lg font-semibold uppercase tracking-wider text-foreground">
                    Carrinho ({totalItems})
                  </h2>
                  <button onClick={handleClose}>
                    <X className="h-5 w-5 text-muted-foreground hover:text-foreground" />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6">
                  {items.length === 0 ? (
                    <p className="pt-8 text-center font-body text-sm text-muted-foreground">
                      Seu carrinho está vazio.
                    </p>
                  ) : (
                    <div className="space-y-0 divide-y divide-border">
                      {items.map((item) => (
                        <div key={`${item.productId}-${item.size}`} className="flex gap-4 py-4">
                          <div className="h-20 w-20 flex-shrink-0 overflow-hidden bg-secondary">
                            <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                          </div>
                          <div className="flex flex-1 flex-col justify-between">
                            <div className="flex items-start justify-between">
                              <div>
                                <h3 className="font-body text-sm font-medium text-foreground">{item.name}</h3>
                                <p className="font-body text-xs text-muted-foreground">Tam: {item.size}</p>
                              </div>
                              <button onClick={() => removeItem(item.productId, item.size)}>
                                <X className="h-3.5 w-3.5 text-muted-foreground hover:text-foreground" />
                              </button>
                            </div>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2 border border-border">
                                <button
                                  onClick={() => updateQuantity(item.productId, item.size, item.quantity - 1)}
                                  className="p-1.5 text-muted-foreground hover:text-foreground"
                                >
                                  <Minus className="h-3 w-3" />
                                </button>
                                <span className="font-body text-xs text-foreground">{item.quantity}</span>
                                <button
                                  onClick={() => updateQuantity(item.productId, item.size, item.quantity + 1)}
                                  className="p-1.5 text-muted-foreground hover:text-foreground"
                                >
                                  <Plus className="h-3 w-3" />
                                </button>
                              </div>
                              <p className="font-body text-sm text-foreground">{item.price}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {items.length > 0 && (
                  <div className="border-t border-border p-6">
                    <div className="mb-4 flex justify-between font-display text-lg font-bold text-foreground">
                      <span>Total</span>
                      <span>R$ {totalPrice.toLocaleString("pt-BR")}</span>
                    </div>
                    <button
                      onClick={() => setStep("checkout")}
                      className="w-full bg-foreground py-4 font-body text-xs uppercase tracking-widest text-background transition-opacity hover:opacity-80"
                    >
                      Finalizar pedido
                    </button>
                  </div>
                )}
              </>
            ) : (
              <>
                <div className="flex items-center justify-between border-b border-border p-6">
                  <button
                    onClick={() => setStep("cart")}
                    className="font-body text-xs uppercase tracking-widest text-muted-foreground hover:text-foreground"
                  >
                    ← Voltar
                  </button>
                  <button onClick={handleClose}>
                    <X className="h-5 w-5 text-muted-foreground hover:text-foreground" />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6">
                  <div className="mb-8 flex justify-center">
                    <img src={brandLogo} alt="Outsee" className="h-12 w-auto" />
                  </div>

                  <form onSubmit={handleFinalize} className="flex flex-col gap-5">
                    <div>
                      <label className="mb-2 block font-body text-xs uppercase tracking-widest text-muted-foreground">
                        Nome
                      </label>
                      <input
                        type="text"
                        value={form.firstName}
                        onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                        required
                        className="w-full border border-border bg-input px-4 py-3 font-body text-sm text-foreground placeholder:text-muted-foreground focus:border-foreground focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="mb-2 block font-body text-xs uppercase tracking-widest text-muted-foreground">
                        Sobrenome
                      </label>
                      <input
                        type="text"
                        value={form.lastName}
                        onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                        required
                        className="w-full border border-border bg-input px-4 py-3 font-body text-sm text-foreground placeholder:text-muted-foreground focus:border-foreground focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="mb-2 block font-body text-xs uppercase tracking-widest text-muted-foreground">
                        CEP
                      </label>
                      <input
                        type="text"
                        value={form.cep}
                        onChange={(e) => setForm({ ...form, cep: formatCep(e.target.value) })}
                        required
                        placeholder="00000-000"
                        className="w-full border border-border bg-input px-4 py-3 font-body text-sm text-foreground placeholder:text-muted-foreground focus:border-foreground focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="mb-2 block font-body text-xs uppercase tracking-widest text-muted-foreground">
                        Forma de pagamento
                      </label>
                      <div className="flex flex-col gap-2">
                        {["PIX", "Cartão de Crédito", "Boleto"].map((method) => (
                          <button
                            key={method}
                            type="button"
                            onClick={() => setForm({ ...form, payment: method })}
                            className={`w-full border px-4 py-3 text-left font-body text-sm transition-colors ${
                              form.payment === method
                                ? "border-foreground bg-foreground text-background"
                                : "border-border text-foreground hover:border-foreground"
                            }`}
                          >
                            {method}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="mt-4 border-t border-border pt-4">
                      <div className="mb-4 flex justify-between font-display text-lg font-bold text-foreground">
                        <span>Total</span>
                        <span>R$ {totalPrice.toLocaleString("pt-BR")}</span>
                      </div>
                      <button
                        type="submit"
                        disabled={!form.payment}
                        className="w-full bg-foreground py-4 font-body text-xs uppercase tracking-widest text-background transition-opacity hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        Confirmar pedido
                      </button>
                    </div>
                  </form>
                </div>
              </>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default CartSlidePanel;
