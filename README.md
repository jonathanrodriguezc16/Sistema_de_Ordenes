# Sistema de Órdenes (POS) - Prueba Técnica Frontend

Solución para el reto técnico de Frontend. Es una aplicación de Punto de Venta que gestiona inventario, clientes y órdenes de compra, con un enfoque principal en la arquitectura de software y separación de responsabilidades.

## 🛠 Stack Tecnológico

- **Core:** React 18 + TypeScript + Vite
- **Estilos:** TailwindCSS
- **Persistencia:** IndexedDB (Principal) con fallback a LocalStorage
- **Iconos:** Lucide React

## 🏗 Arquitectura y Decisiones de Diseño

El requerimiento principal era **sacar la lógica de negocio de los componentes**. Para lograrlo, implementé una variante de **Clean Architecture** dividida en 3 capas claras.

La idea es que React (`presentation`) solo se encargue de pintar, mientras que las reglas de negocio viven en clases de TypeScript puro (`core`).

### Estructura del proyecto

```text
src/
├── core/               # Lógica pura. No sabe que existe React.
│   ├── domain/         # Entidades (Product, Order) con sus validaciones.
│   └── services/       # Casos de uso (Gestión de stock, crear orden).
│
├── infrastructure/     # Conexión con el "mundo exterior".
│   ├── repositories/   # Implementación de IndexedDB/LocalStorage.
│   └── websocket/      # Mock del sistema de notificaciones.
│
└── presentation/       # La UI.
    ├── components/     # Componentes visuales.
    ├── hooks/          # Custom hooks que conectan la UI con los Servicios.
    └── context/        # Inyección de dependencias.
```
