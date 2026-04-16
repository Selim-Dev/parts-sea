export type OrderStatus = 'pending' | 'approved' | 'preparing' | 'ready' | 'delivered' | 'cancelled';

export interface User {
  id: string;
  username: string;
  role: 'shop' | 'admin';
  shopName?: string;
}

export interface Part {
  id: string;
  partNumber: string;
  name: string;
  price: number;
  description: string;
  stock: number;
  category: string;
  brand: string;
}

export interface OrderItem {
  id: string;
  orderId: string;
  partId: string;
  partNumber: string;
  partName: string;
  unitPrice: number;
  quantity: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  userId: string;
  status: OrderStatus;
  createdAt: string;
  updatedAt: string;
  items: OrderItem[];
}

export interface CartItem {
  part: Part;
  quantity: number;
}
