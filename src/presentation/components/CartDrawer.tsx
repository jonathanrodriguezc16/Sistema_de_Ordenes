import {
  X,
  ShoppingCart,
  Trash2,
  Plus,
  Minus,
  User,
  CreditCard,
  ShoppingBag,
  UserPlus,
  AlertCircle,
} from "lucide-react";
import type { OrderItem } from "../../core/domain/Order";
import type { Client } from "../../core/domain/Client";
import type { Product } from "../../core/domain/Product";

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cart: OrderItem[];
  products: Product[];
  total: number;
  clients: Client[];
  selectedClientId: string;
  onSelectClient: (id: string) => void;
  onCheckout: () => void;
  onIncrease: (product: Product) => void;
  onDecrease: (id: string) => void;
  onRemove: (id: string) => void;

  onGoToAdmin?: () => void;
}

/**
 * Componente de tipo "Drawer" (deslizable) que gestiona el resumen de compra.
 * Permite modificar cantidades, seleccionar el cliente y finalizar la orden.
 */
export const CartDrawer = ({
  isOpen,
  onClose,
  cart,
  products,
  total,
  clients,
  selectedClientId,
  onSelectClient,
  onCheckout,
  onIncrease,
  onDecrease,
  onRemove,
  onGoToAdmin,
}: CartDrawerProps) => {
  const getProduct = (id: string) => products.find((p) => p.id === id);

  return (
    <>
      {/* Overlay con efecto Blur */}
      <div
        onClick={onClose}
        className={`fixed inset-0 bg-black/40 backdrop-blur-sm z-40 transition-opacity duration-300 ${
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      />

      {/* Panel Deslizable */}
      <div
        className={`fixed top-0 right-0 h-full w-[400px] max-w-[90vw] bg-white shadow-2xl z-50 flex flex-col transition-transform duration-300 ease-out transform ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Encabezado */}
        <div className="flex justify-between items-center p-5 border-b border-gray-100 bg-gray-50/50">
          <div className="flex items-center gap-2 text-gray-800">
            <ShoppingCart className="text-blue-600" size={24} />
            <h2 className="text-xl font-bold">Tu Carrito</h2>
            <span className="bg-blue-100 text-blue-700 text-xs font-bold px-2 py-0.5 rounded-full">
              {cart.length}
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-red-500 hover:bg-red-50 p-2 rounded-full transition-all"
            aria-label="Cerrar carrito"
          >
            <X size={20} />
          </button>
        </div>

        {/* Lista de Productos */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 custom-scrollbar">
          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-400 space-y-4 opacity-60">
              <ShoppingBag size={80} strokeWidth={1} />
              <p className="text-lg font-medium">Tu carrito está vacío</p>
              <button
                onClick={onClose}
                className="text-blue-500 text-sm hover:underline"
              >
                Volver al catálogo
              </button>
            </div>
          ) : (
            <ul className="space-y-4">
              {cart.map((item) => {
                const product = getProduct(item.productId);
                if (!product) return null;
                const isMaxStock = item.quantity >= product.stock;

                return (
                  <li
                    key={item.productId}
                    className="flex flex-col bg-white p-3 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="font-bold text-gray-800 text-sm">
                          {product.name}
                        </h4>
                        <p className="text-xs text-gray-500 font-medium">
                          Stock disponible: {product.stock}
                        </p>
                      </div>
                      <button
                        onClick={() => onRemove(item.productId)}
                        className="text-gray-400 hover:text-red-500 p-1.5 hover:bg-red-50 rounded-lg transition-colors group"
                        title="Eliminar producto"
                      >
                        <Trash2
                          size={16}
                          className="group-hover:scale-110 transition-transform"
                        />
                      </button>
                    </div>

                    <div className="flex justify-between items-end bg-gray-50 p-2 rounded-lg">
                      <div className="flex items-center bg-white rounded-md border border-gray-200 shadow-sm h-8">
                        <button
                          onClick={() => onDecrease(item.productId)}
                          className="px-2 h-full text-gray-500 hover:text-blue-600 hover:bg-gray-50 rounded-l-md disabled:opacity-30 transition-colors"
                        >
                          <Minus size={14} />
                        </button>
                        <span className="w-8 text-center text-sm font-bold text-gray-700 select-none">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => onIncrease(product)}
                          disabled={isMaxStock}
                          className={`px-2 h-full rounded-r-md transition-colors ${
                            isMaxStock
                              ? "text-gray-300 cursor-not-allowed"
                              : "text-gray-500 hover:text-blue-600 hover:bg-gray-50"
                          }`}
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                      <div className="text-right">
                        <div className="text-[10px] text-gray-400">
                          Subtotal
                        </div>
                        <div className="font-bold text-gray-900 text-sm">
                          ${(item.quantity * item.price).toLocaleString()}
                        </div>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* Footer (Resumen y Checkout) */}
        <div className="border-t border-gray-100 p-6 bg-white shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-10">
          <div className="flex justify-between items-end mb-6">
            <span className="text-gray-500 font-medium text-sm">
              Total a pagar
            </span>
            <span className="text-3xl font-extrabold text-gray-800 tracking-tight">
              ${total.toLocaleString()}
            </span>
          </div>

          <div className="space-y-3">
            {/* Validación de Clientes: Si no hay, bloqueamos y ofrecemos ir al admin */}
            {clients.length === 0 ? (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex flex-col gap-3 animate-in fade-in slide-in-from-bottom-2">
                <div className="flex items-start gap-2 text-amber-800">
                  <AlertCircle size={18} className="shrink-0 mt-0.5" />
                  <div className="text-xs font-medium leading-relaxed">
                    No hay clientes registrados en el sistema. Debes crear uno
                    antes de confirmar la orden.
                  </div>
                </div>
                <button
                  onClick={() => {
                    onClose();
                    if (onGoToAdmin) onGoToAdmin();
                  }}
                  className="w-full py-2 bg-white border border-amber-300 hover:bg-amber-100 text-amber-900 rounded-lg text-sm font-bold transition-colors flex items-center justify-center gap-2 shadow-sm"
                >
                  <UserPlus size={16} />
                  Registrar Cliente Ahora
                </button>
              </div>
            ) : (
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="text-gray-400" size={18} />
                </div>
                <select
                  value={selectedClientId}
                  onChange={(e) => onSelectClient(e.target.value)}
                  className={`w-full pl-10 pr-4 py-3 border rounded-xl appearance-none outline-none transition-all cursor-pointer ${
                    !selectedClientId
                      ? "border-gray-300 text-gray-500 bg-gray-50"
                      : "border-blue-200 text-gray-900 bg-blue-50/30 ring-1 ring-blue-100"
                  }`}
                >
                  <option value="" disabled>
                    Seleccionar cliente para el pedido...
                  </option>
                  {clients.map((c) => (
                    <option key={c.id} value={c.id} className="text-gray-900">
                      {c.name} ({c.email})
                    </option>
                  ))}
                </select>
              </div>
            )}

            <button
              onClick={onCheckout}
              disabled={
                cart.length === 0 || !selectedClientId || clients.length === 0
              }
              className={`w-full py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-all transform active:scale-[0.99] ${
                cart.length > 0 && selectedClientId
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-200 hover:bg-blue-700 hover:shadow-blue-300"
                  : "bg-gray-100 text-gray-400 cursor-not-allowed"
              }`}
            >
              <CreditCard size={20} />
              Confirmar Orden
            </button>
          </div>
        </div>
      </div>
    </>
  );
};
