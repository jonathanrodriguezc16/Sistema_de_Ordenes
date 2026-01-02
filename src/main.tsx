import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';

// --- IMPORTACIONES DE CORE Y SERVICIOS ---
import { InventoryService } from './core/services/InventoryService';
import { OrderService } from './core/services/OrderService.ts';
import { ClientService } from './core/services/ClientService.ts';
import { ServiceProvider } from './presentation/context/ServiceContext';
import { NotificationService } from './infrastructure/websocket/NotificationService';

// --- NUEVAS IMPORTACIONES DE INFRAESTRUCTURA (INDEXEDDB) ---
import { IndexedDBInventoryRepository } from './infrastructure/repositories/IndexedDBInventoryRepository';
import { IndexedDBClientRepository } from './infrastructure/repositories/IndexedDBClientRepository';
import { IndexedDBOrderRepository } from './infrastructure/repositories/IndexedDBOrderRepository';

// 1. Instanciamos las dependencias con IndexedDB
const inventoryRepo = new IndexedDBInventoryRepository();
const clientRepo = new IndexedDBClientRepository();
const orderRepo = new IndexedDBOrderRepository();

const notificationService = new NotificationService();

// 2. Inyectamos los repositorios en los servicios
const inventoryService = new InventoryService(inventoryRepo, notificationService);
// IMPORTANTE: Si tu OrderService espera un repositorio de órdenes en el constructor, inyéctalo aquí.
// Si tu OrderService actual solo usaba 'inventoryService', puede que necesites actualizarlo para guardar órdenes.
// Asumiendo que OrderService guarda el historial, deberías pasárselo:
const orderService = new OrderService(inventoryService, orderRepo);

const clientService = new ClientService(clientRepo);




createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ServiceProvider
      inventoryService={inventoryService}
      notificationService={notificationService}
      orderService={orderService}
      clientService={clientService}
    >


      <App />
    </ServiceProvider>
  </StrictMode>,
);