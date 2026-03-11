import product1 from "@/assets/product-1.jpg";
import product2 from "@/assets/product-2.jpg";
import product3 from "@/assets/product-3.jpg";
import product4 from "@/assets/product-4.jpg";
import product5 from "@/assets/product-5.jpg";

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
  { id: "1", image: product1, name: "Sobretudo Noir", price: "R$ 2.890", priceNum: 2890, tag: "NOVO", category: "Casacos", description: "Sobretudo oversized em lã premium com forro acetinado. Silhueta ampla que desafia o convencional. Perfeito para transições de estação." },
  { id: "2", image: product2, name: "Blazer Marfim", price: "R$ 2.290", priceNum: 2290, tag: null, category: "Casacos", description: "Blazer desestruturado em tom marfim com acabamento raw-edge. Corte contemporâneo que transita entre o formal e o streetwear." },
  { id: "3", image: product3, name: "Calça Estrutura", price: "R$ 1.190", priceNum: 1190, tag: "NOVO", category: "Calças", description: "Calça de alfaiataria com recortes assimétricos e cintura alta. Tecido com elastano para conforto sem perder a forma." },
  { id: "4", image: product4, name: "Tricot Grafite", price: "R$ 890", priceNum: 890, tag: null, category: "Malhas", description: "Tricot pesado em fio 100% algodão egípcio. Textura grossa com caimento perfeito. Peça atemporal para o guarda-roupa underground." },
  { id: "5", image: product5, name: "Camisa Assimétrica", price: "R$ 990", priceNum: 990, tag: null, category: "Camisas", description: "Camisa em algodão com barra e colarinho assimétricos. Detalhes em costura aparente. Para quem não segue regras." },
  { id: "6", image: product1, name: "Sobretudo Noir II", price: "R$ 3.190", priceNum: 3190, tag: "ESGOTANDO", category: "Casacos", description: "Segunda edição do Sobretudo Noir, agora com bolsos internos e forro térmico. Produção limitada — últimas unidades." },
];

export const categories = [...new Set(products.map((p) => p.category))];
