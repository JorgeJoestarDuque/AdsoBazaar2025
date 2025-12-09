// =======================================================
// inventario.js - Limpio sin duplicados
// =======================================================

console.log("inventario.js cargado");

const API_BASE = "http://localhost:10000/api/producto";
let productsCache = [];
let editingId = null;
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
        Object.assign(container.style, {
            position: 'fixed',
            right: '16px',
            bottom: '16px',
            zIndex: 9999,
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            alignItems: 'flex-end'
        });
        document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = 'toast ' + type;
    Object.assign(toast.style, {
        minWidth: '220px',
        maxWidth: '360px',
        padding: '10px 14px',
        borderRadius: '6px',
        color: '#fff',
        boxShadow: '0 4px 12px rgba(0,0,0,0.12)',
        fontSize: '14px',
        display: 'flex',
        alignItems: 'center'
    });
    toast.style.background = (type === 'success') ? '#2f9e44' : '#d9480f';

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
function renderProductos(list) {
    const tbody = document.querySelector(".tabla-productos tbody");
    if (!tbody) return;
    tbody.innerHTML = "";
    list.forEach(p => {
        const pid = String(p.id ?? p.idProducto ?? '');
        const fecha = p.fechaVencimiento ?? p.fechaCaducidad ?? '';
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td>${p.nombre ?? ''}</td>
            <td>${p.cantidad ?? 0}</td>
            <td>${p.marca ?? ''}</td>
            <td>${p.tipo ?? ''}</td>
            <td>${fecha ?? ''}</td>
            <td class="acciones">
                <button class="btn-accion editar" type="button" title="Editar" onclick="abrirEditar('${pid}')" aria-label="Editar">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                        <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25z" fill="currentColor"/>
                        <path d="M20.71 7.04a1 1 0 0 0 0-1.41l-2.34-2.34a1 1 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" fill="currentColor"/>
                    </svg>
                </button>
                <button class="btn-accion eliminar" type="button" title="Eliminar" onclick="confirmDelete('${pid}')" aria-label="Eliminar">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                        <path d="M6 7h12v13a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V7z" fill="currentColor"/>
                        <path d="M9 4h6v2H9z" fill="currentColor"/>
                        <path d="M10 11v6" stroke="#fff" stroke-width="1.4" stroke-linecap="round"/>
                        <path d="M14 11v6" stroke="#fff" stroke-width="1.4" stroke-linecap="round"/>
                    </svg>
                </button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

// ==================== GET PRODUCTOS ====================
async function cargarProductos() {
    try {
        console.log("cargarProductos -> solicitando lista al servidor");
        const resp = await fetch(API_BASE, { method: "GET" });
        if (!resp.ok) throw new Error("GET productos falló: " + resp.status);
        const productos = await resp.json();
        productsCache = Array.isArray(productos) ? productos : [];
        renderProductos(productsCache);
        console.log("cargarProductos -> completado, items:", productsCache.length);
    } catch (err) {
        console.error("cargarProductos error:", err);
        showToast("Error cargando productos. Revisa consola.", "error");
    }
}

// ==================== POST NUEVO ====================
async function registrarProductoAPI(nuevo) {
    console.log("registrarProductoAPI -> enviando:", nuevo);
    const resp = await fetch(API_BASE, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(nuevo)
    });
    const text = await resp.text().catch(()=>null);
    console.log("registrarProductoAPI -> status:", resp.status, "body:", text);
    if (!resp.ok) throw new Error(text || resp.status);
    try { return JSON.parse(text); } catch(e){ return null; }
}

// ==================== PUT ACTUALIZAR ====================
async function actualizarProductoAPI(id, actualizado) {
    console.log("actualizarProductoAPI -> id:", id, "body:", actualizado);
    const resp = await fetch(`${API_BASE}/${encodeURIComponent(id)}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(actualizado)
    });
    const text = await resp.text().catch(()=>null);
    console.log("actualizarProductoAPI -> status:", resp.status, "body:", text);
    if (!resp.ok) throw new Error(text || resp.status);
    try { return JSON.parse(text); } catch(e){ return null; }
}

// ==================== OBTENER PRÓXIMO ID ====================
function getNextId() {
    if (productsCache.length === 0) return 1;
    const maxId = Math.max(...productsCache.map(p => {
        const id = p.id ?? p.idProducto;
        return isNaN(id) ? 0 : Number(id);
    }));
    return maxId + 1;
}

// ==================== GUARDAR (CREATE/UPDATE) ====================
async function guardarProducto() {
    console.log("guardarProducto -> llamada");
    const nuevo = {
        tipo: document.getElementById("tipo")?.value || '',
        gramaje: document.getElementById("gramaje")?.value || '',
        marca: document.getElementById("marca")?.value || '',
        fechaVencimiento: document.getElementById("fecha")?.value || '',
        lote: document.getElementById("lote")?.value || '',
        nombre: document.getElementById("nombre")?.value || '',
        cantidad: (document.getElementById("cantidad")?.value !== '') ? parseInt(document.getElementById("cantidad")?.value) || 0 : 0
    };

    console.log("guardarProducto -> datos del formulario:", nuevo);

    if (!nuevo.nombre) {
        showToast("El nombre es obligatorio.", "error");
        return;
    }

    try {
        if (editingId) {
            await actualizarProductoAPI(editingId, nuevo);
            showToast("Producto actualizado correctamente.", "success");
            console.log("guardarProducto -> actualización OK");
        } else {
            const nextId = getNextId();
            nuevo.idProducto = String(nextId);
            nuevo.id = nextId;
            console.log("guardarProducto -> ID generado:", nextId);

            await registrarProductoAPI(nuevo);
            showToast("Producto registrado correctamente.", "success");
            console.log("guardarProducto -> registro OK");
        }

        editingId = null;
        document.getElementById("form-add")?.reset();
        closeModal("modal-add");
        await cargarProductos();
    } catch (err) {
        console.error("guardarProducto error:", err);
        showToast("No se pudo guardar el producto. Revisa la consola.", "error");
    }
}

// ==================== CONFIRMACIÓN ELIMINAR ====================
function confirmDelete(id) {
    console.log("confirmDelete -> id:", id);
    pendingDeleteId = id;
    const text = document.getElementById("modal-delete-text");
    if (text) text.textContent = `¿Eliminar producto id ${id}?`;
    openModal('modal-delete');
}

// ==================== ELIMINAR (DELETE) ====================
async function eliminarProducto(id) {
    console.log("eliminarProducto -> id:", id);
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
            productsCache = productsCache.filter(p => String(p.id ?? p.idProducto ?? '') !== String(id));
            renderProductos(productsCache);
            showToast("Producto eliminado correctamente.", "success");
            console.log("eliminarProducto -> OK");
        } else {
            // ERROR: mostrar solo toast de error
            const msg = bodyText || `Error ${resp.status}`;
            showToast("No se pudo eliminar el producto: " + msg, "error");
            console.error("eliminarProducto -> DELETE falló:", msg);
        }
    } catch (err) {
        console.error("eliminarProducto error:", err);
        showToast("No se pudo eliminar el producto. Revisa la consola.", "error");
    } finally {
        if (delBtn) {
            delBtn.disabled = false;
            delBtn.textContent = 'Eliminar';
        }
        pendingDeleteId = null;
        closeModal('modal-delete');
    }
}

// ==================== EDITAR ====================
async function abrirEditar(id) {
    console.log("abrirEditar -> id:", id);
    const prod = productsCache.find(p => String(p.id ?? p.idProducto ?? '') === String(id));
    if (prod) {
        fillFormForEdit(prod);
        openModal('modal-add');
        return;
    }
    try {
        const resp = await fetch(`${API_BASE}/${encodeURIComponent(id)}`);
        if (!resp.ok) throw new Error("No encontrado");
        const p = await resp.json();
        fillFormForEdit(p);
        openModal('modal-add');
    } catch (err) {
        console.error("abrirEditar error:", err);
        showToast("No se pudo cargar producto para editar.", "error");
    }
}

function fillFormForEdit(p) {
    document.getElementById("tipo").value = p.tipo ?? '';
    document.getElementById("gramaje").value = p.gramaje ?? '';
    document.getElementById("marca").value = p.marca ?? '';
    document.getElementById("fecha").value = formatDateForInput(p.fechaVencimiento ?? p.fechaCaducidad ?? '');
    document.getElementById("lote").value = p.lote ?? '';
    document.getElementById("nombre").value = p.nombre ?? '';
    document.getElementById("cantidad").value = p.cantidad ?? 0;
    editingId = (p.id ?? p.idProducto ?? '') + '';
    const btn = document.querySelector(".btn-registrar");
    if (btn) btn.textContent = "Guardar cambios";
}

function formatDateForInput(val) {
    if (!val) return '';
    if (/^\d{4}-\d{2}-\d{2}$/.test(val)) return val;
    const d = new Date(val);
    if (isNaN(d)) return '';
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth()+1).padStart(2,'0');
    const dd = String(d.getDate()).padStart(2,'0');
    return `${yyyy}-${mm}-${dd}`;
}

// ==================== FILTRADO ====================
function filtrarProductos(term) {
    if (!term) { renderProductos(productsCache); return; }
    const t = term.trim().toLowerCase();
    const filtered = productsCache.filter(p => {
        const idStr = String(p.id ?? p.idProducto ?? '').toLowerCase();
        const nombre = String(p.nombre ?? '').toLowerCase();
        const marca = String(p.marca ?? '').toLowerCase();
        const tipo = String(p.tipo ?? '').toLowerCase();
        return idStr.includes(t) || nombre.includes(t) || marca.includes(t) || tipo.includes(t);
    });
    renderProductos(filtered);
}

// ==================== INICIALIZACIÓN ====================
document.addEventListener("DOMContentLoaded", () => {
    console.log("DOMContentLoaded -> inicializando listeners");
    const modalExito = document.getElementById("modalExito");
    if (modalExito) modalExito.style.display = "none";

    cargarProductos();

    const addBtn = document.querySelector('.btn.agregar');
    if (addBtn) {
        addBtn.addEventListener("click", () => {
            editingId = null;
            const btn = document.querySelector(".btn-registrar");
            if (btn) btn.textContent = "Registrar";
            document.getElementById("form-add")?.reset();
            openModal('modal-add');
        });
    }

    const btnRegistrar = document.querySelector(".btn-registrar");
    if (btnRegistrar) {
        btnRegistrar.addEventListener("click", guardarProducto);
        console.log("Listener btn-registrar enlazado");
    }

    const delCancel = document.getElementById("modal-delete-cancel");
    const delConfirm = document.getElementById("modal-delete-confirm");
    if (delCancel) delCancel.addEventListener("click", () => { pendingDeleteId = null; closeModal('modal-delete'); });
    if (delConfirm) delConfirm.addEventListener("click", () => { if (pendingDeleteId) eliminarProducto(pendingDeleteId); });

    document.querySelectorAll('.close').forEach(btn => {
        btn.addEventListener('click', () => {
            const m = btn.getAttribute('data-modal');
            if (m) closeModal(m);
            editingId = null;
            const registrar = document.querySelector(".btn-registrar");
            if (registrar) registrar.textContent = "Registrar";
            document.getElementById("form-add")?.reset();
        });
    });

    const searchInput = document.querySelector('.busqueda');
    if (searchInput) {
        searchInput.addEventListener('input', debounce((e) => {
            filtrarProductos(e.target.value);
        }, 80));
    }

    window.addEventListener('error', (ev) => {
        console.error('Error global capturado:', ev.error || ev.message);
    });
});