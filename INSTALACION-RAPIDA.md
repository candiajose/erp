# 🚀 INSTALACIÓN RÁPIDA - FIRMEZA ERP

## 📋 Lista de Verificación Previa

✅ **Synology DSM 7.0+ instalado**  
✅ **Node.js v18+ instalado en Synology**  
✅ **Dominio configurado (opcional)**  
✅ **Puerto disponible en el router**  

---

## ⚡ Instalación en 5 Pasos

### 1️⃣ **Subir Archivos**
```bash
# Copiar todos los archivos a /volume1/web/firmeza-erp/
```

### 2️⃣ **Ejecutar Instalador Automático**
```bash
cd /volume1/web/firmeza-erp/
sudo bash install-synology.sh
```

### 3️⃣ **Configurar Web Station**
- Panel de Control → Web Station
- Crear Virtual Host:
  - **Puerto**: 3000 (o el configurado)
  - **Documento raíz**: `/volume1/web/firmeza-erp/dist`
  - **PHP**: No PHP (Static Web)

### 4️⃣ **Configurar Router**
- Abrir puerto 3000 en el Synology
- Reenviar puerto 3000 en el router

### 5️⃣ **Configurar Base de Datos**
- Ejecutar `firmeza-database.sql` en Supabase SQL Editor
- URL: https://zgjdioffzmgqbyynhivi.supabase.co

---

## 🌐 Acceso al Sistema

**Local**: `http://localhost:3000`  
**Red**: `http://[IP-SYNOLOGY]:3000`  
**Dominio**: `http://tu-dominio.com:3000`  

---

## 📊 Credenciales de Acceso

**Empleado de Prueba**:
- Usuario: admin
- Contraseña: (configurar en la aplicación)

**Base de Datos**:
- Supabase ya configurado
- Crear tablas con `firmeza-database.sql`

---

## 🏗️ Módulos Disponibles

| Módulo | Funcionalidades | Legislación |
|--------|----------------|-------------|
| **Dashboard** | KPIs, Gráficos, Alertas | - |
| **RRHH** | Empleados, Contratos, Nóminas | IPS 9%, Renta 2.5% |
| **Comercial** | Clientes, Proveedores, Obras | RUT Digital |
| **Facturación** | Facturas, Presupuestos, Órdenes | IVA 10%, RCI 30% |
| **Inventario** | Stock, Alertas, Categorías | - |
| **Reportes** | Financieros, Fiscales | DGI Compatible |

---

## 🔧 Comandos Útiles

```bash
# Iniciar ERP
./start-erp.sh

# Crear backup
./backup-erp.sh

# Reconstruir aplicación
npm run build

# Ver logs
tail -f /var/log/
```

---

## 📞 Soporte

**Empresa**: Firmeza Contracciones S.A.  
**Sistema**: ERP v1.0.0  
**Desarrollado por**: MiniMax Agent  
**Legislación**: Paraguay (IVA 10%, IPS 9%, Renta 2.5%)  

---

## ⚠️ Notas Importantes

1. **Firewall**: Asegurar que el puerto esté abierto
2. **Backup**: Ejecutar backup regularmente
3. **Actualizaciones**: Monitorear actualizaciones de Node.js
4. **Cumplimiento**: Sistema cumple con legislación paraguaya
5. **Supabase**: Backend ya configurado y funcional

¡**Firmeza ERP listo para gestionar tu empresa constructora**! 🏗️