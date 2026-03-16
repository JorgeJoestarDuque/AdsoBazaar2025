const btn = document.querySelector('#btn');
const sidebar = document.querySelector('.sidebar');
const body = document.body;

btn.addEventListener('click', () => {
    // 1. Animamos las rayitas del botón (la X)
    btn.classList.toggle('activo');
    
    // 2. Abrimos/cerramos la barra lateral
    sidebar.classList.toggle('active');
    
    // 3. Empujamos todo el contenido de la página
    body.classList.toggle('menu-open');
});