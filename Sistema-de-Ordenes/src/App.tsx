import { useState, useEffect } from 'react';
import { useInventory } from './presentation/hooks/useInventory';
import { useOrder } from './presentation/hooks/useOrder';
import { useServices } from './presentation/context/ServiceContext';

// Iconos de Lucide
import {
  Loader2,
  AlertCircle,
  PackageOpen,
  Settings,
  Plus
} from 'lucide-react';

// Componentes
import { NotificationPanel } from './presentation/components/NotificationPanel';
import { OrderHistory } from './presentation/components/OrderHistory';
import { AdminPanel } from './presentation/components/AdminPanel';
import { Navbar } from './presentation/components/Navbar';
import { CartDrawer } from './presentation/components/CartDrawer';
import { ProductCard } from './presentation/components/ProductCard';

import type { Client } from './core/domain/Client';
import type { Product } from './core/domain/Product';

function App() {
  const [currentView, setCurrentView] = useState<'catalog' | 'history' | 'admin'>('catalog');
  const [isCartOpen, setIsCartOpen] = useState(false);

  const { products, loading, error } = useInventory();
  const { cart, total, addToCart, decreaseQuantity, removeItem, checkout } = useOrder();
  const { clientService } = useServices();

  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClientId, setSelectedClientId] = useState<string>("");

  useEffect(() => { refreshClients(); }, []);

  const refreshClients = () => {
    clientService.getAllClients().then(data => {
      setClients(data);
      if (data.length > 0 && !selectedClientId) setSelectedClientId(data[0].id);
    });
  };

  const handleAddToCartAndOpen = (product: Product, qty: number) => {
    addToCart(product, qty);
    setIsCartOpen(true);
  };
  const handleIncrease = (product: Product) => {
    addToCart(product, 1);
  };

  const handleDecrease = (productId: string) => {
    decreaseQuantity(productId);
  };

  const handleRemove = (productId: string) => {
    removeItem(productId);
  };

  const handleCheckout = async () => {
    if (!selectedClientId) return;
    const success = await checkout(selectedClientId);
    if (success) setIsCartOpen(false);
  };

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 relative min-h-screen bg-gray-50/50 font-sans text-gray-800">

      <Navbar
        currentView={currentView}
        onChangeView={setCurrentView}
        cartCount={cart.reduce((acc, item) => acc + item.quantity, 0)}
        onOpenCart={() => setIsCartOpen(true)}
      />

      <NotificationPanel />

      <main className="mt-8 animate-in fade-in duration-500">

        {/* --- ESTADO DE CARGA --- */}
        {loading && (
          <div className="flex flex-col justify-center items-center py-20">
            <Loader2 className="h-10 w-10 text-blue-600 animate-spin mb-4" />
            <p className="text-gray-500 font-medium animate-pulse">Sincronizando inventario...</p>
          </div>
        )}

        {/* --- ESTADO DE ERROR --- */}
        {error && (
          <div className="max-w-2xl mx-auto bg-red-50 border border-red-100 rounded-xl p-4 mb-8 flex items-start gap-4 shadow-sm">
            <div className="p-2 bg-red-100 rounded-full text-red-600 shrink-0">
              <AlertCircle size={24} />
            </div>
            <div>
              <h3 className="font-bold text-red-800">Error de conexión</h3>
              <p className="text-red-600 text-sm mt-1">{error}</p>
            </div>
          </div>
        )}

        {/* --- VISTA: CATÁLOGO --- */}
        {currentView === 'catalog' && (
          <>
            {!loading && products.length === 0 ? (
              // Empty State (Sin productos)
              <div className="flex flex-col items-center justify-center py-24 bg-white rounded-3xl border border-dashed border-gray-300 text-center px-4 max-w-2xl mx-auto shadow-sm">
                <div className="bg-gray-50 p-6 rounded-full mb-6">
                  <PackageOpen size={64} className="text-gray-300" strokeWidth={1.5} />
                </div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Tu catálogo está vacío</h2>
                <p className="text-gray-500 mb-8 max-w-md">
                  Parece que aún no hay productos en el sistema. Ve al panel de administración para registrar tu primer artículo.
                </p>
                <button
                  onClick={() => setCurrentView('admin')}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-blue-200 transition-all transform hover:scale-105 active:scale-95 flex items-center gap-2 group"
                >
                  <Settings size={20} className="group-hover:rotate-45 transition-transform duration-500" />
                  Ir a Administración
                </button>
              </div>
            ) : (
              // Grilla de Productos
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {products.map(p => (
                  <ProductCard
                    key={p.id}
                    product={p}
                    onAdd={handleAddToCartAndOpen}
                  />
                ))}
              </div>
            )}
          </>
        )}

        {/* --- VISTA: ADMIN --- */}
        {currentView === 'admin' && (
          <AdminPanel onClientAdded={refreshClients} />
        )}

        {/* --- VISTA: HISTORIAL --- */}
        {currentView === 'history' && (
          <OrderHistory />
        )}
      </main>

      {/* --- DRAWER DEL CARRITO --- */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cart={cart}
        products={products}
        total={total}
        clients={clients}
        selectedClientId={selectedClientId}
        onSelectClient={setSelectedClientId}
        onCheckout={handleCheckout}
        onIncrease={handleIncrease}
        onDecrease={handleDecrease}
        onRemove={handleRemove}
        onGoToAdmin={() => setCurrentView('admin')}
      />
    </div>
  );
}

export default App;