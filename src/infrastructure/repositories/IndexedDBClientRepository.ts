import { Client } from "../../core/domain/Client";
import { initDB } from "../persistence/IndexedDBContext";

/**
 * Implementación del repositorio de Clientes usando IndexedDB.
 * Permite persistencia local en el navegador manteniendo la estructura de objetos del dominio.
 */
export class IndexedDBClientRepository {
  /**
   * Obtiene todos los clientes almacenados en la base de datos local.
   * Convierte los datos planos (JSON) almacenados en instancias de la clase Client.
   * @returns Promesa con el listado de objetos Client.
   */
  async getClients(): Promise<Client[]> {
    const db = await initDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction("clients", "readonly");
      const store = transaction.objectStore("clients");
      const request = store.getAll();

      request.onsuccess = () => {
        const rawData = request.result as any[];

        const clients = rawData.map(
          (item) => new Client(item.id, item.name, item.email)
        );

        resolve(clients);
      };

      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Guarda o actualiza la lista completa de clientes.
   * Utiliza una estrategia de reemplazo total para simplificar la sincronización.
   * @param clients Lista actualizada de instancias de Client.
   */
  async saveClients(clients: Client[]): Promise<void> {
    const db = await initDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction("clients", "readwrite");
      const store = transaction.objectStore("clients");

      store.clear();

      clients.forEach((client) => {
        store.put(client);
      });

      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    });
  }

  /**
   * Inicializa la base de datos con datos de prueba si se encuentra vacía.
   * @param initialClients Lista de clientes semilla.
   */
  async seed(initialClients: Client[]): Promise<void> {
    const current = await this.getClients();
    if (current.length === 0) {
      await this.saveClients(initialClients);
    }
  }
}
