import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://zgjdioffzmgqbyynhivi.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpnamRpb2Zmem1ncWJ5eW5oaXZpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIzMDYzNTUsImV4cCI6MjA3Nzg4MjM1NX0.9xoNJphJK8GZT3wMsZjjlmS4h3isOVd3iCvAPltoDVE'

export const supabase = createClient(supabaseUrl, supabaseKey)

// Tipos para la base de datos
export interface Empleado {
  id: string
  cedula: string
  nombres: string
  apellidos: string
  email: string
  telefono: string
  direccion: string
  fecha_nacimiento: string
  fecha_ingreso: string
  cargo: string
  salario: number
  estado_civil: string
  tipo_contrato: 'indefinido' | 'temporal' | 'obra_determinada'
  numero_ips: string
  created_at: string
  updated_at: string
}

export interface Cliente {
  id: string
  ruc: string
  razon_social: string
  nombre_fantasia: string
  direccion: string
  telefono: string
  email: string
  ciudad: string
  tipo_contribuyente: 'iva' | 'exento' | 'no_habitual'
  created_at: string
  updated_at: string
}

export interface Proveedor {
  id: string
  ruc: string
  razon_social: string
  direccion: string
  telefono: string
  email: string
  ciudad: string
  categoria: string
  created_at: string
  updated_at: string
}

export interface Obra {
  id: string
  codigo_obra: string
  nombre: string
  cliente_id: string
  direccion: string
  ciudad: string
  fecha_inicio: string
  fecha_fin_estimada: string
  fecha_fin_real: string | null
  presupuesto_total: number
  avance_porcentaje: number
  estado: 'planificacion' | 'en_ejecucion' | 'pausada' | 'finalizada' | 'cancelada'
  arquitecto_responsable: string
  created_at: string
  updated_at: string
}

export interface Factura {
  id: string
  numero_factura: string
  fecha_emision: string
  fecha_vencimiento: string
  cliente_id: string
  obra_id: string
  subtotal: number
  iva_10: number
  rci_30: number
  total: number
  estado: 'borrador' | 'emitida' | 'pagada' | 'vencida' | 'anulada'
  observaciones: string
  created_at: string
  updated_at: string
}

export interface Presupuesto {
  id: string
  numero_presupuesto: string
  fecha: string
  cliente_id: string
  obra_id: string
  validez_dias: number
  subtotal: number
  iva_10: number
  total: number
  estado: 'borrador' | 'enviado' | 'aprobado' | 'rechazado' | 'vencido'
  observaciones: string
  created_at: string
  updated_at: string
}

export interface OrdenCompra {
  id: string
  numero_orden: string
  fecha: string
  proveedor_id: string
  obra_id: string
  subtotal: number
  iva_10: number
  total: number
  estado: 'borrador' | 'enviada' | 'recibida' | 'pagada' | 'cancelada'
  observaciones: string
  created_at: string
  updated_at: string
}

export interface OrdenTrabajo {
  id: string
  numero_orden: string
  fecha: string
  obra_id: string
  empleado_id: string
  descripcion: string
  horas_trabajadas: number
  tarifahora: number
  subtotal: number
  estado: 'pendiente' | 'en_proceso' | 'completada' | 'facturada'
  created_at: string
  updated_at: string
}

export interface InventarioItem {
  id: string
  codigo: string
  nombre: string
  descripcion: string
  categoria: string
  unidad_medida: string
  precio_unitario: number
  stock_actual: number
  stock_minimo: number
  proveedor_id: string
  created_at: string
  updated_at: string
}

export interface Nómina {
  id: string
  periodo: string
  fecha_pago: string
  empleado_id: string
  salario_base: number
  horas_extras: number
  total_horas_extras: number
  descuento_ips: number
  descuento_renta: number
  total_descuentos: number
  total_neto: number
  created_at: string
  updated_at: string
}

export interface Orden {
  id: number
  numero_orden: string
  tipo: 'trabajo' | 'servicio'
  cliente_id: number
  obra_id: number
  descripcion: string
  fecha_inicio: string
  fecha_fin: string
  estado: 'pendiente' | 'en_proceso' | 'completada' | 'cancelada'
  responsable_id: number
  prioridad: 'baja' | 'media' | 'alta' | 'urgente'
  monto_estimado: number
  observaciones?: string
  created_at: string
  updated_at: string
}

// FUNCIONES CRUD PARA EMPLEADOS
export const createEmpleado = async (empleado: Omit<Empleado, 'id' | 'created_at' | 'updated_at'>) => {
  const { data, error } = await supabase
    .from('empleados')
    .insert([empleado])
    .select()
    .single()
  
  if (error) throw error
  return data
}

export const fetchEmpleados = async () => {
  const { data, error } = await supabase
    .from('empleados')
    .select('*')
    .order('created_at', { ascending: false })
  
  if (error) throw error
  return data
}

export const updateEmpleado = async (id: string, empleado: Partial<Empleado>) => {
  const { data, error } = await supabase
    .from('empleados')
    .update(empleado)
    .eq('id', id)
    .select()
    .single()
  
  if (error) throw error
  return data
}

export const deleteEmpleado = async (id: string) => {
  const { error } = await supabase
    .from('empleados')
    .delete()
    .eq('id', id)
  
  if (error) throw error
}

// FUNCIONES CRUD PARA CLIENTES
export const createCliente = async (cliente: Omit<Cliente, 'id' | 'created_at' | 'updated_at'>) => {
  const { data, error } = await supabase
    .from('clientes')
    .insert([cliente])
    .select()
    .single()
  
  if (error) throw error
  return data
}

export const fetchClientes = async () => {
  const { data, error } = await supabase
    .from('clientes')
    .select('*')
    .order('razon_social')
  
  if (error) throw error
  return data
}

export const updateCliente = async (id: string, cliente: Partial<Cliente>) => {
  const { data, error } = await supabase
    .from('clientes')
    .update(cliente)
    .eq('id', id)
    .select()
    .single()
  
  if (error) throw error
  return data
}

export const deleteCliente = async (id: string) => {
  const { error } = await supabase
    .from('clientes')
    .delete()
    .eq('id', id)
  
  if (error) throw error
}

// FUNCIONES CRUD PARA PROVEEDORES
export const createProveedor = async (proveedor: Omit<Proveedor, 'id' | 'created_at' | 'updated_at'>) => {
  const { data, error } = await supabase
    .from('proveedores')
    .insert([proveedor])
    .select()
    .single()
  
  if (error) throw error
  return data
}

export const fetchProveedores = async () => {
  const { data, error } = await supabase
    .from('proveedores')
    .select('*')
    .order('razon_social')
  
  if (error) throw error
  return data
}

export const updateProveedor = async (id: string, proveedor: Partial<Proveedor>) => {
  const { data, error } = await supabase
    .from('proveedores')
    .update(proveedor)
    .eq('id', id)
    .select()
    .single()
  
  if (error) throw error
  return data
}

export const deleteProveedor = async (id: string) => {
  const { error } = await supabase
    .from('proveedores')
    .delete()
    .eq('id', id)
  
  if (error) throw error
}

// FUNCIONES CRUD PARA OBRAS
export const createObra = async (obra: Omit<Obra, 'id' | 'created_at' | 'updated_at'>) => {
  const { data, error } = await supabase
    .from('obras')
    .insert([obra])
    .select()
    .single()
  
  if (error) throw error
  return data
}

export const fetchObras = async () => {
  const { data, error } = await supabase
    .from('obras')
    .select('*')
    .order('created_at', { ascending: false })
  
  if (error) throw error
  return data
}

export const updateObra = async (id: string, obra: Partial<Obra>) => {
  const { data, error } = await supabase
    .from('obras')
    .update(obra)
    .eq('id', id)
    .select()
    .single()
  
  if (error) throw error
  return data
}

export const deleteObra = async (id: string) => {
  const { error } = await supabase
    .from('obras')
    .delete()
    .eq('id', id)
  
  if (error) throw error
}

// FUNCIONES CRUD PARA ÓRDENES DE TRABAJO Y SERVICIO
export const createOrden = async (orden: Omit<Orden, 'id' | 'created_at' | 'updated_at'>) => {
  const { data, error } = await supabase
    .from('ordenes')
    .insert([orden])
    .select(`
      *,
      clientes (nombre, email),
      obras (nombre, ubicacion),
      empleados (nombre, cargo)
    `)
    .single()
  
  if (error) throw error
  return data
}

export const fetchOrdenes = async () => {
  const { data, error } = await supabase
    .from('ordenes')
    .select(`
      *,
      clientes (nombre, email),
      obras (nombre, ubicacion),
      empleados (nombre, cargo)
    `)
    .order('created_at', { ascending: false })
  
  if (error) throw error
  return data
}

export const updateOrden = async (id: number, orden: Partial<Orden>) => {
  const { data, error } = await supabase
    .from('ordenes')
    .update(orden)
    .eq('id', id)
    .select(`
      *,
      clientes (nombre, email),
      obras (nombre, ubicacion),
      empleados (nombre, cargo)
    `)
    .single()
  
  if (error) throw error
  return data
}

export const deleteOrden = async (id: number) => {
  const { error } = await supabase
    .from('ordenes')
    .delete()
    .eq('id', id)
  
  if (error) throw error
}

// FUNCIONES CRUD PARA FACTURAS
export const createFactura = async (factura: Omit<Factura, 'id' | 'created_at' | 'updated_at'>) => {
  const { data, error } = await supabase
    .from('facturas')
    .insert([factura])
    .select()
    .single()
  
  if (error) throw error
  return data
}

export const fetchFacturas = async () => {
  const { data, error } = await supabase
    .from('facturas')
    .select('*')
    .order('created_at', { ascending: false })
  
  if (error) throw error
  return data
}

export const updateFactura = async (id: string, factura: Partial<Factura>) => {
  const { data, error } = await supabase
    .from('facturas')
    .update(factura)
    .eq('id', id)
    .select()
    .single()
  
  if (error) throw error
  return data
}

export const deleteFactura = async (id: string) => {
  const { error } = await supabase
    .from('facturas')
    .delete()
    .eq('id', id)
  
  if (error) throw error
}

// FUNCIONES CRUD PARA PRESUPUESTOS
export const createPresupuesto = async (presupuesto: Omit<Presupuesto, 'id' | 'created_at' | 'updated_at'>) => {
  const { data, error } = await supabase
    .from('presupuestos')
    .insert([presupuesto])
    .select()
    .single()
  
  if (error) throw error
  return data
}

export const fetchPresupuestos = async () => {
  const { data, error } = await supabase
    .from('presupuestos')
    .select('*')
    .order('created_at', { ascending: false })
  
  if (error) throw error
  return data
}

export const updatePresupuesto = async (id: string, presupuesto: Partial<Presupuesto>) => {
  const { data, error } = await supabase
    .from('presupuestos')
    .update(presupuesto)
    .eq('id', id)
    .select()
    .single()
  
  if (error) throw error
  return data
}

export const deletePresupuesto = async (id: string) => {
  const { error } = await supabase
    .from('presupuestos')
    .delete()
    .eq('id', id)
  
  if (error) throw error
}

// FUNCIONES CRUD PARA ÓRDENES DE COMPRA
export const createOrdenCompra = async (ordenCompra: Omit<OrdenCompra, 'id' | 'created_at' | 'updated_at'>) => {
  const { data, error } = await supabase
    .from('ordenes_compra')
    .insert([ordenCompra])
    .select()
    .single()
  
  if (error) throw error
  return data
}

export const fetchOrdenesCompra = async () => {
  const { data, error } = await supabase
    .from('ordenes_compra')
    .select('*')
    .order('created_at', { ascending: false })
  
  if (error) throw error
  return data
}

export const updateOrdenCompra = async (id: string, ordenCompra: Partial<OrdenCompra>) => {
  const { data, error } = await supabase
    .from('ordenes_compra')
    .update(ordenCompra)
    .eq('id', id)
    .select()
    .single()
  
  if (error) throw error
  return data
}

export const deleteOrdenCompra = async (id: string) => {
  const { error } = await supabase
    .from('ordenes_compra')
    .delete()
    .eq('id', id)
  
  if (error) throw error
}

// FUNCIONES CRUD PARA NÓMINAS
export const createNomina = async (nomina: Omit<Nómina, 'id' | 'created_at' | 'updated_at'>) => {
  const { data, error } = await supabase
    .from('nominas')
    .insert([nomina])
    .select()
    .single()
  
  if (error) throw error
  return data
}

export const fetchNominas = async () => {
  const { data, error } = await supabase
    .from('nominas')
    .select('*')
    .order('created_at', { ascending: false })
  
  if (error) throw error
  return data
}

export const updateNomina = async (id: string, nomina: Partial<Nómina>) => {
  const { data, error } = await supabase
    .from('nominas')
    .update(nomina)
    .eq('id', id)
    .select()
    .single()
  
  if (error) throw error
  return data
}

export const deleteNomina = async (id: string) => {
  const { error } = await supabase
    .from('nominas')
    .delete()
    .eq('id', id)
  
  if (error) throw error
}