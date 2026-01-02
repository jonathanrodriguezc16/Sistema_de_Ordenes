import { useState, useEffect, useRef } from 'react';
import { useServices } from '../context/ServiceContext';
import { useInventory } from '../hooks/useInventory';
import type { Client } from '../../core/domain/Client';
import type { Product } from '../../core/domain/Product';
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
    UserPlus,
    Pencil,
    Save,
    XCircle
} from 'lucide-react';

import toast from 'react-hot-toast';

export const AdminPanel = ({ onClientAdded }: { onClientAdded: () => void }) => {
    const { inventoryService, clientService } = useServices();
    const { products } = useInventory();

    const [tab, setTab] = useState<'product' | 'client'>('product');
    const [clients, setClients] = useState<Client[]>([]);

    // Estados para la Edición
    const [editingId, setEditingId] = useState<string | null>(null);
    const formRef = useRef<HTMLFormElement>(null);

    useEffect(() => {
        fetchClients();
    }, []);

    const fetchClients = async () => {
        const data = await clientService.getAllClients();
        setClients(data);
    };

    // --- LÓGICA DE PRODUCTOS ---

    // Cargar datos en el formulario para editar
    const handleEditClick = (product: Product) => {
        setEditingId(product.id);
        if (formRef.current) {
            const form = formRef.current;
            // Rellenamos los inputs manualmente
            (form.elements.namedItem('name') as HTMLInputElement).value = product.name;
            (form.elements.namedItem('price') as HTMLInputElement).value = product.price.toString();
            (form.elements.namedItem('stock') as HTMLInputElement).value = product.stock.toString();
            (form.elements.namedItem('minStock') as HTMLInputElement).value = product.minStock.toString();
            // Ponemos el foco en el primer input
            (form.elements.namedItem('name') as HTMLInputElement).focus();
        }
    };

    const handleCancelEdit = () => {
        setEditingId(null);
        formRef.current?.reset();
    };

    // Crear o Actualizar Producto
    const handleProductSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const form = e.currentTarget;
        const formData = new FormData(e.currentTarget);

        const name = formData.get('name') as string;
        const price = Number(formData.get('price'));
        const stock = Number(formData.get('stock'));
        const minStock = Number(formData.get('minStock'));

        // Validación
        if (price < 0 || stock < 0 || minStock < 0) {
            toast.error("Error: No se permiten valores negativos.");

            return;
        }

        try {
            if (editingId) {
                // MODO EDICIÓN
                await inventoryService.updateProduct(editingId, { name, price, stock, minStock });
                toast.success(" Producto actualizado correctamente");
                setEditingId(null);
            } else {
                // MODO CREACIÓN
                await inventoryService.createProduct(name, price, stock, minStock);
                toast.success(" Producto creado exitosamente");
            }
            // Refrescamos la lista de productos
            form.reset();
        } catch (error) {


            toast.error("Error al guardar producto");

        }
    };

    // --- LÓGICA DE CLIENTES ---
    const handleCreateClient = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const form = e.currentTarget;
        const formData = new FormData(form);
        try {
            await clientService.createClient(
                formData.get('name') as string,
                formData.get('email') as string
            );
            onClientAdded();
            fetchClients();
            form.reset();
            toast.success(" Cliente registrado exitosamente");
        } catch (error) {
            toast.error("Error al crear cliente");
        }
    };

    // Estilos Base
    const inputWrapperClass = "relative";
    const inputIconClass = "absolute left-3 top-1/2 -translate-y-1/2 text-gray-400";
    const inputClass = "w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-50 outline-none transition-all duration-200 bg-white placeholder-gray-400 text-sm";
    const labelClass = "block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5 ml-1";

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

            <div className="p-6 lg:p-8">
                {/* === PESTAÑA PRODUCTOS === */}
                {tab === 'product' ? (
                    <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">

                        {/* 1. Formulario (Crear / Editar) */}
                        <div className="xl:col-span-1">
                            <div className={`p-6 rounded-2xl border h-fit sticky top-24 transition-colors duration-300 ${editingId ? 'bg-amber-50/50 border-amber-200' : 'bg-blue-50/30 border-blue-100'
                                }`}>
                                <div className="flex items-center justify-between mb-6">
                                    <div className="flex items-center gap-3">
                                        <div className={`p-2 rounded-lg ${editingId ? 'bg-amber-100 text-amber-600' : 'bg-blue-100 text-blue-600'}`}>
                                            {editingId ? <Pencil size={20} /> : <PackagePlus size={20} />}
                                        </div>
                                        <h3 className={`font-bold text-lg ${editingId ? 'text-amber-800' : 'text-gray-800'}`}>
                                            {editingId ? 'Editar Producto' : 'Nuevo Producto'}
                                        </h3>
                                    </div>
                                    {editingId && (
                                        <button
                                            onClick={handleCancelEdit}
                                            className="text-xs text-gray-500 hover:text-red-500 flex items-center gap-1 font-medium bg-white px-2 py-1 rounded border border-gray-200 shadow-sm"
                                        >
                                            <XCircle size={14} /> Cancelar
                                        </button>
                                    )}
                                </div>

                                <form ref={formRef} onSubmit={handleProductSubmit} className="flex flex-col gap-5">
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
                                                <input name="price" type="number" step="0.01" min="0" placeholder="0.00" required className={inputClass} />
                                            </div>
                                        </div>
                                        <div>
                                            <label className={labelClass}>{editingId ? 'Stock (Editar)' : 'Stock Inicial'}</label>
                                            <div className={inputWrapperClass}>
                                                <Layers size={16} className={inputIconClass} />
                                                <input name="stock" type="number" min="0" placeholder="0" required className={inputClass} />
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <label className={labelClass}>Alerta Mínimo</label>
                                        <div className={inputWrapperClass}>
                                            <AlertTriangle size={16} className={inputIconClass} />
                                            <input name="minStock" type="number" min="0" placeholder="Ej: 5" required className={inputClass} />
                                        </div>
                                    </div>

                                    <button
                                        type="submit"
                                        className={`mt-2 w-full py-3.5 text-white font-bold rounded-xl shadow-lg transition-all active:scale-[0.98] flex items-center justify-center gap-2 ${editingId
                                            ? 'bg-amber-500 hover:bg-amber-600 shadow-amber-200'
                                            : 'bg-blue-600 hover:bg-blue-700 shadow-blue-200'
                                            }`}
                                    >
                                        {editingId ? <Save size={20} /> : <Plus size={20} />}
                                        {editingId ? 'Guardar Cambios' : 'Crear Producto'}
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

                            <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm max-h-[600px] overflow-y-auto">
                                <table className="min-w-full text-left">
                                    <thead className="bg-gray-50/50 border-b border-gray-200 sticky top-0 z-10 backdrop-blur-sm">
                                        <tr>
                                            <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Producto</th>
                                            <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Precio</th>
                                            <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Stock</th>
                                            <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-center">Estado</th>
                                            <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Acción</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {products.length === 0 ? (
                                            <tr>
                                                <td colSpan={5} className="p-12 text-center text-gray-400">
                                                    <Search size={40} className="mx-auto mb-3 opacity-20" />
                                                    <p>No hay productos en el inventario</p>
                                                </td>
                                            </tr>
                                        ) : products.map((p) => (
                                            <tr key={p.id} className={`transition-colors group ${editingId === p.id ? 'bg-amber-50' : 'hover:bg-blue-50/30'}`}>
                                                <td className="px-6 py-4">
                                                    <div className="font-bold text-gray-900">{p.name}</div>
                                                    <div className="text-[10px] text-gray-400 font-mono">ID: {p.id.substring(0, 6)}</div>
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
                                                <td className="px-6 py-4 text-right">
                                                    <button
                                                        onClick={() => handleEditClick(p)}
                                                        className="text-gray-400 hover:text-blue-600 hover:bg-blue-50 p-2 rounded-lg transition-all"
                                                        title="Editar producto"
                                                    >
                                                        <Pencil size={16} />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
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