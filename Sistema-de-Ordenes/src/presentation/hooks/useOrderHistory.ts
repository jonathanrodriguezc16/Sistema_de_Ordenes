import { useState, useEffect, useCallback } from 'react';
import { useServices } from '../context/ServiceContext';
import type { Order } from '../../core/domain/Order';

export const useOrderHistory = () => {
    const { orderService } = useServices();
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(false);

    // Función para cargar órdenes (ordenadas por fecha más reciente)
    const fetchHistory = useCallback(async () => {
        //setLoading(true);
        try {
            const history = await orderService.getHistory();
            // Ordenamos: las nuevas primero
            setOrders(history.sort((a, b) =>
                new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            ));
        } catch (error) {
            console.error("Error cargando historial:", error);
        } finally {
            setLoading(false);
        }
    }, [orderService]);

    // Carga inicial
    useEffect(() => {
        //1
        setLoading(true);
        fetchHistory();
        // 2. SUSCRIPCIÓN AUTOMÁTICA
        // Cada vez que createOrder o cancelOrder llamen a notifyChanges(),
        // este callback se ejecutará y recargará la lista.
        const unsubscribe = orderService.subscribe(() => {
            fetchHistory();
        });

        return () => unsubscribe();
    }, [fetchHistory, orderService]);

    // Función de Cancelar
    const cancelOrder = async (orderId: string) => {
        if (!confirm('¿Estás seguro de cancelar esta orden? El stock será restaurado.')) return;

        try {
            await orderService.cancelOrder(orderId);
            alert('Orden cancelada y stock restaurado ✅');
            // Recargamos la lista para ver el cambio de estado

        } catch (error: any) {
            alert('Error: ' + error.message);
        }
    };

    return { orders, loading, cancelOrder, refresh: fetchHistory };
};