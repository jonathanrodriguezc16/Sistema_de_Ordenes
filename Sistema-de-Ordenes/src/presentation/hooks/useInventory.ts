import { useState, useEffect } from 'react';
import { useServices } from '../context/ServiceContext';
import { Product } from '../../core/domain/Product';

export const useInventory = () => {
    // Obtenemos la instancia del servicio desde el contexto
    const { inventoryService } = useServices();

    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        // Función interna para cargar datos iniciales
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

        // 1. Carga inicial
        loadInitialData();

        // 2. SUSCRIPCIÓN REACTIVA (La "Magia"):
        // Nos suscribimos al servicio. Cuando ocurra una venta en cualquier lugar de la app,
        // el servicio ejecutará este callback con los datos actualizados.
        const unsubscribe = inventoryService.subscribe((updatedProducts) => {
            setProducts(updatedProducts);
        });

        // 3. Limpieza: Dejar de escuchar cuando el componente se desmonte
        return () => unsubscribe();
    }, [inventoryService]);

    return {
        products,
        loading,
        error
        // Ya no devolvemos 'refresh' ni 'purchase' porque la actualización es automática
    };
};