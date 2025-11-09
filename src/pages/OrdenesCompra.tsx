// Ordenes de Compra
import { useState, useEffect } from 'react'
import { Plus, Edit, Trash2, Search, ShoppingCart } from 'lucide-react'
import { supabase } from '../lib/supabase'
import toast from 'react-hot-toast'

export default function OrdenesCompra() {
  const [ordenes, setOrdenes] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    numero_orden: '',
    fecha: '',
    proveedor_id: '',
    obra_id: '',
    subtotal: '',
    observaciones: ''
  })

  useEffect(() => {
    fetchOrdenes()
  }, [])

  const fetchOrdenes = async () => {
    try {
      const { data } = await supabase
        .from('ordenes_compra')
        .select(`
          *,
          proveedor:proveedores(razon_social),
          obra:obras(nombre)
        `)
        .order('created_at', { ascending: false })
      setOrdenes(data || [])
    } catch (error) {
      console.error('Error:', error)
      toast.error('Error al cargar órdenes')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const subtotal = parseFloat(formData.subtotal)
      const iva_10 = subtotal * 0.10
      const total = subtotal + iva_10

      const data = {
        ...formData,
        subtotal,
        iva_10,
        total,
        estado: 'borrador'
      }

      const { error } = await supabase.from('ordenes_compra').insert([data])
      if (error) throw error
      toast.success('Orden de compra creada')
      setShowForm(false)
      setFormData({ numero_orden: '', fecha: '', proveedor_id: '', obra_id: '', subtotal: '', observaciones: '' })
      fetchOrdenes()
    } catch (error) {
      console.error('Error:', error)
      toast.error('Error al crear orden')
    }
  }

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div></div>

  return (
    <div className="space-y-xl">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900">Órdenes de Compra</h1>
          <p className="text-neutral-600 mt-2">Gestión de órdenes de compra a proveedores</p>
        </div>
        <button onClick={() => setShowForm(true)} className="btn-primary flex items-center">
          <Plus className="h-4 w-4 mr-2" /> Nueva Orden
        </button>
      </div>

      {showForm && (
        <div className="card">
          <h2 className="text-xl font-semibold text-neutral-900 mb-4">Nueva Orden de Compra</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Número *</label>
                <input
                  type="text"
                  required
                  value={formData.numero_orden}
                  onChange={(e) => setFormData({ ...formData, numero_orden: e.target.value })}
                  className="input-field"
                  placeholder="OC-2024-001"
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
            </div>
            <div className="flex justify-end space-x-3">
              <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">Cancelar</button>
              <button type="submit" className="btn-primary">Crear Orden</button>
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
                <th className="table-header">Proveedor</th>
                <th className="table-header">Total</th>
                <th className="table-header">Estado</th>
              </tr>
            </thead>
            <tbody>
              {ordenes.map((orden) => (
                <tr key={orden.id} className="border-b border-neutral-100">
                  <td className="table-cell font-mono">{orden.numero_orden}</td>
                  <td className="table-cell">{new Date(orden.fecha).toLocaleDateString('es-PY')}</td>
                  <td className="table-cell">{orden.proveedor?.razon_social}</td>
                  <td className="table-cell font-mono">₲{orden.total?.toLocaleString('es-PY')}</td>
                  <td className="table-cell">
                    <span className="px-2 py-1 text-xs rounded-full bg-neutral-100 text-neutral-700">
                      {orden.estado}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

// Ordenes de Trabajo
export function OrdenesTrabajo() {
  const [ordenes, setOrdenes] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    numero_orden: '',
    fecha: '',
    obra_id: '',
    empleado_id: '',
    descripcion: '',
    horas_trabajadas: '',
    tarifahora: ''
  })

  useEffect(() => {
    fetchOrdenes()
  }, [])

  const fetchOrdenes = async () => {
    try {
      const { data } = await supabase
        .from('ordenes_trabajo')
        .select(`
          *,
          obra:obras(nombre),
          empleado:empleados(nombres, apellidos)
        `)
        .order('created_at', { ascending: false })
      setOrdenes(data || [])
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const horas = parseFloat(formData.horas_trabajadas)
      const tarifa = parseFloat(formData.tarifahora)
      const subtotal = horas * tarifa

      const data = {
        ...formData,
        horas_trabajadas: horas,
        tarifahora: tarifa,
        subtotal
      }

      const { error } = await supabase.from('ordenes_trabajo').insert([data])
      if (error) throw error
      toast.success('Orden de trabajo creada')
      setShowForm(false)
      setFormData({ numero_orden: '', fecha: '', obra_id: '', empleado_id: '', descripcion: '', horas_trabajadas: '', tarifahora: '' })
      fetchOrdenes()
    } catch (error) {
      console.error('Error:', error)
      toast.error('Error al crear orden')
    }
  }

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div></div>

  return (
    <div className="space-y-xl">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900">Órdenes de Trabajo</h1>
          <p className="text-neutral-600 mt-2">Gestión de órdenes de trabajo a empleados</p>
        </div>
        <button onClick={() => setShowForm(true)} className="btn-primary flex items-center">
          <Plus className="h-4 w-4 mr-2" /> Nueva Orden
        </button>
      </div>

      {showForm && (
        <div className="card">
          <h2 className="text-xl font-semibold text-neutral-900 mb-4">Nueva Orden de Trabajo</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Número *</label>
                <input type="text" required value={formData.numero_orden} onChange={(e) => setFormData({ ...formData, numero_orden: e.target.value })} className="input-field" placeholder="OT-2024-001" />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Fecha *</label>
                <input type="date" required value={formData.fecha} onChange={(e) => setFormData({ ...formData, fecha: e.target.value })} className="input-field" />
              </div>
            </div>
            <div className="flex justify-end space-x-3">
              <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">Cancelar</button>
              <button type="submit" className="btn-primary">Crear Orden</button>
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
                <th className="table-header">Obra</th>
                <th className="table-header">Empleado</th>
                <th className="table-header">Total</th>
                <th className="table-header">Estado</th>
              </tr>
            </thead>
            <tbody>
              {ordenes.map((orden) => (
                <tr key={orden.id} className="border-b border-neutral-100">
                  <td className="table-cell font-mono">{orden.numero_orden}</td>
                  <td className="table-cell">{new Date(orden.fecha).toLocaleDateString('es-PY')}</td>
                  <td className="table-cell">{orden.obra?.nombre}</td>
                  <td className="table-cell">{orden.empleado?.nombres} {orden.empleado?.apellidos}</td>
                  <td className="table-cell font-mono">₲{orden.subtotal?.toLocaleString('es-PY')}</td>
                  <td className="table-cell">
                    <span className="px-2 py-1 text-xs rounded-full bg-neutral-100 text-neutral-700">
                      {orden.estado}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

// Inventario
export function Inventario() {
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    codigo: '',
    nombre: '',
    descripcion: '',
    categoria: '',
    unidad_medida: '',
    precio_unitario: '',
    stock_actual: '',
    stock_minimo: '',
    proveedor_id: ''
  })

  useEffect(() => {
    fetchItems()
  }, [])

  const fetchItems = async () => {
    try {
      const { data } = await supabase
        .from('inventario_items')
        .select(`
          *,
          proveedor:proveedores(razon_social)
        `)
        .order('nombre')
      setItems(data || [])
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const data = {
        ...formData,
        precio_unitario: parseFloat(formData.precio_unitario),
        stock_actual: parseInt(formData.stock_actual),
        stock_minimo: parseInt(formData.stock_minimo)
      }

      const { error } = await supabase.from('inventario_items').insert([data])
      if (error) throw error
      toast.success('Ítem agregado al inventario')
      setShowForm(false)
      setFormData({ codigo: '', nombre: '', descripcion: '', categoria: '', unidad_medida: '', precio_unitario: '', stock_actual: '', stock_minimo: '', proveedor_id: '' })
      fetchItems()
    } catch (error) {
      console.error('Error:', error)
      toast.error('Error al agregar item')
    }
  }

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div></div>

  return (
    <div className="space-y-xl">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900">Inventario</h1>
          <p className="text-neutral-600 mt-2">Gestión de stock y materiales</p>
        </div>
        <button onClick={() => setShowForm(true)} className="btn-primary flex items-center">
          <Plus className="h-4 w-4 mr-2" /> Nuevo Ítem
        </button>
      </div>

      {showForm && (
        <div className="card">
          <h2 className="text-xl font-semibold text-neutral-900 mb-4">Nuevo Ítem</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Código *</label>
                <input type="text" required value={formData.codigo} onChange={(e) => setFormData({ ...formData, codigo: e.target.value })} className="input-field" />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Nombre *</label>
                <input type="text" required value={formData.nombre} onChange={(e) => setFormData({ ...formData, nombre: e.target.value })} className="input-field" />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Categoría *</label>
                <select required value={formData.categoria} onChange={(e) => setFormData({ ...formData, categoria: e.target.value })} className="input-field">
                  <option value="">Seleccionar</option>
                  <option value="Cemento">Cemento</option>
                  <option value="Arena">Arena</option>
                  <option value">Grava">Grava</option>
                  <option value="Hierro">Hierro</option>
                  <option value="Bloques">Bloques</option>
                  <option value="Azulejos">Azulejos</option>
                  <option value="Pintura">Pintura</option>
                  <option value="Herramientas">Herramientas</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end space-x-3">
              <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">Cancelar</button>
              <button type="submit" className="btn-primary">Agregar</button>
            </div>
          </form>
        </div>
      )}

      <div className="card">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-neutral-200">
                <th className="table-header">Código</th>
                <th className="table-header">Nombre</th>
                <th className="table-header">Categoría</th>
                <th className="table-header">Stock</th>
                <th className="table-header">Precio</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id} className="border-b border-neutral-100">
                  <td className="table-cell font-mono">{item.codigo}</td>
                  <td className="table-cell">{item.nombre}</td>
                  <td className="table-cell">{item.categoria}</td>
                  <td className="table-cell">
                    <span className={item.stock_actual <= item.stock_minimo ? 'text-error font-semibold' : ''}>
                      {item.stock_actual} {item.unidad_medida}
                    </span>
                  </td>
                  <td className="table-cell font-mono">₲{item.precio_unitario?.toLocaleString('es-PY')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}