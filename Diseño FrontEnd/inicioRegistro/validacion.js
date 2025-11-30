console.log('validacion.js loaded');

const loginForm = document.getElementById('loginForm');
if (!loginForm) {
  console.error('loginForm not found in DOM');
} else {
  loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  const submitBtn = e.target.querySelector('button[type="submit"]');
  const errorDiv = document.getElementById('error');
  // feedback
  if (submitBtn) submitBtn.disabled = true;
  if (errorDiv) errorDiv.textContent = 'Validando...';

  // GET para consulta usuario contraseña.
  const url = `http://localhost:10000/api/login?email=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`;
  try {
    console.log('Login request URL:', url);
    const response = await fetch(url, { method: 'GET' });
    console.log('Fetch finished, status:', response.status);
    const data = await response.json().catch(() => null);
    console.log('Parsed JSON:', data);

    if (response.ok && data && data.success) {
      // Guardar usuario sin token
      localStorage.setItem('usuario', JSON.stringify(data.usuario));
      // Mostrar toast y esperar a que desaparezca antes de redirigir
      await showToast('Inicio de sesión exitoso', 'info', duration = 1000);
      // redirigir sólo una vez
      redirigir();
    } else {
      const msg = (data && data.message) ? data.message : `Error ${response.status}: ${response.statusText}`;
      if (errorDiv) errorDiv.textContent = msg;
      console.warn('Login failed:', msg);
      // Mostrar toast en esquina para errores; si es 401, destacarlo
      if (response.status === 401) showToast(msg, 'error');
      else showToast(msg, 'warning');
    }
  } catch (err) {
    console.error('Login error:', err);
    if (errorDiv) errorDiv.textContent = 'Error al conectar con el servidor';
    showToast('Error al conectar con el servidor', 'error');
  }
  finally {
    if (submitBtn) submitBtn.disabled = false;
  }
  });
}

function redirigir() {
    window.location.href = '../menu/menu.html';
}

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