import { supabase } from "@/integrations/supabase/client";

/**
 * Sanitiza um nome/caminho de arquivo para uso seguro no Supabase Storage.
 * - Remove acentos (NFD + strip diacríticos)
 * - Mantém apenas [a-z0-9._/-]
 * - Normaliza separadores e remove vazios
 */
export function sanitizeStorageKey(input: string): string {
  if (!input) return "file";
  const parts = input.split("/").map((part) =>
    part
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/\s+/g, "_")
      .replace(/[^a-z0-9._-]/g, "_")
      .replace(/_+/g, "_")
      .replace(/^_+|_+$/g, "")
  );
  const cleaned = parts.filter(Boolean).join("/");
  return cleaned || "file";
}

/** Mensagem amigável em pt-BR para erros comuns de upload no Storage. */
export function friendlyUploadError(err: unknown): string {
  const raw =
    (err as any)?.message ||
    (err as any)?.error_description ||
    (err as any)?.error ||
    (typeof err === "string" ? err : "") ||
    "Erro desconhecido";
  const msg = String(raw).toLowerCase();

  if (msg.includes("invalid key") || msg.includes("invalid_key")) {
    return "Nome de arquivo inválido. Renomeie removendo acentos e caracteres especiais (use apenas letras, números, '.', '_' ou '-').";
  }
  if (msg.includes("payload too large") || msg.includes("exceeded")) {
    return "Arquivo muito grande. Use uma imagem com menos de 5MB.";
  }
  if (msg.includes("mime") || msg.includes("content-type")) {
    return "Formato de imagem não suportado. Use JPG, PNG ou WEBP.";
  }
  if (msg.includes("row-level security") || msg.includes("permission") || msg.includes("not authorized")) {
    return "Você não tem permissão para enviar imagens. Verifique se está logado como admin.";
  }
  if (msg.includes("duplicate")) {
    return "Já existe um arquivo com esse nome. Tente novamente — o nome será regenerado.";
  }
  return `Falha no upload: ${raw}`;
}

export async function uploadProductImage(file: File, path: string): Promise<string> {
  const safePath = sanitizeStorageKey(path);
  const { error } = await supabase.storage
    .from("product-images")
    .upload(safePath, file, { upsert: true, contentType: file.type || undefined });
  if (error) throw error;
  const { data } = supabase.storage.from("product-images").getPublicUrl(safePath);
  return data.publicUrl;
}