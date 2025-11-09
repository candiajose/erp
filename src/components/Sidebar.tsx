import { Link, useLocation } from 'react-router-dom'
import { 
  Home,
  Users,
  FileText,
  DollarSign,
  UserCheck,
  Building2,
  Receipt,
  Calculator,
  ShoppingCart,
  Wrench,
  Package,
  BarChart3,
  Settings,
  HardHat
} from 'lucide-react'
import clsx from 'clsx'

const menuItems = [
  {
    section: 'Principal',
    items: [
      { name: 'Dashboard', href: '/', icon: Home }
    ]
  },
  {
    section: 'RRHH',
    items: [
      { name: 'Empleados', href: '/rrhh/empleados', icon: Users },
      { name: 'Contratos', href: '/rrhh/contratos', icon: FileText },
      { name: 'Nóminas', href: '/rrhh/nominas', icon: DollarSign }
    ]
  },
  {
    section: 'Comercial',
    items: [
      { name: 'Clientes', href: '/comercial/clientes', icon: UserCheck },
      { name: 'Proveedores', href: '/comercial/proveedores', icon: Building2 },
      { name: 'Obras', href: '/comercial/obras', icon: HardHat }
    ]
  },
  {
    section: 'Facturación',
    items: [
      { name: 'Facturas', href: '/facturacion/facturas', icon: Receipt },
      { name: 'Presupuestos', href: '/facturacion/presupuestos', icon: Calculator },
      { name: 'Órdenes de Compra', href: '/facturacion/ordenes-compra', icon: ShoppingCart },
      { name: 'Órdenes de Trabajo', href: '/facturacion/ordenes-trabajo', icon: Wrench }
    ]
  },
  {
    section: 'Inventario',
    items: [
      { name: 'Inventario', href: '/inventario', icon: Package }
    ]
  },
  {
    section: 'Sistema',
    items: [
      { name: 'Reportes', href: '/reportes', icon: BarChart3 },
      { name: 'Configuración', href: '/configuracion', icon: Settings }
    ]
  }
]

export default function Sidebar() {
  const location = useLocation()

  return (
    <div className="fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg">
      {/* Logo */}
      <div className="flex items-center px-xl py-lg border-b border-neutral-100">
        <img 
          src="/logo_firmeza.png" 
          alt="Firmeza Contracciones" 
          className="h-12 w-auto"
        />
        <div className="ml-3">
          <h1 className="text-lg font-bold text-neutral-900">FIRMEZA</h1>
          <p className="text-sm text-neutral-600">ERP</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="mt-6 px-4 space-y-6">
        {menuItems.map((section) => (
          <div key={section.section}>
            <h3 className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-3">
              {section.section}
            </h3>
            <ul className="space-y-1">
              {section.items.map((item) => {
                const isActive = location.pathname === item.href
                return (
                  <li key={item.name}>
                    <Link
                      to={item.href}
                      className={clsx(
                        'flex items-center px-3 py-2 text-sm font-medium rounded-button transition-colors duration-200',
                        isActive
                          ? 'bg-primary-100 text-primary-700'
                          : 'text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900'
                      )}
                    >
                      <item.icon className="mr-3 h-5 w-5" />
                      {item.name}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-neutral-100">
        <p className="text-xs text-neutral-500 text-center">
          Sistema ERP v1.0.0<br />
          Firmeza Contracciones
        </p>
      </div>
    </div>
  )
}