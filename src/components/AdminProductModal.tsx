import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Product, useAdminUpdateProduct, useAdminCreateProduct, useAdminDeleteProduct } from "@/hooks/useProducts";

interface AdminProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  product?: Product | null; // null = create mode
}

const DEFAULT_SIZES = ["PP", "P", "M", "G", "GG", "XG"];

const AdminProductModal = ({ isOpen, onClose, product }: AdminProductModalProps) => {
  const isEdit = !!product;
  const updateMutation = useAdminUpdateProduct();
  const createMutation = useAdminCreateProduct();
  const deleteMutation = useAdminDeleteProduct();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [tag, setTag] = useState("");
  const [category, setCategory] = useState("Moletons");
  const [sizeAvailability, setSizeAvailability] = useState<Record<string, boolean>>({});
  const [colors, setColors] = useState<{ name: string; hex: string }[]>([]);
  const [newColorName, setNewColorName] = useState("");
  const [newColorHex, setNewColorHex] = useState("#000000");

  useEffect(() => {
    if (product) {
      setName(product.name);
      setDescription(product.description);
      setPrice(String(product.price));
      setTag(product.tag || "");
      setCategory(product.category);
      const avail: Record<string, boolean> = {};
      product.sizes.forEach((s) => { avail[s.size] = s.available; });
      // Fill missing sizes
      DEFAULT_SIZES.forEach((s) => {
        if (!(s in avail)) avail[s] = true;
      });
      setSizeAvailability(avail);
      setColors(product.colors.map((c) => ({ name: c.name, hex: c.hex })));
    } else {
      setName("");
      setDescription("");
      setPrice("");
      setTag("");
      setCategory("Moletons");
      const avail: Record<string, boolean> = {};
      DEFAULT_SIZES.forEach((s) => { avail[s] = true; });
      setSizeAvailability(avail);
      setColors([]);
    }
  }, [product, isOpen]);

  const handleSave = async () => {
    if (!name.trim() || !price.trim()) {
      toast.error("Nome e preço são obrigatórios.");
      return;
    }

    try {
      if (isEdit && product) {
        await updateMutation.mutateAsync({
          productId: product.id,
          updates: {
            name,
            description,
            price: parseFloat(price),
            tag: tag || null,
            category,
            sizes: product.sizes.map((s) => ({
              id: s.id,
              available: sizeAvailability[s.size] ?? true,
            })),
          },
        });
        toast.success("Produto atualizado!");
      } else {
        const sizes = DEFAULT_SIZES.map((s) => ({
          size: s,
          available: sizeAvailability[s] ?? true,
        }));
        await createMutation.mutateAsync({
          name,
          description,
          price: parseFloat(price),
          tag: tag || undefined,
          category,
          colors,
          sizes,
        });
        toast.success("Produto criado!");
      }
      onClose();
    } catch (err) {
      console.error(err);
      toast.error("Erro ao salvar produto.");
    }
  };

  const handleDelete = async () => {
    if (!product) return;
    if (!confirm("Tem certeza que deseja excluir este produto?")) return;
    try {
      await deleteMutation.mutateAsync(product.id);
      toast.success("Produto excluído!");
      onClose();
    } catch {
      toast.error("Erro ao excluir produto.");
    }
  };

  const addColor = () => {
    if (!newColorName.trim()) return;
    setColors([...colors, { name: newColorName, hex: newColorHex }]);
    setNewColorName("");
    setNewColorHex("#000000");
  };

  const removeColor = (idx: number) => {
    setColors(colors.filter((_, i) => i !== idx));
  };

  const loading = updateMutation.isPending || createMutation.isPending || deleteMutation.isPending;

  const inputClass =
    "w-full border border-border bg-input px-4 py-3 font-body text-sm text-foreground placeholder:text-muted-foreground focus:border-foreground focus:outline-none transition-colors";

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className="fixed inset-0 z-[60] bg-[hsl(var(--overlay))]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            className="fixed right-0 top-0 z-[70] flex h-full w-full max-w-lg flex-col border-l border-border bg-card"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "tween", duration: 0.3 }}
          >
            <div className="flex items-center justify-between border-b border-border p-6">
              <h2 className="font-display text-lg font-semibold uppercase tracking-wider text-foreground">
                {isEdit ? "Editar Produto" : "Novo Produto"}
              </h2>
              <button onClick={onClose}>
                <X className="h-5 w-5 text-muted-foreground hover:text-foreground" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-5">
              <div>
                <label className="mb-2 block font-body text-xs uppercase tracking-widest text-muted-foreground">Nome</label>
                <input value={name} onChange={(e) => setName(e.target.value)} className={inputClass} placeholder="Nome do produto" />
              </div>

              <div>
                <label className="mb-2 block font-body text-xs uppercase tracking-widest text-muted-foreground">Descrição</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className={`${inputClass} min-h-[80px] resize-y`}
                  placeholder="Descrição do produto"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-2 block font-body text-xs uppercase tracking-widest text-muted-foreground">Preço (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className={inputClass}
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label className="mb-2 block font-body text-xs uppercase tracking-widest text-muted-foreground">Tag</label>
                  <input value={tag} onChange={(e) => setTag(e.target.value)} className={inputClass} placeholder="Ex: NOVO" />
                </div>
              </div>

              <div>
                <label className="mb-2 block font-body text-xs uppercase tracking-widest text-muted-foreground">Categoria</label>
                <input value={category} onChange={(e) => setCategory(e.target.value)} className={inputClass} placeholder="Ex: Moletons" />
              </div>

              {/* Sizes */}
              <div>
                <label className="mb-3 block font-body text-xs uppercase tracking-widest text-muted-foreground">
                  Tamanhos (clique para marcar indisponível)
                </label>
                <div className="flex flex-wrap gap-2">
                  {DEFAULT_SIZES.map((size) => (
                    <button
                      key={size}
                      type="button"
                      onClick={() => setSizeAvailability({ ...sizeAvailability, [size]: !sizeAvailability[size] })}
                      className={`flex h-10 w-10 items-center justify-center border font-body text-xs transition-colors ${
                        sizeAvailability[size]
                          ? "border-foreground bg-foreground text-background"
                          : "border-border text-muted-foreground line-through opacity-50"
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              {/* Colors (create mode only for now) */}
              {!isEdit && (
                <div>
                  <label className="mb-3 block font-body text-xs uppercase tracking-widest text-muted-foreground">Cores</label>
                  <div className="space-y-2">
                    {colors.map((c, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <div className="h-6 w-6 rounded-full border border-border" style={{ backgroundColor: c.hex }} />
                        <span className="font-body text-sm text-foreground">{c.name}</span>
                        <button onClick={() => removeColor(idx)} className="ml-auto text-muted-foreground hover:text-foreground">
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={newColorHex}
                        onChange={(e) => setNewColorHex(e.target.value)}
                        className="h-8 w-8 cursor-pointer border-0 p-0"
                      />
                      <input
                        value={newColorName}
                        onChange={(e) => setNewColorName(e.target.value)}
                        className={`${inputClass} flex-1`}
                        placeholder="Nome da cor"
                      />
                      <button
                        type="button"
                        onClick={addColor}
                        className="border border-border px-3 py-2 font-body text-xs text-foreground hover:bg-foreground hover:text-background transition-colors"
                      >
                        Add
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="border-t border-border p-6 space-y-3">
              {isEdit && (
                <button
                  onClick={handleDelete}
                  disabled={loading}
                  className="flex w-full items-center justify-center gap-2 border border-accent py-3 font-body text-xs uppercase tracking-widest text-accent transition-colors hover:bg-accent hover:text-accent-foreground"
                >
                  <Trash2 className="h-4 w-4" />
                  Excluir Produto
                </button>
              )}
              <button
                onClick={handleSave}
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 bg-foreground py-4 font-body text-xs uppercase tracking-widest text-background transition-opacity hover:opacity-80 disabled:opacity-40"
              >
                {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                {isEdit ? "Salvar Alterações" : "Criar Produto"}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default AdminProductModal;
