import type { IInventoryRepository } from "../Interfaces/IInventoryRepository";
import { Product } from "../domain/Product";
import { NotificationService } from "../../infrastructure/websocket/NotificationService";

type Listener = (products: Product[]) => void;

/**
 * Servicio de dominio responsable de la gestión del inventario.
 * Centraliza las reglas de negocio sobre stock, actualizaciones y notificaciones en tiempo real.
 * Implementa el patrón Observer para mantener la UI sincronizada.
 */
export class InventoryService {
  private listeners: Listener[] = [];

  constructor(
    private repository: IInventoryRepository,
    private notifier: NotificationService
  ) {}

  /**
   * Suscribe un observador a los cambios del inventario.
   * Utilizado por la capa de presentación (React Hooks) para reaccionar a actualizaciones.
   * @param listener Función callback que recibe la lista actualizada de productos.
   * @returns Función de limpieza (unsubscribe) para evitar memory leaks.
   */
  subscribe(listener: Listener): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  /**
   * Notifica a todos los suscriptores activos con el estado actual del inventario.
   */
  private async notifyChanges() {
    const products = await this.getAllProducts();
    this.listeners.forEach((listener) => listener(products));
  }

  /**
   * Obtiene el catálogo completo de productos.
   */
  async getAllProducts(): Promise<Product[]> {
    return await this.repository.getProducts();
  }

  /**
   * Crea un nuevo producto y lo añade al inventario.
   * Dispara una actualización automática a todos los suscriptores.
   */
  async createProduct(
    name: string,
    price: number,
    stock: number,
    minStock: number
  ): Promise<void> {
    const products = await this.getAllProducts();

    const newProduct = new Product(
      crypto.randomUUID(),
      name,
      price,
      stock,
      minStock
    );

    await this.repository.saveProducts([...products, newProduct]);
    await this.notifyChanges();
  }

  /**
   * Procesa un lote de actualizaciones de stock de manera transaccional.
   * Valida disponibilidad, descuenta stock y emite alertas (Low/Out) si es necesario.
   * @param items Lista de productos y cantidades a descontar.
   */
  async updateStockBatch(
    items: { productId: string; quantity: number }[]
  ): Promise<void> {
    const products = await this.repository.getProducts();

    for (const item of items) {
      const product = products.find((p) => p.id === item.productId);
      if (!product) throw new Error(`Producto ${item.productId} no encontrado`);

      product.decreaseStock(item.quantity);

      if (product.isOut()) {
        this.notifier.emit("inventory:out", {
          message: `AGOTADO: ${product.name}`,
          productId: product.id,
        });
      } else if (product.isLow()) {
        this.notifier.emit("inventory:low", {
          message: `STOCK BAJO: ${product.name} (${product.stock})`,
          productId: product.id,
        });
      }
    }

    await this.repository.saveProducts(products);
    await this.notifyChanges();
  }

  /**
   * Restaura el stock de productos previamente descontados.
   * Utilizado principalmente para operaciones de cancelación (Rollback).
   */
  async restoreStockBatch(
    items: { productId: string; quantity: number }[]
  ): Promise<void> {
    const products = await this.repository.getProducts();

    for (const item of items) {
      const product = products.find((p) => p.id === item.productId);
      if (product) {
        product.increaseStock(item.quantity);
      }
    }

    await this.repository.saveProducts(products);
    await this.notifyChanges();
  }

  /**
   * Actualiza las propiedades de un producto existente.
   * @throws {Error} Si el producto no existe.
   */
  async updateProduct(
    id: string,
    updates: { name: string; price: number; stock: number; minStock: number }
  ): Promise<void> {
    const products = await this.getAllProducts();
    const index = products.findIndex((p) => p.id === id);

    if (index === -1) throw new Error("Producto no encontrado");

    const currentProduct = products[index];
    const updatedProduct = new Product(
      currentProduct.id,
      updates.name,
      updates.price,
      updates.stock,
      updates.minStock
    );

    products[index] = updatedProduct;

    await this.repository.saveProducts(products);
    await this.notifyChanges();
  }
}
