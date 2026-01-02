import { IndexedDBClientRepository } from "../../infrastructure/repositories/IndexedDBClientRepository";
import { Client } from "../domain/Client";

/**
 * Servicio de aplicación para la gestión de clientes.
 * Orquesta la creación y recuperación de clientes interactuando con el repositorio.
 */
export class ClientService {
  /**
   * Inicializa el servicio inyectando la dependencia del repositorio.
   * @param repository Repositorio concreto de IndexedDB.
   */
  constructor(private repository: IndexedDBClientRepository) {}

  /**
   * Obtiene el listado completo de clientes registrados.
   * @returns Promesa con el array de instancias de Client.
   */
  async getAllClients(): Promise<Client[]> {
    return await this.repository.getClients();
  }

  /**
   * Crea un nuevo cliente, lo valida y lo persiste en la base de datos.
   * @param name Nombre completo del cliente.
   * @param email Dirección de correo electrónico.
   * @returns La nueva instancia de Client creada.
   */
  async createClient(name: string, email: string): Promise<Client> {
    const clients = await this.getAllClients();

    const newClient = new Client(crypto.randomUUID(), name, email);

    await this.repository.saveClients([...clients, newClient]);

    return newClient;
  }
}
