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

// 3. Datos de prueba (Seed)
const seedProducts = [
  { id: '1', name: 'Laptop Gamer', price: 1500, stock: 10, minStock: 2 },
  { id: '2', name: 'Teclado Mecánico', price: 100, stock: 5, minStock: 3 },
  { id: '3', name: 'Monitor 4K', price: 400, stock: 0, minStock: 2 },
  { id: '4', name: 'Monitor 2K', price: 300, stock: 4, minStock: 2 },
];

const seedClients = [
  { id: 'c1', name: 'Juan Pérez', email: 'juan@example.com' },
  { id: 'c2', name: 'Maria Lopez', email: 'maria@example.com' },
];

// Inicializamos la BD con datos semilla
inventoryRepo.seed(seedProducts);
clientRepo.seed(seedClients);

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