# Sistema de Gestión de Órdenes (POS) - Technical Assessment

Este repositorio contiene la solución a la prueba técnica para el rol de Frontend Developer. El objetivo principal de la implementación fue diseñar una arquitectura escalable, mantenible y desacoplada, priorizando la **Clean Architecture** y la separación de responsabilidades sobre un desarrollo tradicional acoplado a la UI.

## 📋 Resumen de la Solución

El proyecto no es solo una aplicación de React; es una aplicación de software estructurada por capas donde **React es simplemente un detalle de implementación** para la capa de presentación.

### Principios de Diseño Aplicados

- **Clean Architecture:** Separación estricta entre Dominio, Infraestructura y Presentación.
- **Domain-Driven Design (DDD):** Uso de Modelos Ricos (_Rich Domain Models_) en lugar de modelos anémicos (simples interfaces JSON).
- **SOLID:** Especial énfasis en Inversión de Dependencias (D) y Responsabilidad Única (S).

---

## 🏗 Arquitectura y Estructura

El código se organiza en tres capas concéntricas. La regla de oro es que **la lógica de negocio no debe depender de la UI ni de la base de datos**.

```text
src/
├── 🟢 core/                  # CAPA DE DOMINIO Y APLICACIÓN (Agnóstico a Frameworks)
│   ├── domain/               # Entidades (Clases con lógica de negocio pura)
│   ├── services/             # Casos de Uso (Orquestadores de la lógica)
│   └── interfaces/           # Contratos (Puertos para los adaptadores)
│
├── 🟡 infrastructure/        # CAPA DE INFRAESTRUCTURA (Detalles Técnicos)
│   ├── repositories/         # Implementación técnica de persistencia (IndexedDB)
│   └── websocket/            # Mock de notificaciones (Observer Pattern)
│
├── 🔴 presentation/          # CAPA DE PRESENTACIÓN (REACT)
│   ├── components/           # UI "Tonta" (Solo renderiza props)
│   ├── hooks/                # Controladores (Conectan UI con Servicios)
│   └── context/              # Contenedor de Inyección de Dependencias (DI)
│
└── main.tsx                  # Composition Root (Configuración de DI)
```
