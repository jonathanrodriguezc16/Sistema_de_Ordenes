import type { Order } from "../../core/domain/Order";

const STORAGE_KEY = 'orders_history';

export class LocalStorageOrderRepository {
    async saveOrder(order: Order): Promise<void> {
        const orders = await this.getOrders();
        orders.push(order);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
    }

    async getOrders(): Promise<Order[]> {
        const data = localStorage.getItem(STORAGE_KEY);
        return data ? JSON.parse(data) : [];
    }
}