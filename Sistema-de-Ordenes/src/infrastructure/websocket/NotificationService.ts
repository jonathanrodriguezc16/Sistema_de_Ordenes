// src/infrastructure/websocket/NotificationService.ts

// 1. Definimos los tipos de eventos
export type NotificationEvent = 'inventory:low' | 'inventory:out';
const STORAGE_KEY = 'notifications_log';

// 2. Interfaz ACTUALIZADA (esto soluciona tu error de tipos)
export interface NotificationPayload {
    id: string;          // <--- Faltaba esto
    type: NotificationEvent; // <--- Faltaba esto (para el icono)
    message: string;
    productId: string;
    timestamp: Date;
    read: boolean;       // <--- Faltaba esto
}

type Listener = (payload: NotificationPayload) => void;

export class NotificationService {
    private listeners: Map<NotificationEvent, Listener[]> = new Map();

    private saveToStorage(notification: NotificationPayload) {
        const current = this.getHistory();
        current.unshift(notification);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(current));
    }

    // Método nuevo para marcar como leído
    markAsRead(id: string) {
        const current = this.getHistory();
        const updated = current.map(n => n.id === id ? { ...n, read: true } : n);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    }

    getHistory(): NotificationPayload[] {
        const data = localStorage.getItem(STORAGE_KEY);
        if (!data) return [];
        return JSON.parse(data).map((n: any) => ({
            ...n,
            timestamp: new Date(n.timestamp)
        }));
    }

    on(event: NotificationEvent, callback: Listener): void {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, []);
        }
        this.listeners.get(event)?.push(callback);
    }

    off(event: NotificationEvent, callback: Listener): void {
        const eventListeners = this.listeners.get(event);
        if (eventListeners) {
            this.listeners.set(event, eventListeners.filter(cb => cb !== callback));
        }
    }

    // Método emit INTELIGENTE:
    // Recibe solo lo básico y él se encarga de generar ID, Fecha y Tipo
    emit(event: NotificationEvent, payload: { message: string; productId: string }): void {

        const fullPayload: NotificationPayload = {
            id: crypto.randomUUID(), // Genera ID único
            type: event,             // Guarda el tipo de evento
            message: payload.message,
            productId: payload.productId,
            timestamp: new Date(),   // Genera fecha actual
            read: false              // Por defecto no leído
        };

        this.saveToStorage(fullPayload);

        const eventListeners = this.listeners.get(event);
        if (eventListeners) {
            eventListeners.forEach(callback => callback(fullPayload));
        }
    }
}