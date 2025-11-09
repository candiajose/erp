import { useState, useEffect } from 'react'
import { Plus, Edit, Trash2, Search, Building2, MapPin, Mail, Phone } from 'lucide-react'
import { supabase, type Proveedor } from '../lib/supabase'
import toast from 'react-hot-toast'

const initialFormData = {
  ruc: '',
  razon_social: '',
  direccion: '',
  telefono: '',
  email: '',
  ciudad: '',
  categoria: ''
}

export default function Proveedores() {
  const [proveedores, setProveedores] = useState<Proveedor[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState(initialFormData)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    fetchProveedores()
  }, [])

  const fetchProveedores = async () => {
    try {
      const { data, error } = await supabase
        .from('proveedores')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setProveedores(data || [])
    } catch (error) {
      console.error('Error al cargar proveedores:', error)
      toast.error('Error al cargar proveedores')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      if (editingId) {
        const { error } = await supabase
          .from('proveedores')
          .update({ ...formData, updated_at: new Date().toISOString() })
          .eq('id', editingId)

        if (error) throw error
        toast.success('Proveedor actualizado exitosamente')
      } else {
        const { error } = await supabase
          .from('proveedores')
          .insert([formData])

        if (error) throw error
        toast.success('Proveedor creado exitosamente')
      }

      setShowForm(false)
      setEditingId(null)
      setFormData(initialFormData)
      fetchProveedores()
    } catch (error) {
      console.error('Error al guardar proveedor:', error)
      toast.error('Error al guardar proveedor')
    }
  }

  const handleEdit = (proveedor: Proveedor) => {
    setFormData({
      ruc: proveedor.ruc,
      razon_social: proveedor.razon_social,
      direccion: proveedor.direccion,
      telefono: proveedor.telefono,
      email: proveedor.email,
      ciudad: proveedor.ciudad,
      categoria: proveedor.categoria
    })
    setEditingId(proveedor.id)
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('¿Está seguro de que desea eliminar este proveedor?')) return

    try {
      const { error } = await supabase
        .from('proveedores')
        .delete()
        .eq('id', id)

      if (error) throw error
      toast.success('Proveedor eliminado exitosamente')
      fetchProveedores()
    } catch (error) {
      console.error('Error al eliminar proveedor:', error)
      toast.error('Error al eliminar proveedor')
    }
  }

  const handleCancel = () => {
    setShowForm(false)
    setEditingId(null)
    setFormData(initialFormData)
  }

  const filteredProveedores = proveedores.filter(proveedor =>
    proveedor.razon_social.toLowerCase().includes(searchTerm.toLowerCase()) ||
    proveedor.ruc.includes(searchTerm) ||
    proveedor.ciudad.toLowerCase().includes(searchTerm.toLowerCase()) ||
    proveedor.categoria.toLowerCase().includes(searchTerm.toLowerCase())
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
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900">Proveedores</h1>
          <p className="text-neutral-600 mt-2">Gestión de proveedores y contratistas</p>
        </div>
        <button onClick={() => setShowForm(true)} className="btn-primary flex items-center">
          <Plus className="h-4 w-4 mr-2" /> Nuevo Proveedor
        </button>
      </div>

      <div className="card">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-400" />
          <input
            type="text"
            placeholder="Buscar por RUC, razón social, ciudad o categoría..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-field pl-10"
          />
        </div>
      </div>

      {showForm && (
        <div className="card">
          <h2 className="text-xl font-semibold text-neutral-900 mb-4">
            {editingId ? 'Editar Proveedor' : 'Nuevo Proveedor'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">RUC *</label>
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
                <label className="block text-sm font-medium text-neutral-700 mb-1">Razón Social *</label>
                <input
                  type="text"
                  required
                  value={formData.razon_social}
                  onChange={(e) => setFormData({ ...formData, razon_social: e.target.value })}
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Categoría *</label>
                <select
                  required
                  value={formData.categoria}
                  onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
                  className="input-field"
                >
                  <option value="">Seleccionar categoría</option>
                  <option value="Materiales de Construcción">Materiales de Construcción</option>
                  <option value="Herramientas y Equipos">Herramientas y Equipos</option>
                  <option value="Servicios Profesionales">Servicios Profesionales</option>
                  <option value="Transporte y Logística">Transporte y Logística</option>
                  <option value="Mantenimiento">Mantenimiento</option>
                  <option value="Seguros">Seguros</option>
                  <option value="Otros">Otros</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Email *</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Teléfono *</label>
                <input
                  type="tel"
                  required
                  value={formData.telefono}
                  onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Ciudad *</label>
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
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">Dirección *</label>
              <textarea
                required
                value={formData.direccion}
                onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
                className="input-field"
                rows={2}
              />
            </div>
            <div className="flex justify-end space-x-3">
              <button type="button" onClick={handleCancel} className="btn-secondary">Cancelar</button>
              <button type="submit" className="btn-primary">
                {editingId ? 'Actualizar' : 'Crear'} Proveedor
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="card">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-neutral-200">
                <th className="table-header">RUC</th>
                <th className="table-header">Razón Social</th>
                <th className="table-header">Categoría</th>
                <th className="table-header">Ciudad</th>
                <th className="table-header">Contacto</th>
                <th className="table-header">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredProveedores.map((proveedor) => (
                <tr key={proveedor.id} className="border-b border-neutral-100">
                  <td className="table-cell font-mono font-medium">{proveedor.ruc}</td>
                  <td className="table-cell">
                    <div className="font-medium">{proveedor.razon_social}</div>
                  </td>
                  <td className="table-cell">
                    <span className="px-2 py-1 text-xs rounded-full bg-primary-100 text-primary-700">
                      {proveedor.categoria}
                    </span>
                  </td>
                  <td className="table-cell">
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 text-neutral-400 mr-1" />
                      {proveedor.ciudad}
                    </div>
                  </td>
                  <td className="table-cell">
                    <div className="space-y-1">
                      <div className="flex items-center">
                        <Phone className="h-3 w-3 text-neutral-400 mr-1" />
                        <span className="text-sm">{proveedor.telefono}</span>
                      </div>
                      <div className="flex items-center">
                        <Mail className="h-3 w-3 text-neutral-400 mr-1" />
                        <span className="text-sm">{proveedor.email}</span>
                      </div>
                    </div>
                  </td>
                  <td className="table-cell">
                    <div className="flex space-x-2">
                      <button onClick={() => handleEdit(proveedor)} className="p-1 text-neutral-400 hover:text-primary-500 transition-colors">
                        <Edit className="h-4 w-4" />
                      </button>
                      <button onClick={() => handleDelete(proveedor.id)} className="p-1 text-neutral-400 hover:text-error transition-colors">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredProveedores.length === 0 && (
          <div className="text-center py-8 text-neutral-500">
            {searchTerm ? 'No se encontraron proveedores' : 'No hay proveedores registrados'}
          </div>
        )}
      </div>
    </div>
  )
}