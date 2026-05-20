import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// Mock sonner so we can spy on toast.error
const toastError = vi.fn();
vi.mock("sonner", () => ({
  toast: { error: (...args: any[]) => toastError(...args), success: vi.fn() },
  Toaster: () => null,
}));

// Mock supabase storage to simulate an upload failure
vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    storage: {
      from: () => ({
        upload: async () => ({
          error: { message: "new row violates row-level security policy" },
        }),
        getPublicUrl: () => ({ data: { publicUrl: "" } }),
      }),
    },
    functions: { invoke: vi.fn() },
  },
}));

// Mock product mutations
vi.mock("@/hooks/useProducts", async () => {
  return {
    useAdminUpdateProduct: () => ({ mutateAsync: vi.fn(), isPending: false }),
    useAdminCreateProduct: () => ({ mutateAsync: vi.fn(), isPending: false }),
    useAdminDeleteProduct: () => ({ mutateAsync: vi.fn(), isPending: false }),
  };
});

import AdminProductModal from "./AdminProductModal";

function setup() {
  const qc = new QueryClient();
  return render(
    <QueryClientProvider client={qc}>
      <AdminProductModal isOpen onClose={() => {}} />
    </QueryClientProvider>,
  );
}

describe("AdminProductModal", () => {
  it("exibe toast com mensagem amigável quando o upload falha", async () => {
    setup();

    fireEvent.change(screen.getByPlaceholderText(/nome do produto/i), {
      target: { value: "Produto Teste" },
    });
    fireEvent.change(screen.getByPlaceholderText("0.00"), {
      target: { value: "99" },
    });

    // Anexa um arquivo com acento no nome para forçar caminho de upload
    const file = new File(["x"], "Tênis Corrida.png", { type: "image/png" });
    const fileInputs = document.querySelectorAll('input[type="file"]');
    fireEvent.change(fileInputs[0], { target: { files: [file] } });

    fireEvent.click(screen.getByRole("button", { name: /criar produto/i }));

    await waitFor(() => {
      expect(toastError).toHaveBeenCalled();
    });
    const msg = String(toastError.mock.calls[0][0]);
    expect(msg).toMatch(/permissão/i);
  });
});