# ESTRUCTURA DE CSS UNIFICADA - Bazar de Barrio

## 📋 Descripción General

Se ha implementado un sistema de CSS unificado y modular donde:
- **base.css**: Contiene todos los estilos comunes (sidebar, topbar, variables, tipografía, componentes base)
- **Archivos específicos**: Cada sección tiene su propio archivo con estilos particulares

---

## 📁 Estructura de Carpetas

```
Diseño FrontEnd/
├── diseño CSS/
│   └── base.css                    ← ARCHIVO BASE (estilos comunes)
│
├── menu/
│   ├── menu.html
│   ├── menu.js
│   └── menu-estilos.css           ← Estilos específicos del menú
│
├── Empleados - HTML CSS JS/
│   ├── Empleados.html
│   ├── empleados.js
│   └── empleados-estilos.css      ← Estilos específicos
│
├── Inventario - HTML BAzar/
│   ├── Inventario.html
│   ├── inventario.js
│   └── inventario-estilos.css     ← Estilos específicos
│
├── Analitica - HTML CSS JS/
│   ├── analitica.html
│   ├── codeCharts.js
│   └── analitica-estilos.css      ← Estilos específicos
│
├── Proveedores - HTML CSS JS/
│   ├── Proveedores.html
│   ├── proveedores.js
│   └── proveedores-estilos.css    ← Estilos específicos
│
└── inicioRegistro/
    ├── inicioSesion.html
    ├── formularioRegistro.html
    ├── sesion.js
    └── init-estilos.css           ← Estilos específicos
```

---

## 🎨 ¿Qué contiene base.css?

Estilos globales y reutilizables:
- **Variables CSS** (colores, fuentes, tamaños)
- **Sidebar** (menú lateral con animaciones)
- **Topbar** (barra superior)
- **Botón hamburguesa** con animación a X
- **Tipografía** (Anton, Lato)
- **Componentes base** (botones, tablas, modales, etc.)
- **Estilos de formularios** básicos

---

## 📄 ¿Qué contiene cada archivo específico?

### menu-estilos.css
- Estilos del contenedor #menu
- Tarjetas: #inventario, #estadisticas, #empleados, #proveedores

### empleados-estilos.css
- .tabla-empleados (tabla de empleados)
- .titulo-empleados
- Botones de acción específicos

### inventario-estilos.css
- .tabla-productos
- .titulo-productos
- Buscador específico del inventario

### analitica-estilos.css
- .filters (filtros)
- .charts (gráficos)
- .tabla-analitica

### proveedores-estilos.css
- .tabla-proveedores
- .titulo-proveedores
- Estilos de botones

### init-estilos.css
- Estilos de login/registro
- Formularios
- Topbar sin sidebar

---

## 🔗 Cómo se usan en los HTML

Cada archivo HTML ahora enlaza:

```html
<!-- Archivo base con estilos comunes -->
<link rel="stylesheet" href="../diseño CSS/base.css">

<!-- Archivo específico con estilos propios -->
<link rel="stylesheet" href="menu-estilos.css">
```

**Nota sobre rutas:**
- Desde `menu/`: `../diseño CSS/base.css` (sube un nivel)
- Desde `Empleados - HTML CSS JS/`: `../../diseño CSS/base.css` (sube dos niveles)
- Desde `inicioRegistro/`: `../diseño CSS/base.css` (sube un nivel)

---

## 🎯 Ventajas de esta estructura

✅ **Mantenibilidad**: Cambios comunes en un solo lugar  
✅ **Modularidad**: Cada sección es independiente  
✅ **Legibilidad**: Código organizado y claro  
✅ **Reutilización**: Sidebar y topbar compartidos en todas partes  
✅ **Escalabilidad**: Fácil agregar nuevas secciones  
✅ **Rendimiento**: CSS optimizado y sin duplicación  

---

## 📝 Nota sobre archivos antiguos

Los archivos CSS antiguos están disponibles si necesitas hacer referencia:
- menu.css
- empleados.css (en CSS/)
- inventario.css
- analiticaStyle.css
- proveedores.css
- sesion.css, sesion_final.css

Puedes eliminarlos una vez confirmes que todo funciona correctamente.

---

## 🔧 Para agregar nuevas secciones

1. Crea la carpeta de la nueva sección
2. Crea un archivo HTML
3. Enlaza base.css: `<link rel="stylesheet" href="../diseño CSS/base.css">`
4. Crea tu archivo de estilos específicos
5. Enlaza tus estilos: `<link rel="stylesheet" href="tu-seccion-estilos.css">`

---

## 📌 Variables CSS disponibles

Definidas en base.css:

```css
:root {
    --sidebar-width: 10%;
    --color-principal: #8B0000;
    --color-hover: #a10000;
    --color-background: #f9f9f9;
    --color-white: #ffffff;
    --color-text: #222222;
    --font-main: 'Lato', sans-serif;
    --font-title: 'Anton', sans-serif;
}
```

Úsalas en tus estilos: `color: var(--color-principal);`

---

## ✨ Cambios realizados

✅ Creada carpeta `diseño CSS`  
✅ Creado archivo base.css con estilos comunes  
✅ Creados archivos específicos para cada sección  
✅ Actualizado todos los HTML para usar nueva estructura  
✅ Sidebar y Topbar unificados en todas las secciones  
✅ CSS consolidado sin duplicación  

**Fecha**: 18 de Marzo, 2026
