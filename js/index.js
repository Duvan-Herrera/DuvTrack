function cargarEstadisticas() {
    const enviosGuardados = localStorage.getItem('duvtrack_envios_personalizados');
    const envios = JSON.parse(enviosGuardados || '[]');

    let total = envios.length;
    let entregados = 0;
    let transito = 0;
    let retrasados = 0;

    for (const envio of envios) {
        if (envio.estado === 'Entregado') {
            entregados++;
        }
        if (envio.estado === 'En tránsito' || envio.estado === 'Pendiente') {
            transito++;
        }
        if (envio.estado === 'Retrasado') {
            retrasados++;
        }
    }

    // Se muestran los resultados en el HTML
    document.getElementById('total-envios').textContent = total;
    document.getElementById('entregados').textContent = entregados;
    document.getElementById('en-transito').textContent = transito;
    document.getElementById('retrasados').textContent = retrasados;
}
if (document.getElementById('total-envios')) {
    actualizarEstadosPorFecha();
    cargarEstadisticas();
}

//cargar features desde JSON
function cargarFeatures() {
    const grid = document.getElementById('featuresGrid');

    if (!grid) {
        return;
    }

    fetch('data/features.json')
        .then(function (respuesta) {
            return respuesta.json();
        })
        .then(function (features) {

            for (const feature of features) {
                const tarjeta = document.createElement('article');
                tarjeta.classList.add('feature-card');

                tarjeta.innerHTML =
                    '<span class="material-symbols-outlined">' + feature.icono + '</span>' +
                    '<h3>' + feature.titulo + '</h3>' +
                    '<p>' + feature.descripcion + '</p>';

                grid.appendChild(tarjeta);
            }
        })
        .catch(function (error) {
            console.log('No se pudieron cargar las features:', error);
        });
}

if (document.getElementById('featuresGrid')) {
    cargarFeatures();
}