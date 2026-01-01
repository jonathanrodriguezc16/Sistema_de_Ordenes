import { Store, History, Settings, ShoppingCart } from 'lucide-react';

interface NavbarProps {
    currentView: 'catalog' | 'history' | 'admin';
    onChangeView: (view: 'catalog' | 'history' | 'admin') => void;
    cartCount: number;
    onOpenCart: () => void;
}

export const Navbar = ({ currentView, onChangeView, cartCount, onOpenCart }: NavbarProps) => {

    // Función auxiliar para los estilos de los botones de navegación
    const getNavItemClass = (view: string) => {
        const isActive = currentView === view;
        return `
            flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 font-medium
            ${isActive
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50'
                : 'text-gray-400 hover:text-white hover:bg-gray-800'
            }
        `;
    };

    return (
        <nav className="sticky top-4 z-40 mb-8 mx-4">
            <div className="bg-gray-900/95 backdrop-blur-md text-white rounded-2xl shadow-xl border border-gray-800 px-4 py-3 sm:px-6 flex justify-between items-center">

                {/* --- Grupo de Navegación --- */}
                <div className="flex gap-1 sm:gap-2 overflow-x-auto no-scrollbar">
                    <button
                        onClick={() => onChangeView('catalog')}
                        className={getNavItemClass('catalog')}
                    >
                        <Store size={18} />
                        <span className="hidden sm:inline">Catálogo</span>
                    </button>

                    <button
                        onClick={() => onChangeView('history')}
                        className={getNavItemClass('history')}
                    >
                        <History size={18} />
                        <span className="hidden sm:inline">Historial</span>
                    </button>

                    <button
                        onClick={() => onChangeView('admin')}
                        className={getNavItemClass('admin')}
                    >
                        <Settings size={18} />
                        <span className="hidden sm:inline">Admin</span>
                    </button>
                </div>

                {/* --- Botón del Carrito --- */}
                <button
                    onClick={onOpenCart}
                    className="group relative bg-gray-800 hover:bg-gray-700 text-white p-3 sm:py-2 sm:px-5 rounded-xl flex items-center gap-3 transition-all border border-gray-700 hover:border-gray-600 active:scale-95"
                >
                    <div className="relative">
                        <ShoppingCart size={20} className="text-blue-400 group-hover:text-blue-300 transition-colors" />

                        {/* Badge de Notificación con animación */}
                        {cartCount > 0 && (
                            <span className="absolute -top-2.5 -right-2.5 bg-red-500 text-white text-[10px] font-bold h-5 w-5 flex items-center justify-center rounded-full border-2 border-gray-900 animate-in zoom-in duration-200">
                                {cartCount > 9 ? '9+' : cartCount}
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