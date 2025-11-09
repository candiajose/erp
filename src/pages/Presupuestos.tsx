import { useState, useEffect } from 'react'
import { Plus, Edit, Trash2, Search, Calculator, FileText, CheckCircle, XCircle, Clock } from 'lucide-react'
import { supabase, type Presupuesto } from '../lib/supabase'
import toast from 'react-hot-toast'

const initialFormData = {
  numero_presupuesto: '',
  fecha: '',
  cliente_id: '',
  obra_id: '',
  validez_dias: '30',
  subtotal: '',
  iva_10: '',
  observaciones: ''
}

export default function Presupuestos() {
  const [presupuestos, setPresupuestos] = useState<Presupuesto[]>([])
  const [clientes, setClientes] = useState<any[]>([])
  const [obras, setObras] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState(initialFormData)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    fetchPresupuestos()
    fetchClientes()
    fetchObras()
  }, [])

  useEffect(() => {
    const subtotal = parseFloat(formData.subtotal) || 0
    const iva = subtotal * 0.10
    setFormData(prev => ({ ...prev, iva_10: iva.toFixed(0) }))
  }, [formData.subtotal])

  const fetchPresupuestos = async () => {
    try {
      const { data, error } = await supabase
        .from('presupuestos')
        .select(`
          *,
          cliente:clientes(razon_social),
          obra:obras(nombre)
        `)
        .order('created_at', { ascending: false })

      if (error) throw error
      setPresupuestos(data || [])
    } catch (error) {
      console.error('Error al cargar presupuestos:', error)
      toast.error('Error al cargar presupuestos')
    } finally {
      setLoading(false)
    }
  }

  const fetchClientes = async () => {
    try {
      const { data } = await supabase.from('clientes').select('*').order('razon_social')
      setClientes(data || [])
    } catch (error) {
      console.error('Error:', error)
    }
  }

  const fetchObras = async () => {
    try {
      const { data } = await supabase.from('obras').select('*').order('nombre')
      setObras(data || [])
    } catch (error) {
      console.error('Error:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const subtotal = parseFloat(formData.subtotal)
      const iva_10 = parseFloat(formData.iva_10)
      const total = subtotal + iva_10

      const data = {
        ...formData,
        subtotal,
        iva_10,
        total,
        validez_dias: parseInt(formData.validez_dias)
      }

      if (editingId) {
        const { error } = await supabase.from('presupuestos').update({ ...data, updated_at: new Date().toISOString() }).eq('id', editingId)
        if (error) throw error
        toast.success('Presupuesto actualizado')
      } else {
        const { error } = await supabase.from('presupuestos').insert([data])
        if (error) throw error
        toast.success('Presupuesto creado')
      }

      setShowForm(false)
      setEditingId(null)
      setFormData(initialFormData)
      fetchPresupuestos()
    } catch (error) {
      console.error('Error:', error)
      toast.error('Error al guardar')
    }
  }

  const handleEdit = (presupuesto: any) => {
    setFormData({
      numero_presupuesto: presupuesto.numero_presupuesto,
      fecha: presupuesto.fecha,
      cliente_id: presupuesto.cliente_id,
      obra_id: presupuesto.obra_id,
      validez_dias: presupuesto.validez_dias.toString(),
      subtotal: presupuesto.subtotal.toString(),
      iva_10: presupuesto.iva_10.toString(),
      observaciones: presupuesto.observaciones
    })
    setEditingId(presupuesto.id)
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar presupuesto?')) return
    try {
      const { error } = await supabase.from('presupuestos').delete().eq('id', id)
      if (error) throw error
      toast.success('Presupuesto eliminado')
      fetchPresupuestos()
    } catch (error) {
      console.error('Error:', error)
      toast.error('Error al eliminar')
    }
  }

  const getStatusInfo = (estado: string) => {
    const statusMap = {
      borrador: { color: 'bg-neutral-100 text-neutral-700', icon: FileText },
      enviado: { color: 'bg-primary-100 text-primary-700', icon: Clock },
      aprobado: { color: 'bg-success/10 text-success', icon: CheckCircle },
      rechazado: { color: 'bg-error/10 text-error', icon: XCircle },
      vencido: { color: 'bg-warning/10 text-warning', icon: XCircle }
    }
    return statusMap[estado as keyof typeof statusMap] || statusMap.borrador
  }

  const filteredPresupuestos = presupuestos.filter(p =>
    p.numero_presupuesto.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.cliente?.razon_social?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div></div>

  return (
    <div className="space-y-xl">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900">Presupuestos</h1>
          <p className="text-neutral-600 mt-2">Gestión de presupuestos de obras y servicios</p>
        </div>
        <button onClick={() => setShowForm(true)} className="btn-primary flex items-center">
          <Plus className="h-4 w-4 mr-2" /> Nuevo Presupuesto
        </button>
      </div>

      <div className="card">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-400" />
          <input
            type="text"
            placeholder="Buscar por número o cliente..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-field pl-10"
          />
        </div>
      </div>

      {showForm && (
        <div className="card">
          <h2 className="text-xl font-semibold text-neutral-900 mb-4">
            {editingId ? 'Editar Presupuesto' : 'Nuevo Presupuesto'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Número *</label>
                <input
                  type="text"
                  required
                  value={formData.numero_presupuesto}
                  onChange={(e) => setFormData({ ...formData, numero_presupuesto: e.target.value })}
                  className="input-field"
                  placeholder="PR-2024-001"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Fecha *</label>
                <input
                  type="date"
                  required
                  value={formData.fecha}
                  onChange={(e) => setFormData({ ...formData, fecha: e.target.value })}
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Validez (días) *</label>
                <input
                  type="number"
                  required
                  min="1"
                  max="365"
                  value={formData.validez_dias}
                  onChange={(e) => setFormData({ ...formData, validez_dias: e.target.value })}
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Cliente *</label>
                <select
                  required
                  value={formData.cliente_id}
                  onChange={(e) => setFormData({ ...formData, cliente_id: e.target.value })}
                  className="input-field"
                >
                  <option value="">Seleccionar cliente</option>
                  {clientes.map(cliente => (
                    <option key={cliente.id} value={cliente.id}>{cliente.razon_social}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Obra</label>
                <select
                  value={formData.obra_id}
                  onChange={(e) => setFormData({ ...formData, obra_id: e.target.value })}
                  className="input-field"
                >
                  <option value="">Seleccionar obra</option>
                  {obras.map(obra => (
                    <option key={obra.id} value={obra.id}>{obra.nombre}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Subtotal (₲) *</label>
                <input
                  type="number"
                  required
                  min="0"
                  step="1000"
                  value={formData.subtotal}
                  onChange={(e) => setFormData({ ...formData, subtotal: e.target.value })}
                  className="input-field"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">Observaciones</label>
              <textarea
                value={formData.observaciones}
                onChange={(e) => setFormData({ ...formData, observaciones: e.target.value })}
                className="input-field"
                rows={2}
              />
            </div>
            <div className="flex justify-end space-x-3">
              <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">Cancelar</button>
              <button type="submit" className="btn-primary">
                {editingId ? 'Actualizar' : 'Crear'} Presupuesto
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
                <th className="table-header">Número</th>
                <th className="table-header">Fecha</th>
                <th className="table-header">Cliente</th>
                <th className="table-header">Total</th>
                <th className="table-header">Estado</th>
                <th className="table-header">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredPresupuestos.map((presupuesto) => {
                const statusInfo = getStatusInfo(presupuesto.estado)
                const StatusIcon = statusInfo.icon
                return (
                  <tr key={presupuesto.id} className="border-b border-neutral-100">
                    <td className="table-cell font-mono">{presupuesto.numero_presupuesto}</td>
                    <td className="table-cell">
                      {new Date(presupuesto.fecha).toLocaleDateString('es-PY')}
                    </td>
                    <td className="table-cell">{presupuesto.cliente?.razon_social}</td>
                    <td className="table-cell font-mono font-semibold">
                      ₲{presupuesto.total.toLocaleString('es-PY')}
                    </td>
                    <td className="table-cell">
                      <span className={`inline-flex items-center px-2 py-1 text-xs rounded-full ${statusInfo.color}`}>
                        <StatusIcon className="h-3 w-3 mr-1" />
                        {presupuesto.estado.toUpperCase()}
                      </span>
                    </td>
                    <td className="table-cell">
                      <div className="flex space-x-2">
                        <button onClick={() => handleEdit(presupuesto)} className="p-1 text-neutral-400 hover:text-primary-500">
                          <Edit className="h-4 w-4" />
                        </button>
                        <button onClick={() => handleDelete(presupuesto.id)} className="p-1 text-neutral-400 hover:text-error">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}