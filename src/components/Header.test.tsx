import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// Mock useProducts to return a deterministic list (avoid hitting Supabase).
vi.mock("@/hooks/useProducts", () => ({
  useProducts: () => ({
    data: [
      {
        id: "p1",
        name: "Tênis Corrida",
        description: "Para correr",
        price: 299,
        tag: null,
        category: "Tenis",
        image_url: null,
        sort_order: 0,
        colors: [],
        sizes: [],
      },
      {
        id: "p2",
        name: "Camisa Polo",
        description: "Casual",
        price: 150,
        tag: null,
        category: "Camisas",
        image_url: null,
        sort_order: 1,
        colors: [],
        sizes: [],
      },
    ],
    isLoading: false,
  }),
}));

// Cart context is required by Header.
vi.mock("@/contexts/CartContext", () => ({
  useCart: () => ({ totalItems: 0, setCartOpen: vi.fn() }),
}));

import Header from "./Header";

function renderHeader() {
  const qc = new QueryClient();
  return render(
    <QueryClientProvider client={qc}>
      <MemoryRouter initialEntries={["/"]}>
        <Routes>
          <Route path="/" element={<Header onProfileClick={() => {}} />} />
          <Route path="/produto/:id" element={<div>PRODUCT_PAGE</div>} />
          <Route path="/buscar" element={<div>SEARCH_PAGE</div>} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe("Header search", () => {
  beforeEach(() => vi.useRealTimers());

  it("navega para a página do produto ao clicar na sugestão", async () => {
    renderHeader();
    fireEvent.click(screen.getByRole("button", { name: /buscar/i }));
    const input = await screen.findByPlaceholderText(/buscar peças/i);
    fireEvent.change(input, { target: { value: "tênis" } });

    const link = await screen.findByText("Tênis Corrida");
    fireEvent.click(link);

    await waitFor(() => {
      expect(screen.getByText("PRODUCT_PAGE")).toBeInTheDocument();
    });
  });

  it("navega para /buscar ao apertar Enter", async () => {
    renderHeader();
    fireEvent.click(screen.getByRole("button", { name: /buscar/i }));
    const input = await screen.findByPlaceholderText(/buscar peças/i);
    fireEvent.change(input, { target: { value: "qualquer" } });
    fireEvent.keyDown(input, { key: "Enter" });
    await waitFor(() => {
      expect(screen.getByText("SEARCH_PAGE")).toBeInTheDocument();
    });
  });
});