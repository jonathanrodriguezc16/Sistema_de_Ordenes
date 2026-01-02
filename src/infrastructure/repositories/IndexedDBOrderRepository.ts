import { Order } from "../../core/domain/Order";
import { initDB } from "../persistence/IndexedDBContext";

export class IndexedDBOrderRepository {
  async saveOrder(order: Order): Promise<void> {
    const db = await initDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction("orders", "readwrite");
      const store = transaction.objectStore("orders");

      const orderDTO = {
        id: order.id,
        clientId: order.clientId,
        items: order.items,
        status: order.status,
        createdAt: order.createdAt,
        total: order.total, // Guardamos el valor calculado
      };

      store.put(orderDTO); // Usamos 'add' o 'put' para insertar la nueva orden

      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    });
  }

  async getOrders(): Promise<Order[]> {
    const db = await initDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction("orders", "readonly");
      const store = transaction.objectStore("orders");
      const request = store.getAll();

      request.onsuccess = () => {
        const rawData = request.result as any[];

        // AQUÍ LA MAGIA: Convertimos JSON plano -> Instancia de Clase Order
        const orders = rawData.map((item) => Order.fromJSON(item));

        resolve(orders);
      };
      request.onerror = () => reject(request.error);
    });
  }
}
