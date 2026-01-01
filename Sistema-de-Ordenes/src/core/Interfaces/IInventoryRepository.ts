import type { Product } from "../domain/Product";

export interface IInventoryRepository {
    getProducts(): Promise<Product[]>;
    saveProducts(products: Product[]): Promise<void>;
    getProductById(id: string): Promise<Product | undefined>;
}