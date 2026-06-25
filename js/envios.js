let pestanaActual = 'activos';

// ── Mostrar envíos ──
function mostrarEnvios() {
    const enviosGrid = document.getElementById('enviosGrid');

    if (!enviosGrid) {
        return;
    }

    fetch('data/envios.json')
        .then(function(respuesta) {
            return respuesta.json();
        })
        .then(function(enviosJSON) {
            const enviosLocalStorage = obtenerEnvios();
            const todosLosEnvios = enviosJSON.concat(enviosLocalStorage);
            dibujarEnvios(todosLosEnvios);
        })
        .catch(function(error) {
            console.log('No se pudo cargar el JSON:', error);
            dibujarEnvios(obtenerEnvios());
        });
}

// ── Dibujar tarjetas ──
function dibujarEnvios(todosLosEnvios) {
    const enviosGrid = document.getElementById('enviosGrid');
    const contadorActivos = document.getElementById('contadorActivos');
    const contadorArchivados = document.getElementById('contadorArchivados');
    const contadorResultados = document.getElementById('contadorResultados');

    const activos = [];
    const archivados = [];

    for (const envio of todosLosEnvios) {
        if (envio.estado === 'Entregado') {
            archivados.push(envio);
        } else {
            activos.push(envio);
        }
    }

    contadorActivos.textContent = activos.length;
    contadorArchivados.textContent = archivados.length;

    let lista = activos;
    if (pestanaActual === 'archivados') {
        lista = archivados;
    }

    const texto = document.getElementById('busqueda').value.toLowerCase();
    const estadoFiltro = document.getElementById('filtroEstado').value;
    const categoriaFiltro = document.getElementById('filtroCategoria').value;

    const filtrados = [];

    for (const envio of lista) {
        const coincideTexto =
            envio.numeroGuia.toLowerCase().includes(texto) ||
            envio.destinatario.toLowerCase().includes(texto);

        const coincideEstado = estadoFiltro === '' || envio.estado === estadoFiltro;
        const coincideCategoria = categoriaFiltro === '' || envio.categoria === categoriaFiltro;

        if (coincideTexto && coincideEstado && coincideCategoria) {
            filtrados.push(envio);
        }
    }

    contadorResultados.textContent = 'Mostrando ' + filtrados.length + ' envíos ' + pestanaActual;

    const cardNuevo = document.querySelector('.card-nuevo');
    enviosGrid.innerHTML = '';

    for (const envio of filtrados) {
        const tarjeta = document.createElement('article');
        tarjeta.classList.add('envio-card');
        tarjeta.classList.add(envio.estado.replace(' ', '-'));

        let notaHTML = '';
        const enviosLocales = obtenerEnvios();
        const esLocal = enviosLocales.some(function(e) { return e.id === envio.id; });

        if (esLocal) {
            notaHTML =
                '<div class="nota-editable" style="margin-top:8px">' +
                '<input type="text" class="input-nota" data-id="' + envio.id + '" ' +
                'placeholder="Agregar nota..." value="' + (envio.nota || '') + '">' +
                '</div>';
        } else if (envio.nota && envio.nota !== '') {
            notaHTML =
                '<div class="nota">' +
                '<span class="material-symbols-outlined">sticky_note_2</span> ' +
                envio.nota +
                '</div>';
        }

        let botonesHTML = '';
        if (envio.estado !== 'Entregado') {
            botonesHTML =
                '<div class="botones">' +
                '<button class="btn-recibido" data-id="' + envio.id + '">' +
                '<span class="material-symbols-outlined">check</span> Marcar recibido' +
                '</button>' +
                '<button class="btn-archivar" data-id="' + envio.id + '">' +
                '<span class="material-symbols-outlined">archive</span> Archivar' +
                '</button>' +
                '</div>';
        }

        tarjeta.innerHTML =
            '<div class="top-row">' +
            '<span class="numero-guia">#' + envio.numeroGuia + '</span>' +
            '</div>' +
            '<p class="destinatario">' +
            '<span class="material-symbols-outlined">person</span> ' + envio.destinatario +
            '</p>' +
            '<div class="badges">' +
            '<span class="badge ' + envio.estado.replace(' ', '-') + '">' + envio.estado + '</span>' +
            '<span class="badge ' + envio.categoria + '">' + envio.categoria + '</span>' +
            '</div>' +
            '<p class="info-row">' +
            '<span class="material-symbols-outlined">location_on</span> ' +
            (envio.origen || '?') + ' → ' + envio.destino + ' · ' + envio.kilometros + ' km' +
            '</p>' +
            '<p class="info-row">' +
            '<span class="material-symbols-outlined">calendar_today</span> Est. ' + envio.fechaEstimada +
            '</p>' +
            '<p class="info-row">' +
            '<span class="material-symbols-outlined">payments</span> Costo: ₡' + envio.costo +
            '</p>' +
            '<p class="info-row">' +
            '<span class="material-symbols-outlined">history</span> ' + envio.ultimoEvento +
            '</p>' +
            notaHTML +
            botonesHTML;

        enviosGrid.appendChild(tarjeta);
    }

    if (filtrados.length === 0) {
        const vacio = document.createElement('p');
        vacio.classList.add('vacio');
        vacio.textContent = 'No se encontraron envíos con esos criterios.';
        enviosGrid.appendChild(vacio);
    }

    enviosGrid.appendChild(cardNuevo);

    const inputsNota = document.querySelectorAll('.input-nota');
    for (const input of inputsNota) {
        input.addEventListener('input', function() {
            const id = input.dataset.id;
            const envios = obtenerEnvios();

            for (const envio of envios) {
                if (envio.id === id) {
                    envio.nota = input.value;
                }
            }

            guardarEnvios(envios);
        });
    }

    const botonesRecibido = document.querySelectorAll('.btn-recibido');
    for (const boton of botonesRecibido) {
        boton.addEventListener('click', function() {
            cambiarEstado(boton.dataset.id, 'Entregado');
        });
    }

    const botonesArchivar = document.querySelectorAll('.btn-archivar');
    for (const boton of botonesArchivar) {
        boton.addEventListener('click', function() {
            archivarEnvio(boton.dataset.id);
        });
    }
}

// ── Cambiar estado ──
function cambiarEstado(id, nuevoEstado) {
    const envios = obtenerEnvios();

    for (const envio of envios) {
        if (envio.id === id) {
            envio.estado = nuevoEstado;
            envio.ultimoEvento = 'Marcado como Entregado';
        }
    }

    guardarEnvios(envios);
    mostrarEnvios();
}

function archivarEnvio(id) {
    const envios = obtenerEnvios();

    for (const envio of envios) {
        if (envio.id === id) {
            envio.estado = 'Entregado';
            envio.ultimoEvento = 'Archivado manualmente';
        }
    }

    guardarEnvios(envios);
    mostrarEnvios();
}

// ── Pestañas y filtros ──
const btnActivos = document.getElementById('btnActivos');
const btnArchivados = document.getElementById('btnArchivados');

if (btnActivos) {
    actualizarEstadosPorFecha();

    btnActivos.addEventListener('click', function() {
        pestanaActual = 'activos';
        btnActivos.classList.add('active');
        btnArchivados.classList.remove('active');
        mostrarEnvios();
    });

    btnArchivados.addEventListener('click', function() {
        pestanaActual = 'archivados';
        btnArchivados.classList.add('active');
        btnActivos.classList.remove('active');
        mostrarEnvios();
    });

    document.getElementById('busqueda').addEventListener('input', mostrarEnvios);
    document.getElementById('filtroEstado').addEventListener('change', mostrarEnvios);
    document.getElementById('filtroCategoria').addEventListener('change', mostrarEnvios);

    mostrarEnvios();
}