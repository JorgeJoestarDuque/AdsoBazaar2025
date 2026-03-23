/**
 * empleados.js
 * Sistema de gestion de empleados.
 * - Carga y muestra la lista de empleados desde la API
 * - Permite buscar y eliminar empleados
 * - Gestion de roles y datos de contacto
 * - Maneja modales de confirmacion y notificaciones emergentes
 */

// =======================================================
// empleados.js - Gestion de Empleados
// =======================================================

const btn = document.querySelector('#btn');
const sidebar = document.querySelector('.sidebar');
const body = document.body;

btn.addEventListener('click', () => {
    // 1. Animamos las rayitas del boton (la X)
    btn.classList.toggle('activo');
    
    // 2. Abrimos/cerramos la barra lateral
    sidebar.classList.toggle('active');
    
    // 3. Empujamos todo el contenido de la pagina
    body.classList.toggle('menu-open');
});

console.log("empleados.js cargado");

const API_BASE = "http://localhost:10000/api/usuario";
let usuariosCache = [];
let pendingDeleteId = null;

// ==================== UTILS ====================
function debounce(fn, wait = 150) {
    let t;
    return (...args) => {
        clearTimeout(t);
        t = setTimeout(() => fn(...args), wait);
    };
}

// ==================== TOASTS ====================
function showToast(message, type = 'success', duration = 3500) {
    let container = document.getElementById('toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        container.className = 'toast-container';
        document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = 'toast ' + type;
    
    const content = document.createElement('div');
    content.style.flex = '1';
    content.textContent = message;

    const closeBtn = document.createElement('button');
    closeBtn.innerHTML = '✕';
    Object.assign(closeBtn.style, {
        marginLeft: '8px',
        background: 'transparent',
        border: 'none',
        color: 'rgba(255,255,255,0.9)',
        cursor: 'pointer',
        fontSize: '14px'
    });
    closeBtn.addEventListener('click', () => { toast.remove(); });

    toast.appendChild(content);
    toast.appendChild(closeBtn);
    container.appendChild(toast);
    setTimeout(() => { toast.remove(); }, duration);
}

// ==================== MODALES ====================
function openModal(id) {
    const el = document.getElementById(id);
    if (el) el.style.display = 'block';
}

function closeModal(id) {
    const el = document.getElementById(id);
    if (el) el.style.display = 'none';
}

// ==================== RENDER TABLA ====================
function renderEmpleados(list) {
    const tbody = document.querySelector(".tabla-empleados tbody");
    if (!tbody) return;
    tbody.innerHTML = "";
    list.forEach(u => {
        const uid = String(u.id ?? u.NIT ?? '');
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td>${u.Nombre ?? 'N/A'}</td>
            <td>${u.Email ?? 'N/A'}</td>
            <td>${u.NIT ?? 'N/A'}</td>
            <td>${u.Telefono ?? 'N/A'}</td>
            <td>${u.Rol ?? 'N/A'}</td>
            <td class="acciones">
                <button class="btn-accion eliminar" type="button" title="Eliminar" onclick="confirmDelete('${uid}')" aria-label="Eliminar empleado">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                        <path d="M6 7h12v13a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V7z" fill="currentColor"/>
                        <path d="M9 4h6v2H9z" fill="currentColor"/>
                        <path d="M10 11v6" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/>
                        <path d="M14 11v6" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/>
                    </svg>
                </button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

// ==================== GET USUARIOS ====================
async function cargarEmpleados() {
    try {
        console.log("cargarEmpleados -> solicitando lista al servidor");
        const resp = await fetch(API_BASE, { method: "GET" });
        if (!resp.ok) throw new Error("GET empleados falló: " + resp.status);
        const usuarios = await resp.json();
        usuariosCache = Array.isArray(usuarios) ? usuarios : [];
        renderEmpleados(usuariosCache);
        console.log("cargarEmpleados -> completado, items:", usuariosCache.length);
    } catch (err) {
        console.error("cargarEmpleados error:", err);
        showToast("Error cargando empleados. Revisa consola.", "error");
    }
}

// ==================== CONFIRMACIÓN ELIMINAR ====================
function confirmDelete(id) {
    console.log("confirmDelete -> id:", id);
    pendingDeleteId = id;
    const usuario = usuariosCache.find(u => String(u.NIT ?? u.id ?? '') === String(id));
    const nombreUsuario = usuario ? usuario.Nombre : id;
    const text = document.getElementById("modal-delete-text");
    if (text) text.textContent = `¿Eliminar empleado "${nombreUsuario}"?`;
    openModal('modal-delete');
}

// ==================== ELIMINAR (DELETE) ====================
async function eliminarEmpleado(id) {
    console.log("eliminarEmpleado -> id:", id);
    const delBtn = document.getElementById("modal-delete-confirm");
    
    try {
        if (delBtn) {
            delBtn.disabled = true;
            delBtn.textContent = 'Eliminando...';
        }

        const url = `${API_BASE}/${encodeURIComponent(id)}`;
        console.log("DELETE request a:", url);

        const resp = await fetch(url, { method: "DELETE" });
        const bodyText = await resp.text().catch(()=>null);

        console.log("DELETE response -> status:", resp.status, "body:", bodyText);

        if (resp.ok) {
            // ÉXITO: eliminar del caché, renderizar y mostrar toast éxito
            usuariosCache = usuariosCache.filter(u => String(u.NIT ?? u.id ?? '') !== String(id));
            renderEmpleados(usuariosCache);
            showToast("Empleado eliminado correctamente.", "success");
            console.log("eliminarEmpleado -> OK");
        } else {
            // ERROR: mostrar solo toast de error
            const msg = bodyText || `Error ${resp.status}`;
            showToast("No se pudo eliminar el empleado: " + msg, "error");
            console.error("eliminarEmpleado -> DELETE falló:", msg);
        }
    } catch (err) {
        console.error("eliminarEmpleado error:", err);
        showToast("No se pudo eliminar el empleado. Revisa la consola.", "error");
    } finally {
        if (delBtn) {
            delBtn.disabled = false;
            delBtn.textContent = 'Eliminar';
        }
        pendingDeleteId = null;
        closeModal('modal-delete');
    }
}

// ==================== FILTRADO ====================
function filtrarEmpleados(term) {
    if (!term) { 
        renderEmpleados(usuariosCache); 
        return; 
    }
    const t = term.trim().toLowerCase();
    const filtered = usuariosCache.filter(u => {
        // Buscar en todos los campos excepto Password
        const nombre = String(u.Nombre ?? '').toLowerCase();
        const email = String(u.Email ?? '').toLowerCase();
        const nit = String(u.NIT ?? '').toLowerCase();
        const telefono = String(u.Telefono ?? '').toLowerCase();
        const rol = String(u.Rol ?? '').toLowerCase();
        
        return nombre.includes(t) || email.includes(t) || nit.includes(t) || 
               telefono.includes(t) || rol.includes(t);
    });
    renderEmpleados(filtered);
}

// ==================== INICIALIZACIÓN ====================
document.addEventListener("DOMContentLoaded", () => {
    console.log("DOMContentLoaded -> inicializando listeners");
    
    cargarEmpleados();

    // Cerrar modales
    document.querySelectorAll('.close').forEach(btn => {
        btn.addEventListener('click', () => {
            const m = btn.getAttribute('data-modal');
            if (m) closeModal(m);
        });
    });

    // Botones de confirmación de eliminar
    const delCancel = document.getElementById("modal-delete-cancel");
    const delConfirm = document.getElementById("modal-delete-confirm");
    if (delCancel) delCancel.addEventListener("click", () => { pendingDeleteId = null; closeModal('modal-delete'); });
    if (delConfirm) delConfirm.addEventListener("click", () => { if (pendingDeleteId) eliminarEmpleado(pendingDeleteId); });

    // Barra de búsqueda
    const searchInput = document.querySelector('.busqueda');
    if (searchInput) {
        searchInput.addEventListener('input', debounce((e) => {
            filtrarEmpleados(e.target.value);
        }, 150));
    }

    // Cierre de modal al hacer clic fuera
    window.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal')) {
            e.target.style.display = 'none';
        }
    });

    window.addEventListener('error', (ev) => {
        console.error('Error global capturado:', ev.error || ev.message);
    });
});
