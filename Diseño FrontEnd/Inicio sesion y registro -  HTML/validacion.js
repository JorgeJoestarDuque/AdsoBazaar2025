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
      // redirigir sólo una vez
      //window.location.href = '../menu/Menu.html';
      redirigir();
    } else {
      const msg = (data && data.message) ? data.message : `Error ${response.status}: ${response.statusText}`;
      if (errorDiv) errorDiv.textContent = msg;
      console.warn('Login failed:', msg);
    }
  } catch (err) {
    console.error('Login error:', err);
    if (errorDiv) errorDiv.textContent = 'Error al conectar con el servidor';
  }
  finally {
    if (submitBtn) submitBtn.disabled = false;
  }
  });
}

function redirigir() {
    window.location.href = '../menu/menu.html';
}