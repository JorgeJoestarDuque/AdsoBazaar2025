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
            alert('Error al registrar: ' + (err.message || resp.statusText));
            return;
        }

        const created = await resp.json();
        console.log('Usuario creado:', created);
        alert('Usuario registrado con éxito.');
        // opcional: limpiar formulario
        document.getElementById('registroForm').reset();
        redirigir();
    } catch (error) {
        console.error('Fetch error:', error);
        alert('Error de conexión al registrar usuario. Revisa la consola.');
    }
});

function redirigir() {
    window.location.href = 'inicioSesion.html';
}