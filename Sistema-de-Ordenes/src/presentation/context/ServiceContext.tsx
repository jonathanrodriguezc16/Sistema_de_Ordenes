import React, { createContext, useContext, type ReactNode } from 'react';
import { InventoryService } from '../../core/services/InventoryService';
import { NotificationService } from '../../infrastructure/websocket/NotificationService';
import { OrderService } from '../../core/services/OrderService'; // Importar
import { ClientService } from '../../core/services/ClientService';
// Definimos qué servicios estarán disponibles en toda la app
interface ServiceContextProps {
    inventoryService: InventoryService;
    notificationService: NotificationService;
    orderService: OrderService; // Agregar OrderService
    clientService: ClientService;
}

const ServiceContext = createContext<ServiceContextProps | undefined>(undefined);

// Provider: Este componente envolverá tu aplicación
export const ServiceProvider = ({
    children,
    inventoryService,
    notificationService,
    orderService,
    clientService
}: {
    children: ReactNode;
    inventoryService: InventoryService;
    notificationService: NotificationService;
    orderService: OrderService;
    clientService: ClientService;
}) => {
    return (
        <ServiceContext.Provider value={{ inventoryService, notificationService, orderService, clientService }}>
            {children}
        </ServiceContext.Provider>
    );
};

// Hook utilitario para usar el contexto fácilmente
export const useServices = () => {
    const context = useContext(ServiceContext);
    if (!context) {
        throw new Error("useServices debe usarse dentro de un ServiceProvider");
    }
    return context;
};