#!/bin/bash

# Script de inicio para Firmeza ERP en Synology
# Autor: MiniMax Agent
# Versión: 1.0.0

echo "================================================"
echo "  FIRMEZA ERP - Sistema de Gestión Integral"
echo "  Empresa Constructora Paraguaya"
echo "================================================"

# Verificar si Node.js está instalado
if ! command -v node &> /dev/null; then
    echo "❌ Node.js no está instalado. Instalar desde el Package Center."
    exit 1
fi

# Verificar versión de Node.js
NODE_VERSION=$(node --version)
echo "✅ Node.js detectado: $NODE_VERSION"

# Verificar si npm está disponible
if ! command -v npm &> /dev/null; then
    echo "❌ npm no está instalado."
    exit 1
fi

# Cambiar al directorio del proyecto
PROJECT_DIR="/volume1/web/firmeza-erp"
if [ ! -d "$PROJECT_DIR" ]; then
    echo "❌ Directorio del proyecto no encontrado: $PROJECT_DIR"
    echo "   Asegúrate de que los archivos estén en la ubicación correcta."
    exit 1
fi

cd "$PROJECT_DIR"
echo "📁 Directorio del proyecto: $(pwd)"

# Verificar si package.json existe
if [ ! -f "package.json" ]; then
    echo "❌ package.json no encontrado. Verificar estructura del proyecto."
    exit 1
fi

echo "📦 Instalando dependencias..."
npm install --production

if [ $? -ne 0 ]; then
    echo "❌ Error al instalar dependencias."
    exit 1
fi

echo "🔨 Compilando aplicación para producción..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Error al compilar la aplicación."
    exit 1
fi

echo "✅ Aplicación compilada exitosamente"
echo ""
echo "📋 Instrucciones para Synology Web Station:"
echo "1. Abrir Panel de Control > Web Station"
echo "2. Crear Virtual Host apuntando a: $PROJECT_DIR/dist"
echo "3. Configurar puerto en el router (ej: 3000)"
echo "4. El ERP estará disponible en: http://tu-ip-synology:puerto"
echo ""
echo "🌐 Configuración de dominio:"
echo "- Configurar DNS para apuntar al Synology"
echo "- Habilitar reenvío de puerto en el router"
echo ""
echo "🗄️ Base de datos:"
echo "- Supabase ya configurado"
echo "- URL: https://zgjdioffzmgqbyynhivi.supabase.co"
echo ""
echo "✅ Firmeza ERP listo para usar!"
echo "================================================"