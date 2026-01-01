import { LocalStorageClientRepository } from "../../infrastructure/repositories/LocalStorageClientRepository";
import type { Client } from "../domain/Client";

export class ClientService {
    // 1. Declaramos la propiedad privada aquí (esto sí se borra al compilar)
    private repository: LocalStorageClientRepository;

    // 2. En el constructor recibimos el argumento normal (sin 'private')
    constructor(repository: LocalStorageClientRepository) {
        this.repository = repository;
    }

    async getAllClients(): Promise<Client[]> {
        return await this.repository.getClients();
    }

    async createClient(name: string, email: string): Promise<Client> {
        const clients = await this.getAllClients();

        const newClient: Client = {
            id: crypto.randomUUID(),
            name,
            email
        };

        // Guardamos la nueva lista completa
        await this.repository.saveClients([...clients, newClient]);

        return newClient;
    }
}