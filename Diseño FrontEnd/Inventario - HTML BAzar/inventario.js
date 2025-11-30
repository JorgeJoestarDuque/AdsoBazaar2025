// =======================================================
// inventario.js
// Archivo: lógica de consulta (GET), registro (POST), modales,
// edición/eliminación y arranque (DOMContentLoaded)
// =======================================================

// --------------------------
//  SECCIÓN: Consulta (GET)
//  - cargarProductos(): trae productos del backend y renderiza la tabla.
// --------------------------
async function cargarProductos() {
    try {
        const resp = await fetch("http://localhost:10000/api/producto", {
            method: "GET"
        });

        if (!resp.ok) throw new Error("Error en GET productos");

        const productos = await resp.json();
        const tbody = document.querySelector(".tabla-productos tbody");
        tbody.innerHTML = ""; // limpiar tabla

        productos.forEach(p => {
            const pid = p.id ?? p.idProducto ?? ''; // <-- fallback id
            const fecha = p.fechaVencimiento ?? p.fechaCaducidad ?? '';
            const fila = document.createElement("tr");
            fila.innerHTML = `
                <td>${p.nombre ?? ''}</td>
                <td>${p.cantidad ?? 0}</td>
                <td>${p.marca ?? ''}</td>
                <td>${p.tipo ?? ''}</td>
                <td>${fecha}</td>
                <td class="acciones">
                    <button class="btn-accion editar" onclick="abrirEditar('${pid}')"></button>
                    <button class="btn-accion eliminar" onclick="eliminarProducto('${pid}')"></button>
                </td>
            `;
            tbody.appendChild(fila);
        });

    } catch (error) {
        console.error("Error al cargar productos:", error);
    }
}

// --------------------------
//  SECCIÓN: Registro (POST)
//  - registrarProducto(): valida mínimo, genera id, envía POST y actualiza UI.
// --------------------------
async function registrarProducto() {
    const nuevo = {
        tipo: document.getElementById("tipo")?.value || '',
        gramaje: document.getElementById("gramaje")?.value || '',
        marca: document.getElementById("marca")?.value || '',
        fechaVencimiento: document.getElementById("fecha")?.value || '',
        lote: document.getElementById("lote")?.value || '',
        nombre: document.getElementById("nombre")?.value || '',
        cantidad: parseInt(document.getElementById("cantidad")?.value) || 0
    };

    if (!nuevo.nombre) {
        alert("El nombre del producto es obligatorio.");
        return;
    }

    // generar id automático (timestamp) y enviar tanto idProducto como id (compatibilidad)
    const genId = Date.now().toString();
    nuevo.idProducto = genId;
    // si tu backend usa numeric `id`, enviar también como número
    const idNum = Number(genId);
    if (!Number.isNaN(idNum)) nuevo.id = idNum;

    try {
        const resp = await fetch("http://localhost:10000/api/producto", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(nuevo)
        });

        if (!resp.ok) {
            const txt = await resp.text().catch(()=>null);
            throw new Error("Error al registrar producto: " + (txt || resp.status));
        }

        // mostrar modal de éxito y refrescar tabla
        mostrarModalExito();
        closeModal("modal-add");
        cargarProductos();
        document.getElementById("form-add")?.reset();

    } catch (error) {
        console.error(error);
        alert("No se pudo registrar producto");
    }
}

// --------------------------
//  SECCIÓN: Modales (UI helpers)
//  - mostrarModalExito, cerrarModalExito
// --------------------------
function mostrarModalExito() {
    const m = document.getElementById("modalExito");
    if (m) m.style.display = "flex";
}

function cerrarModalExito() {
    const m = document.getElementById("modalExito");
    if (m) m.style.display = "none";
}

// --------------------------
//  SECCIÓN: Edición / Eliminación (stubs)
//  - eliminarProducto(id): intenta DELETE y refresca
//  - abrirEditar(id): abre modal y sirve para rellenar formulario si se implementa
// --------------------------
async function eliminarProducto(id) {
    if (!confirm("¿Eliminar producto id " + id + "?")) return;
    try {
        const resp = await fetch(`http://localhost:10000/api/producto/${id}`, { method: "DELETE" });
        if (!resp.ok) throw new Error("Error al eliminar");
        cargarProductos();
    } catch (err) {
        console.error(err);
        alert("No se pudo eliminar");
    }
}

function abrirEditar(id) {
    openModal('modal-add');
    // Aquí podrías cargar producto por id y rellenar formulario para editar
}

// --------------------------
//  SECCIÓN: Inicialización
//  - Registrar eventos al DOMContentLoaded
// --------------------------
document.addEventListener("DOMContentLoaded", () => {
    // ocultar modal de éxito al iniciar (evita que aparezca en recargas)
    const modalExito = document.getElementById("modalExito");
    if (modalExito) modalExito.style.display = "none";

    cargarProductos();
    const btnRegistrar = document.querySelector(".btn-registrar");
    if (btnRegistrar) btnRegistrar.addEventListener("click", registrarProducto);
});