# Sistema de Órdenes con Inventario en Tiempo Real (POS)

Este proyecto es una solución técnica para un sistema de Punto de Venta (POS) desarrollado con **React** y **TypeScript**. El objetivo principal fue construir una aplicación robusta, escalable y mantenible, priorizando la **Arquitectura de Software** y la **Programación Orientada a Objetos (POO)** por encima de la implementación tradicional centrada solo en componentes.

## 🚀 Tecnologías y Herramientas

* **Core:** React 18, TypeScript, Vite.
* **Estilos:** CSS Modules / TailwindCSS (según tu configuración).
* **Persistencia:** IndexedDB (Almacenamiento robusto) y LocalStorage.
* **Patrones de Diseño:** Observer, Repository, Dependency Injection, Singleton.
* **Gestión de Estado:** React Context (solo para Inyección de Dependencias) + Hooks personalizados.

---

## 🏗 Arquitectura del Proyecto

El proyecto sigue los principios de **Clean Architecture** (Arquitectura Limpia) y **Hexagonal**, separando estrictamente las responsabilidades en capas. La regla de oro aplicada es: **"La lógica de negocio NO vive en los componentes de React"**.

### 1. Capa de Dominio (`src/core/domain`)
Contiene las entidades y reglas de negocio puras. No dependen de React ni de librerías externas.
* **Entidades Ricas:** `Product`, `Order`, `Client`. Estas clases contienen métodos de negocio (ej: `product.decreaseStock()`, `order.calculateTotal()`) en lugar de ser simples objetos de datos.

### 2. Capa de Aplicación (`src/core/services`)
Orquesta los casos de uso de la aplicación.
* **`InventoryService`**: Gestiona el stock y emite eventos de dominio.
* **`OrderService`**: Coordina la creación de órdenes, validaciones y transacciones.
* **`NotificationService`**: Maneja la lógica de alertas en tiempo real.

### 3. Capa de Infraestructura (`src/infrastructure`)
Implementaciones concretas de interfaces definidas en el Core. Aquí es donde la aplicación "toca" el mundo exterior.
* **Repositorios:** Implementación de persistencia con `IndexedDB` y `LocalStorage`.
* **WebSockets Mock:** Simulación de eventos en tiempo real usando el **Patrón Observer** en memoria (`NotificationService.ts`).

### 4. Capa de Presentación (`src/presentation`)
Responsable únicamente de pintar la interfaz.
* **Componentes:** Tontos y funcionales. Solo reciben datos y emiten eventos de UI.
* **Custom Hooks:** (`useInventory`, `useOrder`) Actúan como adaptadores entre la Vista y los Servicios.
* **Dependency Injection:** Un `ServiceContext` inyecta las instancias de los servicios, permitiendo cambiar implementaciones (ej: cambiar IndexedDB por una API real) sin tocar los componentes.

---

## ✨ Funcionalidades Clave

### 📦 Gestión de Inventario
* Visualización de productos con indicadores de estado (Disponible, Pocas Unidades, Agotado).
* **Validación Estricta:** El sistema impide transacciones que dejen el stock en negativo (validado en la Entidad de Dominio).

### 🛒 Sistema de Órdenes
* Carrito de compras con selección de clientes.
* Cálculo automático de subtotales y totales.
* **Atomicidad:** Al confirmar una orden, el stock se descuenta y la orden se guarda en una sola operación lógica.
* **Rollback (Extra):** Capacidad de cancelar órdenes y devolver el stock automáticamente al inventario.

### 🔔 Notificaciones en Tiempo Real (Mock)
Sistema de alertas reactivas para el Administrador:
* **`inventory:low`**: Alerta cuando el stock baja del umbral mínimo.
* **`inventory:out`**: Alerta crítica cuando un producto se agota.
* Panel de notificaciones persistente (no se pierde al recargar) con contador de no leídos.

### 💾 Persistencia de Datos
* Uso de **IndexedDB** para manejar grandes volúmenes de datos de forma asíncrona y eficiente, superando las limitaciones del LocalStorage.

---

## 📂 Estructura de Carpetas

```bash
src/
├── core/                   # Lógica de Negocio Pura (Agnóstica del Framework)
│   ├── domain/             # Entidades (Product, Order, Client)
│   ├── services/           # Casos de Uso (Logica de aplicación)
│   └── interfaces/         # Contratos para repositorios (Repository Pattern)
│
├── infrastructure/         # Implementaciones Técnicas
│   ├── repositories/       # Acceso a Datos (IndexedDB, LocalStorage)
│   ├── persistence/        # Configuración de BD
│   └── websocket/          # Mock de servicio de notificaciones
│
├── presentation/           # Capa de Vista (React)
│   ├── components/         # Componentes UI reutilizables
│   ├── hooks/              # Lógica de conexión Vista-Controlador
│   └── context/            # Inyección de Dependencias
│
└── main.tsx                # Punto de entrada y composición (Composition Root)