# Sistema de Gestión de Órdenes (POS) - Prueba Técnica

## Jonathan Alexander Rodriguez Campos

Este repositorio contiene la solución a la prueba técnica para el rol de Frontend Developer. El proyecto implementa un sistema de punto de venta (POS) con inventario en tiempo real, priorizando una **arquitectura desacoplada**, el uso de **Programación Orientada a Objetos (POO)** y la separación estricta de responsabilidades, tal como se solicitó en los requerimientos.

## Resumen de la Solución

El sistema permite gestionar el ciclo de vida completo de una venta: desde la administración de productos y clientes hasta la creación de órdenes, control de stock en tiempo real y alertas administrativas.

### implementacion de Requerimientos

|       Requerimiento        | Implementación                                                      |
| :------------------------: | :------------------------------------------------------------------ |
|    **Arquitectura OOP**    | Uso estricto de Clases, Interfaces e Inyección de Dependencias.     |
|  **Separación Lógica/UI**  | La lógica vive en la capa `Core`, React solo renderiza.             |
| **Inventario Tiempo Real** | Patrón Observer y Pub/Sub para actualizar la UI sin recargar.       |
|      **Persistencia**      | **IndexedDB** para datos críticos y LocalStorage para logs.         |
|     **Notificaciones**     | Sistema de alertas (`inventory:low`, `inventory:out`) persistentes. |
|        **No "any"**        | Tipado estricto en TypeScript.                                      |

---

## Arquitectura y Diseño

Para cumplir con la restricción de **"La lógica de negocio NO debe vivir en los componentes"**, se implementó una variante de **Clean Architecture** organizada en capas concéntricas:

### 1. Capa de Dominio (Core)

_Ubicación: `src/core/domain`_
Contiene las entidades ricas del negocio. A diferencia de interfaces planas, estas clases encapsulan reglas y validaciones.

- **`Product`**: Gestiona su propio stock y determina si está agotado o bajo mínimos.
- **`Order`**: Calcula totales y gestiona sus estados (pending, completed, cancelled).

### 2. Capa de Aplicación (Servicios)

_Ubicación: `src/core/services`_
Orquestan los casos de uso. Son agnósticos a React y a la base de datos.

- **`InventoryService`**: Centraliza la modificación de stock y emite eventos al sistema de notificaciones.
- **`OrderService`**: Maneja la transacción de compra. Si una orden se crea, descuenta el stock automáticamente. Incluye lógica de **Rollback** (deshacer compra y restaurar stock).

### 3. Capa de Infraestructura

_Ubicación: `src/infrastructure`_
Detalles técnicos concretos.

- **Repositorios**: Implementaciones que usan **IndexedDB** para guardar datos de forma permanente en el navegador.
- **NotificationService**: Mock de WebSockets implementado con un patrón Pub/Sub para simular eventos del servidor en tiempo real.

### 4. Capa de Presentación (React)

_Ubicación: `src/presentation`_

- **Inyección de Dependencias**: Se utiliza un `ServiceContext` para proveer las instancias de los servicios a los componentes, facilitando el testing y el desacoplamiento.
- **Custom Hooks**: Actúan como adaptadores (`useInventory`, `useOrder`) que conectan la UI con los servicios del Core.

---

## Estructura del Proyecto

```text
src/
├── core/                   # LÓGICA DE NEGOCIO PURA
│   ├── domain/                # Entidades (Product, Order, Client)
│   ├── services/              # Casos de uso y orquestación
│   └── Interfaces/            # Contratos (Puertos)
│
├── infrastructure/         # ADAPTADORES TÉCNICOS
│   ├── repositories/          # Persistencia (IndexedDB)
│   └── websocket/             # Mock de Notificaciones
│
├── presentation/           # VISTA (REACT)
│   ├── components/            # Componentes visuales
│   ├── context/               # Inyección de Dependencias
│   └── hooks/                 # Puentes entre UI y Lógica
│
└── main.tsx                   # Composition Root (Configuración)
```

## Instalar el proyecto

1.  **Clonar el repositorio:**

    ```bash
    git clone <https://github.com/jonathanrodriguezc16/Sistema_de_Ordenes.git>
    cd sistema-de-ordenes
    ```

2.  **Instalar dependencias:**

    ```bash
    npm i
    ```

3.  **Correr el proyecto:**
    ```bash
     npm run dev
    ```
