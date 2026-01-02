import { useState } from 'react';
import { useServices } from '../context/ServiceContext';
import type { OrderItem } from '../../core/domain/Order';
import type { Product } from '../../core/domain/Product';
import toast from 'react-hot-toast';

export const useOrder = () => {
    const { orderService } = useServices();
    const [cart, setCart] = useState<OrderItem[]>([]);

    // Agregar al carrito (Lógica UI)
    // Modificamos para aceptar 'quantity' opcional (por defecto 1)
    const addToCart = (product: Product, quantity: number = 1) => {
        setCart(prev => {
            const existing = prev.find(item => item.productId === product.id);
            const currentQty = existing ? existing.quantity : 0;

            // Validación de stock con la cantidad deseada
            if (currentQty + quantity > product.stock) {
                toast.error(`No hay suficiente stock. Solo quedan ${product.stock}`);
                return prev;
            }

            if (existing) {
                return prev.map(item =>
                    item.productId === product.id
                        ? { ...item, quantity: item.quantity + quantity } // Sumamos N
                        : item
                );
            }

            return [...prev, { productId: product.id, quantity: quantity, price: product.price }];
        });
    };

    // 2. Disminuir Cantidad (Si llega a 0, se elimina)
    const decreaseQuantity = (productId: string) => {
        setCart(prev => prev.map(item => {
            if (item.productId === productId) {
                return { ...item, quantity: Math.max(0, item.quantity - 1) };
            }
            return item;
        }).filter(item => item.quantity > 0)); // Limpiamos los que tengan 0
    };

    // 3. Eliminar Item completo (Papelera)
    const removeItem = (productId: string) => {
        setCart(prev => prev.filter(item => item.productId !== productId));
    };

    // Confirmar Compra (Llama al Servicio)
    const checkout = async (clientId: string) => {
        try {
            await orderService.createOrder(clientId, cart);
            setCart([]); // Limpiar carrito
            toast.success("¡Orden procesada con éxito!");
            return true; // Éxito
        } catch (error: any) {
            toast.error(error.message);
            return false;
        }
    };

    // Calcular total visual usando el servicio
    const total = orderService.calculateTotal(cart);

    const removeFromCart = (productId: string) => {
        setCart(prev => prev.filter(item => item.productId !== productId));
    };
    return {
        cart,
        total,
        addToCart,
        removeFromCart,
        decreaseQuantity,
        removeItem,
        checkout
    };
};