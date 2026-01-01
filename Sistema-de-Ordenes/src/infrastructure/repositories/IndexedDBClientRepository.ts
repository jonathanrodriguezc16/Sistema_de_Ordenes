import type { Client } from "../../core/domain/Client";
import { initDB } from "../persistence/IndexedDBContext";

export class IndexedDBClientRepository {

    async getClients(): Promise<Client[]> {
        const db = await initDB();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction('clients', 'readonly');
            const store = transaction.objectStore('clients');
            const request = store.getAll();

            request.onsuccess = () => resolve(request.result as Client[]);
            request.onerror = () => reject(request.error);
        });
    }

    async saveClients(clients: Client[]): Promise<void> {
        const db = await initDB();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction('clients', 'readwrite');
            const store = transaction.objectStore('clients');

            // Estrategia simple: Limpiar y reinsertar (para mantener sincronía total)
            store.clear();

            clients.forEach(client => {
                store.put(client);
            });

            transaction.oncomplete = () => resolve();
            transaction.onerror = () => reject(transaction.error);
        });
    }

    async seed(initialClients: Client[]): Promise<void> {
        const current = await this.getClients();
        if (current.length === 0) {
            await this.saveClients(initialClients);
        }
    }
}