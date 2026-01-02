// 1. Definimos los tipos de eventos
export type NotificationEvent = "inventory:low" | "inventory:out";
const STORAGE_KEY = "notifications_log";

/**
 * Estructura completa de una notificación en el sistema.
 * Contiene metadatos generados automáticamente por el servicio (ID, timestamp, estado).
 */
export interface NotificationPayload {
  id: string;
  type: NotificationEvent;
  message: string;
  productId: string;
  timestamp: Date;
  read: boolean;
}

type Listener = (payload: NotificationPayload) => void;

/**
 * Servicio de infraestructura que simula un cliente de WebSockets.
 * Gestiona la emisión de eventos en tiempo real y la persistencia local del historial de notificaciones.
 * Implementa un patrón Pub/Sub simple.
 */
export class NotificationService {
  private listeners: Map<NotificationEvent, Listener[]> = new Map();

  /**
   * Persiste una nueva notificación en el historial local (LocalStorage).
   * @param notification Objeto de notificación completo.
   */
  private saveToStorage(notification: NotificationPayload) {
    const current = this.getHistory();
    // Agregamos al inicio para que las más recientes salgan primero
    current.unshift(notification);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(current));
  }

  /**
   * Actualiza el estado de una notificación a 'leída'.
   * @param id Identificador único de la notificación.
   */
  markAsRead(id: string): void {
    const current = this.getHistory();
    const updated = current.map((n) =>
      n.id === id ? { ...n, read: true } : n
    );
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  }

  /**
   * Recupera el historial completo de notificaciones almacenadas.
   * Rehidrata las fechas (strings) a objetos Date reales.
   * @returns Lista de notificaciones ordenadas por inserción.
   */
  getHistory(): NotificationPayload[] {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return [];

    try {
      const parsed = JSON.parse(data);
      return parsed.map((n: any) => ({
        ...n,
        timestamp: new Date(n.timestamp),
      }));
    } catch (error) {
      console.error("Error al leer historial de notificaciones", error);
      return [];
    }
  }

  /**
   * Suscribe un callback a un evento específico.
   * @param event Tipo de evento a escuchar ('inventory:low' | 'inventory:out').
   * @param callback Función que se ejecutará cuando ocurra el evento.
   */
  on(event: NotificationEvent, callback: Listener): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)?.push(callback);
  }

  /**
   * Elimina una suscripción existente.
   * @param event Tipo de evento.
   * @param callback La misma función que se usó para suscribirse.
   */
  off(event: NotificationEvent, callback: Listener): void {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      this.listeners.set(
        event,
        eventListeners.filter((cb) => cb !== callback)
      );
    }
  }

  /**
   * Emite un evento a todos los suscriptores y lo guarda en el historial.
   * Se encarga de enriquecer el payload básico con ID, Timestamp y Tipo.
   * @param event Tipo de evento a emitir.
   * @param payload Datos básicos del evento (mensaje y producto asociado).
   */
  emit(
    event: NotificationEvent,
    payload: { message: string; productId: string }
  ): void {
    const fullPayload: NotificationPayload = {
      id: crypto.randomUUID(),
      type: event,
      message: payload.message,
      productId: payload.productId,
      timestamp: new Date(),
      read: false,
    };

    this.saveToStorage(fullPayload);

    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      eventListeners.forEach((callback) => callback(fullPayload));
    }
  }
}
