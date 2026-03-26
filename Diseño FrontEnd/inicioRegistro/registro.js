/**
 * registro.js
 * Sistema de registro de nuevos usuarios en la plataforma.
 * - Captura datos del formulario de registro
 * - Envia los datos a la API para crear una nueva cuenta
 * - Maneja errores y redirecciona al login despues del registro
 */

function redirigir() {
    window.location.href = 'inicioSesion.html';
}

document.getElementById("registroForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const usuario = {
        NIT: document.getElementById("documento").value,
        Nombre: document.getElementById("usuario").value,
        Email: document.getElementById("email").value,
        Rol: document.getElementById("rol").value,
        Telefono: document.getElementById("telefono").value,
        Contrasena: document.getElementById("password").value,
    };

    try {
        console.log('Registrando usuario:', usuario);
        const resp = await fetch("http://localhost:10000/api/usuario", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(usuario)
        });

        if (!resp.ok) {
            const err = await resp.json().catch(() => ({ message: resp.statusText }));
            console.error('Error response:', resp.status, err);
            showToast('Error al registrar: ' + (err.message || resp.statusText), 'error', duration = 2000);
            return;
        }

        const created = await resp.json();
        console.log('Usuario creado:', created);
        await showToast('Usuario registrado con éxito.', 'info', duration = 2000);
        // opcional: limpiar formulario
        document.getElementById('registroForm').reset();
        redirigir();
    } catch (error) {
        console.error('Fetch error:', error);
        await showToast('Error de conexión al registrar usuario. Revisa la consola.', 'warning', duration = 2000);
    }
});


// Toast utility: crea un aviso en la esquina superior derecha que desaparece solo.
function showToast(message, type = 'info', duration = 4000) {
  // Reusar toast existente si hay
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = 'toast-item';
  toast.textContent = message;
  toast.classList.add(type === 'error' ? 'error' : (type === 'warning' ? 'warning' : 'info'));
  container.appendChild(toast);

  // selección de clase CSS para mostrar
  void toast.offsetWidth;
  toast.classList.add('show');

  // Devuelve una promesa que se resuelve cuando el toast desaparece
  return new Promise((resolve) => {
    const timeout = setTimeout(() => {
      toast.classList.remove('show');
      // quitar después de la transición
      setTimeout(() => { toast.remove(); if (!container.hasChildNodes()) container.remove(); resolve(); }, 260);
    }, duration);

    // click para quitar y resolver inmediatamente
    toast.addEventListener('click', () => {
      clearTimeout(timeout);
      toast.classList.remove('show');
      setTimeout(() => { toast.remove(); if (!container.hasChildNodes()) container.remove(); resolve(); }, 220);
    });
  });
}