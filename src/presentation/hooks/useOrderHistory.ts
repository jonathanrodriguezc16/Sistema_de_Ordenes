import { useState, useEffect, useCallback } from "react";
import { useServices } from "../context/ServiceContext";
import type { Order } from "../../core/domain/Order";
import toast from "react-hot-toast";

/**
 * Hook de presentación para gestionar el historial de órdenes.
 * Mantiene la lista de órdenes actualizada en tiempo real escuchando eventos del OrderService.
 */
export const useOrderHistory = () => {
  const { orderService } = useServices();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);

  /**
   * Recupera el historial completo de órdenes desde el repositorio.
   * Ordena los resultados por fecha de creación descendente (más recientes primero).
   */
  const fetchHistory = useCallback(async () => {
    try {
      const history = await orderService.getHistory();

      setOrders(
        history.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )
      );
    } catch (error) {
      console.error("Error cargando historial:", error);
      toast.error("Error al actualizar el historial");
    } finally {
      setLoading(false);
    }
  }, [orderService]);

  useEffect(() => {
    setLoading(true);
    fetchHistory();

    // Suscripción al Observer del servicio:
    // Cualquier cambio en una orden (creación o cancelación) disparará una recarga automática.
    const unsubscribe = orderService.subscribe(() => {
      fetchHistory();
    });

    return () => unsubscribe();
  }, [fetchHistory, orderService]);

  /**
   * Procesa la cancelación de una orden específica.
   * Incluye confirmación de usuario y feedback visual.
   * @param orderId ID de la orden a cancelar.
   */
  const cancelOrder = async (orderId: string) => {
    if (
      !confirm(
        "¿Estás seguro de cancelar esta orden? El stock será restaurado."
      )
    )
      return;

    try {
      await orderService.cancelOrder(orderId);
      toast.success("Orden cancelada y stock restaurado ✅");
    } catch (error: any) {
      toast.error(
        "Error: " + (error.message || "No se pudo cancelar la orden")
      );
    }
  };

  return {
    orders,
    loading,
    cancelOrder,
    refresh: fetchHistory,
  };
};
