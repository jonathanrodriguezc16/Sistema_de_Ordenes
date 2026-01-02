import { createContext, useContext, type ReactNode } from "react";
import { InventoryService } from "../../core/services/InventoryService";
import { NotificationService } from "../../infrastructure/websocket/NotificationService";
import { OrderService } from "../../core/services/OrderService";
import { ClientService } from "../../core/services/ClientService";

/**
 * Contrato que define los servicios disponibles para inyección en toda la aplicación.
 */
interface ServiceContextProps {
  inventoryService: InventoryService;
  notificationService: NotificationService;
  orderService: OrderService;
  clientService: ClientService;
}

const ServiceContext = createContext<ServiceContextProps | undefined>(
  undefined
);

// Definimos las props del componente Provider extendiendo la interfaz de servicios
interface ServiceProviderProps extends ServiceContextProps {
  children: ReactNode;
}

/**
 * Componente Proveedor que inyecta las instancias de los servicios en el árbol de componentes.
 * Implementa el patrón de Inyección de Dependencias a través de React Context.
 */
export const ServiceProvider = ({
  children,
  inventoryService,
  notificationService,
  orderService,
  clientService,
}: ServiceProviderProps) => {
  return (
    <ServiceContext.Provider
      value={{
        inventoryService,
        notificationService,
        orderService,
        clientService,
      }}
    >
      {children}
    </ServiceContext.Provider>
  );
};

/**
 * Hook personalizado para consumir los servicios inyectados.
 * Protege contra el uso del hook fuera del contexto del proveedor.
 * @returns El objeto con todos los servicios instanciados.
 * @throws {Error} Si se invoca fuera de <ServiceProvider>.
 */
export const useServices = () => {
  const context = useContext(ServiceContext);
  if (!context) {
    throw new Error(
      "useServices debe ser utilizado dentro de un ServiceProvider"
    );
  }
  return context;
};
