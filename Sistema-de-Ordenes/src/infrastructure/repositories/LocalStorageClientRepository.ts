import type { Client } from "../../core/domain/Client";

const STORAGE_KEY = 'clients_data';

export class LocalStorageClientRepository {
    async getClients(): Promise<Client[]> {
        const data = localStorage.getItem(STORAGE_KEY);
        return data ? JSON.parse(data) : [];
    }

    async saveClients(clients: Client[]): Promise<void> {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(clients));
    }

    async seed(initialClients: Client[]): Promise<void> {
        if (!(await this.getClients()).length) {
            await this.saveClients(initialClients);
        }
    }
}