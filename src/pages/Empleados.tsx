import { useState, useEffect } from 'react'
import { Plus, Edit, Trash2, Search, Filter } from 'lucide-react'
import { supabase, type Empleado } from '../lib/supabase'
import toast from 'react-hot-toast'

const initialFormData = {
  cedula: '',
  nombres: '',
  apellidos: '',
  email: '',
  telefono: '',
  direccion: '',
  fecha_nacimiento: '',
  fecha_ingreso: '',
  cargo: '',
  salario: '',
  estado_civil: '',
  tipo_contrato: 'indefinido' as const,
  numero_ips: ''
}

export default function Empleados() {
  const [empleados, setEmpleados] = useState<Empleado[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState(initialFormData)
  const [searchTerm, setSearchTerm] = useState('')

  // Cargar empleados al inicializar
  useEffect(() => {
    fetchEmpleados()
  }, [])

  const fetchEmpleados = async () => {
    try {
      const { data, error } = await supabase
        .from('empleados')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setEmpleados(data || [])
    } catch (error) {
      console.error('Error al cargar empleados:', error)
      toast.error('Error al cargar empleados')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const empleadoData = {
        ...formData,
        salario: parseFloat(formData.salario)
      }

      if (editingId) {
        // Actualizar empleado existente
        const { error } = await supabase
          .from('empleados')
          .update({ ...empleadoData, updated_at: new Date().toISOString() })
          .eq('id', editingId)

        if (error) throw error
        toast.success('Empleado actualizado exitosamente')
      } else {
        // Crear nuevo empleado
        const { error } = await supabase
          .from('empleados')
          .insert([empleadoData])

        if (error) throw error
        toast.success('Empleado creado exitosamente')
      }

      setShowForm(false)
      setEditingId(null)
      setFormData(initialFormData)
      fetchEmpleados()
    } catch (error) {
      console.error('Error al guardar empleado:', error)
      toast.error('Error al guardar empleado')
    }
  }

  const handleEdit = (empleado: Empleado) => {
    setFormData({
      cedula: empleado.cedula,
      nombres: empleado.nombres,
      apellidos: empleado.apellidos,
      email: empleado.email,
      telefono: empleado.telefono,
      direccion: empleado.direccion,
      fecha_nacimiento: empleado.fecha_nacimiento,
      fecha_ingreso: empleado.fecha_ingreso,
      cargo: empleado.cargo,
      salario: empleado.salario.toString(),
      estado_civil: empleado.estado_civil,
      tipo_contrato: empleado.tipo_contrato,
      numero_ips: empleado.numero_ips
    })
    setEditingId(empleado.id)
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('¿Está seguro de que desea eliminar este empleado?')) return

    try {
      const { error } = await supabase
        .from('empleados')
        .delete()
        .eq('id', id)

      if (error) throw error
      toast.success('Empleado eliminado exitosamente')
      fetchEmpleados()
    } catch (error) {
      console.error('Error al eliminar empleado:', error)
      toast.error('Error al eliminar empleado')
    }
  }

  const handleCancel = () => {
    setShowForm(false)
    setEditingId(null)
    setFormData(initialFormData)
  }

  const filteredEmpleados = empleados.filter(empleado =>
    empleado.nombres.toLowerCase().includes(searchTerm.toLowerCase()) ||
    empleado.apellidos.toLowerCase().includes(searchTerm.toLowerCase()) ||
    empleado.cedula.includes(searchTerm) ||
    empleado.cargo.toLowerCase().includes(searchTerm.toLowerCase())
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
          <h1 className="text-3xl font-bold text-neutral-900">Empleados</h1>
          <p className="text-neutral-600 mt-2">Gestión del recurso humano</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="btn-primary flex items-center"
        >
          <Plus className="h-4 w-4 mr-2" />
          Nuevo Empleado
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
                placeholder="Buscar por nombre, cédula o cargo..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-field pl-10"
              />
            </div>
          </div>
          <button className="btn-secondary flex items-center">
            <Filter className="h-4 w-4 mr-2" />
            Filtros
          </button>
        </div>
      </div>

      {/* Formulario */}
      {showForm && (
        <div className="card">
          <h2 className="text-xl font-semibold text-neutral-900 mb-4">
            {editingId ? 'Editar Empleado' : 'Nuevo Empleado'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Cédula *
                </label>
                <input
                  type="text"
                  required
                  value={formData.cedula}
                  onChange={(e) => setFormData({ ...formData, cedula: e.target.value })}
                  className="input-field"
                  placeholder="1.234.567"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Nombres *
                </label>
                <input
                  type="text"
                  required
                  value={formData.nombres}
                  onChange={(e) => setFormData({ ...formData, nombres: e.target.value })}
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Apellidos *
                </label>
                <input
                  type="text"
                  required
                  value={formData.apellidos}
                  onChange={(e) => setFormData({ ...formData, apellidos: e.target.value })}
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
                  Cargo *
                </label>
                <select
                  required
                  value={formData.cargo}
                  onChange={(e) => setFormData({ ...formData, cargo: e.target.value })}
                  className="input-field"
                >
                  <option value="">Seleccionar cargo</option>
                  <option value="Arquitecto">Arquitecto</option>
                  <option value="Ingeniero Civil">Ingeniero Civil</option>
                  <option value="M maestro de obra">Maestro de obra</option>
                  <option value="Albañil">Albañil</option>
                  <option value="Pintor">Pintor</option>
                  <option value="Soldador">Soldador</option>
                  <option value="Electricista">Electricista</option>
                  <option value="Plomero">Plomero</option>
                  <option value="Administrativo">Administrativo</option>
                  <option value="Contador">Contador</option>
                  <option value="Supervisor">Supervisor</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Salario (₲) *
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  step="1000"
                  value={formData.salario}
                  onChange={(e) => setFormData({ ...formData, salario: e.target.value })}
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Fecha de Nacimiento *
                </label>
                <input
                  type="date"
                  required
                  value={formData.fecha_nacimiento}
                  onChange={(e) => setFormData({ ...formData, fecha_nacimiento: e.target.value })}
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Fecha de Ingreso *
                </label>
                <input
                  type="date"
                  required
                  value={formData.fecha_ingreso}
                  onChange={(e) => setFormData({ ...formData, fecha_ingreso: e.target.value })}
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Estado Civil *
                </label>
                <select
                  required
                  value={formData.estado_civil}
                  onChange={(e) => setFormData({ ...formData, estado_civil: e.target.value })}
                  className="input-field"
                >
                  <option value="">Seleccionar</option>
                  <option value="Soltero">Soltero</option>
                  <option value="Casado">Casado</option>
                  <option value="Divorciado">Divorciado</option>
                  <option value="Viudo">Viudo</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Tipo de Contrato *
                </label>
                <select
                  required
                  value={formData.tipo_contrato}
                  onChange={(e) => setFormData({ ...formData, tipo_contrato: e.target.value as any })}
                  className="input-field"
                >
                  <option value="indefinido">Indefinido</option>
                  <option value="temporal">Temporal</option>
                  <option value="obra_determinada">Obra Determinada</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Número IPS *
                </label>
                <input
                  type="text"
                  required
                  value={formData.numero_ips}
                  onChange={(e) => setFormData({ ...formData, numero_ips: e.target.value })}
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
                {editingId ? 'Actualizar' : 'Crear'} Empleado
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tabla de empleados */}
      <div className="card">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-neutral-200">
                <th className="table-header">Cédula</th>
                <th className="table-header">Nombre Completo</th>
                <th className="table-header">Cargo</th>
                <th className="table-header">Salario</th>
                <th className="table-header">Fecha Ingreso</th>
                <th className="table-header">Contrato</th>
                <th className="table-header">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredEmpleados.map((empleado) => (
                <tr key={empleado.id} className="border-b border-neutral-100">
                  <td className="table-cell font-mono">{empleado.cedula}</td>
                  <td className="table-cell">
                    <div>
                      <div className="font-medium">{empleado.nombres} {empleado.apellidos}</div>
                      <div className="text-sm text-neutral-500">{empleado.email}</div>
                    </div>
                  </td>
                  <td className="table-cell">{empleado.cargo}</td>
                  <td className="table-cell font-medium">
                    ₲{empleado.salario.toLocaleString('es-PY')}
                  </td>
                  <td className="table-cell">
                    {new Date(empleado.fecha_ingreso).toLocaleDateString('es-PY')}
                  </td>
                  <td className="table-cell">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      empleado.tipo_contrato === 'indefinido' ? 'bg-success/10 text-success' :
                      empleado.tipo_contrato === 'temporal' ? 'bg-warning/10 text-warning' :
                      'bg-primary-100 text-primary-700'
                    }`}>
                      {empleado.tipo_contrato.replace('_', ' ').toUpperCase()}
                    </span>
                  </td>
                  <td className="table-cell">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEdit(empleado)}
                        className="p-1 text-neutral-400 hover:text-primary-500 transition-colors"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(empleado.id)}
                        className="p-1 text-neutral-400 hover:text-error transition-colors"
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
        {filteredEmpleados.length === 0 && (
          <div className="text-center py-8 text-neutral-500">
            {searchTerm ? 'No se encontraron empleados' : 'No hay empleados registrados'}
          </div>
        )}
      </div>
    </div>
  )
}