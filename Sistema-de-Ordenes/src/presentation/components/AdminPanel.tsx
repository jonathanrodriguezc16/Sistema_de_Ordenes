import { useState, useEffect } from 'react';
import { useServices } from '../context/ServiceContext';
import { useInventory } from '../hooks/useInventory';
import type { Client } from '../../core/domain/Client';
import {
    Package,
    Users,
    Plus,
    Search,
    DollarSign,
    Layers,
    AlertTriangle,
    Mail,
    User,
    PackagePlus,
    UserPlus
} from 'lucide-react';

export const AdminPanel = ({ onClientAdded }: { onClientAdded: () => void }) => {
    const { inventoryService, clientService } = useServices();
    const { products } = useInventory();

    const [tab, setTab] = useState<'product' | 'client'>('product');
    const [clients, setClients] = useState<Client[]>([]);

    useEffect(() => {
        fetchClients();
    }, []);

    const fetchClients = async () => {
        const data = await clientService.getAllClients();
        setClients(data);
    };

    // Estilos Base
    const inputWrapperClass = "relative";
    const inputIconClass = "absolute left-3 top-1/2 -translate-y-1/2 text-gray-400";
    const inputClass = "w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-50 outline-none transition-all duration-200 bg-white placeholder-gray-400 text-sm";
    const labelClass = "block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5 ml-1";

    // Formulario Producto
    const handleCreateProduct = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const form = e.currentTarget;
        const formData = new FormData(form);

        // 1. Extraemos y convertimos los valores
        const name = formData.get('name') as string;
        const price = Number(formData.get('price'));
        const stock = Number(formData.get('stock'));
        const minStock = Number(formData.get('minStock'));

        // 2. VALIDACIÓN DE NEGATIVOS (Capa de seguridad lógica)
        if (price < 0 || stock < 0 || minStock < 0) {
            alert("⛔ Error: No se permiten valores negativos en precio o stock.");
            return; // Detenemos la ejecución aquí
        }

        try {
            await inventoryService.createProduct(name, price, stock, minStock);
            form.reset();
            alert("✅ Producto creado exitosamente");
        } catch (error) {
            alert("Error al crear producto");
        }
    };

    // Formulario Cliente
    const handleCreateClient = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const form = e.currentTarget; // Guardamos referencia
        const formData = new FormData(form);
        try {
            await clientService.createClient(
                formData.get('name') as string,
                formData.get('email') as string
            );
            onClientAdded();
            fetchClients();
            form.reset();
            alert("✅ Cliente registrado exitosamente");
        } catch (error) {
            alert("Error al crear cliente");
        }
    };

    return (
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden mb-12 animate-in fade-in slide-in-from-bottom-4 duration-500">

            {/* --- Tabs Header --- */}
            <div className="bg-gray-50/80 backdrop-blur-md border-b border-gray-100 p-2 flex gap-2 sticky top-0 z-10">
                <button
                    onClick={() => setTab('product')}
                    className={`flex-1 py-3 px-4 rounded-xl font-bold text-sm transition-all duration-300 flex items-center justify-center gap-2 ${tab === 'product'
                        ? 'bg-white text-blue-600 shadow-md ring-1 ring-gray-100'
                        : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100/50'
                        }`}
                >
                    <Package size={18} />
                    Gestión de Productos
                </button>
                <button
                    onClick={() => setTab('client')}
                    className={`flex-1 py-3 px-4 rounded-xl font-bold text-sm transition-all duration-300 flex items-center justify-center gap-2 ${tab === 'client'
                        ? 'bg-white text-indigo-600 shadow-md ring-1 ring-gray-100'
                        : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100/50'
                        }`}
                >
                    <Users size={18} />
                    Gestión de Clientes
                </button>
            </div>

            {/* --- Contenido --- */}
            <div className="p-6 lg:p-8">

                {/* === PESTAÑA PRODUCTOS === */}
                {tab === 'product' ? (
                    <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">

                        {/* 1. Formulario de Creación */}
                        <div className="xl:col-span-1">
                            <div className="bg-blue-50/30 p-6 rounded-2xl border border-blue-100 h-fit sticky top-24">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                                        <PackagePlus size={20} />
                                    </div>
                                    <h3 className="font-bold text-gray-800 text-lg">Nuevo Producto</h3>
                                </div>

                                <form onSubmit={handleCreateProduct} className="flex flex-col gap-5">
                                    <div>
                                        <label className={labelClass}>Nombre del Producto</label>
                                        <div className={inputWrapperClass}>
                                            <Package size={16} className={inputIconClass} />
                                            <input name="name" placeholder="Ej: Monitor UltraWide" required className={inputClass} />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className={labelClass}>Precio</label>
                                            <div className={inputWrapperClass}>
                                                <DollarSign size={16} className={inputIconClass} />
                                                <input name="price" type="number" step="0.01" placeholder="0.00" min="0" required className={inputClass} />
                                            </div>
                                        </div>
                                        <div>
                                            <label className={labelClass}>Stock Inicial</label>
                                            <div className={inputWrapperClass}>
                                                <Layers size={16} className={inputIconClass} /> {/* Note: 'layers' from lucide might need correct import if it conflicts, usually it is just 'Layers' but lucide exports lowercase sometimes or Lucide icon names */}
                                                <input name="stock" type="number" placeholder="0" min="0" required className={inputClass} />
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <label className={labelClass}>Alerta de Stock Mínimo</label>
                                        <div className={inputWrapperClass}>
                                            <AlertTriangle size={16} className={inputIconClass} />
                                            <input name="minStock" type="number" placeholder="Ej: 5" min="0" required className={inputClass} />
                                        </div>
                                        <p className="text-[10px] text-gray-400 mt-1 ml-1">Se notificará cuando el stock sea menor o igual a este valor.</p>
                                    </div>

                                    <button type="submit" className="mt-2 w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-200 transition-all active:scale-[0.98] flex items-center justify-center gap-2">
                                        <Plus size={20} />
                                        Crear Producto
                                    </button>
                                </form>
                            </div>
                        </div>

                        {/* 2. Tabla de Inventario */}
                        <div className="xl:col-span-2">
                            <div className="flex justify-between items-end mb-4">
                                <div>
                                    <h3 className="font-bold text-gray-800 text-lg">Inventario Actual</h3>
                                    <p className="text-sm text-gray-500">Gestión de existencias en tiempo real</p>
                                </div>
                                <span className="text-xs font-bold bg-gray-100 text-gray-600 px-3 py-1 rounded-full border border-gray-200">
                                    {products.length} productos
                                </span>
                            </div>

                            <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
                                <div className="overflow-x-auto">
                                    <table className="min-w-full text-left">
                                        <thead className="bg-gray-50/50 border-b border-gray-200">
                                            <tr>
                                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Producto</th>
                                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Precio</th>
                                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Stock</th>
                                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-center">Estado</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                            {products.length === 0 ? (
                                                <tr>
                                                    <td colSpan={4} className="p-12 text-center text-gray-400">
                                                        <Search size={40} className="mx-auto mb-3 opacity-20" />
                                                        <p>No hay productos en el inventario</p>
                                                    </td>
                                                </tr>
                                            ) : products.map((p) => (
                                                <tr key={p.id} className="hover:bg-blue-50/30 transition-colors group">
                                                    <td className="px-6 py-4">
                                                        <div className="font-bold text-gray-900">{p.name}</div>
                                                        <div className="text-[10px] text-gray-400 font-mono flex items-center gap-1">
                                                            ID: <span className="bg-gray-100 px-1 rounded">{p.id.substring(0, 6)}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-sm font-medium text-gray-600">
                                                        ${p.price.toLocaleString()}
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className={`font-bold text-sm ${p.stock <= p.minStock ? 'text-amber-600' : 'text-gray-700'}`}>
                                                            {p.stock}
                                                        </span>
                                                        <span className="text-xs text-gray-400 ml-1">unid.</span>
                                                    </td>
                                                    <td className="px-6 py-4 text-center">
                                                        {p.stock === 0 ? (
                                                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-red-100 text-red-700 border border-red-200">
                                                                Agotado
                                                            </span>
                                                        ) : p.stock <= p.minStock ? (
                                                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-100 text-amber-700 border border-amber-200">
                                                                Stock Bajo
                                                            </span>
                                                        ) : (
                                                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-green-100 text-green-700 border border-green-200">
                                                                Disponible
                                                            </span>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (

                    /* === PESTAÑA CLIENTES === */
                    <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">

                        {/* 1. Formulario Cliente */}
                        <div className="xl:col-span-1">
                            <div className="bg-indigo-50/30 p-6 rounded-2xl border border-indigo-100 h-fit sticky top-24">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg">
                                        <UserPlus size={20} />
                                    </div>
                                    <h3 className="font-bold text-gray-800 text-lg">Nuevo Cliente</h3>
                                </div>

                                <form onSubmit={handleCreateClient} className="flex flex-col gap-5">
                                    <div>
                                        <label className={labelClass}>Nombre Completo</label>
                                        <div className={inputWrapperClass}>
                                            <User size={16} className={inputIconClass} />
                                            <input name="name" placeholder="Ej: María García" required className={inputClass} />
                                        </div>
                                    </div>
                                    <div>
                                        <label className={labelClass}>Correo Electrónico</label>
                                        <div className={inputWrapperClass}>
                                            <Mail size={16} className={inputIconClass} />
                                            <input name="email" type="email" placeholder="maria@mail.com" required className={inputClass} />
                                        </div>
                                    </div>

                                    <button type="submit" className="mt-2 w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-200 transition-all active:scale-[0.98] flex items-center justify-center gap-2">
                                        <Plus size={20} />
                                        Registrar Cliente
                                    </button>
                                </form>
                            </div>
                        </div>

                        {/* 2. Listado de Clientes */}
                        <div className="xl:col-span-2">
                            <div className="flex justify-between items-end mb-4">
                                <div>
                                    <h3 className="font-bold text-gray-800 text-lg">Cartera de Clientes</h3>
                                    <p className="text-sm text-gray-500">Base de datos de compradores</p>
                                </div>
                                <span className="text-xs font-bold bg-gray-100 text-gray-600 px-3 py-1 rounded-full border border-gray-200">
                                    {clients.length} clientes
                                </span>
                            </div>

                            <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm max-h-[600px] overflow-y-auto custom-scrollbar">
                                <table className="min-w-full text-left">
                                    <thead className="bg-gray-50/50 border-b border-gray-200 sticky top-0 z-10 backdrop-blur-sm">
                                        <tr>
                                            <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Cliente</th>
                                            <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Contacto</th>
                                            <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">ID Sistema</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {clients.length === 0 ? (
                                            <tr>
                                                <td colSpan={3} className="p-12 text-center text-gray-400">
                                                    <Users size={40} className="mx-auto mb-3 opacity-20" />
                                                    <p>No hay clientes registrados</p>
                                                </td>
                                            </tr>
                                        ) : clients.map((c) => (
                                            <tr key={c.id} className="hover:bg-indigo-50/30 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center">
                                                        <div className="h-9 w-9 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-sm mr-3 border-2 border-white shadow-sm ring-1 ring-indigo-50">
                                                            {c.name.charAt(0).toUpperCase()}
                                                        </div>
                                                        <div className="font-bold text-gray-900 text-sm">{c.name}</div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-600">
                                                    {c.email}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="font-mono text-[10px] text-gray-400 bg-gray-50 px-2 py-1 rounded border border-gray-100">
                                                        {c.id}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};