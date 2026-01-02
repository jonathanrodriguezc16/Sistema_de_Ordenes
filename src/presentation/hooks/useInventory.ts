import { useState, useEffect } from "react";
import { useServices } from "../context/ServiceContext";
import { Product } from "../../core/domain/Product";

/**
 * Hook personalizado para acceder al estado del inventario.
 * Gestiona la carga inicial y mantiene la lista de productos sincronizada
 * en tiempo real mediante suscripción al InventoryService.
 */
export const useInventory = () => {
  const { inventoryService } = useServices();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setLoading(true);
        const data = await inventoryService.getAllProducts();
        setProducts(data);
      } catch (err) {
        setError("Error al cargar productos del inventario");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadInitialData();

    // Suscripción a cambios del servicio (Observer Pattern) para actualizaciones automáticas
    const unsubscribe = inventoryService.subscribe((updatedProducts) => {
      setProducts(updatedProducts);
    });

    return () => unsubscribe();
  }, [inventoryService]);

  return {
    products,
    loading,
    error,
  };
};
