import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Calendar, User, Building2, DollarSign } from 'lucide-react';
import { supabase, createOrden, updateOrden, deleteOrden, fetchOrdenes } from '../lib/supabase';

interface Orden {
  id: number;
  numero_orden: string;
  tipo: 'trabajo' | 'servicio';
  cliente_id: number;
  obra_id: number;
  descripcion: string;
  fecha_inicio: string;
  fecha_fin: string;
  estado: 'pendiente' | 'en_proceso' | 'completada' | 'cancelada';
  responsable_id: number;
  prioridad: 'baja' | 'media' | 'alta' | 'urgente';
  monto_estimado: number;
  observaciones?: string;
  created_at: string;
  updated_at: string;
  clientes?: {
    nombre: string;
    email: string;
  };
  obras?: {
    nombre: string;
    ubicacion: string;
  };
  empleados?: {
    nombre: string;
    cargo: string;
  };
}

interface FormData {
  numero_orden: string;
  tipo: 'trabajo' | 'servicio';
  cliente_id: string;
  obra_id: string;
  descripcion: string;
  fecha_inicio: string;
  fecha_fin: string;
  estado: 'pendiente' | 'en_proceso' | 'completada' | 'cancelada';
  responsable_id: string;
  prioridad: 'baja' | 'media' | 'alta' | 'urgente';
  monto_estimado: string;
  observaciones: string;
}

const OrdenesTrabajo: React.FC = () => {
  const [ordenes, setOrdenes] = useState<Orden[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingOrden, setEditingOrden] = useState<Orden | null>(null);
  const [formData, setFormData] = useState<FormData>({
    numero_orden: '',
    tipo: 'trabajo',
    cliente_id: '',
    obra_id: '',
    descripcion: '',
    fecha_inicio: '',
    fecha_fin: '',
    estado: 'pendiente',
    responsable_id: '',
    prioridad: 'media',
    monto_estimado: '',
    observaciones: ''
  });
  const [clientes, setClientes] = useState<{id: number, nombre: string}[]>([]);
  const [obras, setObras] = useState<{id: number, nombre: string}[]>([]);
  const [empleados, setEmpleados] = useState<{id: number, nombre: string}[]>([]);

  useEffect(() => {
    loadOrdenes();
    loadOptions();
  }, []);

  const loadOrdenes = async () => {
    try {
      setLoading(true);
      const data = await fetchOrdenes();
      setOrdenes(data || []);
    } catch (error) {
      console.error('Error cargando órdenes:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadOptions = async () => {
    try {
      const [clientesData, obrasData, empleadosData] = await Promise.all([
        supabase.from('clientes').select('id, nombre').order('nombre'),
        supabase.from('obras').select('id, nombre').order('nombre'),
        supabase.from('empleados').select('id, nombre').order('nombre')
      ]);

      if (clientesData.data) setClientes(clientesData.data);
      if (obrasData.data) setObras(obrasData.data);
      if (empleadosData.data) setEmpleados(empleadosData.data);
    } catch (error) {
      console.error('Error cargando opciones:', error);
    }
  };

  const generateOrdenNumber = () => {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `OT-${year}${month}-${random}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const ordenData = {
        numero_orden: formData.numero_orden || generateOrdenNumber(),
        tipo: formData.tipo,
        cliente_id: parseInt(formData.cliente_id),
        obra_id: parseInt(formData.obra_id),
        descripcion: formData.descripcion,
        fecha_inicio: formData.fecha_inicio,
        fecha_fin: formData.fecha_fin,
        estado: formData.estado,
        responsable_id: parseInt(formData.responsable_id),
        prioridad: formData.prioridad,
        monto_estimado: parseFloat(formData.monto_estimado),
        observaciones: formData.observaciones || null
      };

      if (editingOrden) {
        await updateOrden(editingOrden.id, ordenData);
      } else {
        await createOrden(ordenData);
      }

      setModalOpen(false);
      setEditingOrden(null);
      resetForm();
      loadOrdenes();
    } catch (error) {
      console.error('Error guardando orden:', error);
      alert('Error al guardar la orden. Verifique los datos e intente nuevamente.');
    }
  };

  const handleEdit = (orden: Orden) => {
    setEditingOrden(orden);
    setFormData({
      numero_orden: orden.numero_orden,
      tipo: orden.tipo,
      cliente_id: orden.cliente_id.toString(),
      obra_id: orden.obra_id.toString(),
      descripcion: orden.descripcion,
      fecha_inicio: orden.fecha_inicio.split('T')[0],
      fecha_fin: orden.fecha_fin.split('T')[0],
      estado: orden.estado,
      responsable_id: orden.responsable_id.toString(),
      prioridad: orden.prioridad,
      monto_estimado: orden.monto_estimado.toString(),
      observaciones: orden.observaciones || ''
    });
    setModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm('¿Está seguro de que desea eliminar esta orden?')) {
      try {
        await deleteOrden(id);
        loadOrdenes();
      } catch (error) {
        console.error('Error eliminando orden:', error);
        alert('Error al eliminar la orden.');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      numero_orden: '',
      tipo: 'trabajo',
      cliente_id: '',
      obra_id: '',
      descripcion: '',
      fecha_inicio: '',
      fecha_fin: '',
      estado: 'pendiente',
      responsable_id: '',
      prioridad: 'media',
      monto_estimado: '',
      observaciones: ''
    });
  };

  const getStatusColor = (estado: string) => {
    switch (estado) {
      case 'pendiente': return 'bg-yellow-100 text-yellow-800';
      case 'en_proceso': return 'bg-blue-100 text-blue-800';
      case 'completada': return 'bg-green-100 text-green-800';
      case 'cancelada': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (prioridad: string) => {
    switch (prioridad) {
      case 'baja': return 'bg-gray-100 text-gray-800';
      case 'media': return 'bg-blue-100 text-blue-800';
      case 'alta': return 'bg-orange-100 text-orange-800';
      case 'urgente': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-PY', {
      style: 'currency',
      currency: 'PYG',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Órdenes de Trabajo y Servicio</h1>
          <p className="mt-1 text-sm text-gray-600">
            Gestión de órdenes de trabajo y servicios para proyectos
          </p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setFormData(prev => ({ ...prev, numero_orden: generateOrdenNumber() }));
            setEditingOrden(null);
            setModalOpen(true);
          }}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
        >
          <Plus className="h-4 w-4 mr-2" />
          Nueva Orden
        </button>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
            Órdenes Activas ({ordenes.length})
          </h3>
          
          {ordenes.length === 0 ? (
            <div className="text-center py-12">
              <Building2 className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No hay órdenes registradas</h3>
              <p className="mt-1 text-sm text-gray-500">
                Comience creando su primera orden de trabajo o servicio.
              </p>
              <div className="mt-6">
                <button
                  onClick={() => {
                    resetForm();
                    setFormData(prev => ({ ...prev, numero_orden: generateOrdenNumber() }));
                    setEditingOrden(null);
                    setModalOpen(true);
                  }}
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Nueva Orden
                </button>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Orden
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tipo
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Cliente / Obra
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Fechas
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Estado
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Prioridad
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Monto
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {ordenes.map((orden) => (
                    <tr key={orden.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{orden.numero_orden}</div>
                          <div className="text-sm text-gray-500 truncate max-w-xs">{orden.descripcion}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          orden.tipo === 'trabajo' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
                        }`}>
                          {orden.tipo === 'trabajo' ? 'Trabajo' : 'Servicio'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {orden.clientes?.nombre || 'Cliente no encontrado'}
                          </div>
                          <div className="text-sm text-gray-500">
                            {orden.obras?.nombre || 'Obra no encontrada'}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div>
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 text-gray-400 mr-1" />
                            {new Date(orden.fecha_inicio).toLocaleDateString('es-PY')} - {new Date(orden.fecha_fin).toLocaleDateString('es-PY')}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(orden.estado)}`}>
                          {orden.estado === 'pendiente' ? 'Pendiente' :
                           orden.estado === 'en_proceso' ? 'En Proceso' :
                           orden.estado === 'completada' ? 'Completada' : 'Cancelada'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(orden.prioridad)}`}>
                          {orden.prioridad.charAt(0).toUpperCase() + orden.prioridad.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                        {formatCurrency(orden.monto_estimado)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                        <button
                          onClick={() => handleEdit(orden)}
                          className="text-primary-600 hover:text-primary-900"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(orden.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-2xl shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {editingOrden ? 'Editar Orden' : 'Nueva Orden de Trabajo/Servicio'}
              </h3>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Número de Orden</label>
                    <input
                      type="text"
                      value={formData.numero_orden}
                      onChange={(e) => setFormData({...formData, numero_orden: e.target.value})}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                      placeholder="Auto-generado si se deja vacío"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Tipo de Orden *</label>
                    <select
                      value={formData.tipo}
                      onChange={(e) => setFormData({...formData, tipo: e.target.value as 'trabajo' | 'servicio'})}
                      required
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                    >
                      <option value="trabajo">Trabajo</option>
                      <option value="servicio">Servicio</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Cliente *</label>
                    <select
                      value={formData.cliente_id}
                      onChange={(e) => setFormData({...formData, cliente_id: e.target.value})}
                      required
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                    >
                      <option value="">Seleccionar cliente</option>
                      {clientes.map(cliente => (
                        <option key={cliente.id} value={cliente.id}>{cliente.nombre}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Obra *</label>
                    <select
                      value={formData.obra_id}
                      onChange={(e) => setFormData({...formData, obra_id: e.target.value})}
                      required
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                    >
                      <option value="">Seleccionar obra</option>
                      {obras.map(obra => (
                        <option key={obra.id} value={obra.id}>{obra.nombre}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Fecha de Inicio *</label>
                    <input
                      type="date"
                      value={formData.fecha_inicio}
                      onChange={(e) => setFormData({...formData, fecha_inicio: e.target.value})}
                      required
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Fecha de Fin *</label>
                    <input
                      type="date"
                      value={formData.fecha_fin}
                      onChange={(e) => setFormData({...formData, fecha_fin: e.target.value})}
                      required
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Estado *</label>
                    <select
                      value={formData.estado}
                      onChange={(e) => setFormData({...formData, estado: e.target.value as 'pendiente' | 'en_proceso' | 'completada' | 'cancelada'})}
                      required
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                    >
                      <option value="pendiente">Pendiente</option>
                      <option value="en_proceso">En Proceso</option>
                      <option value="completada">Completada</option>
                      <option value="cancelada">Cancelada</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Responsable *</label>
                    <select
                      value={formData.responsable_id}
                      onChange={(e) => setFormData({...formData, responsable_id: e.target.value})}
                      required
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                    >
                      <option value="">Seleccionar responsable</option>
                      {empleados.map(empleado => (
                        <option key={empleado.id} value={empleado.id}>{empleado.nombre}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Prioridad *</label>
                    <select
                      value={formData.prioridad}
                      onChange={(e) => setFormData({...formData, prioridad: e.target.value as 'baja' | 'media' | 'alta' | 'urgente'})}
                      required
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                    >
                      <option value="baja">Baja</option>
                      <option value="media">Media</option>
                      <option value="alta">Alta</option>
                      <option value="urgente">Urgente</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Monto Estimado (Guaraníes) *</label>
                    <input
                      type="number"
                      value={formData.monto_estimado}
                      onChange={(e) => setFormData({...formData, monto_estimado: e.target.value})}
                      required
                      min="0"
                      step="0.01"
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                      placeholder="0"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Descripción *</label>
                  <textarea
                    value={formData.descripcion}
                    onChange={(e) => setFormData({...formData, descripcion: e.target.value})}
                    required
                    rows={3}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                    placeholder="Descripción detallada del trabajo o servicio..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Observaciones</label>
                  <textarea
                    value={formData.observaciones}
                    onChange={(e) => setFormData({...formData, observaciones: e.target.value})}
                    rows={2}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                    placeholder="Observaciones adicionales (opcional)..."
                  />
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setModalOpen(false);
                      setEditingOrden(null);
                      resetForm();
                    }}
                    className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="bg-primary-600 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                  >
                    {editingOrden ? 'Actualizar' : 'Crear'} Orden
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrdenesTrabajo;