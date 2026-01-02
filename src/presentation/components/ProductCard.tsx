import { useState } from "react";
import {
  ShoppingCart,
  Plus,
  Minus,
  AlertTriangle,
  PackageX,
  PackageCheck,
} from "lucide-react";
import type { Product } from "../../core/domain/Product";

interface ProductCardProps {
  /** Instancia del producto con sus métodos de dominio */
  product: Product;
  /** Callback para agregar al carrito */
  onAdd: (p: Product, qty: number) => void;
}

/**
 * Tarjeta de presentación de producto.
 * Muestra información clave, estado del stock y controles de adición al carrito.
 * Delega las reglas de "agotado" o "stock bajo" a la entidad de dominio.
 */
export const ProductCard = ({ product, onAdd }: ProductCardProps) => {
  const [qty, setQty] = useState(1);

  // Usamos los métodos de la clase Product (Lógica de Dominio)
  // en lugar de calcularlo manualmente aquí.
  const isLowStock = product.isLow();
  const isOutOfStock = product.isOut();

  const handleIncrement = () => {
    if (qty < product.stock) setQty((prev) => prev + 1);
  };

  const handleDecrement = () => {
    if (qty > 1) setQty((prev) => prev - 1);
  };

  const handleAdd = () => {
    onAdd(product, qty);
    setQty(1);
  };

  return (
    <div
      className={`
        relative flex flex-col justify-between
        bg-white rounded-2xl overflow-hidden
        border border-gray-100 shadow-sm
        transition-all duration-300 ease-in-out
        hover:shadow-xl hover:-translate-y-1 group
        ${isOutOfStock ? "opacity-75 grayscale-[0.5]" : ""}
    `}
    >
      {/* Header Visual */}
      <div className="h-32 bg-gradient-to-br from-slate-50 to-slate-200 flex items-center justify-center relative group-hover:from-blue-50 group-hover:to-indigo-50 transition-colors duration-500">
        {isOutOfStock ? (
          <PackageX size={48} className="text-gray-400" />
        ) : (
          <div className="text-blue-500 transform group-hover:scale-110 transition-transform duration-300">
            <PackageCheck size={48} strokeWidth={1.5} />
          </div>
        )}

        {/* Badges Flotantes de Estado */}
        <div className="absolute top-3 right-3 flex flex-col gap-1 items-end">
          {isOutOfStock && (
            <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded-full shadow-sm flex items-center gap-1">
              AGOTADO
            </span>
          )}
          {isLowStock && (
            <span className="bg-amber-400 text-white text-[10px] font-bold px-2 py-1 rounded-full shadow-sm flex items-center gap-1 animate-pulse">
              <AlertTriangle size={10} /> ÚLTIMAS UNIDADES
            </span>
          )}
        </div>
      </div>

      {/* Contenido */}
      <div className="p-5 flex flex-col flex-grow">
        <div className="mb-4">
          <h3
            className="text-gray-800 font-bold text-lg leading-tight mb-1 truncate"
            title={product.name}
          >
            {product.name}
          </h3>
          <div className="flex justify-between items-end">
            <span className="text-2xl font-bold text-blue-600">
              ${product.price.toLocaleString()}
            </span>
            <div className="text-xs text-gray-500 font-medium bg-gray-100 px-2 py-1 rounded-md">
              Stock: {product.stock}
            </div>
          </div>
        </div>

        {/* Controles de Acción */}
        <div className="mt-auto pt-4 border-t border-gray-100">
          {isOutOfStock ? (
            <button
              disabled
              className="w-full py-2.5 bg-gray-100 text-gray-400 font-medium rounded-xl cursor-not-allowed text-sm"
            >
              No disponible
            </button>
          ) : (
            <div className="flex gap-3">
              {/* Stepper (Contador) */}
              <div className="flex items-center bg-gray-50 rounded-xl border border-gray-200 p-1">
                <button
                  onClick={handleDecrement}
                  disabled={qty <= 1}
                  className="p-1.5 hover:bg-white rounded-lg text-gray-500 hover:text-blue-600 hover:shadow-sm disabled:opacity-30 disabled:hover:bg-transparent transition-all"
                  aria-label="Disminuir cantidad"
                >
                  <Minus size={16} />
                </button>
                <span className="w-8 text-center font-bold text-gray-700 text-sm select-none">
                  {qty}
                </span>
                <button
                  onClick={handleIncrement}
                  disabled={qty >= product.stock}
                  className="p-1.5 hover:bg-white rounded-lg text-gray-500 hover:text-blue-600 hover:shadow-sm disabled:opacity-30 disabled:hover:bg-transparent transition-all"
                  aria-label="Aumentar cantidad"
                >
                  <Plus size={16} />
                </button>
              </div>

              {/* Botón Agregar */}
              <button
                onClick={handleAdd}
                className="flex-1 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-medium py-2 px-4 rounded-xl shadow-blue-200 shadow-lg hover:shadow-blue-300 transition-all flex items-center justify-center gap-2 group/btn"
              >
                <span className="text-sm">Agregar</span>
                <ShoppingCart
                  size={16}
                  className="group-hover/btn:translate-x-1 transition-transform"
                />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
