import type { Order } from "../../core/domain/Order";
import { initDB } from "../persistence/IndexedDBContext";

export class IndexedDBOrderRepository {

    async saveOrder(order: Order): Promise<void> {
        const db = await initDB();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction('orders', 'readwrite');
            const store = transaction.objectStore('orders');

            store.put(order); // Usamos 'add' o 'put' para insertar la nueva orden

            transaction.oncomplete = () => resolve();
            transaction.onerror = () => reject(transaction.error);
        });
    }

    async getOrders(): Promise<Order[]> {
        const db = await initDB();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction('orders', 'readonly');
            const store = transaction.objectStore('orders');
            const request = store.getAll();

            request.onsuccess = () => resolve(request.result as Order[]);
            request.onerror = () => reject(request.error);
        });
    }
}