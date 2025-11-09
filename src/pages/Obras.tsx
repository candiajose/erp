import { useState, useEffect } from 'react'
import { Plus, Edit, Trash2, Search, Building, MapPin, Calendar, User, TrendingUp } from 'lucide-react'
import { supabase, type Obra } from '../lib/supabase'
import toast from 'react-hot-toast'

const initialFormData = {
  codigo_obra: '',
  nombre: '',
  cliente_id: '',
  direccion: '',
  ciudad: '',
  fecha_inicio: '',
  fecha_fin_estimada: '',
  fecha_fin_real: '',
  presupuesto_total: '',
  avance_porcentaje: '',
  arquitecto_responsable: ''
}

export default function Obras() {
  const [obras, setObras] = useState<Obra[]>([])
  const [clientes, setClientes] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState(initialFormData)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    fetchObras()
    fetchClientes()
  }, [])

  const fetchObras = async () => {
    try {
      const { data, error } = await supabase
        .from('obras')
        .select(`
          *,
          cliente:clientes(razon_social, nombre_fantasia)
        `)
        .order('created_at', { ascending: false })

      if (error) throw error
      setObras(data || [])
    } catch (error) {
      console.error('Error al cargar obras:', error)
      toast.error('Error al cargar obras')
    } finally {
      setLoading(false)
    }
  }

  const fetchClientes = async () => {
    try {
      const { data, error } = await supabase
        .from('clientes')
        .select('*')
        .order('razon_social')

      if (error) throw error
      setClientes(data || [])
    } catch (error) {
      console.error('Error al cargar clientes:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const obraData = {
        ...formData,
        presupuesto_total: parseFloat(formData.presupuesto_total),
        avance_porcentaje: parseFloat(formData.avance_porcentaje),
        fecha_fin_real: formData.fecha_fin_real || null
      }

      if (editingId) {
        const { error } = await supabase
          .from('obras')
          .update({ ...obraData, updated_at: new Date().toISOString() })
          .eq('id', editingId)

        if (error) throw error
        toast.success('Obra actualizada exitosamente')
      } else {
        const { error } = await supabase
          .from('obras')
          .insert([obraData])

        if (error) throw error
        toast.success('Obra creada exitosamente')
      }

      setShowForm(false)
      setEditingId(null)
      setFormData(initialFormData)
      fetchObras()
    } catch (error) {
      console.error('Error al guardar obra:', error)
      toast.error('Error al guardar obra')
    }
  }

  const handleEdit = (obra: Obra) => {
    setFormData({
      codigo_obra: obra.codigo_obra,
      nombre: obra.nombre,
      cliente_id: obra.cliente_id,
      direccion: obra.direccion,
      ciudad: obra.ciudad,
      fecha_inicio: obra.fecha_inicio,
      fecha_fin_estimada: obra.fecha_fin_estimada,
      fecha_fin_real: obra.fecha_fin_real || '',
      presupuesto_total: obra.presupuesto_total.toString(),
      avance_porcentaje: obra.avance_porcentaje.toString(),
      arquitecto_responsable: obra.arquitecto_responsable
    })
    setEditingId(obra.id)
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('¿Está seguro de que desea eliminar esta obra?')) return

    try {
      const { error } = await supabase
        .from('obras')
        .delete()
        .eq('id', id)

      if (error) throw error
      toast.success('Obra eliminada exitosamente')
      fetchObras()
    } catch (error) {
      console.error('Error al eliminar obra:', error)
      toast.error('Error al eliminar obra')
    }
  }

  const getStatusColor = (estado: string) => {
    switch (estado) {
      case 'planificacion':
        return 'bg-primary-100 text-primary-700'
      case 'en_ejecucion':
        return 'bg-warning/10 text-warning'
      case 'pausada':
        return 'bg-error/10 text-error'
      case 'finalizada':
        return 'bg-success/10 text-success'
      case 'cancelada':
        return 'bg-neutral-100 text-neutral-600'
      default:
        return 'bg-neutral-100 text-neutral-700'
    }
  }

  const getStatusText = (estado: string) => {
    switch (estado) {
      case 'planificacion':
        return 'Planificación'
      case 'en_ejecucion':
        return 'En Ejecución'
      case 'pausada':
        return 'Pausada'
      case 'finalizada':
        return 'Finalizada'
      case 'cancelada':
        return 'Cancelada'
      default:
        return estado
    }
  }

  const handleCancel = () => {
    setShowForm(false)
    setEditingId(null)
    setFormData(initialFormData)
  }

  const filteredObras = obras.filter(obra =>
    obra.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    obra.codigo_obra.toLowerCase().includes(searchTerm.toLowerCase()) ||
    obra.ciudad.toLowerCase().includes(searchTerm.toLowerCase()) ||
    obra.arquitecto_responsable.toLowerCase().includes(searchTerm.toLowerCase()) ||
    obra.cliente?.razon_social?.toLowerCase().includes(searchTerm.toLowerCase())
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
          <h1 className="text-3xl font-bold text-neutral-900">Obras</h1>
          <p className="text-neutral-600 mt-2">Gestión de proyectos y obras de construcción</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="btn-primary flex items-center"
        >
          <Plus className="h-4 w-4 mr-2" />
          Nueva Obra
        </button>
      </div>

      {/* Estadísticas rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-lg">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-neutral-600">Total Obras</p>
              <p className="text-2xl font-bold text-neutral-900">{obras.length}</p>
            </div>
            <Building className="h-8 w-8 text-primary-500" />
          </div>
        </div>
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-neutral-600">En Ejecución</p>
              <p className="text-2xl font-bold text-neutral-900">
                {obras.filter(o => o.estado === 'en_ejecucion').length}
              </p>
            </div>
            <TrendingUp className="h-8 w-8 text-warning" />
          </div>
        </div>
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-neutral-600">Finalizadas</p>
              <p className="text-2xl font-bold text-neutral-900">
                {obras.filter(o => o.estado === 'finalizada').length}
              </p>
            </div>
            <Calendar className="h-8 w-8 text-success" />
          </div>
        </div>
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-neutral-600">Presupuesto Total</p>
              <p className="text-xl font-bold text-neutral-900">
                ₲{obras.reduce((sum, obra) => sum + obra.presupuesto_total, 0).toLocaleString('es-PY')}
              </p>
            </div>
            <User className="h-8 w-8 text-primary-500" />
          </div>
        </div>
      </div>

      {/* Filtros y búsqueda */}
      <div className="card">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-400" />
              <input
                type="text"
                placeholder="Buscar por nombre, código, cliente o arquitecto..."
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
            {editingId ? 'Editar Obra' : 'Nueva Obra'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Código de Obra *
                </label>
                <input
                  type="text"
                  required
                  value={formData.codigo_obra}
                  onChange={(e) => setFormData({ ...formData, codigo_obra: e.target.value })}
                  className="input-field"
                  placeholder="OBR-2024-001"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Nombre de la Obra *
                </label>
                <input
                  type="text"
                  required
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Cliente *
                </label>
                <select
                  required
                  value={formData.cliente_id}
                  onChange={(e) => setFormData({ ...formData, cliente_id: e.target.value })}
                  className="input-field"
                >
                  <option value="">Seleccionar cliente</option>
                  {clientes.map((cliente) => (
                    <option key={cliente.id} value={cliente.id}>
                      {cliente.razon_social}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Arquitecto Responsable *
                </label>
                <input
                  type="text"
                  required
                  value={formData.arquitecto_responsable}
                  onChange={(e) => setFormData({ ...formData, arquitecto_responsable: e.target.value })}
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
                  Presupuesto Total (₲) *
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  step="100000"
                  value={formData.presupuesto_total}
                  onChange={(e) => setFormData({ ...formData, presupuesto_total: e.target.value })}
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Fecha de Inicio *
                </label>
                <input
                  type="date"
                  required
                  value={formData.fecha_inicio}
                  onChange={(e) => setFormData({ ...formData, fecha_inicio: e.target.value })}
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Fecha Fin Estimada *
                </label>
                <input
                  type="date"
                  required
                  value={formData.fecha_fin_estimada}
                  onChange={(e) => setFormData({ ...formData, fecha_fin_estimada: e.target.value })}
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Avance (%)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="1"
                  value={formData.avance_porcentaje}
                  onChange={(e) => setFormData({ ...formData, avance_porcentaje: e.target.value })}
                  className="input-field"
                />
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
                {editingId ? 'Actualizar' : 'Crear'} Obra
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tabla de obras */}
      <div className="card">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-neutral-200">
                <th className="table-header">Código</th>
                <th className="table-header">Obra</th>
                <th className="table-header">Cliente</th>
                <th className="table-header">Ubicación</th>
                <th className="table-header">Presupuesto</th>
                <th className="table-header">Avance</th>
                <th className="table-header">Estado</th>
                <th className="table-header">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredObras.map((obra) => (
                <tr key={obra.id} className="border-b border-neutral-100">
                  <td className="table-cell font-mono font-medium">
                    {obra.codigo_obra}
                  </td>
                  <td className="table-cell">
                    <div>
                      <div className="font-medium">{obra.nombre}</div>
                      <div className="text-sm text-neutral-500 flex items-center">
                        <User className="h-3 w-3 mr-1" />
                        {obra.arquitecto_responsable}
                      </div>
                    </div>
                  </td>
                  <td className="table-cell">
                    {obra.cliente?.razon_social || 'N/A'}
                  </td>
                  <td className="table-cell">
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 text-neutral-400 mr-1" />
                      {obra.ciudad}
                    </div>
                  </td>
                  <td className="table-cell font-mono font-medium">
                    ₲{obra.presupuesto_total.toLocaleString('es-PY')}
                  </td>
                  <td className="table-cell">
                    <div className="flex items-center">
                      <div className="w-16 bg-neutral-200 rounded-full h-2 mr-2">
                        <div 
                          className="bg-primary-500 h-2 rounded-full"
                          style={{ width: `${obra.avance_porcentaje}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium">{obra.avance_porcentaje}%</span>
                    </div>
                  </td>
                  <td className="table-cell">
                    <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(obra.estado)}`}>
                      {getStatusText(obra.estado)}
                    </span>
                  </td>
                  <td className="table-cell">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEdit(obra)}
                        className="p-1 text-neutral-400 hover:text-primary-500 transition-colors"
                        title="Editar"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(obra.id)}
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
        {filteredObras.length === 0 && (
          <div className="text-center py-8 text-neutral-500">
            {searchTerm ? 'No se encontraron obras' : 'No hay obras registradas'}
          </div>
        )}
      </div>
    </div>
  )
}