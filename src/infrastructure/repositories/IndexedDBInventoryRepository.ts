// src/infrastructure/repositories/IndexedDBInventoryRepository.ts
import type { IInventoryRepository } from "../../core/Interfaces/IInventoryRepository";
import { Product } from "../../core/domain/Product";
import { initDB } from "../persistence/IndexedDBContext";

export class IndexedDBInventoryRepository implements IInventoryRepository {

    async getProducts(): Promise<Product[]> {
        const db = await initDB();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction('products', 'readonly');
            const store = transaction.objectStore('products');
            const request = store.getAll();

            request.onsuccess = () => {
                const rawData = request.result;
                // Mapeamos los datos planos a instancias de tu Clase Product
                const products = rawData.map((item: any) => new Product(
                    item.id,
                    item.name,
                    item.price,
                    // Recuperamos el stock correctamente (sea _stock o stock)
                    item._stock !== undefined ? item._stock : item.stock,
                    item.minStock
                ));
                resolve(products);
            };
            request.onerror = () => reject(request.error);
        });
    }

    async saveProducts(products: Product[]): Promise<void> {
        const db = await initDB();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction('products', 'readwrite');
            const store = transaction.objectStore('products');

            // Limpiamos la tienda antes de guardar para evitar duplicados/fantasmas 
            // (Estrategia simple que imita LocalStorage, ideal para arrays pequeños)
            store.clear();

            products.forEach(product => {
                // IMPORTANTE: Serializamos manualmente para guardar las propiedades privadas
                const rawProduct = {
                    id: product.id,
                    name: product.name,
                    price: product.price,
                    _stock: product.stock, // Guardamos el valor del getter
                    minStock: product.minStock
                };
                store.put(rawProduct);
            });

            transaction.oncomplete = () => resolve();
            transaction.onerror = () => reject(transaction.error);
        });
    }

    async getProductById(id: string): Promise<Product | undefined> {
        const products = await this.getProducts();
        return products.find(p => p.id === id);
    }

    // Método seed para datos iniciales
    async seed(initialData: any[]): Promise<void> {
        const current = await this.getProducts();
        if (current.length === 0) {
            // Mapeamos a clases Product antes de guardar
            const products = initialData.map(d => new Product(d.id, d.name, d.price, d.stock, d.minStock));
            await this.saveProducts(products);
        }
    }
}