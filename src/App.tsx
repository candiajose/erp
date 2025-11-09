import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import Empleados from './pages/Empleados'
import Contratos from './pages/Contratos'
import Nominas from './pages/Nominas'
import Clientes from './pages/Clientes'
import Proveedores from './pages/Proveedores'
import Obras from './pages/Obras'
import Facturas from './pages/Facturas'
import Presupuestos from './pages/Presupuestos'
import OrdenesCompra from './pages/OrdenesCompra'
import OrdenesTrabajo from './pages/OrdenesTrabajo'
import Inventario from './pages/Inventario'
import Reportes from './pages/Reportes'
import Configuracion from './pages/Configuracion'

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/dashboard" element={<Dashboard />} />
        
        {/* RRHH */}
        <Route path="/rrhh/empleados" element={<Empleados />} />
        <Route path="/rrhh/contratos" element={<Contratos />} />
        <Route path="/rrhh/nominas" element={<Nominas />} />
        
        {/* Comercial */}
        <Route path="/comercial/clientes" element={<Clientes />} />
        <Route path="/comercial/proveedores" element={<Proveedores />} />
        <Route path="/comercial/obras" element={<Obras />} />
        
        {/* Facturación */}
        <Route path="/facturacion/facturas" element={<Facturas />} />
        <Route path="/facturacion/presupuestos" element={<Presupuestos />} />
        <Route path="/facturacion/ordenes-compra" element={<OrdenesCompra />} />
        <Route path="/facturacion/ordenes-trabajo" element={<OrdenesTrabajo />} />
        
        {/* Inventario */}
        <Route path="/inventario" element={<Inventario />} />
        
        {/* Reportes y Configuración */}
        <Route path="/reportes" element={<Reportes />} />
        <Route path="/configuracion" element={<Configuracion />} />
      </Routes>
    </Layout>
  )
}

export default App