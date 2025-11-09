// Nóminas
import { useState, useEffect } from 'react'
import { Plus, Edit, Trash2, Search, DollarSign } from 'lucide-react'
import { supabase } from '../lib/supabase'
import toast from 'react-hot-toast'

export default function Nominas() {
  const [nominas, setNominas] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    periodo: '',
    fecha_pago: '',
    empleado_id: '',
    salario_base: '',
    horas_extras: '',
    total_horas_extras: ''
  })

  useEffect(() => {
    fetchNominas()
  }, [])

  const fetchNominas = async () => {
    try {
      const { data } = await supabase
        .from('nominas')
        .select(`
          *,
          empleado:empleados(nombres, apellidos)
        `)
        .order('periodo', { ascending: false })
      setNominas(data || [])
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const salarioBase = parseFloat(formData.salario_base)
      const horasExtras = parseFloat(formData.horas_extras || '0')
      const totalHorasExtras = parseFloat(formData.total_horas_extras || '0')
      const descuentoIps = salarioBase * 0.09 // IPS 9%
      const descuentoRenta = salarioBase * 0.025 // Renta 2.5%
      const totalDescuentos = descuentoIps + descuentoRenta
      const totalNeto = salarioBase + totalHorasExtras - totalDescuentos

      const data = {
        ...formData,
        salario_base: salarioBase,
        horas_extras: horasExtras,
        total_horas_extras: totalHorasExtras,
        descuento_ips: descuentoIps,
        descuento_renta: descuentoRenta,
        total_descuentos: totalDescuentos,
        total_neto: totalNeto
      }

      const { error } = await supabase.from('nominas').insert([data])
      if (error) throw error
      toast.success('Nómina procesada')
      setShowForm(false)
      setFormData({ periodo: '', fecha_pago: '', empleado_id: '', salario_base: '', horas_extras: '', total_horas_extras: '' })
      fetchNominas()
    } catch (error) {
      console.error('Error:', error)
      toast.error('Error al procesar nómina')
    }
  }

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div></div>

  return (
    <div className="space-y-xl">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900">Nóminas</h1>
          <p className="text-neutral-600 mt-2">Gestión de nóminas y pagos de empleados</p>
        </div>
        <button onClick={() => setShowForm(true)} className="btn-primary flex items-center">
          <Plus className="h-4 w-4 mr-2" /> Nueva Nómina
        </button>
      </div>

      {showForm && (
        <div className="card">
          <h2 className="text-xl font-semibold text-neutral-900 mb-4">Nueva Nómina</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Período *</label>
                <input
                  type="text"
                  required
                  value={formData.periodo}
                  onChange={(e) => setFormData({ ...formData, periodo: e.target.value })}
                  className="input-field"
                  placeholder="2024-12"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Fecha de Pago *</label>
                <input
                  type="date"
                  required
                  value={formData.fecha_pago}
                  onChange={(e) => setFormData({ ...formData, fecha_pago: e.target.value })}
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Salario Base (₲) *</label>
                <input
                  type="number"
                  required
                  min="0"
                  value={formData.salario_base}
                  onChange={(e) => setFormData({ ...formData, salario_base: e.target.value })}
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Horas Extras</label>
                <input
                  type="number"
                  min="0"
                  value={formData.horas_extras}
                  onChange={(e) => setFormData({ ...formData, horas_extras: e.target.value })}
                  className="input-field"
                />
              </div>
            </div>
            <div className="bg-neutral-50 p-4 rounded-card">
              <h4 className="font-medium text-neutral-900 mb-2">Cálculo Automático (Paraguay)</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>IPS (9%):</div>
                <div className="text-right font-mono">₲{(parseFloat(formData.salario_base || '0') * 0.09).toLocaleString('es-PY')}</div>
                <div>Renta (2.5%):</div>
                <div className="text-right font-mono">₲{(parseFloat(formData.salario_base || '0') * 0.025).toLocaleString('es-PY')}</div>
                <div className="font-semibold">Total Neto:</div>
                <div className="text-right font-mono font-semibold">
                  ₲{(parseFloat(formData.salario_base || '0') + parseFloat(formData.total_horas_extras || '0') - (parseFloat(formData.salario_base || '0') * 0.115)).toLocaleString('es-PY')}
                </div>
              </div>
            </div>
            <div className="flex justify-end space-x-3">
              <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">Cancelar</button>
              <button type="submit" className="btn-primary">Procesar Nómina</button>
            </div>
          </form>
        </div>
      )}

      <div className="card">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-neutral-200">
                <th className="table-header">Período</th>
                <th className="table-header">Empleado</th>
                <th className="table-header">Salario Base</th>
                <th className="table-header">Descuentos</th>
                <th className="table-header">Total Neto</th>
                <th className="table-header">Fecha Pago</th>
              </tr>
            </thead>
            <tbody>
              {nominas.map((nomina) => (
                <tr key={nomina.id} className="border-b border-neutral-100">
                  <td className="table-cell font-mono">{nomina.periodo}</td>
                  <td className="table-cell">
                    {nomina.empleado?.nombres} {nomina.empleado?.apellidos}
                  </td>
                  <td className="table-cell font-mono">₲{nomina.salario_base?.toLocaleString('es-PY')}</td>
                  <td className="table-cell font-mono">₲{nomina.total_descuentos?.toLocaleString('es-PY')}</td>
                  <td className="table-cell font-mono font-semibold text-success">₲{nomina.total_neto?.toLocaleString('es-PY')}</td>
                  <td className="table-cell">{new Date(nomina.fecha_pago).toLocaleDateString('es-PY')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

// Contratos
export function Contratos() {
  const [contratos, setContratos] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchContratos()
  }, [])

  const fetchContratos = async () => {
    try {
      const { data } = await supabase
        .from('empleados')
        .select(`
          *,
          nominas:suffix, -- no es una realtion real
        `)
        .eq('tipo_contrato', 'indefinido')
        .order('fecha_ingreso')
      setContratos(data || [])
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div></div>

  return (
    <div className="space-y-xl">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900">Contratos</h1>
          <p className="text-neutral-600 mt-2">Gestión de contratos de empleados</p>
        </div>
      </div>

      <div className="card">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-neutral-200">
                <th className="table-header">Empleado</th>
                <th className="table-header">Cédula</th>
                <th className="table-header">Cargo</th>
                <th className="table-header">Fecha Ingreso</th>
                <th className="table-header">Tipo Contrato</th>
                <th className="table-header">Salario</th>
              </tr>
            </thead>
            <tbody>
              {contratos.map((empleado) => (
                <tr key={empleado.id} className="border-b border-neutral-100">
                  <td className="table-cell">
                    {empleado.nombres} {empleado.apellidos}
                  </td>
                  <td className="table-cell font-mono">{empleado.cedula}</td>
                  <td className="table-cell">{empleado.cargo}</td>
                  <td className="table-cell">
                    {new Date(empleado.fecha_ingreso).toLocaleDateString('es-PY')}
                  </td>
                  <td className="table-cell">
                    <span className="px-2 py-1 text-xs rounded-full bg-success/10 text-success">
                      {empleado.tipo_contrato.toUpperCase()}
                    </span>
                  </td>
                  <td className="table-cell font-mono">₲{empleado.salario?.toLocaleString('es-PY')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

// Reportes
export function Reportes() {
  const [reportes] = useState([
    {
      id: 1,
      titulo: 'Reporte Financiero Mensual',
      descripcion: 'Resumen de ingresos, gastos y flujo de caja del mes',
      icono: DollarSign,
      color: 'bg-primary-100 text-primary-700'
    },
    {
      id: 2,
      titulo: 'Reporte de Obras',
      descripcion: 'Estado de avance y presupuestos de todas las obras',
      icono: Edit,
      color: 'bg-success/10 text-success'
    },
    {
      id: 3,
      titulo: 'Reporte de RRHH',
      descripcion: 'Nómina, asistencias y personal activo',
      icono: Search,
      color: 'bg-warning/10 text-warning'
    }
  ])

  return (
    <div className="space-y-xl">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900">Reportes</h1>
          <p className="text-neutral-600 mt-2">Reportes y análisis de la empresa</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-lg">
        {reportes.map((reporte) => (
          <div key={reporte.id} className="card hover:shadow-lg transition-shadow cursor-pointer">
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-card ${reporte.color}`}>
                <reporte.icono className="h-6 w-6" />
              </div>
              <button className="btn-secondary text-sm">Generar</button>
            </div>
            <h3 className="text-lg font-semibold text-neutral-900 mb-2">{reporte.titulo}</h3>
            <p className="text-neutral-600 text-sm">{reporte.descripcion}</p>
          </div>
        ))}
      </div>

      <div className="card">
        <h3 className="text-xl font-semibold text-neutral-900 mb-4">Reportes Legislación Paraguaya</h3>
        <div className="space-y-3">
          <div className="flex items-center p-3 bg-primary-50 rounded-card">
            <DollarSign className="h-5 w-5 text-primary-700 mr-3" />
            <div>
              <p className="text-sm font-medium text-neutral-900">Declaración Mensual IVA</p>
              <p className="text-xs text-neutral-500">Reporte para la DGI - Vencimiento: 15 del mes siguiente</p>
            </div>
          </div>
          <div className="flex items-center p-3 bg-warning/10 rounded-card">
            <Search className="h-5 w-5 text-warning mr-3" />
            <div>
              <p className="text-sm font-medium text-neutral-900">Certificación de Ingresos</p>
              <p className="text-xs text-neutral-500">Para empleados - Declaración jurada anual</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Configuración
export function Configuracion() {
  const [config, setConfig] = useState({
    empresa: {
      razon_social: 'Firmeza Contracciones S.A.',
      ruc: '80012345-7',
      direccion: 'Avda. Eusebio Ayala 1234, Asunción',
      telefono: '(021) 123-456',
      email: 'info@firmeza.com.py'
    },
    tributaria: {
      timbrado: {
        numero: '12345678',
        fecha_vigencia: '2025-12-31'
      },
      cfg_iva: '10',
      cfg_ips: '9',
      cfg_renta: '2.5'
    }
  })

  return (
    <div className="space-y-xl">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900">Configuración</h1>
          <p className="text-neutral-600 mt-2">Configuración del sistema y empresa</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-xl">
        <div className="card">
          <h3 className="text-lg font-semibold text-neutral-900 mb-4">Datos de la Empresa</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">Razón Social</label>
              <input
                type="text"
                value={config.empresa.razon_social}
                onChange={(e) => setConfig({ ...config, empresa: { ...config.empresa, razon_social: e.target.value } })}
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">RUC</label>
              <input
                type="text"
                value={config.empresa.ruc}
                onChange={(e) => setConfig({ ...config, empresa: { ...config.empresa, ruc: e.target.value } })}
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">Dirección</label>
              <textarea
                value={config.empresa.direccion}
                onChange={(e) => setConfig({ ...config, empresa: { ...config.empresa, direccion: e.target.value } })}
                className="input-field"
                rows={2}
              />
            </div>
          </div>
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold text-neutral-900 mb-4">Configuración Tributaria Paraguay</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">Timbrado Número</label>
              <input
                type="text"
                value={config.tributaria.timbrado.numero}
                onChange={(e) => setConfig({ ...config, tributaria: { ...config.tributaria, timbrado: { ...config.tributaria.timbrado, numero: e.target.value } } })}
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">IVA (%)</label>
              <input
                type="number"
                value={config.tributaria.cfg_iva}
                onChange={(e) => setConfig({ ...config, tributaria: { ...config.tributaria, cfg_iva: e.target.value } })}
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">IPS (%)</label>
              <input
                type="number"
                value={config.tributaria.cfg_ips}
                onChange={(e) => setConfig({ ...config, tributaria: { ...config.tributaria, cfg_ips: e.target.value } })}
                className="input-field"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <h3 className="text-lg font-semibold text-neutral-900 mb-4">Base de Datos</h3>
        <div className="flex space-x-3">
          <button className="btn-primary">Sincronizar con Supabase</button>
          <button className="btn-secondary">Crear Backup</button>
          <button className="btn-secondary">Restaurar Backup</button>
        </div>
      </div>
    </div>
  )
}