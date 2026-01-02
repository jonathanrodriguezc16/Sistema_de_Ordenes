import { useState, useMemo } from "react";
import { useServices } from "../context/ServiceContext";
import { Order, type OrderItem } from "../../core/domain/Order";
import type { Product } from "../../core/domain/Product";
import toast from "react-hot-toast";

/**
 * Hook de capa de presentación para la gestión del carrito de compras.
 * Coordina el estado local del carrito con las validaciones de negocio y el servicio de órdenes.
 */
export const useOrder = () => {
  const { orderService } = useServices();
  const [cart, setCart] = useState<OrderItem[]>([]);

  /**
   * Agrega un producto al carrito o incrementa su cantidad si ya existe.
   * Realiza una validación preventiva contra el stock disponible.
   * @param product Producto seleccionado.
   * @param quantity Cantidad a agregar (por defecto 1).
   */
  const addToCart = (product: Product, quantity: number = 1) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.productId === product.id);
      const currentQty = existing ? existing.quantity : 0;

      if (currentQty + quantity > product.stock) {
        toast.error(`No hay suficiente stock. Solo quedan ${product.stock}`);
        return prev;
      }

      if (existing) {
        return prev.map((item) =>
          item.productId === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }

      return [
        ...prev,
        { productId: product.id, quantity: quantity, price: product.price },
      ];
    });
  };

  /**
   * Decrementa la cantidad de un ítem. Si llega a 0, lo elimina del carrito.
   * @param productId ID del producto a decrementar.
   */
  const decreaseQuantity = (productId: string) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.productId === productId) {
            return { ...item, quantity: Math.max(0, item.quantity - 1) };
          }
          return item;
        })
        .filter((item) => item.quantity > 0)
    );
  };

  /**
   * Elimina un producto del carrito por completo.
   * @param productId ID del producto a eliminar.
   */
  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.productId !== productId));
  };

  /**
   * Procesa la compra enviando el carrito actual al servicio de dominio.
   * Maneja errores y notificaciones de éxito.
   * @param clientId ID del cliente que realiza la compra.
   */
  const checkout = async (clientId: string) => {
    try {
      await orderService.createOrder(clientId, cart);
      setCart([]);
      toast.success("¡Orden procesada con éxito!");
      return true;
    } catch (error: any) {
      toast.error(error.message || "Error al procesar la orden");
      return false;
    }
  };

  const total = useMemo(() => {
    return Order.calculateTotal(cart);
  }, [cart]);

  return {
    cart,
    total,
    addToCart,
    removeFromCart,
    decreaseQuantity,
    checkout,
  };
};
