import { useOrderHistory } from "../hooks/useOrderHistory";
import {
  RefreshCcw,
  RotateCcw,
  CheckCircle2,
  XCircle,
  FileClock,
  SearchX,
  Clock,
} from "lucide-react";

/**
 * Componente que visualiza el registro histórico de transacciones.
 * Permite al administrador auditar las ventas y ejecutar acciones de reversión (Rollback).
 */
export const OrderHistory = () => {
  const { orders, loading, cancelOrder, refresh } = useOrderHistory();

  // Estado de carga inicial o sincronización
  if (loading && orders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-gray-400 bg-white rounded-2xl shadow-sm border border-gray-100">
        <RefreshCcw className="animate-spin mb-3 text-blue-500" size={32} />
        <p className="text-sm font-medium animate-pulse">
          Sincronizando historial...
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden mb-8 animate-in fade-in duration-500">
      {/* Encabezado y Controles */}
      <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-center bg-gray-50/50 gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-blue-100 text-blue-600 rounded-xl shadow-sm">
            <FileClock size={24} strokeWidth={2} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-800">
              Historial de Órdenes
            </h2>
            <p className="text-xs text-gray-500 font-medium">
              {orders.length}{" "}
              {orders.length === 1
                ? "registro encontrado"
                : "registros encontrados"}
            </p>
          </div>
        </div>

        <button
          onClick={refresh}
          className="group flex items-center gap-2 px-4 py-2 text-sm font-bold text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 transition-all shadow-sm active:scale-95"
          title="Recargar datos manualmente"
        >
          <RefreshCcw
            size={16}
            className="group-hover:rotate-180 transition-transform duration-500"
          />
          <span>Actualizar</span>
        </button>
      </div>

      {/* Tabla de Datos */}
      <div className="overflow-x-auto">
        {orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-20 text-gray-400">
            <div className="bg-gray-50 p-6 rounded-full mb-4">
              <SearchX size={48} className="text-gray-300" />
            </div>
            <p className="text-lg font-medium text-gray-600">
              No hay órdenes registradas aún
            </p>
            <p className="text-sm text-gray-400">
              Las nuevas ventas aparecerán aquí
            </p>
          </div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-xs uppercase text-gray-500 font-bold tracking-wider">
                <th className="px-6 py-4">ID Transacción</th>
                <th className="px-6 py-4">Fecha y Hora</th>
                <th className="px-6 py-4">Monto Total</th>
                <th className="px-6 py-4 text-center">Estado</th>
                <th className="px-6 py-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {orders.map((order) => (
                <tr
                  key={order.id}
                  className={`
                    hover:bg-blue-50/30 transition-colors group
                    ${
                      order.status === "cancelled"
                        ? "bg-gray-50/50 grayscale-[0.5]"
                        : "bg-white"
                    }
                  `}
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-gray-500 bg-gray-100 px-2 py-1 rounded border border-gray-200 select-all">
                        {order.id.slice(0, 8)}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-700">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </div>
                    <div className="text-xs text-gray-400">
                      {new Date(order.createdAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`text-sm font-bold ${
                        order.status === "cancelled"
                          ? "text-gray-400 line-through"
                          : "text-gray-900"
                      }`}
                    >
                      ${order.total.toLocaleString()}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <StatusBadge status={order.status} />
                  </td>
                  <td className="px-6 py-4 text-right">
                    {order.status === "completed" && (
                      <button
                        onClick={() => cancelOrder(order.id)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-red-600 bg-white border border-red-100 hover:bg-red-50 hover:border-red-200 rounded-lg transition-all shadow-sm hover:shadow active:scale-95"
                        title="Cancelar orden y reponer inventario"
                      >
                        <RotateCcw size={14} />
                        Rollback
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

/**
 * Sub-componente para renderizar la etiqueta de estado de la orden.
 * Utiliza un mapa de configuración para facilitar la escalabilidad de nuevos estados.
 */
const StatusBadge = ({ status }: { status: string }) => {
  const config = {
    completed: {
      styles: "bg-green-100 text-green-700 border-green-200",
      icon: <CheckCircle2 size={12} strokeWidth={3} />,
      label: "Completada",
    },
    pending: {
      styles: "bg-amber-100 text-amber-700 border-amber-200",
      icon: <Clock size={12} strokeWidth={3} />,
      label: "Pendiente",
    },
    cancelled: {
      styles: "bg-red-100 text-red-700 border-red-200",
      icon: <XCircle size={12} strokeWidth={3} />,
      label: "Cancelada",
    },
  };

  const current = config[status as keyof typeof config] || config.pending;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] uppercase tracking-wide font-bold border ${current.styles}`}
    >
      {current.icon}
      {current.label}
    </span>
  );
};
