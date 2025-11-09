import { useState, useEffect } from 'react'
import { Plus, Edit, Trash2, Search, FileText, AlertCircle, CheckCircle, Clock, XCircle } from 'lucide-react'
import { supabase, type Factura } from '../lib/supabase'
import toast from 'react-hot-toast'

const initialFormData = {
  numero_factura: '',
  fecha_emision: '',
  fecha_vencimiento: '',
  cliente_id: '',
  obra_id: '',
  subtotal: '',
  iva_10: '',
  rci_30: '',
  observaciones: ''
}

export default function Facturas() {
  const [facturas, setFacturas] = useState<Factura[]>([])
  const [clientes, setClientes] = useState<any[]>([])
  const [obras, setObras] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState(initialFormData)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    fetchFacturas()
    fetchClientes()
    fetchObras()
  }, [])

  // Calcular IVA y RCI automáticamente cuando cambie el subtotal
  useEffect(() => {
    const subtotal = parseFloat(formData.subtotal) || 0
    const iva = subtotal * 0.10 // IVA 10% Paraguay
    const rci = subtotal * 0.30 // RCI 30% Paraguay
    setFormData(prev => ({
      ...prev,
      iva_10: iva.toFixed(0)
    }))
  }, [formData.subtotal])

  const fetchFacturas = async () => {
    try {
      const { data, error } = await supabase
        .from('facturas')
        .select(`
          *,
          cliente:clientes(nombre_fantasia, razon_social),
          obra:obras(nombre, codigo_obra)
        `)
        .order('created_at', { ascending: false })

      if (error) throw error
      setFacturas(data || [])
    } catch (error) {
      console.error('Error al cargar facturas:', error)
      toast.error('Error al cargar facturas')
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

  const fetchObras = async () => {
    try {
      const { data, error } = await supabase
        .from('obras')
        .select('*')
        .order('nombre')

      if (error) throw error
      setObras(data || [])
    } catch (error) {
      console.error('Error al cargar obras:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const subtotal = parseFloat(formData.subtotal)
      const iva_10 = parseFloat(formData.iva_10)
      const total = subtotal + iva_10

      const facturaData = {
        numero_factura: formData.numero_factura,
        fecha_emision: formData.fecha_emision,
        fecha_vencimiento: formData.fecha_vencimiento,
        cliente_id: formData.cliente_id,
        obra_id: formData.obra_id,
        subtotal,
        iva_10,
        rci_30: 0, // RCI se calcula por separado
        total,
        estado: 'borrador' as const,
        observaciones: formData.observaciones
      }

      if (editingId) {
        const { error } = await supabase
          .from('facturas')
          .update({ ...facturaData, updated_at: new Date().toISOString() })
          .eq('id', editingId)

        if (error) throw error
        toast.success('Factura actualizada exitosamente')
      } else {
        const { error } = await supabase
          .from('facturas')
          .insert([facturaData])

        if (error) throw error
        toast.success('Factura creada exitosamente')
      }

      setShowForm(false)
      setEditingId(null)
      setFormData(initialFormData)
      fetchFacturas()
    } catch (error) {
      console.error('Error al guardar factura:', error)
      toast.error('Error al guardar factura')
    }
  }

  const handleEdit = (factura: any) => {
    setFormData({
      numero_factura: factura.numero_factura,
      fecha_emision: factura.fecha_emision,
      fecha_vencimiento: factura.fecha_vencimiento,
      cliente_id: factura.cliente_id,
      obra_id: factura.obra_id,
      subtotal: factura.subtotal.toString(),
      iva_10: factura.iva_10.toString(),
      rci_30: factura.rci_30.toString(),
      observaciones: factura.observaciones
    })
    setEditingId(factura.id)
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('¿Está seguro de que desea eliminar esta factura?')) return

    try {
      const { error } = await supabase
        .from('facturas')
        .delete()
        .eq('id', id)

      if (error) throw error
      toast.success('Factura eliminada exitosamente')
      fetchFacturas()
    } catch (error) {
      console.error('Error al eliminar factura:', error)
      toast.error('Error al eliminar factura')
    }
  }

  const getStatusIcon = (estado: string) => {
    switch (estado) {
      case 'borrador':
        return <Clock className="h-4 w-4 text-neutral-400" />
      case 'emitida':
        return <FileText className="h-4 w-4 text-primary-500" />
      case 'pagada':
        return <CheckCircle className="h-4 w-4 text-success" />
      case 'vencida':
        return <XCircle className="h-4 w-4 text-error" />
      case 'anulada':
        return <AlertCircle className="h-4 w-4 text-warning" />
      default:
        return <Clock className="h-4 w-4 text-neutral-400" />
    }
  }

  const getStatusText = (estado: string) => {
    switch (estado) {
      case 'borrador':
        return 'Borrador'
      case 'emitida':
        return 'Emitida'
      case 'pagada':
        return 'Pagada'
      case 'vencida':
        return 'Vencida'
      case 'anulada':
        return 'Anulada'
      default:
        return estado
    }
  }

  const getStatusColor = (estado: string) => {
    switch (estado) {
      case 'borrador':
        return 'bg-neutral-100 text-neutral-700'
      case 'emitida':
        return 'bg-primary-100 text-primary-700'
      case 'pagada':
        return 'bg-success/10 text-success'
      case 'vencida':
        return 'bg-error/10 text-error'
      case 'anulada':
        return 'bg-warning/10 text-warning'
      default:
        return 'bg-neutral-100 text-neutral-700'
    }
  }

  const handleCancel = () => {
    setShowForm(false)
    setEditingId(null)
    setFormData(initialFormData)
  }

  const filteredFacturas = facturas.filter(factura =>
    factura.numero_factura.toLowerCase().includes(searchTerm.toLowerCase()) ||
    factura.cliente?.razon_social?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    factura.obra?.nombre?.toLowerCase().includes(searchTerm.toLowerCase())
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
          <h1 className="text-3xl font-bold text-neutral-900">Facturas</h1>
          <p className="text-neutral-600 mt-2">Emisión y gestión de facturas con tributación paraguaya</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="btn-primary flex items-center"
        >
          <Plus className="h-4 w-4 mr-2" />
          Nueva Factura
        </button>
      </div>

      {/* Información tributaria */}
      <div className="card bg-primary-50 border border-primary-200">
        <div className="flex items-start">
          <AlertCircle className="h-5 w-5 text-primary-700 mt-0.5 mr-3" />
          <div>
            <h3 className="text-sm font-medium text-primary-900">Sistema Tributario Paraguayo</h3>
            <div className="text-sm text-primary-700 mt-1 space-y-1">
              <p><strong>IVA 10%:</strong> Impuesto al Valor Agregado aplicado a todos los servicios</p>
              <p><strong>RCI 30%:</strong> Régimen de Contrato Independiente (se calcula por separado)</p>
              <p><strong>Timbre Fiscal:</strong> Debe ser aplicado según el monto de la factura</p>
            </div>
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
                placeholder="Buscar por número, cliente u obra..."
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
            {editingId ? 'Editar Factura' : 'Nueva Factura'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Número de Factura *
                </label>
                <input
                  type="text"
                  required
                  value={formData.numero_factura}
                  onChange={(e) => setFormData({ ...formData, numero_factura: e.target.value })}
                  className="input-field"
                  placeholder="001-001-0000001"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Fecha de Emisión *
                </label>
                <input
                  type="date"
                  required
                  value={formData.fecha_emision}
                  onChange={(e) => setFormData({ ...formData, fecha_emision: e.target.value })}
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Fecha de Vencimiento *
                </label>
                <input
                  type="date"
                  required
                  value={formData.fecha_vencimiento}
                  onChange={(e) => setFormData({ ...formData, fecha_vencimiento: e.target.value })}
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
                      {cliente.razon_social} - {cliente.ruc}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Obra *
                </label>
                <select
                  required
                  value={formData.obra_id}
                  onChange={(e) => setFormData({ ...formData, obra_id: e.target.value })}
                  className="input-field"
                >
                  <option value="">Seleccionar obra</option>
                  {obras.map((obra) => (
                    <option key={obra.id} value={obra.id}>
                      {obra.nombre} - {obra.codigo_obra}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Subtotal (₲) *
                </label>
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
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  IVA 10% (₲)
                </label>
                <input
                  type="number"
                  readOnly
                  value={formData.iva_10}
                  className="input-field bg-neutral-50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  RCI 30% (₲)
                </label>
                <input
                  type="number"
                  min="0"
                  step="1000"
                  value={formData.rci_30}
                  onChange={(e) => setFormData({ ...formData, rci_30: e.target.value })}
                  className="input-field"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Observaciones
              </label>
              <textarea
                value={formData.observaciones}
                onChange={(e) => setFormData({ ...formData, observaciones: e.target.value })}
                className="input-field"
                rows={2}
                placeholder="Observaciones adicionales..."
              />
            </div>
            {formData.subtotal && (
              <div className="bg-neutral-50 p-4 rounded-card">
                <h4 className="font-medium text-neutral-900 mb-2">Resumen de Factura</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>Subtotal:</div>
                  <div className="text-right font-mono">
                    ₲{parseFloat(formData.subtotal || '0').toLocaleString('es-PY')}
                  </div>
                  <div>IVA 10%:</div>
                  <div className="text-right font-mono">
                    ₲{parseFloat(formData.iva_10 || '0').toLocaleString('es-PY')}
                  </div>
                  <div>RCI 30%:</div>
                  <div className="text-right font-mono">
                    ₲{parseFloat(formData.rci_30 || '0').toLocaleString('es-PY')}
                  </div>
                  <div className="font-semibold">Total:</div>
                  <div className="text-right font-mono font-semibold">
                    ₲{(parseFloat(formData.subtotal || '0') + parseFloat(formData.iva_10 || '0') + parseFloat(formData.rci_30 || '0')).toLocaleString('es-PY')}
                  </div>
                </div>
              </div>
            )}
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={handleCancel}
                className="btn-secondary"
              >
                Cancelar
              </button>
              <button type="submit" className="btn-primary">
                {editingId ? 'Actualizar' : 'Crear'} Factura
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tabla de facturas */}
      <div className="card">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-neutral-200">
                <th className="table-header">Número</th>
                <th className="table-header">Fecha</th>
                <th className="table-header">Cliente</th>
                <th className="table-header">Obra</th>
                <th className="table-header">Subtotal</th>
                <th className="table-header">Total</th>
                <th className="table-header">Estado</th>
                <th className="table-header">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredFacturas.map((factura) => (
                <tr key={factura.id} className="border-b border-neutral-100">
                  <td className="table-cell font-mono font-medium">
                    {factura.numero_factura}
                  </td>
                  <td className="table-cell">
                    {new Date(factura.fecha_emision).toLocaleDateString('es-PY')}
                  </td>
                  <td className="table-cell">
                    {factura.cliente?.razon_social || 'N/A'}
                  </td>
                  <td className="table-cell">
                    {factura.obra?.nombre || 'N/A'}
                  </td>
                  <td className="table-cell font-mono">
                    ₲{factura.subtotal.toLocaleString('es-PY')}
                  </td>
                  <td className="table-cell font-mono font-semibold">
                    ₲{factura.total.toLocaleString('es-PY')}
                  </td>
                  <td className="table-cell">
                    <span className={`inline-flex items-center px-2 py-1 text-xs rounded-full ${getStatusColor(factura.estado)}`}>
                      {getStatusIcon(factura.estado)}
                      <span className="ml-1">{getStatusText(factura.estado)}</span>
                    </span>
                  </td>
                  <td className="table-cell">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEdit(factura)}
                        className="p-1 text-neutral-400 hover:text-primary-500 transition-colors"
                        title="Editar"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(factura.id)}
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
        {filteredFacturas.length === 0 && (
          <div className="text-center py-8 text-neutral-500">
            {searchTerm ? 'No se encontraron facturas' : 'No hay facturas registradas'}
          </div>
        )}
      </div>
    </div>
  )
}