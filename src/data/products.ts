import product1 from "@/assets/product-1.jpg";
import hoodieWhite from "@/assets/hoodie-white.jpg";
import hoodieGreen from "@/assets/hoodie-green.jpg";
import hoodieNavy from "@/assets/hoodie-navy.jpg";
import hoodieGray from "@/assets/hoodie-gray.jpg";

export interface ColorVariant {
  name: string;
  hex: string;
  image: string;
}

export interface Product {
  id: string;
  image: string;
  name: string;
  price: string;
  priceNum: number;
  tag: string | null;
  category: string;
  description: string;
  colors?: ColorVariant[];
}

export const products: Product[] = [
  {
    id: "1",
    image: product1,
    name: "Blusa Outsee Gang",
    price: "R$ 180",
    priceNum: 180,
    tag: "NOVO",
    category: "Blusas",
    description: "Blusa exclusiva Outsee Gang. Design autêntico para quem vive o estilo underground.",
  },
  {
    id: "2",
    image: hoodieWhite,
    name: "Moletom Outsee Gang",
    price: "R$ 280",
    priceNum: 280,
    tag: "NOVO",
    category: "Moletons",
    description: "Moletom com zíper Outsee Gang. Conforto premium com estilo streetwear autêntico. Disponível em 4 cores.",
    colors: [
      { name: "Branco", hex: "#F5F5F0", image: hoodieWhite },
      { name: "Verde Militar", hex: "#2D3B2D", image: hoodieGreen },
      { name: "Azul Marinho", hex: "#1C2333", image: hoodieNavy },
      { name: "Cinza", hex: "#A0A0A0", image: hoodieGray },
    ],
  },
];

export const categories = [...new Set(products.map((p) => p.category))];
