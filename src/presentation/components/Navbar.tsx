import { Store, History, Settings, ShoppingCart } from "lucide-react";

interface NavbarProps {
  /** Vista actual activa en la aplicación */
  currentView: "catalog" | "history" | "admin";
  /** Función para cambiar la vista actual */
  onChangeView: (view: "catalog" | "history" | "admin") => void;
  /** Cantidad total de ítems en el carrito */
  cartCount: number;
  /** Callback para abrir el drawer del carrito */
  onOpenCart: () => void;
}

/**
 * Barra de navegación principal flotante.
 * Contiene los enlaces a las vistas principales y el acceso directo al carrito.
 */
export const Navbar = ({
  currentView,
  onChangeView,
  cartCount,
  onOpenCart,
}: NavbarProps) => {
  /**
   * Genera las clases CSS para los botones de navegación según su estado activo.
   */
  const getNavItemClass = (view: string) => {
    const isActive = currentView === view;
    const baseClasses =
      "flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 font-medium";

    const activeClasses = "bg-blue-600 text-white shadow-lg shadow-blue-900/50";
    const inactiveClasses = "text-gray-400 hover:text-white hover:bg-gray-800";

    return `${baseClasses} ${isActive ? activeClasses : inactiveClasses}`;
  };

  return (
    <nav className="sticky top-4 z-40 mb-8 mx-4">
      <div className="bg-gray-900/95 backdrop-blur-md text-white rounded-2xl shadow-xl border border-gray-800 px-4 py-3 sm:px-6 flex justify-between items-center">
        {/* Grupo de Navegación */}
        <div className="flex gap-1 sm:gap-2 overflow-x-auto no-scrollbar">
          <button
            onClick={() => onChangeView("catalog")}
            className={getNavItemClass("catalog")}
          >
            <Store size={18} />
            <span className="hidden sm:inline">Catálogo</span>
          </button>

          <button
            onClick={() => onChangeView("history")}
            className={getNavItemClass("history")}
          >
            <History size={18} />
            <span className="hidden sm:inline">Historial</span>
          </button>

          <button
            onClick={() => onChangeView("admin")}
            className={getNavItemClass("admin")}
          >
            <Settings size={18} />
            <span className="hidden sm:inline">Admin</span>
          </button>
        </div>

        {/* Botón del Carrito */}
        <button
          onClick={onOpenCart}
          className="group relative bg-gray-800 hover:bg-gray-700 text-white p-3 sm:py-2 sm:px-5 rounded-xl flex items-center gap-3 transition-all border border-gray-700 hover:border-gray-600 active:scale-95"
          aria-label="Abrir carrito"
        >
          <div className="relative">
            <ShoppingCart
              size={20}
              className="text-blue-400 group-hover:text-blue-300 transition-colors"
            />

            {cartCount > 0 && (
              <span className="absolute -top-2.5 -right-2.5 bg-red-500 text-white text-[10px] font-bold h-5 w-5 flex items-center justify-center rounded-full border-2 border-gray-900 animate-in zoom-in duration-200">
                {cartCount > 9 ? "9+" : cartCount}
              </span>
            )}
          </div>

          <span className="font-semibold text-sm hidden sm:inline">
            Carrito
          </span>
        </button>
      </div>
    </nav>
  );
};
