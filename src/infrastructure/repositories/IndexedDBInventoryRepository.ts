import type { IInventoryRepository } from "../../core/Interfaces/IInventoryRepository";
import { Product } from "../../core/domain/Product";
import { initDB } from "../persistence/IndexedDBContext";

/**
 * Repositorio de Inventario basado en IndexedDB.
 * Gestiona la persistencia de productos manteniendo la integridad de las instancias de clase Product.
 */
export class IndexedDBInventoryRepository implements IInventoryRepository {
  /**
   * Recupera el catálogo completo de productos.
   * Utiliza el método estático fromJSON para reconstruir las instancias con sus métodos de negocio.
   * @returns Promesa con la lista de productos.
   */
  async getProducts(): Promise<Product[]> {
    const db = await initDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction("products", "readonly");
      const store = transaction.objectStore("products");
      const request = store.getAll();

      request.onsuccess = () => {
        const rawData = request.result as any[];
        // Reconstrucción limpia usando el método de fábrica del Dominio
        const products = rawData.map((item) => Product.fromJSON(item));
        resolve(products);
      };

      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Guarda el estado actual del inventario.
   * Utiliza una estrategia de "Limpiar y Reemplazar" para asegurar consistencia total.
   * @param products Lista actualizada de productos.
   */
  async saveProducts(products: Product[]): Promise<void> {
    const db = await initDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction("products", "readwrite");
      const store = transaction.objectStore("products");

      store.clear();

      products.forEach((product) => {
        const rawProduct = {
          id: product.id,
          name: product.name,
          price: product.price,
          _stock: product.stock,
          minStock: product.minStock,
        };
        store.put(rawProduct);
      });

      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    });
  }

  /**
   * Busca un producto por su ID.
   * Nota: Por simplicidad en esta implementación, recupera todos y filtra en memoria.
   * @param id Identificador único del producto.
   */
  async getProductById(id: string): Promise<Product | undefined> {
    const products = await this.getProducts();
    return products.find((p) => p.id === id);
  }

  /**
   * Inicializa la base de datos con un conjunto de datos de prueba si está vacía.
   * @param initialData Datos crudos (JSON) para poblar el inventario.
   */
  async seed(initialData: any[]): Promise<void> {
    const current = await this.getProducts();
    if (current.length === 0) {
      const products = initialData.map((d) => Product.fromJSON(d));
      await this.saveProducts(products);
    }
  }
}
