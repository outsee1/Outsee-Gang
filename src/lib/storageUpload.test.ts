import { describe, it, expect } from "vitest";
import { sanitizeStorageKey, friendlyUploadError } from "./storageUpload";

describe("sanitizeStorageKey", () => {
  it("remove acentos preservando a extensão", () => {
    expect(sanitizeStorageKey("Tênis Corrida.PNG")).toBe("tenis_corrida.png");
  });

  it("mantém estrutura de pastas", () => {
    expect(sanitizeStorageKey("main/1234-Camisa Polo.jpg")).toBe("main/1234-camisa_polo.jpg");
  });

  it("substitui caracteres inválidos por underscore", () => {
    expect(sanitizeStorageKey("foto@#%&*().jpg")).toBe("foto_.jpg");
  });

  it("colapsa múltiplos underscores", () => {
    expect(sanitizeStorageKey("a   b   c.png")).toBe("a_b_c.png");
  });

  it("nunca retorna string vazia", () => {
    expect(sanitizeStorageKey("")).toBe("file");
    expect(sanitizeStorageKey("@@@")).toBe("file");
  });
});

describe("friendlyUploadError", () => {
  it("traduz erro de invalid key", () => {
    expect(friendlyUploadError({ message: "Invalid key" })).toMatch(/Nome de arquivo inválido/);
  });
  it("traduz erro de RLS", () => {
    expect(friendlyUploadError({ message: "new row violates row-level security policy" })).toMatch(/permissão/);
  });
  it("traduz erro de tamanho", () => {
    expect(friendlyUploadError({ message: "Payload too large" })).toMatch(/menos de 5MB/);
  });
  it("usa fallback para erros desconhecidos", () => {
    expect(friendlyUploadError({ message: "boom" })).toBe("Falha no upload: boom");
  });
});