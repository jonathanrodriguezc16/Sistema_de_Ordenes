import { useEffect, useState } from "react";
import { useServices } from "../context/ServiceContext";
import {
  Bell,
  X,
  Check,
  AlertTriangle,
  AlertCircle,
  BellOff,
} from "lucide-react";
import type { NotificationPayload } from "../../infrastructure/websocket/NotificationService";

/**
 * Componente flotante que gestiona el centro de notificaciones.
 * Se suscribe a los eventos de inventario en tiempo real y permite marcar alertas como leídas.
 */
export const NotificationPanel = () => {
  const { notificationService } = useServices();
  const [notifications, setNotifications] = useState<NotificationPayload[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  /**
   * Carga el historial inicial desde el almacenamiento local.
   */
  const loadNotifications = () => {
    const history = notificationService.getHistory();
    setNotifications(history);
    setUnreadCount(history.filter((n) => !n.read).length);
  };

  useEffect(() => {
    loadNotifications();

    // Handler para nuevas notificaciones en tiempo real
    const handleNewNotification = (payload: NotificationPayload) => {
      setNotifications((prev) => [payload, ...prev]);
      setUnreadCount((prev) => prev + 1);
    };

    // Suscripción a eventos del sistema
    notificationService.on("inventory:low", handleNewNotification);
    notificationService.on("inventory:out", handleNewNotification);

    // Limpieza de suscripciones al desmontar
    return () => {
      notificationService.off("inventory:low", handleNewNotification);
      notificationService.off("inventory:out", handleNewNotification);
    };
  }, [notificationService]);

  const handleMarkRead = (id: string) => {
    notificationService.markAsRead(id);
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));
  };

  const handleMarkAllRead = () => {
    notifications.forEach((n) => {
      if (!n.read) notificationService.markAsRead(n.id);
    });
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnreadCount(0);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-4">
      {/* Panel Desplegable */}
      {isOpen && (
        <div className="bg-white w-80 sm:w-96 max-h-[500px] rounded-2xl shadow-2xl border border-gray-100 overflow-hidden flex flex-col animate-in slide-in-from-bottom-5 duration-200">
          <div className="bg-gray-50/80 backdrop-blur-sm p-4 border-b border-gray-100 flex justify-between items-center sticky top-0 z-10">
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-gray-800">Notificaciones</h3>
              {unreadCount > 0 && (
                <span className="bg-blue-100 text-blue-700 text-[10px] font-bold px-2 py-0.5 rounded-full">
                  {unreadCount} nuevas
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="text-xs font-medium text-blue-600 hover:text-blue-800 hover:underline transition-all"
              >
                Marcar todo leído
              </button>
            )}
          </div>

          <div className="overflow-y-auto flex-1 p-0 scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent">
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
                <div className="bg-gray-50 p-4 rounded-full mb-3">
                  <BellOff className="text-gray-300" size={32} />
                </div>
                <p className="text-gray-500 font-medium">Estás al día</p>
                <p className="text-xs text-gray-400 mt-1">
                  No hay notificaciones pendientes
                </p>
              </div>
            ) : (
              <ul className="divide-y divide-gray-50">
                {notifications.map((note) => {
                  const isOut = note.type === "inventory:out";

                  return (
                    <li
                      key={note.id}
                      onClick={() => !note.read && handleMarkRead(note.id)}
                      className={`relative p-4 transition-all duration-200 cursor-pointer group ${
                        note.read
                          ? "bg-white hover:bg-gray-50"
                          : "bg-blue-50/40 hover:bg-blue-50"
                      }`}
                    >
                      {/* Indicador de No Leído */}
                      {!note.read && (
                        <span className="absolute left-2 top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-blue-500 rounded-full shadow-sm" />
                      )}

                      <div className="flex gap-3 items-start pl-2">
                        <div
                          className={`mt-0.5 p-2 rounded-lg shrink-0 ${
                            isOut
                              ? "bg-red-100 text-red-600"
                              : "bg-amber-100 text-amber-600"
                          }`}
                        >
                          {isOut ? (
                            <AlertCircle size={18} />
                          ) : (
                            <AlertTriangle size={18} />
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <p
                            className={`text-sm leading-snug ${
                              note.read
                                ? "text-gray-600 font-medium"
                                : "text-gray-900 font-bold"
                            }`}
                          >
                            {note.message}
                          </p>
                          <p className="text-[11px] text-gray-400 mt-1.5 flex items-center gap-1">
                            {new Date(note.timestamp).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                            <span>•</span>
                            {new Date(note.timestamp).toLocaleDateString()}
                          </p>
                        </div>

                        {!note.read && (
                          <button
                            className="text-gray-300 hover:text-blue-600 hover:bg-blue-100 p-1 rounded-full transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                            title="Marcar como leído"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleMarkRead(note.id);
                            }}
                          >
                            <Check size={16} />
                          </button>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
      )}

      {/* Botón Flotante  */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        title={isOpen ? "Cerrar notificaciones" : "Abrir notificaciones"}
        className={`relative p-4 rounded-2xl shadow-xl shadow-blue-900/20 transition-all duration-300 transform hover:scale-105 active:scale-95 flex items-center justify-center border ${
          isOpen
            ? "bg-white text-gray-600 border-gray-200 rotate-90"
            : "bg-blue-600 text-white border-transparent rotate-0 hover:bg-blue-700"
        }`}
      >
        {isOpen ? <X size={24} /> : <Bell size={24} />}

        {!isOpen && unreadCount > 0 && (
          <span className="absolute -top-2 -right-2 flex h-6 w-6">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-6 w-6 bg-red-500 border-2 border-white text-white text-[10px] font-bold items-center justify-center">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          </span>
        )}
      </button>
    </div>
  );
};
