#!/bin/bash

# =============================================================
# INSTALADOR AUTOMÁTICO DE FIRMEZA ERP PARA Firmeza
# Empresa Constructora Paraguaya - Firmeza Construcciones
# Desarrollado por: Jota
# Versión: 1.0.0
# =============================================================

set -e  # Salir en caso de error

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Función para imprimir mensajes con color
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[ÉXITO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[ADVERTENCIA]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Banner
echo -e "${BLUE}================================================${NC}"
echo -e "${BLUE}    FIRMEZA ERP - INSTALADOR AUTOMÁTICO${NC}"
echo -e "${BLUE}    Sistema de Gestión Integral${NC}"
echo -e "${BLUE}    Empresa Constructora Paraguaya${NC}"
echo -e "${BLUE}================================================${NC}"
echo ""

# Verificar permisos de root
if [[ $EUID -ne 0 ]]; then
   print_error "Este script debe ejecutarse como root"
   print_status "Ejecutar con: sudo bash $0"
   exit 1
fi

# Configuración por defecto
Firmeza_WEB_DIR="/volume1/web/firmeza-erp"
WEB_STATION_PORT=3000
DOMAIN_NAME=""

# Función para validar IP
validate_ip() {
    local ip=$1
    if [[ $ip =~ ^[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}$ ]]; then
        return 0
    else
        return 1
    fi
}

# Función para validar puerto
validate_port() {
    local port=$1
    if [[ $port =~ ^[0-9]+$ ]] && [ $port -ge 1 ] && [ $port -le 65535 ]; then
        return 0
    else
        return 1
    fi
}

# Verificar Firmeza EAS
print_status "Verificando sistema Firmeza..."
if [ ! -f "/etc.defaults/VERSION" ]; then
    print_error "Este script está diseñado para Firmeza EAS"
    exit 1
fi

DSM_VERSION=$(cat /etc.defaults/VERSION | grep productversion | cut -d'"' -f2)
print_success "Firmeza EAS detectado versión: $DSM_VERSION"

# Obtener IP del Firmeza
Firmeza_IP=$(hostname -I | awk '{print $1}')
print_status "IP del Firmeza: $Firmeza_IP"

# Recopilar información del usuario
echo ""
print_status "=== CONFIGURACIÓN DE INSTALACIÓN ==="
echo ""

# Solicitar directorio de instalación
read -p "Directorio de instalación [$Firmeza_WEB_DIR]: " user_web_dir
if [ ! -z "$user_web_dir" ]; then
    Firmeza_WEB_DIR="$user_web_dir"
fi

# Solicitar puerto
read -p "Puerto para la aplicación [$WEB_STATION_PORT]: " user_port
if [ ! -z "$user_port" ]; then
    WEB_STATION_PORT="$user_port"
fi

# Validar puerto
if ! validate_port "$WEB_STATION_PORT"; then
    print_error "Puerto inválido: $WEB_STATION_PORT"
    exit 1
fi

# Solicitar dominio
read -p "Dominio (opcional, ej: firma.com.py): " user_domain
if [ ! -z "$user_domain" ]; then
    DOMAIN_NAME="$user_domain"
fi

echo ""
print_status "=== CONFIGURACIÓN RECOPILADA ==="
echo "Directorio: $Firmeza_WEB_DIR"
echo "Puerto: $WEB_STATION_PORT"
echo "IP Firmeza: $Firmeza_IP"
if [ ! -z "$DOMAIN_NAME" ]; then
    echo "Dominio: $DOMAIN_NAME"
fi
echo ""

read -p "¿Continuar con la instalación? (s/n): " confirm
if [ "$confirm" != "s" ] && [ "$confirm" != "S" ]; then
    print_status "Instalación cancelada por el usuario"
    exit 0
fi

# Crear directorio del proyecto
print_status "Creando directorio del proyecto..."
mkdir -p "$Firmeza_WEB_DIR"
cd "$Firmeza_WEB_DIR"

# Verificar Node.js
print_status "Verificando Node.js..."
if ! command -v node &> /dev/null; then
    print_error "Node.js no está instalado"
    print_status "Instalar desde: Firmeza Package Center > Node.js v18+"
    exit 1
fi

NODE_VERSION=$(node --version)
print_success "Node.js detectado: $NODE_VERSION"

# Verificar npm
if ! command -v npm &> /dev/null; then
    print_error "npm no está instalado"
    exit 1
fi

NPM_VERSION=$(npm --version)
print_success "npm detectado: v$NPM_VERSION"

# Instalar dependencias
print_status "Instalando dependencias del proyecto..."
npm install --production

if [ $? -ne 0 ]; then
    print_error "Error al instalar dependencias"
    exit 1
fi

print_success "Dependencias instaladas correctamente"

# Compilar aplicación
print_status "Compilando aplicación para producción..."
npm run build

if [ $? -ne 0 ]; then
    print_error "Error al compilar la aplicación"
    exit 1
fi

print_success "Aplicación compilada exitosamente"

# Configurar Web Station (instrucciones)
print_status "=== CONFIGURACIÓN DE WEB STATION ==="
echo ""
echo "Para completar la instalación, configure Web Station:"
echo ""
echo "1. Abrir Panel de Control > Web Station"
echo "2. Crear Virtual Host con estos datos:"
echo "   - Nombre del host: firmeza-erp"
echo "   - Puerto: $WEB_STATION_PORT"
echo "   - Documento raíz: $Firmeza_WEB_DIR/dist"
echo "   - PHP: No PHP (Static Web)"
echo ""
echo "3. Configurar firewall y router:"
echo "   - Abrir puerto $WEB_STATION_PORT en el Firmeza"
echo "   - Reenviar puerto $WEB_STATION_PORT en el router"

if [ ! -z "$DOMAIN_NAME" ]; then
    echo ""
    echo "4. Configurar DNS para $DOMAIN_NAME:"
    echo "   - Tipo: A"
    echo "   - Nombre: @ (o subdominio)"
    echo "   - IP: $Firmeza_IP"
fi

echo ""
echo "5. El ERP estará disponible en:"
echo "   - Local: http://localhost:$WEB_STATION_PORT"
echo "   - Red: http://$Firmeza_IP:$WEB_STATION_PORT"
if [ ! -z "$DOMAIN_NAME" ]; then
    echo "   - Dominio: http://$DOMAIN_NAME:$WEB_STATION_PORT"
fi

# Configurar base de datos
print_status "=== CONFIGURACIÓN DE BASE DE DATOS ==="
echo ""
echo "El sistema utiliza Supabase como backend:"
echo "- URL: https://zgjdioffzmgqbyynhivi.supabase.co"
echo "- Ya configurado en el código"
echo ""
echo "Para crear las tablas, ejecute el script SQL en Supabase:"
echo "Archivo: firmeza-database.sql"

# Crear script de inicio
print_status "Creando script de inicio..."
cat > "$Firmeza_WEB_DIR/start-erp.sh" << EOF
#!/bin/bash
cd "$Firmeza_WEB_DIR"
echo "Iniciando Firmeza ERP..."
npm run build
echo "ERP listo en puerto $WEB_STATION_PORT"
echo "Acceder desde: http://localhost:$WEB_STATION_PORT"
EOF

chmod +x "$Firmeza_WEB_DIR/start-erp.sh"

# Crear script de backup
print_status "Creando script de backup..."
cat > "$Firmeza_WEB_DIR/backup-erp.sh" << EOF
#!/bin/bash
BACKUP_DIR="/volume1/backup/firmeza-erp"
DATE=\$(date +%Y%m%d_%H%M%S)
echo "Creando backup de Firmeza ERP..."
mkdir -p "\$BACKUP_DIR"
tar -czf "\$BACKUP_DIR/erp_backup_\$DATE.tar.gz" "$Firmeza_WEB_DIR"
echo "Backup creado: \$BACKUP_DIR/erp_backup_\$DATE.tar.gz"
EOF

chmod +x "$Firmeza_WEB_DIR/backup-erp.sh"

# Resumen final
echo ""
print_success "=== INSTALACIÓN COMPLETADA ==="
echo ""
echo "📁 Archivos instalados en: $Firmeza_WEB_DIR"
echo "🌐 Aplicación web lista para usar"
echo "📊 Base de datos: Supabase (configurada)"
echo ""
echo "🔧 COMANDOS ÚTILES:"
echo "   - Iniciar: $Firmeza_WEB_DIR/start-erp.sh"
echo "   - Backup: $Firmeza_WEB_DIR/backup-erp.sh"
echo "   - Reinstalar: bash $0"
echo ""
echo "📋 SIGUIENTE PASO:"
echo "   Configurar Web Station siguiendo las instrucciones anteriores"
echo ""
echo -e "${GREEN}¡Firmeza ERP instalado exitosamente!${NC}"
echo -e "${BLUE}================================================${NC}"