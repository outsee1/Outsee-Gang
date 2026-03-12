import product1 from "@/assets/product-1.jpg";

export interface Product {
  id: string;
  image: string;
  name: string;
  price: string;
  priceNum: number;
  tag: string | null;
  category: string;
  description: string;
}

export const products: Product[] = [
  { id: "1", image: product1, name: "Blusa Outsee Gang", price: "R$ 180", priceNum: 180, tag: "NOVO", category: "Blusas", description: "Blusa exclusiva Outsee Gang. Design autêntico para quem vive o estilo underground." },
];

export const categories = [...new Set(products.map((p) => p.category))];
