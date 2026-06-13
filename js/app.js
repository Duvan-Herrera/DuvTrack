

/* ESTADÍSTICAS DEL INDEX */

function cargarEstadisticas() {

    // Leemos los envíos que el usuario ha registrado
    // Si no hay nada guardado, usamos un arreglo vacío []
    const enviosGuardados = localStorage.getItem('duvtrack_envios_personalizados');
    const envios = JSON.parse(enviosGuardados || '[]');

    // Contadores que empiezan en 0
    let total = envios.length;
    let entregados = 0;
    let transito = 0;
    let retrasados = 0;

    // Recorremos los envíos guardados y contamos según su estado
    for (const envio of envios) {

        if (envio.estado === 'entregado') {
            entregados++;
        }

        if (envio.estado === 'en tránsito') {
            transito++;
        }

        if (envio.estado === 'retrasado') {
            retrasados++;
        }
    }

    // Mostramos los resultados en el HTML
    document.getElementById('total-envios').textContent = total;
    document.getElementById('entregados').textContent = entregados;
    document.getElementById('en-transito').textContent = transito;
    document.getElementById('retrasados').textContent = retrasados;
}

// Solo ejecuta si existen esos elementos (es decir, si estamos en index.html)
if (document.getElementById('total-envios')) {
    cargarEstadisticas();
}