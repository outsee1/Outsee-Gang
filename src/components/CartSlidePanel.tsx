import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, Minus, Plus, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useCart } from "@/contexts/CartContext";
import { saveOrder } from "@/utils/orderHistory";
import { supabase } from "@/integrations/supabase/client";
import brandLogo from "@/assets/brand-logo.png";

interface CartSlidePanelProps {
  isOpen: boolean;
  onClose: () => void;
}

type Step = "cart" | "checkout";

interface AddressData {
  logradouro: string;
  bairro: string;
  localidade: string;
  uf: string;
}

const CartSlidePanel = ({ isOpen, onClose }: CartSlidePanelProps) => {
  const navigate = useNavigate();
  const { items, removeItem, updateQuantity, clearCart, totalPrice, totalItems } = useCart();
  const [step, setStep] = useState<Step>("cart");
  const [submitting, setSubmitting] = useState(false);
  const [loadingCep, setLoadingCep] = useState(false);
  const [address, setAddress] = useState<AddressData | null>(null);
  const [cepError, setCepError] = useState("");
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    cep: "",
    numero: "",
    complemento: "",
    payment: "",
  });

  const handleClose = () => {
    setStep("cart");
    onClose();
  };

  const handleFinalize = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!address) {
      setCepError("Informe um CEP válido.");
      return;
    }
    if (!form.numero.trim()) return;
    if (!form.payment) return;

    setSubmitting(true);

    const order = saveOrder({
      items: [...items],
      totalPrice,
      firstName: form.firstName,
      lastName: form.lastName,
      cep: form.cep,
      numero: form.numero,
      complemento: form.complemento,
      address: `${address.logradouro}, ${form.numero}${form.complemento ? ` - ${form.complemento}` : ""}, ${address.bairro} - ${address.localidade}/${address.uf}`,
      payment: form.payment,
      date: new Date().toISOString(),
    });

    // Try Mercado Pago checkout
    if (form.payment === "Mercado Pago") {
      try {
        const mpItems = items.map((item) => ({
          name: item.name,
          price: typeof item.price === "string"
            ? parseFloat(item.price.replace(/[^\d,]/g, "").replace(",", "."))
            : item.price,
          quantity: item.quantity,
        }));

        const { data, error } = await supabase.functions.invoke("create-mp-preference", {
          body: {
            items: mpItems,
            payer: { firstName: form.firstName, lastName: form.lastName },
            orderId: order.id,
          },
        });

        if (error) throw error;
        if (data?.init_point) {
          clearCart();
          window.location.href = data.init_point;
          return;
        }
      } catch (err) {
        console.error("MP error:", err);
        toast.error("Erro ao conectar com Mercado Pago. Pedido salvo localmente.");
      }
    }

    toast.success("Pedido realizado com sucesso!");
    clearCart();
    setStep("cart");
    setForm({ firstName: "", lastName: "", cep: "", numero: "", complemento: "", payment: "" });
    setAddress(null);
    setSubmitting(false);
    onClose();
    navigate(`/pedido-confirmado?id=${order.id}`);
  };

  const formatCep = (value: string) => {
    const digits = value.replace(/\D/g, "").slice(0, 8);
    if (digits.length > 5) return `${digits.slice(0, 5)}-${digits.slice(5)}`;
    return digits;
  };

  const fetchAddress = async (cep: string) => {
    const digits = cep.replace(/\D/g, "");
    if (digits.length !== 8) {
      setAddress(null);
      setCepError("");
      return;
    }
    setLoadingCep(true);
    setCepError("");
    try {
      const res = await fetch(`https://viacep.com.br/ws/${digits}/json/`);
      const data = await res.json();
      if (data.erro) {
        setCepError("CEP não encontrado.");
        setAddress(null);
      } else {
        setAddress({
          logradouro: data.logradouro || "",
          bairro: data.bairro || "",
          localidade: data.localidade || "",
          uf: data.uf || "",
        });
      }
    } catch {
      setCepError("Erro ao buscar CEP.");
      setAddress(null);
    } finally {
      setLoadingCep(false);
    }
  };

  const handleCepChange = (value: string) => {
    const formatted = formatCep(value);
    setForm({ ...form, cep: formatted });
    fetchAddress(formatted);
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
                        <div key={`${item.productId}-${item.size}-${item.color || ""}`} className="flex gap-4 py-4">
                          <div className="h-20 w-20 flex-shrink-0 overflow-hidden bg-secondary">
                            <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                          </div>
                          <div className="flex flex-1 flex-col justify-between">
                            <div className="flex items-start justify-between">
                              <div>
                                <h3 className="font-body text-sm font-medium text-foreground">{item.name}</h3>
                                <p className="font-body text-xs text-muted-foreground">
                                  Tam: {item.size}{item.color ? ` · ${item.color}` : ""}
                                </p>
                              </div>
                              <button onClick={() => removeItem(item.productId, item.size, item.color)}>
                                <X className="h-3.5 w-3.5 text-muted-foreground hover:text-foreground" />
                              </button>
                            </div>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2 border border-border">
                                <button
                                  onClick={() => updateQuantity(item.productId, item.size, item.quantity - 1, item.color)}
                                  className="p-1.5 text-muted-foreground hover:text-foreground"
                                >
                                  <Minus className="h-3 w-3" />
                                </button>
                                <span className="font-body text-xs text-foreground">{item.quantity}</span>
                                <button
                                  onClick={() => updateQuantity(item.productId, item.size, item.quantity + 1, item.color)}
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
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="mb-2 block font-body text-xs uppercase tracking-widest text-muted-foreground">
                          Nome
                        </label>
                        <input
                          type="text"
                          value={form.firstName}
                          onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                          required
                          className={inputClass}
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
                          className={inputClass}
                        />
                      </div>
                    </div>

                    {/* CEP + Número side by side */}
                    <div className="grid grid-cols-5 gap-3">
                      <div className="col-span-3">
                        <label className="mb-2 block font-body text-xs uppercase tracking-widest text-muted-foreground">
                          CEP
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            value={form.cep}
                            onChange={(e) => handleCepChange(e.target.value)}
                            required
                            placeholder="00000-000"
                            className={inputClass}
                          />
                          {loadingCep && (
                            <Loader2 className="absolute right-3 top-3.5 h-4 w-4 animate-spin text-muted-foreground" />
                          )}
                        </div>
                        {cepError && (
                          <p className="mt-1 font-body text-xs text-accent">{cepError}</p>
                        )}
                      </div>
                      <div className="col-span-2">
                        <label className="mb-2 block font-body text-xs uppercase tracking-widest text-muted-foreground">
                          Número
                        </label>
                        <input
                          type="text"
                          value={form.numero}
                          onChange={(e) => setForm({ ...form, numero: e.target.value })}
                          required
                          placeholder="Nº"
                          className={inputClass}
                        />
                      </div>
                    </div>

                    {address && (
                      <p className="-mt-3 font-body text-xs text-muted-foreground">
                        {address.logradouro && `${address.logradouro}, `}{address.bairro && `${address.bairro} - `}{address.localidade}/{address.uf}
                      </p>
                    )}

                    <div>
                      <label className="mb-2 block font-body text-xs uppercase tracking-widest text-muted-foreground">
                        Complemento
                      </label>
                      <input
                        type="text"
                        value={form.complemento}
                        onChange={(e) => setForm({ ...form, complemento: e.target.value })}
                        placeholder="Apto, bloco, referência..."
                        className={inputClass}
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
