import { useState, useEffect } from 'react'
import { Plus, Edit, Trash2, Search, Building, MapPin, Phone, Mail } from 'lucide-react'
import { supabase, type Cliente } from '../lib/supabase'
import toast from 'react-hot-toast'

const initialFormData = {
  ruc: '',
  razon_social: '',
  nombre_fantasia: '',
  direccion: '',
  telefono: '',
  email: '',
  ciudad: '',
  tipo_contribuyente: 'iva' as const
}

export default function Clientes() {
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState(initialFormData)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    fetchClientes()
  }, [])

  const fetchClientes = async () => {
    try {
      const { data, error } = await supabase
        .from('clientes')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setClientes(data || [])
    } catch (error) {
      console.error('Error al cargar clientes:', error)
      toast.error('Error al cargar clientes')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      if (editingId) {
        const { error } = await supabase
          .from('clientes')
          .update({ ...formData, updated_at: new Date().toISOString() })
          .eq('id', editingId)

        if (error) throw error
        toast.success('Cliente actualizado exitosamente')
      } else {
        const { error } = await supabase
          .from('clientes')
          .insert([formData])

        if (error) throw error
        toast.success('Cliente creado exitosamente')
      }

      setShowForm(false)
      setEditingId(null)
      setFormData(initialFormData)
      fetchClientes()
    } catch (error) {
      console.error('Error al guardar cliente:', error)
      toast.error('Error al guardar cliente')
    }
  }

  const handleEdit = (cliente: Cliente) => {
    setFormData({
      ruc: cliente.ruc,
      razon_social: cliente.razon_social,
      nombre_fantasia: cliente.nombre_fantasia,
      direccion: cliente.direccion,
      telefono: cliente.telefono,
      email: cliente.email,
      ciudad: cliente.ciudad,
      tipo_contribuyente: cliente.tipo_contribuyente
    })
    setEditingId(cliente.id)
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('¿Está seguro de que desea eliminar este cliente?')) return

    try {
      const { error } = await supabase
        .from('clientes')
        .delete()
        .eq('id', id)

      if (error) throw error
      toast.success('Cliente eliminado exitosamente')
      fetchClientes()
    } catch (error) {
      console.error('Error al eliminar cliente:', error)
      toast.error('Error al eliminar cliente')
    }
  }

  const handleCancel = () => {
    setShowForm(false)
    setEditingId(null)
    setFormData(initialFormData)
  }

  const filteredClientes = clientes.filter(cliente =>
    cliente.razon_social.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cliente.nombre_fantasia.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cliente.ruc.includes(searchTerm) ||
    cliente.ciudad.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
      </div>
    )
  }

  return (
    <div className="space-y-xl">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900">Clientes</h1>
          <p className="text-neutral-600 mt-2">Gestión de clientes y contactos comerciales</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="btn-primary flex items-center"
        >
          <Plus className="h-4 w-4 mr-2" />
          Nuevo Cliente
        </button>
      </div>

      {/* Filtros y búsqueda */}
      <div className="card">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-400" />
              <input
                type="text"
                placeholder="Buscar por RUC, razón social o ciudad..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-field pl-10"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Formulario */}
      {showForm && (
        <div className="card">
          <h2 className="text-xl font-semibold text-neutral-900 mb-4">
            {editingId ? 'Editar Cliente' : 'Nuevo Cliente'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  RUC *
                </label>
                <input
                  type="text"
                  required
                  value={formData.ruc}
                  onChange={(e) => setFormData({ ...formData, ruc: e.target.value })}
                  className="input-field"
                  placeholder="80123456-7"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Razón Social *
                </label>
                <input
                  type="text"
                  required
                  value={formData.razon_social}
                  onChange={(e) => setFormData({ ...formData, razon_social: e.target.value })}
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Nombre de Fantasía
                </label>
                <input
                  type="text"
                  value={formData.nombre_fantasia}
                  onChange={(e) => setFormData({ ...formData, nombre_fantasia: e.target.value })}
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Email *
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Teléfono *
                </label>
                <input
                  type="tel"
                  required
                  value={formData.telefono}
                  onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Ciudad *
                </label>
                <select
                  required
                  value={formData.ciudad}
                  onChange={(e) => setFormData({ ...formData, ciudad: e.target.value })}
                  className="input-field"
                >
                  <option value="">Seleccionar ciudad</option>
                  <option value="Asunción">Asunción</option>
                  <option value="Ciudad del Este">Ciudad del Este</option>
                  <option value="San Lorenzo">San Lorenzo</option>
                  <option value="Luque">Luque</option>
                  <option value="Capiatá">Capiatá</option>
                  <option value="Lambaré">Lambaré</option>
                  <option value="Fernando de la Mora">Fernando de la Mora</option>
                  <option value="Limpio">Limpio</option>
                  <option value="Ñemby">Ñemby</option>
                  <option value="Encarnación">Encarnación</option>
                  <option value="Pedro Juan Caballero">Pedro Juan Caballero</option>
                  <option value="Coronel Oviedo">Coronel Oviedo</option>
                  <option value="Caacupé">Caacupé</option>
                  <option value="Villarrica">Villarrica</option>
                  <option value="Concepción">Concepción</option>
                  <option value="Pilar">Pilar</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Tipo de Contribuyente *
                </label>
                <select
                  required
                  value={formData.tipo_contribuyente}
                  onChange={(e) => setFormData({ ...formData, tipo_contribuyente: e.target.value as any })}
                  className="input-field"
                >
                  <option value="iva">IVA (Responsable Inscripto)</option>
                  <option value="exento">Exento</option>
                  <option value="no_habitual">No Habitual</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Dirección *
              </label>
              <textarea
                required
                value={formData.direccion}
                onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
                className="input-field"
                rows={2}
              />
            </div>
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={handleCancel}
                className="btn-secondary"
              >
                Cancelar
              </button>
              <button type="submit" className="btn-primary">
                {editingId ? 'Actualizar' : 'Crear'} Cliente
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tabla de clientes */}
      <div className="card">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-neutral-200">
                <th className="table-header">RUC</th>
                <th className="table-header">Razón Social</th>
                <th className="table-header">Ciudad</th>
                <th className="table-header">Contacto</th>
                <th className="table-header">Tipo</th>
                <th className="table-header">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredClientes.map((cliente) => (
                <tr key={cliente.id} className="border-b border-neutral-100">
                  <td className="table-cell font-mono font-medium">
                    {cliente.ruc}
                  </td>
                  <td className="table-cell">
                    <div>
                      <div className="font-medium">{cliente.razon_social}</div>
                      {cliente.nombre_fantasia && (
                        <div className="text-sm text-neutral-500">{cliente.nombre_fantasia}</div>
                      )}
                    </div>
                  </td>
                  <td className="table-cell">
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 text-neutral-400 mr-1" />
                      {cliente.ciudad}
                    </div>
                  </td>
                  <td className="table-cell">
                    <div className="space-y-1">
                      <div className="flex items-center">
                        <Phone className="h-3 w-3 text-neutral-400 mr-1" />
                        <span className="text-sm">{cliente.telefono}</span>
                      </div>
                      <div className="flex items-center">
                        <Mail className="h-3 w-3 text-neutral-400 mr-1" />
                        <span className="text-sm">{cliente.email}</span>
                      </div>
                    </div>
                  </td>
                  <td className="table-cell">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      cliente.tipo_contribuyente === 'iva' ? 'bg-success/10 text-success' :
                      cliente.tipo_contribuyente === 'exento' ? 'bg-warning/10 text-warning' :
                      'bg-primary-100 text-primary-700'
                    }`}>
                      {cliente.tipo_contribuyente === 'iva' ? 'IVA' :
                       cliente.tipo_contribuyente === 'exento' ? 'Exento' : 'No Habitual'}
                    </span>
                  </td>
                  <td className="table-cell">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEdit(cliente)}
                        className="p-1 text-neutral-400 hover:text-primary-500 transition-colors"
                        title="Editar"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(cliente.id)}
                        className="p-1 text-neutral-400 hover:text-error transition-colors"
                        title="Eliminar"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredClientes.length === 0 && (
          <div className="text-center py-8 text-neutral-500">
            {searchTerm ? 'No se encontraron clientes' : 'No hay clientes registrados'}
          </div>
        )}
      </div>
    </div>
  )
}