export type OrderStatus = 'pending' | 'completed' | 'cancelled';

export interface OrderItem {
    productId: string;
    quantity: number;
    price: number;
}

export interface Order {
    id: string;
    clientId: string;
    items: OrderItem[];
    total: number;
    status: OrderStatus;
    createdAt: string; // Usamos string para facilitar serialización JSON
}