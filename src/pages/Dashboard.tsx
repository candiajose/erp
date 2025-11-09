import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Building, 
  DollarSign, 
  FileText,
  Wrench,
  Package
} from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'

// Datos de ejemplo para el dashboard
const kpiData = [
  {
    title: 'Facturación Mensual',
    value: '₲ 45.2M',
    change: '+12.5%',
    trend: 'up',
    icon: DollarSign
  },
  {
    title: 'Obras Activas',
    value: '8',
    change: '+2',
    trend: 'up',
    icon: Building
  },
  {
    title: 'Empleados',
    value: '24',
    change: '+1',
    trend: 'up',
    icon: Users
  },
  {
    title: 'Presupuestos Pendientes',
    value: '6',
    change: '-3',
    trend: 'down',
    icon: FileText
  }
]

const obrasChartData = [
  { name: 'Ene', gastos: 12, ingresos: 18 },
  { name: 'Feb', gastos: 15, ingresos: 22 },
  { name: 'Mar', gastos: 18, ingresos: 25 },
  { name: 'Abr', gastos: 14, ingresos: 20 },
  { name: 'May', gastos: 20, ingresos: 28 },
  { name: 'Jun', gastos: 22, ingresos: 32 }
]

const estadoObrasData = [
  { name: 'En Ejecución', value: 4, color: '#00AEEF' },
  { name: 'Planificación', value: 2, color: '#ffc107' },
  { name: 'Finalizada', value: 2, color: '#28a745' }
]

const recentActivities = [
  {
    id: 1,
    type: 'factura',
    description: 'Factura #001-001 emitida a Cliente ABC',
    time: 'Hace 2 horas',
    status: 'success'
  },
  {
    id: 2,
    type: 'obra',
    description: 'Obra "Torre Norte" alcanzó 75% de avance',
    time: 'Hace 4 horas',
    status: 'info'
  },
  {
    id: 3,
    type: 'empleado',
    description: 'Nuevo empleado agregado al equipo',
    time: 'Hace 1 día',
    status: 'success'
  },
  {
    id: 4,
    type: 'pago',
    description: 'Pago recibido por presupuesto #PR-001',
    time: 'Hace 2 días',
    status: 'success'
  }
]

export default function Dashboard() {
  return (
    <div className="space-y-xl">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-neutral-900">Dashboard</h1>
        <p className="text-neutral-600 mt-2">Vista general del estado de la empresa</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-lg">
        {kpiData.map((kpi, index) => (
          <div key={index} className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-neutral-600">{kpi.title}</p>
                <p className="text-2xl font-bold text-neutral-900 mt-2">{kpi.value}</p>
                <div className="flex items-center mt-2">
                  {kpi.trend === 'up' ? (
                    <TrendingUp className="h-4 w-4 text-success mr-1" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-error mr-1" />
                  )}
                  <span className={`text-sm font-medium ${
                    kpi.trend === 'up' ? 'text-success' : 'text-error'
                  }`}>
                    {kpi.change}
                  </span>
                  <span className="text-sm text-neutral-500 ml-1">vs mes anterior</span>
                </div>
              </div>
              <div className="h-12 w-12 bg-primary-100 rounded-card flex items-center justify-center">
                <kpi.icon className="h-6 w-6 text-primary-700" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-xl">
        {/* Gráfico de barras - Ingresos vs Gastos */}
        <div className="card">
          <h3 className="text-xl font-semibold text-neutral-900 mb-4">Ingresos vs Gastos (Meses)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={obrasChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" stroke="#6c757d" />
              <YAxis stroke="#6c757d" />
              <Tooltip 
                contentStyle={{
                  backgroundColor: '#ffffff',
                  border: '1px solid #dee2e6',
                  borderRadius: '8px',
                  boxShadow: '0 4px 12px rgba(34, 34, 34, 0.08)'
                }}
              />
              <Bar dataKey="gastos" fill="#dc3545" name="Gastos (M₲)" />
              <Bar dataKey="ingresos" fill="#00AEEF" name="Ingresos (M₲)" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Gráfico de torta - Estado de Obras */}
        <div className="card">
          <h3 className="text-xl font-semibold text-neutral-900 mb-4">Estado de Obras</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={estadoObrasData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={5}
                dataKey="value"
              >
                {estadoObrasData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-4 space-y-2">
            {estadoObrasData.map((item, index) => (
              <div key={index} className="flex items-center">
                <div 
                  className="w-3 h-3 rounded-full mr-3"
                  style={{ backgroundColor: item.color }}
                ></div>
                <span className="text-sm text-neutral-600">
                  {item.name}: {item.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Activities */}
      <div className="card">
        <h3 className="text-xl font-semibold text-neutral-900 mb-4">Actividades Recientes</h3>
        <div className="space-y-4">
          {recentActivities.map((activity) => (
            <div key={activity.id} className="flex items-center p-3 bg-neutral-50 rounded-card">
              <div className={`h-8 w-8 rounded-full flex items-center justify-center mr-3 ${
                activity.status === 'success' ? 'bg-success/10' :
                activity.status === 'error' ? 'bg-error/10' : 'bg-primary-100'
              }`}>
                {activity.type === 'factura' && <FileText className="h-4 w-4 text-success" />}
                {activity.type === 'obra' && <Building className="h-4 w-4 text-primary-500" />}
                {activity.type === 'empleado' && <Users className="h-4 w-4 text-primary-500" />}
                {activity.type === 'pago' && <DollarSign className="h-4 w-4 text-success" />}
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-neutral-900">{activity.description}</p>
                <p className="text-xs text-neutral-500">{activity.time}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Alertas y Notificaciones */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-xl">
        <div className="card">
          <h3 className="text-xl font-semibold text-neutral-900 mb-4">Alertas Importantes</h3>
          <div className="space-y-3">
            <div className="flex items-center p-3 bg-warning/10 rounded-card">
              <Wrench className="h-5 w-5 text-warning mr-3" />
              <div>
                <p className="text-sm font-medium text-neutral-900">3 facturas vencidas</p>
                <p className="text-xs text-neutral-500">Requieren atención inmediata</p>
              </div>
            </div>
            <div className="flex items-center p-3 bg-error/10 rounded-card">
              <Package className="h-5 w-5 text-error mr-3" />
              <div>
                <p className="text-sm font-medium text-neutral-900">Stock bajo en inventario</p>
                <p className="text-xs text-neutral-500">2 productos bajo mínimo</p>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <h3 className="text-xl font-semibold text-neutral-900 mb-4">Recordatorios</h3>
          <div className="space-y-3">
            <div className="flex items-center p-3 bg-primary-100 rounded-card">
              <FileText className="h-5 w-5 text-primary-700 mr-3" />
              <div>
                <p className="text-sm font-medium text-neutral-900">Rendición mensual DGI</p>
                <p className="text-xs text-neutral-500">Vence en 5 días</p>
              </div>
            </div>
            <div className="flex items-center p-3 bg-success/10 rounded-card">
              <DollarSign className="h-5 w-5 text-success mr-3" />
              <div>
                <p className="text-sm font-medium text-neutral-900">Pago de nómina</p>
                <p className="text-xs text-neutral-500">Programado para mañana</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}