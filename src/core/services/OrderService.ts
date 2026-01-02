import { Order, type OrderItem } from "../domain/Order";
import { InventoryService } from "./InventoryService";
import { IndexedDBOrderRepository } from "../../infrastructure/repositories/IndexedDBOrderRepository";

type OrderListener = () => void;

export class OrderService {
  private inventoryService: InventoryService;
  private orderRepository: IndexedDBOrderRepository;

  //lista de suscriptores
  private listeners: OrderListener[] = [];

  constructor(
    inventoryService: InventoryService,
    orderRepository: IndexedDBOrderRepository
  ) {
    this.inventoryService = inventoryService;
    this.orderRepository = orderRepository;
  }

  // --- PATRÓN OBSERVER (NUEVO) ---
  subscribe(listener: OrderListener): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private notifyChanges() {
    this.listeners.forEach((listener) => listener());
  }

  // Lógica Transaccional: Crear Orden y Descontar Inventario [cite: 8, 9]
  async createOrder(clientId: string, items: OrderItem[]): Promise<Order> {
    if (items.length === 0) throw new Error("Carrito vacío");

    // 1. Delegamos la transacción de inventario al servicio de inventario
    // Esto maneja validación, descuento y notificaciones en una sola operación
    await this.inventoryService.updateStockBatch(items);

    // 2. Crear Orden
    const newOrder = new Order(
      crypto.randomUUID(),
      clientId,
      items,
      "completed"
    );

    await this.orderRepository.saveOrder(newOrder);

    this.notifyChanges(); // Notificamos a los suscriptores

    return newOrder;
  }
  // --- NUEVA FUNCIONALIDAD: UNDO / ROLLBACK ---
  async cancelOrder(orderId: string): Promise<void> {
    // 1. Obtener todas las órdenes (Optimización futura: getById en repo)
    const orders = await this.orderRepository.getOrders();
    const order = orders.find((o) => o.id === orderId);

    if (!order) throw new Error("Orden no encontrada");
    if (order.status === "cancelled")
      throw new Error("Esta orden ya fue cancelada");

    // 2. Restaurar el Stock (Rollback)
    await this.inventoryService.restoreStockBatch(order.items);

    // 3. Cambiar estado
    order.cancel();

    // 4. Actualizar la orden en BD
    await this.orderRepository.saveOrder(order);

    this.notifyChanges(); // Notificamos a los suscriptores

    console.log(`Orden ${orderId} cancelada y stock restaurado.`);
  }

  // Método auxiliar para ver historial en la UI
  async getHistory(): Promise<Order[]> {
    return this.orderRepository.getOrders();
  }
}
