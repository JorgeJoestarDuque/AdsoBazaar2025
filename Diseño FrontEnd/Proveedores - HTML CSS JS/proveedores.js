/**
 * proveedores.js
 * Sistema de gestion de proveedores.
 * - Carga y muestra la lista de proveedores desde la API
 * - Permite buscar y eliminar proveedores
 * - Gestiona modales de confirmacion y notificaciones
 */
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
console.log("proveedores.js cargado");

const API_BASE = "http://localhost:10000/api/proveedor";
let proveedoresCache = [];
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
function renderProveedores(list) {
    const tbody = document.querySelector(".tabla-proveedores tbody");
    if (!tbody) return;
    tbody.innerHTML = "";
    list.forEach(p => {
        const pid = String(p.id ?? p.NIP ?? '');
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td>${p.Nombre ?? 'N/A'}</td>
            <td>${p.NIP ?? 'N/A'}</td>
            <td>${p.NIT ?? 'N/A'}</td>
            <td>${p.Telefono ?? 'N/A'}</td>
            <td class="acciones">
                <button class="btn-accion eliminar" type="button" title="Eliminar" onclick="confirmDelete('${pid}')" aria-label="Eliminar proveedor">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                        <path d="M6 7h12v13a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V7z" fill="white"/>
                        <path d="M9 4h6v2H9z" fill="white"/>
                        <path d="M10 11v6" stroke="#8B0000" stroke-width="1.4" stroke-linecap="round"/>
                        <path d="M14 11v6" stroke="#8B0000" stroke-width="1.4" stroke-linecap="round"/>
                    </svg>
                </button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

// ==================== GET PROVEEDORES ====================
async function cargarProveedores() {
    try {
        console.log("cargarProveedores -> solicitando lista al servidor");
        const resp = await fetch(API_BASE, { method: "GET" });
        if (!resp.ok) throw new Error("GET proveedores falló: " + resp.status);
        const proveedores = await resp.json();
        proveedoresCache = Array.isArray(proveedores) ? proveedores : [];
        renderProveedores(proveedoresCache);
        console.log("cargarProveedores -> completado, items:", proveedoresCache.length);
    } catch (err) {
        console.error("cargarProveedores error:", err);
        showToast("Error cargando proveedores. Revisa consola.", "error");
    }
}

// ==================== CONFIRMACIÓN ELIMINAR ====================
function confirmDelete(id) {
    console.log("confirmDelete -> id:", id);
    pendingDeleteId = id;
    const proveedor = proveedoresCache.find(p => String(p.NIP ?? p.id ?? '') === String(id));
    const nombreProveedor = proveedor ? proveedor.Nombre : id;
    const text = document.getElementById("modal-delete-text");
    if (text) text.textContent = `¿Eliminar proveedor "${nombreProveedor}"?`;
    openModal('modal-delete');
}

// ==================== ELIMINAR (DELETE) ====================
async function eliminarProveedor(id) {
    console.log("eliminarProveedor -> id:", id);
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
            proveedoresCache = proveedoresCache.filter(p => String(p.NIP ?? p.id ?? '') !== String(id));
            renderProveedores(proveedoresCache);
            showToast("Proveedor eliminado correctamente.", "success");
            console.log("eliminarProveedor -> OK");
        } else {
            // ERROR: mostrar solo toast de error
            const msg = bodyText || `Error ${resp.status}`;
            showToast("No se pudo eliminar el proveedor: " + msg, "error");
            console.error("eliminarProveedor -> DELETE falló:", msg);
        }
    } catch (err) {
        console.error("eliminarProveedor error:", err);
        showToast("No se pudo eliminar el proveedor. Revisa la consola.", "error");
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
function filtrarProveedores(term) {
    if (!term) { 
        renderProveedores(proveedoresCache); 
        return; 
    }
    const t = term.trim().toLowerCase();
    const filtered = proveedoresCache.filter(p => {
        // Buscar en todos los campos
        const nombre = String(p.Nombre ?? '').toLowerCase();
        const nip = String(p.NIP ?? '').toLowerCase();
        const nit = String(p.NIT ?? '').toLowerCase();
        const telefono = String(p.Telefono ?? '').toLowerCase();
        
        return nombre.includes(t) || nip.includes(t) || nit.includes(t) || telefono.includes(t);
    });
    renderProveedores(filtered);
}

// ==================== INICIALIZACIÓN ====================
document.addEventListener("DOMContentLoaded", () => {
    console.log("DOMContentLoaded -> inicializando listeners");
    
    cargarProveedores();

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
    if (delConfirm) delConfirm.addEventListener("click", () => { if (pendingDeleteId) eliminarProveedor(pendingDeleteId); });

    // Barra de búsqueda
    const searchInput = document.querySelector('.busqueda');
    if (searchInput) {
        searchInput.addEventListener('input', debounce((e) => {
            filtrarProveedores(e.target.value);
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
