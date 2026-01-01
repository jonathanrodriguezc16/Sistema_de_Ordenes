import type { IInventoryRepository } from "../Interfaces/IInventoryRepository";
import { Product } from "../domain/Product";
import { NotificationService } from "../../infrastructure/websocket/NotificationService";

type Listener = (products: Product[]) => void;

export class InventoryService {
    private listeners: Listener[] = [];

    constructor(
        private repository: IInventoryRepository,
        private notifier: NotificationService
    ) { }

    // --- Patrón Observer: Permite a React escuchar cambios ---
    subscribe(listener: Listener): () => void {
        this.listeners.push(listener);
        return () => {
            this.listeners = this.listeners.filter(l => l !== listener);
        };
    }

    private async notifyChanges() {
        const products = await this.getAllProducts();
        this.listeners.forEach(listener => listener(products));
    }

    // --- Métodos de Negocio ---

    async getAllProducts(): Promise<Product[]> {
        return await this.repository.getProducts();
    }

    async createProduct(name: string, price: number, stock: number, minStock: number): Promise<void> {
        const products = await this.getAllProducts();

        // Instanciamos tu Entidad de Dominio (que tiene las reglas de negocio)
        const newProduct = new Product(
            crypto.randomUUID(),
            name,
            price,
            stock,
            minStock
        );

        await this.repository.saveProducts([...products, newProduct]);

        // ¡Magia! Esto actualizará automáticamente la UI gracias al Observer
        await this.notifyChanges();
    }

    // Método optimizado para actualizar en lote (Transacción)
    async updateStockBatch(items: { productId: string; quantity: number }[]): Promise<void> {
        const products = await this.repository.getProducts(); // Leemos 1 vez

        // Modificamos en memoria
        for (const item of items) {
            const product = products.find(p => p.id === item.productId);
            if (!product) throw new Error(`Producto ${item.productId} no encontrado`);

            // Usamos el método de la clase (Lógica encapsulada)
            product.decreaseStock(item.quantity);

            // Verificamos reglas de notificación
            if (product.isOut()) {
                this.notifier.emit('inventory:out', {
                    message: `AGOTADO: ${product.name}`,
                    productId: product.id
                    // timestamp eliminado: lo genera el servicio
                });
            } else if (product.isLow()) {
                this.notifier.emit('inventory:low', {
                    message: `STOCK BAJO: ${product.name} (${product.stock})`,
                    productId: product.id
                    // timestamp eliminado: lo genera el servicio
                });
            }
        }

        // Guardamos todo 1 vez (Atomicidad simulada)
        await this.repository.saveProducts(products);

        // Avisamos a la UI
        await this.notifyChanges();
    }

    async restoreStockBatch(items: { productId: string; quantity: number }[]): Promise<void> {
        const products = await this.repository.getProducts();

        for (const item of items) {
            const product = products.find(p => p.id === item.productId);
            if (product) {
                // Usamos el nuevo método del dominio
                product.increaseStock(item.quantity);
            }
        }

        await this.repository.saveProducts(products);
        // Notificamos a la UI para que refresque el stock visualmente
        await this.notifyChanges();
    }
}