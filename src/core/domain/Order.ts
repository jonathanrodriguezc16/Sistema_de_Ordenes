export type OrderStatus = "pending" | "completed" | "cancelled";

export interface OrderItem {
  productId: string;
  quantity: number;
  price: number;
}

/**
 * Entidad de dominio que representa una Orden de Compra.
 * Encapsula la lógica de cálculo de totales, cambios de estado y reconstrucción.
 */
export class Order {
  constructor(
    public id: string,
    public clientId: string,
    public items: OrderItem[],
    public status: OrderStatus = "completed",
    public createdAt: string = new Date().toISOString()
  ) {}

  /**
   * Calcula el monto total basándose en una lista de ítems.
   * Método estático útil para cálculos previos (ej. en carrito) sin instanciar una orden.
   * @param items Lista de ítems con precio y cantidad.
   */
  static calculateTotal(items: OrderItem[]): number {
    return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }

  /**
   * Obtiene el total calculado de la orden actual.
   * Reutiliza la lógica estática para mantener consistencia.
   */
  get total(): number {
    return Order.calculateTotal(this.items);
  }

  /**
   * Cambia el estado de la orden a 'cancelled'.
   * @throws {Error} Si la orden ya se encuentra cancelada.
   */
  cancel(): void {
    if (this.status === "cancelled") {
      throw new Error("Esta orden ya fue cancelada");
    }
    this.status = "cancelled";
  }

  /**
   * Reconstruye una instancia de Order a partir de un objeto plano (JSON).
   * Esencial para recuperar la funcionalidad de la clase al leer desde persistencia.
   * @param json Objeto plano recuperado de la BD.
   */
  static fromJSON(json: any): Order {
    return new Order(
      json.id,
      json.clientId,
      json.items,
      json.status,
      json.createdAt
    );
  }
}
