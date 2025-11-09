# 📥 INSTRUCCIONES DE DESCARGA Y INSTALACIÓN

## ¿Qué contiene este paquete?
- ✅ Código fuente completo del ERP
- ✅ Scripts de instalación para Synology
- ✅ Base de datos SQL
- ✅ Configuraciones necesarias
- ✅ Documentación completa

## Pasos para instalar:

### 1. Configurar Supabase
1. Ir a su proyecto Supabase
2. Ejecutar el archivo: firmeza-database.sql
3. Verificar que se crearon 10 tablas

### 2. Instalar dependencias
```bash
npm install
```

### 3. Generar build de producción
```bash
npm run build
```

### 4. Desplegar en Synology
```bash
# Opción 1: Automático
chmod +x install-synology.sh
./install-synology.sh

# Opción 2: Manual
# Subir carpeta dist/ a su servidor Synology
```

### 5. Configurar Nginx
- Usar la configuración: nginx-firmeza.conf
- Reiniciar el servicio web

## Soporte
- Documentación: README.md
- Instalación rápida: INSTALACION-RAPIDA.md
- Guía completa: GUIA-DESCARGA-COMPLETA.md

¡ERP listo para usar! 🚀
