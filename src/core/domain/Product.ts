export class Product {
    constructor(
        public readonly id: string,
        public name: string,
        public price: number,
        private _stock: number, // Privado: solo la clase puede modificarlo
        public readonly minStock: number
    ) { }

    // Getter para leer el stock
    get stock(): number {
        return this._stock;
    }

    // Método de negocio: Encapsula la regla "No stock negativo"
    decreaseStock(quantity: number): void {
        if (quantity <= 0) throw new Error("La cantidad debe ser mayor a 0");
        if (this._stock < quantity) throw new Error(`Stock insuficiente para ${this.name}`);

        this._stock -= quantity;
    }
    // Método para devolver stock (Rollback)
    increaseStock(quantity: number): void {
        this._stock += quantity;
    }

    // Métodos de consulta para notificaciones
    isOut(): boolean {
        return this._stock === 0;
    }

    isLow(): boolean {
        return this._stock <= this.minStock && this._stock > 0;
    }
}