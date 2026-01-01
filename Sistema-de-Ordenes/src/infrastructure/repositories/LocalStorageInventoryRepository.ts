import type { IInventoryRepository } from "../../core/Interfaces/IInventoryRepository"; // Asegúrate de importar la interfaz
import { Product } from "../../core/domain/Product";

const STORAGE_KEY = 'inventory_data';

export class LocalStorageInventoryRepository implements IInventoryRepository {

    async getProducts(): Promise<Product[]> {
        const data = localStorage.getItem(STORAGE_KEY);
        if (!data) return [];

        const jsonList = JSON.parse(data);

        // MAPPING: Convertimos JSON plano a instancias de la clase Product
        return jsonList.map((item: any) => new Product(
            item.id,
            item.name,
            item.price,
            item._stock, // Nota: JSON guarda la propiedad privada con guion bajo si no se personaliza toJSON
            item.minStock
        ));
    }

    async saveProducts(products: Product[]): Promise<void> {
        // Al guardar, serializamos el estado actual
        localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
    }

    async getProductById(id: string): Promise<Product | undefined> {
        const products = await this.getProducts();
        return products.find(p => p.id === id);
    }

    // ... seed se mantiene igual
    async seed(initialData: any[]): Promise<void> {
        const current = await this.getProducts();
        if (current.length === 0) {
            // Mapeamos los datos semilla a instancias antes de guardar
            const products = initialData.map(d => new Product(d.id, d.name, d.price, d.stock, d.minStock));
            await this.saveProducts(products);
        }
    }
}