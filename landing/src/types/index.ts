export type OrderStatus = 'pending' | 'approved' | 'preparing' | 'ready' | 'delivered';

export interface User {
  id: number;
  username: string;
  role: 'shop' | 'admin';
  shopName?: string;
}

export interface Part {
  id: number;
  partNumber: string;
  name: string;
  price: number;
  description: string;
  stock: number;
  category: string;
  brand: string;
}

export interface OrderItem {
  id: number;
  orderId: number;
  partId: number;
  partNumber: string;
  partName: string;
  unitPrice: number;
  quantity: number;
}

export interface Order {
  id: number;
  orderNumber: string;
  userId: number;
  status: OrderStatus;
  createdAt: string;
  updatedAt: string;
  items: OrderItem[];
}

export interface CartItem {
  part: Part;
  quantity: number;
}
