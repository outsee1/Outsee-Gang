import { CartItem } from "@/contexts/CartContext";

export interface Order {
  id: string;
  items: CartItem[];
  totalPrice: number;
  firstName: string;
  lastName: string;
  cep: string;
  numero: string;
  complemento: string;
  address: string;
  payment: string;
  date: string;
}

const ORDERS_KEY = "outsee_orders";

export const getOrders = (): Order[] => {
  try {
    return JSON.parse(localStorage.getItem(ORDERS_KEY) || "[]");
  } catch {
    return [];
  }
};

export const saveOrder = (order: Omit<Order, "id">) => {
  const orders = getOrders();
  const newOrder: Order = { ...order, id: crypto.randomUUID() };
  orders.unshift(newOrder);
  localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
  return newOrder;
};
