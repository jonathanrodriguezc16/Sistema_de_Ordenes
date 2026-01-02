import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";

// --- Capa de Servicios (Aplicación) ---
import { InventoryService } from "./core/services/InventoryService";
import { OrderService } from "./core/services/OrderService.ts";
import { ClientService } from "./core/services/ClientService.ts";

// --- Capa de Infraestructura (Persistencia y Externos) ---
import { IndexedDBInventoryRepository } from "./infrastructure/repositories/IndexedDBInventoryRepository";
import { IndexedDBClientRepository } from "./infrastructure/repositories/IndexedDBClientRepository";
import { IndexedDBOrderRepository } from "./infrastructure/repositories/IndexedDBOrderRepository";
import { NotificationService } from "./infrastructure/websocket/NotificationService";

// --- Contexto de Inyección ---
import { ServiceProvider } from "./presentation/context/ServiceContext";

/**
 * COMPOSITION ROOT
 * Aquí se instancian todas las dependencias y se inyectan en la aplicación.
 * Esto asegura que los componentes de React no conozcan la implementación concreta (IndexedDB).
 */

// 1. Instancia de Repositorios (Adaptadores)
const inventoryRepo = new IndexedDBInventoryRepository();
const clientRepo = new IndexedDBClientRepository();
const orderRepo = new IndexedDBOrderRepository();

// 2. Instancia de Servicios Externos
const notificationService = new NotificationService();

// 3. Inyección de Dependencias en Servicios de Dominio
const inventoryService = new InventoryService(
  inventoryRepo,
  notificationService
);
const orderService = new OrderService(inventoryService, orderRepo);
const clientService = new ClientService(clientRepo);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ServiceProvider
      inventoryService={inventoryService}
      notificationService={notificationService}
      orderService={orderService}
      clientService={clientService}
    >
      <App />
    </ServiceProvider>
  </StrictMode>
);
