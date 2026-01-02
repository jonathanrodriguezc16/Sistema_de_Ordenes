export const DB_NAME = "SistemaOrdenesDB";
export const DB_VERSION = 1;

/**
 * Inicializa y abre la conexión con la base de datos IndexedDB.
 * Gestiona la creación del esquema (Object Stores) si la base de datos no existe o cambia de versión.
 * @returns Promesa que resuelve con la instancia de la base de datos abierta.
 */
export const initDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      if (!db.objectStoreNames.contains("products")) {
        db.createObjectStore("products", { keyPath: "id" });
      }
      if (!db.objectStoreNames.contains("orders")) {
        db.createObjectStore("orders", { keyPath: "id" });
      }
      if (!db.objectStoreNames.contains("clients")) {
        db.createObjectStore("clients", { keyPath: "id" });
      }
    };
  });
};
