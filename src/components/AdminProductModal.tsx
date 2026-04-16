import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, Loader2, Trash2, Upload, Image as ImageIcon, Plus } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Product, useAdminUpdateProduct, useAdminCreateProduct, useAdminDeleteProduct } from "@/hooks/useProducts";

interface AdminProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  product?: Product | null;
}

const CLOTHING_SIZES = ["PP", "P", "M", "G", "GG", "XG"];

interface ColorEntry {
  name: string;
  hex: string;
  image_url?: string | null;
  imageFile?: File | null;
  imagePreview?: string | null;
}

const uploadImage = async (file: File, path: string): Promise<string> => {
  const { error } = await supabase.storage
    .from("product-images")
    .upload(path, file, { upsert: true });
  if (error) throw error;
  const { data } = supabase.storage.from("product-images").getPublicUrl(path);
  return data.publicUrl;
};

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
  const [customSizes, setCustomSizes] = useState<string[]>([]);
  const [newCustomSize, setNewCustomSize] = useState("");
  const [colors, setColors] = useState<ColorEntry[]>([]);
  const [newColorName, setNewColorName] = useState("");
  const [newColorHex, setNewColorHex] = useState("#000000");
  const [newColorFile, setNewColorFile] = useState<File | null>(null);
  const [mainImageFile, setMainImageFile] = useState<File | null>(null);
  const [mainImagePreview, setMainImagePreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const allSizes = [...CLOTHING_SIZES, ...customSizes];

  useEffect(() => {
    if (product) {
      setName(product.name);
      setDescription(product.description);
      setPrice(String(product.price));
      setTag(product.tag || "");
      setCategory(product.category);
      const avail: Record<string, boolean> = {};
      const extras: string[] = [];
      product.sizes.forEach((s) => {
        avail[s.size] = s.available;
        if (!CLOTHING_SIZES.includes(s.size)) extras.push(s.size);
      });
      CLOTHING_SIZES.forEach((s) => { if (!(s in avail)) avail[s] = true; });
      setSizeAvailability(avail);
      setCustomSizes(extras);
      setColors(product.colors.map((c) => ({ name: c.name, hex: c.hex, image_url: c.image_url })));
      setMainImageFile(null);
      setMainImagePreview(product.image_url || null);
    } else {
      setName(""); setDescription(""); setPrice(""); setTag("");
      setCategory("Moletons");
      const avail: Record<string, boolean> = {};
      CLOTHING_SIZES.forEach((s) => { avail[s] = true; });
      setSizeAvailability(avail);
      setCustomSizes([]);
      setColors([]);
      setMainImageFile(null);
      setMainImagePreview(null);
    }
    setNewCustomSize("");
  }, [product, isOpen]);

  const addCustomSize = () => {
    const s = newCustomSize.trim();
    if (!s || allSizes.includes(s)) return;
    setCustomSizes([...customSizes, s]);
    setSizeAvailability({ ...sizeAvailability, [s]: true });
    setNewCustomSize("");
  };

  const removeCustomSize = (size: string) => {
    setCustomSizes(customSizes.filter((s) => s !== size));
    const next = { ...sizeAvailability };
    delete next[size];
    setSizeAvailability(next);
  };

  const handleSave = async () => {
    if (!name.trim() || !price.trim()) {
      toast.error("Nome e preço são obrigatórios.");
      return;
    }

    try {
      setUploading(true);
      const timestamp = Date.now();

      let mainImageUrl: string | undefined;
      if (mainImageFile) {
        const ext = mainImageFile.name.split(".").pop();
        mainImageUrl = await uploadImage(mainImageFile, `main/${timestamp}-${name.replace(/\s/g, "_")}.${ext}`);
      }

      const processedColors = await Promise.all(
        colors.map(async (c, i) => {
          let image_url = c.image_url || null;
          if (c.imageFile) {
            const ext = c.imageFile.name.split(".").pop();
            image_url = await uploadImage(c.imageFile, `colors/${timestamp}-${c.name.replace(/\s/g, "_")}-${i}.${ext}`);
          }
          return { name: c.name, hex: c.hex, image_url };
        })
      );

      if (isEdit && product) {
        const updates: Record<string, any> = {
          name, description, price: parseFloat(price), tag: tag || null, category,
          sizes: Object.entries(sizeAvailability).map(([size, available]) => {
            const existing = product.sizes.find((s) => s.size === size);
            return existing ? { id: existing.id, available } : { size, available };
          }),
          colors: processedColors,
        };
        if (mainImageUrl) updates.image_url = mainImageUrl;
        await updateMutation.mutateAsync({ productId: product.id, updates });
        toast.success("Produto atualizado!");
      } else {
        const sizes = allSizes.map((s) => ({ size: s, available: sizeAvailability[s] ?? true }));
        await createMutation.mutateAsync({
          name, description, price: parseFloat(price),
          tag: tag || undefined, category,
          colors: processedColors,
          sizes,
          ...(mainImageUrl ? { image_url: mainImageUrl } : {}),
        } as any);
        toast.success("Produto criado!");
      }
      onClose();
    } catch (err) {
      console.error(err);
      toast.error("Erro ao salvar produto.");
    } finally {
      setUploading(false);
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
    const preview = newColorFile ? URL.createObjectURL(newColorFile) : null;
    setColors([...colors, { name: newColorName, hex: newColorHex, imageFile: newColorFile, imagePreview: preview }]);
    setNewColorName("");
    setNewColorHex("#000000");
    setNewColorFile(null);
  };

  const removeColor = (idx: number) => {
    setColors(colors.filter((_, i) => i !== idx));
  };

  const handleMainImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setMainImageFile(file);
      setMainImagePreview(URL.createObjectURL(file));
    }
  };

  const [mainDragOver, setMainDragOver] = useState(false);
  const [colorDragOver, setColorDragOver] = useState(false);

  const handleMainDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setMainDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith("image/")) {
      setMainImageFile(file);
      setMainImagePreview(URL.createObjectURL(file));
    }
  };

  const handleColorDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setColorDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith("image/")) {
      setNewColorFile(file);
    }
  };

  const loading = updateMutation.isPending || createMutation.isPending || deleteMutation.isPending || uploading;

  const inputClass =
    "w-full border border-border bg-input px-4 py-3 font-body text-sm text-foreground placeholder:text-muted-foreground focus:border-foreground focus:outline-none transition-colors";

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className="fixed inset-0 z-[60] bg-[hsl(var(--overlay))]"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            className="fixed right-0 top-0 z-[70] flex h-full w-full max-w-lg flex-col border-l border-border bg-card"
            initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
            transition={{ type: "tween", duration: 0.3 }}
          >
            <div className="flex items-center justify-between border-b border-border p-6">
              <h2 className="font-display text-lg font-semibold uppercase tracking-wider text-foreground">
                {isEdit ? "Editar Produto" : "Novo Produto"}
              </h2>
              <button onClick={onClose}><X className="h-5 w-5 text-muted-foreground hover:text-foreground" /></button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-5">
              {/* Main image */}
              <div>
                <label className="mb-2 block font-body text-xs uppercase tracking-widest text-muted-foreground">
                  Imagem Principal
                </label>
                <div className="flex items-center gap-4">
                  {mainImagePreview ? (
                    <img src={mainImagePreview} alt="Preview" className="h-20 w-20 object-cover border border-border" />
                  ) : (
                    <div className="flex h-20 w-20 items-center justify-center border border-dashed border-border bg-secondary">
                      <ImageIcon className="h-6 w-6 text-muted-foreground" />
                    </div>
                  )}
                  <label className="flex cursor-pointer items-center gap-2 border border-border px-4 py-2 font-body text-xs uppercase tracking-widest text-foreground transition-colors hover:bg-foreground hover:text-background">
                    <Upload className="h-4 w-4" />
                    Upload
                    <input type="file" accept="image/*" className="hidden" onChange={handleMainImageChange} />
                  </label>
                </div>
              </div>

              <div>
                <label className="mb-2 block font-body text-xs uppercase tracking-widest text-muted-foreground">Nome</label>
                <input value={name} onChange={(e) => setName(e.target.value)} className={inputClass} placeholder="Nome do produto" />
              </div>

              <div>
                <label className="mb-2 block font-body text-xs uppercase tracking-widest text-muted-foreground">Descrição</label>
                <textarea value={description} onChange={(e) => setDescription(e.target.value)} className={`${inputClass} min-h-[80px] resize-y`} placeholder="Descrição do produto" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-2 block font-body text-xs uppercase tracking-widest text-muted-foreground">Preço (R$)</label>
                  <input type="number" step="0.01" value={price} onChange={(e) => setPrice(e.target.value)} className={inputClass} placeholder="0.00" />
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
                  {CLOTHING_SIZES.map((size) => (
                    <button key={size} type="button"
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
                  {customSizes.map((size) => (
                    <div key={size} className="relative">
                      <button type="button"
                        onClick={() => setSizeAvailability({ ...sizeAvailability, [size]: !sizeAvailability[size] })}
                        className={`flex h-10 min-w-[40px] items-center justify-center border px-2 font-body text-xs transition-colors ${
                          sizeAvailability[size]
                            ? "border-foreground bg-foreground text-background"
                            : "border-border text-muted-foreground line-through opacity-50"
                        }`}
                      >
                        {size}
                      </button>
                      <button
                        type="button"
                        onClick={() => removeCustomSize(size)}
                        className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center bg-accent text-accent-foreground text-[8px]"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
                <div className="mt-3 flex items-center gap-2">
                  <input
                    value={newCustomSize}
                    onChange={(e) => setNewCustomSize(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addCustomSize())}
                    className={`${inputClass} flex-1`}
                    placeholder="Ex: 38, 39, 40..."
                  />
                  <button
                    type="button"
                    onClick={addCustomSize}
                    className="flex items-center gap-1 border border-border px-3 py-3 font-body text-xs text-foreground hover:bg-foreground hover:text-background transition-colors"
                  >
                    <Plus className="h-3 w-3" />
                  </button>
                </div>
              </div>

              {/* Colors with images */}
              <div>
                <label className="mb-3 block font-body text-xs uppercase tracking-widest text-muted-foreground">Cores</label>
                <div className="space-y-3">
                  {colors.map((c, idx) => (
                    <div key={idx} className="flex items-center gap-3">
                      {(c.imagePreview || c.image_url) ? (
                        <img src={c.imagePreview || c.image_url!} alt={c.name} className="h-10 w-10 object-cover border border-border rounded" />
                      ) : (
                        <div className="h-10 w-10 rounded-full border border-border flex-shrink-0" style={{ backgroundColor: c.hex }} />
                      )}
                      <span className="font-body text-sm text-foreground flex-1">{c.name}</span>
                      <button onClick={() => removeColor(idx)} className="text-muted-foreground hover:text-foreground">
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                  <div className="space-y-2 border border-dashed border-border p-3">
                    <div className="flex items-center gap-2">
                      <input type="color" value={newColorHex} onChange={(e) => setNewColorHex(e.target.value)} className="h-8 w-8 cursor-pointer border-0 p-0" />
                      <input value={newColorName} onChange={(e) => setNewColorName(e.target.value)} className={`${inputClass} flex-1`} placeholder="Nome da cor" />
                    </div>
                    <div className="flex items-center gap-2">
                      <label className="flex flex-1 cursor-pointer items-center gap-2 border border-border px-3 py-2 font-body text-xs text-muted-foreground transition-colors hover:text-foreground">
                        <Upload className="h-3 w-3" />
                        {newColorFile ? newColorFile.name : "Imagem da cor (opcional)"}
                        <input type="file" accept="image/*" className="hidden" onChange={(e) => setNewColorFile(e.target.files?.[0] || null)} />
                      </label>
                      <button type="button" onClick={addColor}
                        className="border border-border px-3 py-2 font-body text-xs text-foreground hover:bg-foreground hover:text-background transition-colors">
                        Add
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t border-border p-6 space-y-3">
              {isEdit && (
                <button onClick={handleDelete} disabled={loading}
                  className="flex w-full items-center justify-center gap-2 border border-accent py-3 font-body text-xs uppercase tracking-widest text-accent transition-colors hover:bg-accent hover:text-accent-foreground">
                  <Trash2 className="h-4 w-4" /> Excluir Produto
                </button>
              )}
              <button onClick={handleSave} disabled={loading}
                className="flex w-full items-center justify-center gap-2 bg-foreground py-4 font-body text-xs uppercase tracking-widest text-background transition-opacity hover:opacity-80 disabled:opacity-40">
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
