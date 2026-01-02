/**
 * Entidad de dominio que representa un Producto en el inventario.
 * Gestiona su propio stock y contiene las reglas para alertas de escasez.
 */
export class Product {
  constructor(
    public readonly id: string,
    public name: string,
    public price: number,
    private _stock: number,
    public readonly minStock: number
  ) {}

  /**
   * Obtiene la cantidad actual de stock disponible.
   * La propiedad es de solo lectura desde fuera para evitar modificaciones directas sin validación.
   */
  get stock(): number {
    return this._stock;
  }

  /**
   * Reduce el stock del producto de manera segura.
   * @param quantity Cantidad a descontar.
   * @throws {Error} Si la cantidad es inválida o si no hay stock suficiente.
   */
  decreaseStock(quantity: number): void {
    if (quantity <= 0) throw new Error("La cantidad debe ser mayor a 0");
    if (this._stock < quantity) {
      throw new Error(`Stock insuficiente para ${this.name}`);
    }

    this._stock -= quantity;
  }

  /**
   * Incrementa el stock del producto.
   * Utilizado para reabastecimiento o rollback de órdenes canceladas.
   * @param quantity Cantidad a devolver al inventario.
   */
  increaseStock(quantity: number): void {
    if (quantity <= 0) throw new Error("La cantidad debe ser mayor a 0");
    this._stock += quantity;
  }

  /**
   * Verifica si el producto se encuentra totalmente agotado.
   * Útil para generar alertas de 'Inventory Out'.
   */
  isOut(): boolean {
    return this._stock === 0;
  }

  /**
   * Verifica si el stock está por debajo o igual al umbral mínimo definido.
   * Útil para generar alertas de 'Low Stock'.
   */
  isLow(): boolean {
    return this._stock <= this.minStock && this._stock > 0;
  }

  /**
   * Reconstruye una instancia de Product a partir de un JSON plano.
   * Necesario cuando se carga el inventario desde la base de datos (IndexedDB).
   */
  static fromJSON(json: any): Product {
    return new Product(
      json.id,
      json.name,
      json.price,
      json._stock ?? json.stock,
      json.minStock
    );
  }
}
