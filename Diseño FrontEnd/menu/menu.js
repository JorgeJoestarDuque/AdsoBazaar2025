/**
 * menu.js
 * Gestiona la funcionalidad principal del menu de navegacion.
 * - Controla la apertura y cierre del menu lateral hamburguesa
 * - Maneja la navegacion entre las diferentes secciones de la aplicacion
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