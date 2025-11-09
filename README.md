# Firmeza ERP - Sistema de Gestión Integral

## Descripción

ERP completo diseñado específicamente para **Firmeza Contracciones**, empresa constructora paraguaya. Sistema integral de gestión que incluye todos los módulos necesarios para administrar una empresa de construcción con cumplimiento de la legislación paraguaya.

## Características Principales

### 🏗️ Módulos Incluidos

- **Dashboard Ejecutivo**: KPIs y métricas en tiempo real
- **RRHH**: Empleados, Contratos, Nóminas con cálculo de IPS y Renta
- **Gestión Comercial**: Clientes, Proveedores, Obras y Proyectos
- **Facturación**: Facturas, Presupuestos, Órdenes de compra y trabajo
- **Inventario**: Control de stock y materiales
- **Reportes**: Análisis financiero y operativo
- **Configuración**: Datos de empresa y configuración tributaria

### 🇵🇾 Legislación Paraguaya

- **IVA 10%**: Cálculo automático en facturas
- **IPS 9%**: Descuento automático en nóminas
- **Renta 2.5%**: Retención automática en empleados
- **RCI 30%**: Régimen de Contrato Independiente
- **DGI**: Reportes compatibles con requerimientos
- **RUT Digital**: Validación de contribuyentes

## Tecnologías Utilizadas

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS
- **Backend**: Supabase (PostgreSQL)
- **Routing**: React Router DOM
- **Charts**: Recharts
- **Forms**: React Hook Form
- **Notifications**: React Hot Toast

## Instalación en Synology

### Prerrequisitos

1. **Synology NAS** con DSM 7.0 o superior
2. **Node.js** instalado en el Synology
3. **Dominio** configurado y funcional
4. **Puerto disponible** (ej: 3000)

### Pasos de Instalación

1. **Subir archivos al Synology**:
   ```bash
   # Copiar todos los archivos del proyecto a una carpeta en el Synology
   # Ejemplo: /volume1/web/firmeza-erp/
   ```

2. **Instalar dependencias**:
   ```bash
   cd /volume1/web/firmeza-erp/
   npm install
   ```

3. **Configurar variables de entorno**:
   - El sistema ya viene configurado con las credenciales de Supabase
   - Verificar que las credenciales sean correctas

4. **Compilar la aplicación**:
   ```bash
   npm run build
   ```

5. **Configurar Web Station**:
   - Abrir Panel de Control > Web Station
   - Crear nuevo Virtual Host
   - Apuntar al directorio `/volume1/web/firmeza-erp/dist`
   - Configurar el puerto (ej: 3000)

6. **Configurar el dominio**:
   - En el DNS del dominio, apuntar a la IP del Synology
   - Configurar el puerto en el router (reenvío de puerto)

### Estructura de Archivos

```
firmeza-erp/
├── public/
│   └── logo_firmeza.png          # Logo de la empresa
├── src/
│   ├── components/               # Componentes reutilizables
│   │   ├── Layout.tsx
│   │   ├── Sidebar.tsx
│   │   └── Header.tsx
│   ├── pages/                    # Páginas principales
│   │   ├── Dashboard.tsx
│   │   ├── Empleados.tsx
│   │   ├── Clientes.tsx
│   │   ├── Obras.tsx
│   │   ├── Facturas.tsx
│   │   ├── Proveedores.tsx
│   │   ├── Presupuestos.tsx
│   │   ├── OrdenesCompra.tsx
│   │   ├── Nominas.tsx
│   │   └── ...
│   ├── lib/
│   │   └── supabase.ts          # Configuración Supabase
│   ├── App.tsx                   # Aplicación principal
│   ├── main.tsx                  # Entry point
│   └── index.css                 # Estilos globales
├── package.json
├── vite.config.ts
├── tailwind.config.js
├── tsconfig.json
└── README.md
```

## Configuración de Base de Datos

El sistema utiliza **Supabase** como backend. La base de datos incluye las siguientes tablas:

### Tablas Principales

- `empleados` - Personal de la empresa
- `clientes` - Base de datos de clientes
- `proveedores` - Proveedores y contratistas
- `obras` - Proyectos y obras de construcción
- `facturas` - Sistema de facturación
- `presupuestos` - Cotizaciones y presupuestos
- `ordenes_compra` - Órdenes a proveedores
- `ordenes_trabajo` - Órdenes a empleados
- `inventario_items` - Stock de materiales
- `nominas` - Procesamiento de nóminas

## Funcionalidades por Módulo

### 📊 Dashboard
- KPIs en tiempo real
- Gráficos de ingresos vs gastos
- Estado de obras activas
- Alertas y notificaciones
- Actividades recientes

### 👥 RRHH
- **Empleados**: CRUD completo con datos personales
- **Contratos**: Gestión de tipos de contrato
- **Nóminas**: Cálculo automático de:
  - Salario base
  - Horas extras
  - IPS (9%)
  - Renta (2.5%)
  - Total neto

### 🏢 Gestión Comercial
- **Clientes**: RUC, razón social, tipo de contribuyente
- **Proveedores**: Categorías, contactos
- **Obras**: Código, presupuesto, avance, estado

### 🧾 Facturación
- **Facturas**: Numeración, IVA 10%, RCI 30%
- **Presupuestos**: Validez, estados (borrador, enviado, aprobado)
- **Órdenes de Compra**: A proveedores
- **Órdenes de Trabajo**: A empleados

### 📦 Inventario
- Control de stock
- Alertas de stock mínimo
- Categorización de materiales
- Precios unitarios

## Cumplimiento Legal Paraguayo

### Tributación
- ✅ **IVA 10%**: Cálculo automático en todas las facturas
- ✅ **IPS 9%**: Descuento automático en nóminas de empleados
- ✅ **Renta 2.5%**: Retención en empleados
- ✅ **RCI 30%**: Para contratistas independientes
- ✅ **Timbrado**: Control de vigencia de timbrado fiscal
- ✅ **RUT Digital**: Validación de tipos de contribuyente

### Reportes Fiscales
- Declaración mensual IVA para DGI
- Certificación de ingresos anual
- Libro de compras y ventas
- Reportes para IPS y Ministerio de Trabajo

## Soporte y Mantenimiento

### Actualizaciones
```bash
# Para actualizar el sistema
git pull origin main
npm install
npm run build
```

### Backup
- **Base de datos**: Configurar backup automático en Supabase
- **Archivos**: Backup regular de la carpeta del proyecto
- **Configuración**: Exportar configuración de empresa

### Monitoreo
- Logs de aplicación en `/var/log/`
- Monitoreo de Supabase desde el dashboard
- Alertas por email configurables

## Contacto y Soporte

**Firmeza Contracciones S.A.**
- Sistema ERP desarrollado por MiniMax Agent
- Versión: 1.0.0
- Compatible con: Synology DSM 7.0+
- Base de datos: Supabase PostgreSQL

---

*Este sistema ha sido desarrollado específicamente para Firmeza Contracciones, cumpliendo con toda la legislación vigente de Paraguay y las necesidades específicas de una empresa constructora.*