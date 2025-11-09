-- Script SQL para crear las tablas de Firmeza ERP
-- Empresa Constructora Paraguaya - Firmeza Contracciones
-- Versión: 1.0.0

-- =====================================================
-- TABLA: empleados
-- =====================================================
CREATE TABLE IF NOT EXISTS empleados (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    cedula VARCHAR(20) NOT NULL UNIQUE,
    nombres VARCHAR(100) NOT NULL,
    apellidos VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    telefono VARCHAR(20) NOT NULL,
    direccion TEXT NOT NULL,
    fecha_nacimiento DATE NOT NULL,
    fecha_ingreso DATE NOT NULL,
    cargo VARCHAR(100) NOT NULL,
    salario DECIMAL(15,2) NOT NULL,
    estado_civil VARCHAR(20) NOT NULL,
    tipo_contrato VARCHAR(20) NOT NULL CHECK (tipo_contrato IN ('indefinido', 'temporal', 'obra_determinada')),
    numero_ips VARCHAR(50) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- TABLA: clientes
-- =====================================================
CREATE TABLE IF NOT EXISTS clientes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    ruc VARCHAR(20) NOT NULL UNIQUE,
    razon_social VARCHAR(200) NOT NULL,
    nombre_fantasia VARCHAR(200),
    direccion TEXT NOT NULL,
    telefono VARCHAR(20) NOT NULL,
    email VARCHAR(150) NOT NULL,
    ciudad VARCHAR(100) NOT NULL,
    tipo_contribuyente VARCHAR(20) NOT NULL CHECK (tipo_contribuyente IN ('iva', 'exento', 'no_habitual')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- TABLA: proveedores
-- =====================================================
CREATE TABLE IF NOT EXISTS proveedores (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    ruc VARCHAR(20) NOT NULL UNIQUE,
    razon_social VARCHAR(200) NOT NULL,
    direccion TEXT NOT NULL,
    telefono VARCHAR(20) NOT NULL,
    email VARCHAR(150) NOT NULL,
    ciudad VARCHAR(100) NOT NULL,
    categoria VARCHAR(100) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- TABLA: obras
-- =====================================================
CREATE TABLE IF NOT EXISTS obras (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    codigo_obra VARCHAR(50) NOT NULL UNIQUE,
    nombre VARCHAR(200) NOT NULL,
    cliente_id UUID NOT NULL REFERENCES clientes(id) ON DELETE CASCADE,
    direccion TEXT NOT NULL,
    ciudad VARCHAR(100) NOT NULL,
    fecha_inicio DATE NOT NULL,
    fecha_fin_estimada DATE NOT NULL,
    fecha_fin_real DATE,
    presupuesto_total DECIMAL(15,2) NOT NULL,
    avance_porcentaje DECIMAL(5,2) DEFAULT 0,
    estado VARCHAR(20) NOT NULL CHECK (estado IN ('planificacion', 'en_ejecucion', 'pausada', 'finalizada', 'cancelada')),
    arquitecto_responsable VARCHAR(100) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- TABLA: facturas
-- =====================================================
CREATE TABLE IF NOT EXISTS facturas (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    numero_factura VARCHAR(50) NOT NULL UNIQUE,
    fecha_emision DATE NOT NULL,
    fecha_vencimiento DATE NOT NULL,
    cliente_id UUID NOT NULL REFERENCES clientes(id) ON DELETE CASCADE,
    obra_id UUID NOT NULL REFERENCES obras(id) ON DELETE CASCADE,
    subtotal DECIMAL(15,2) NOT NULL,
    iva_10 DECIMAL(15,2) NOT NULL,
    rci_30 DECIMAL(15,2) DEFAULT 0,
    total DECIMAL(15,2) NOT NULL,
    estado VARCHAR(20) NOT NULL CHECK (estado IN ('borrador', 'emitida', 'pagada', 'vencida', 'anulada')),
    observaciones TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- TABLA: presupuestos
-- =====================================================
CREATE TABLE IF NOT EXISTS presupuestos (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    numero_presupuesto VARCHAR(50) NOT NULL UNIQUE,
    fecha DATE NOT NULL,
    cliente_id UUID NOT NULL REFERENCES clientes(id) ON DELETE CASCADE,
    obra_id UUID REFERENCES obras(id) ON DELETE SET NULL,
    validez_dias INTEGER NOT NULL DEFAULT 30,
    subtotal DECIMAL(15,2) NOT NULL,
    iva_10 DECIMAL(15,2) NOT NULL,
    total DECIMAL(15,2) NOT NULL,
    estado VARCHAR(20) NOT NULL CHECK (estado IN ('borrador', 'enviado', 'aprobado', 'rechazado', 'vencido')),
    observaciones TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- TABLA: ordenes_compra
-- =====================================================
CREATE TABLE IF NOT EXISTS ordenes_compra (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    numero_orden VARCHAR(50) NOT NULL UNIQUE,
    fecha DATE NOT NULL,
    proveedor_id UUID NOT NULL REFERENCES proveedores(id) ON DELETE CASCADE,
    obra_id UUID NOT NULL REFERENCES obras(id) ON DELETE CASCADE,
    subtotal DECIMAL(15,2) NOT NULL,
    iva_10 DECIMAL(15,2) NOT NULL,
    total DECIMAL(15,2) NOT NULL,
    estado VARCHAR(20) NOT NULL CHECK (estado IN ('borrador', 'enviada', 'recibida', 'pagada', 'cancelada')),
    observaciones TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- TABLA: ordenes_trabajo
-- =====================================================
CREATE TABLE IF NOT EXISTS ordenes_trabajo (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    numero_orden VARCHAR(50) NOT NULL UNIQUE,
    fecha DATE NOT NULL,
    obra_id UUID NOT NULL REFERENCES obras(id) ON DELETE CASCADE,
    empleado_id UUID NOT NULL REFERENCES empleados(id) ON DELETE CASCADE,
    descripcion TEXT NOT NULL,
    horas_trabajadas DECIMAL(5,2) NOT NULL,
    tarifahora DECIMAL(10,2) NOT NULL,
    subtotal DECIMAL(15,2) NOT NULL,
    estado VARCHAR(20) NOT NULL CHECK (estado IN ('pendiente', 'en_proceso', 'completada', 'facturada')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- TABLA: inventario_items
-- =====================================================
CREATE TABLE IF NOT EXISTS inventario_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    codigo VARCHAR(50) NOT NULL UNIQUE,
    nombre VARCHAR(200) NOT NULL,
    descripcion TEXT,
    categoria VARCHAR(100) NOT NULL,
    unidad_medida VARCHAR(20) NOT NULL,
    precio_unitario DECIMAL(10,2) NOT NULL,
    stock_actual INTEGER NOT NULL DEFAULT 0,
    stock_minimo INTEGER NOT NULL DEFAULT 0,
    proveedor_id UUID REFERENCES proveedores(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- TABLA: nominas
-- =====================================================
CREATE TABLE IF NOT EXISTS nominas (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    periodo VARCHAR(7) NOT NULL, -- Formato: YYYY-MM
    fecha_pago DATE NOT NULL,
    empleado_id UUID NOT NULL REFERENCES empleados(id) ON DELETE CASCADE,
    salario_base DECIMAL(15,2) NOT NULL,
    horas_extras DECIMAL(5,2) DEFAULT 0,
    total_horas_extras DECIMAL(10,2) DEFAULT 0,
    descuento_ips DECIMAL(10,2) NOT NULL, -- 9% en Paraguay
    descuento_renta DECIMAL(10,2) NOT NULL, -- 2.5% en Paraguay
    total_descuentos DECIMAL(10,2) NOT NULL,
    total_neto DECIMAL(15,2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- ÍNDICES PARA OPTIMIZACIÓN
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_empleados_cedula ON empleados(cedula);
CREATE INDEX IF NOT EXISTS idx_empleados_cargo ON empleados(cargo);
CREATE INDEX IF NOT EXISTS idx_clientes_ruc ON clientes(ruc);
CREATE INDEX IF NOT EXISTS idx_proveedores_ruc ON proveedores(ruc);
CREATE INDEX IF NOT EXISTS idx_obras_codigo ON obras(codigo_obra);
CREATE INDEX IF NOT EXISTS idx_obras_estado ON obras(estado);
CREATE INDEX IF NOT EXISTS idx_facturas_numero ON facturas(numero_factura);
CREATE INDEX IF NOT EXISTS idx_facturas_cliente ON facturas(cliente_id);
CREATE INDEX IF NOT EXISTS idx_presupuestos_numero ON presupuestos(numero_presupuesto);
CREATE INDEX IF NOT EXISTS idx_inventario_codigo ON inventario_items(codigo);
CREATE INDEX IF NOT EXISTS idx_inventario_categoria ON inventario_items(categoria);

-- =====================================================
-- TRIGGERS PARA UPDATED_AT
-- =====================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_empleados_updated_at BEFORE UPDATE ON empleados
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_clientes_updated_at BEFORE UPDATE ON clientes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_proveedores_updated_at BEFORE UPDATE ON proveedores
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_obras_updated_at BEFORE UPDATE ON obras
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_facturas_updated_at BEFORE UPDATE ON facturas
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_presupuestos_updated_at BEFORE UPDATE ON presupuestos
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ordenes_compra_updated_at BEFORE UPDATE ON ordenes_compra
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ordenes_trabajo_updated_at BEFORE UPDATE ON ordenes_trabajo
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_inventario_items_updated_at BEFORE UPDATE ON inventario_items
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_nominas_updated_at BEFORE UPDATE ON nominas
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- DATOS DE EJEMPLO (OPCIONAL)
-- =====================================================
-- Se pueden agregar datos de ejemplo aquí si es necesario
-- Comentar las siguientes líneas si no se desean datos de prueba

/*
INSERT INTO clientes (ruc, razon_social, nombre_fantasia, direccion, telefono, email, ciudad, tipo_contribuyente) 
VALUES 
('80012345-7', 'Empresa ABC S.A.', 'ABC Construcciones', 'Avda. Eusebio Ayala 1234', '(021) 123-456', 'info@abc.com.py', 'Asunción', 'iva'),
('80098765-4', 'Inmobiliaria XYZ Ltda.', 'XYZ Inmobiliaria', 'Calle Palma 567', '(021) 789-123', 'contacto@xyz.com.py', 'Asunción', 'iva');

INSERT INTO empleados (cedula, nombres, apellidos, email, telefono, direccion, fecha_nacimiento, fecha_ingreso, cargo, salario, estado_civil, tipo_contrato, numero_ips)
VALUES
('1.234.567', 'Juan Carlos', 'González', 'juan.gonzalez@firmeza.com', '(021) 111-222', 'Barrio Villa Elisa', '1985-03-15', '2020-01-15', 'Arquitecto', 8000000, 'casado', 'indefinido', '1234567'),
('2.345.678', 'María José', 'López', 'maria.lopez@firmeza.com', '(021) 333-444', 'Barrio San Lorenzo', '1990-07-22', '2021-06-01', 'Ingeniero Civil', 7500000, 'soltero', 'indefinido', '2345678');
*/

-- =====================================================
-- VERIFICACIÓN FINAL
-- =====================================================
SELECT 'Firmeza ERP Database Setup Complete!' as status;