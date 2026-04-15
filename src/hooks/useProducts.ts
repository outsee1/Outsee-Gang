import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface ProductColor {
  id: string;
  name: string;
  hex: string;
  image_url: string | null;
  sort_order: number;
}

export interface ProductSize {
  id: string;
  size: string;
  available: boolean;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  tag: string | null;
  category: string;
  image_url: string | null;
  sort_order: number;
  colors: ProductColor[];
  sizes: ProductSize[];
}

export function useProducts() {
  return useQuery({
    queryKey: ["products"],
    queryFn: async (): Promise<Product[]> => {
      const { data: products, error } = await supabase
        .from("products")
        .select("*")
        .order("sort_order", { ascending: true });

      if (error) throw error;

      const { data: colors } = await supabase
        .from("product_colors")
        .select("*")
        .order("sort_order");

      const { data: sizes } = await supabase
        .from("product_sizes")
        .select("*");

      return (products || []).map((p: any) => ({
        id: p.id,
        name: p.name,
        description: p.description,
        price: Number(p.price),
        tag: p.tag,
        category: p.category,
        image_url: p.image_url,
        sort_order: p.sort_order ?? 0,
        colors: (colors || []).filter((c: any) => c.product_id === p.id).map((c: any) => ({
          id: c.id,
          name: c.name,
          hex: c.hex,
          image_url: c.image_url,
          sort_order: c.sort_order,
        })),
        sizes: (sizes || []).filter((s: any) => s.product_id === p.id).map((s: any) => ({
          id: s.id,
          size: s.size,
          available: s.available,
        })),
      }));
    },
  });
}

export function useAdminUpdateProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { productId: string; updates: Record<string, any> }) => {
      const { data, error } = await supabase.functions.invoke("manage-products", {
        body: { action: "update", ...payload },
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["products"] }),
  });
}

export function useAdminCreateProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: {
      name: string;
      description: string;
      price: number;
      tag?: string;
      category: string;
      colors: { name: string; hex: string }[];
      sizes: { size: string; available: boolean }[];
    }) => {
      const { data, error } = await supabase.functions.invoke("manage-products", {
        body: { action: "create", ...payload },
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["products"] }),
  });
}

export function useAdminDeleteProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (productId: string) => {
      const { data, error } = await supabase.functions.invoke("manage-products", {
        body: { action: "delete", productId },
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["products"] }),
  });
}
