
// ===========================
//   Funciones compartidas
// ===========================

function obtenerEnvios() {
    const enviosGuardados = localStorage.getItem('duvtrack_envios_personalizados');
    return JSON.parse(enviosGuardados || '[]');
}

function guardarEnvios(envios) {
    localStorage.setItem('duvtrack_envios_personalizados', JSON.stringify(envios));
}

function actualizarEstadosPorFecha() {
    const envios = obtenerEnvios();
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    let cambios = false;

    for (const envio of envios) {
        if (envio.estado !== 'entregado') {
            const fechaEnvio = new Date(envio.fechaEstimada);
            fechaEnvio.setHours(0, 0, 0, 0);

            if (fechaEnvio < hoy && envio.estado !== 'retrasado') {
                envio.estado = 'retrasado'
                envio.ultimoEvento = 'Fecha estimada vencida';
                cambios = true;
            }
        }
    }

    if (cambios) {
        guardarEnvios(envios);
    }
}

// ===========================
//   ESTADÍSTICAS DEL INDEX
// ===========================


function cargarEstadisticas() {
    const enviosGuardados = localStorage.getItem('duvtrack_envios_personalizados');
    const envios = JSON.parse(enviosGuardados || '[]');

    let total = envios.length;
    let entregados = 0;
    let transito = 0;
    let retrasados = 0;

    for (const envio of envios) {
        if (envio.estado === 'entregado') {
            entregados++;
        }
        if (envio.estado === 'en tránsito' || envio.estado === 'pendiente') {
            transito++;
        }
        if (envio.estado === 'retrasado') {
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

// ===========================
//   INDEX - cargar features desde JSON
// ===========================
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

// ===========================
//   REGISTRO - cálculo de precio
// ===========================

const inputKilometros = document.getElementById('kilometros');
const selectCategoria = document.getElementById('categoria');
const precioMonto = document.getElementById('precioMonto');
const precioFormula = document.getElementById('precioFormula');
const precioTotal = document.getElementById('precioTotal');

function calcularPrecio() {
    const km = Number(inputKilometros.value);
    const multiplicador = Number(selectCategoria.value);

    const total = km * 600 * multiplicador;

    precioMonto.textContent = '₡' + total;
    precioFormula.textContent = km + 'km × ₡600 × ' + multiplicador;
    precioTotal.textContent = 'Total: ₡' + total;
}

if (inputKilometros) {
    inputKilometros.addEventListener('input', calcularPrecio);
    selectCategoria.addEventListener('change', calcularPrecio);
    calcularPrecio();
}

// ===========================
//   REGISTRO - guardar envios
// ===========================

const formRegistro = document.getElementById('formRegistro');

if (formRegistro) {
    formRegistro.addEventListener('submit', function (event) {
        event.preventDefault();

        /* se leen los valores del formulario */
        const numeroGuia = document.getElementById('numeroGuia').value.trim();
        const destinatario = document.getElementById('destinatario').value.trim();
        const origen = document.getElementById('origen').value.trim();
        const destino = document.getElementById('destino').value.trim();
        const nota = document.getElementById('nota').value.trim();
        const km = Number(inputKilometros.value);
        const multiplicador = Number(selectCategoria.value);
        const categoriaTexto = selectCategoria.options[selectCategoria.selectedIndex].dataset.nombre;
        const fecha = document.getElementById('fechaEstimada').value;

        let valido = true;

        if (numeroGuia === '') {
            document.getElementById('errorGuia').textContent = 'Este campo es requerido';
            document.getElementById('errorGuia').classList.add('visible');
            valido = false;
        } else {
            document.getElementById('errorGuia').classList.remove('visible');
        }

        if (destinatario === '') {
            document.getElementById('errorDestinatario').textContent = 'Este campo es requerido';
            document.getElementById('errorDestinatario').classList.add('visible');
            valido = false;
        } else {
            document.getElementById('errorDestinatario').classList.remove('visible');
        }

        if (origen === '') {
            document.getElementById('errorOrigen').textContent = 'Este campo es requerido';
            document.getElementById('errorOrigen').classList.add('visible');
            valido = false;
        } else {
            document.getElementById('errorOrigen').classList.remove('visible');
        }

        if (destino === '') {
            document.getElementById('errorDestino').textContent = 'Este campo es requerido';
            document.getElementById('errorDestino').classList.add('visible');
            valido = false;
        } else {
            document.getElementById('errorDestino').classList.remove('visible');
        }

        if (km <= 0) {
            document.getElementById('errorKilometros').textContent = 'Este campo es requerido';
            document.getElementById('errorKilometros').classList.add('visible');
            valido = false;
        } else {
            document.getElementById('errorKilometros').classList.remove('visible');
        }

        if (fecha === '') {
            document.getElementById('errorFecha').textContent = 'Este campo es requerido';
            document.getElementById('errorFecha').classList.add('visible');
            valido = false;
        } else {
            document.getElementById('errorFecha').classList.remove('visible');
        }

        if (!valido) {
            return;
        }

        /* Se calcula el costo final */
        const costo = km * 600 * multiplicador;

        /* Se crea el objeto del nuevo envío */
        const nuevoEnvio = {
            id: numeroGuia,
            numeroGuia: numeroGuia,
            destinatario: destinatario,
            origen: origen,
            destino: destino,
            nota: nota,
            kilometros: km,
            categoria: categoriaTexto,
            multiplicador: multiplicador,
            costo: costo,
            estado: 'pendiente',
            fechaEstimada: fecha,
            ultimoEvento: 'Registrado por el usuario',
        };

        const envios = obtenerEnvios();
        envios.push(nuevoEnvio);
        guardarEnvios(envios);

        /* se limpia el formulario */
        formRegistro.reset();
        calcularPrecio();
        mostrarEnviosRegistrados();

        const confirmacion = document.getElementById('mensajeConfirmacion');
        confirmacion.textContent = ' Envío registrado correctamente';
        confirmacion.classList.add('visible');

        //se oculta despues de 3seg
        setTimeout(function () {
            confirmacion.classList.remove('visible');
        }, 3000);
    });

    const btnLimpiar = document.getElementById('btnLimpiar');

    if (btnLimpiar) {
        btnLimpiar.addEventListener('click', function () {
            const confirmar = confirm('¿Seguro que quieres limpiar el formulario?');
            if (confirmar) {
                formRegistro.reset();
                calcularPrecio();
            }
        });
    }
}


// ===========================
//  REGISTRO - mostrar lista
// ===========================

function mostrarEnviosRegistrados() {
    const listaEnvios = document.getElementById('listaEnvios');

    if (!listaEnvios) {
        return;
    }

    const envios = obtenerEnvios();
    listaEnvios.innerHTML = '';

    if (envios.length === 0) {
        listaEnvios.innerHTML = '<p class="vacio" id="mensajeVacio">Todavía no has registrado envíos.</p>';
        return;
    }

    for (const envio of envios) {
        const tarjeta = document.createElement('div');
        tarjeta.classList.add('envio-registrado');

        tarjeta.innerHTML =
            '<div>' +
            '<p class="numero-guia">#' + envio.numeroGuia + '</p>' +
            '<p class="detalle">' + envio.destinatario + '</p>' +
            '<p class="detalle">' + (envio.origen || '?') + ' → ' + envio.destino + ' · ' + envio.kilometros + ' km</p>' +
            '<p class="detalle">  Fecha Est. ' + envio.fechaEstimada + '</p>' +
            '<div class="badges">' +
            '<span class="badge ' + envio.categoria + '">' + envio.categoria + '</span>' +
            '<span class="badge entregado">₡' + envio.costo + '</span>' +
            '</div>' +
            '</div>' +
            '<button class="btn-eliminar" data-id="' + envio.id + '">' +
            '<span class="material-symbols-outlined">delete</span>' +
            '</button>';

        listaEnvios.appendChild(tarjeta);
    }

    const botonesEliminar = document.querySelectorAll('.btn-eliminar');
    for (const boton of botonesEliminar) {
        boton.addEventListener('click', function () {
            eliminarEnvio(boton.dataset.id);
        });
    }
}

function eliminarEnvio(id) {
    const envios = obtenerEnvios();
    const nuevosEnvios = [];

    for (const envio of envios) {
        if (envio.id !== id) {
            nuevosEnvios.push(envio);
        }
    }

    guardarEnvios(nuevosEnvios);
    mostrarEnviosRegistrados();
}

if (document.getElementById('listaEnvios')) {
    mostrarEnviosRegistrados();
}

// ===========================
// Envios - mostrar tarjetas
// ===========================

let pestanaActual = 'activos';


function mostrarEnvios() {
    const enviosGrid = document.getElementById('enviosGrid');

    if (!enviosGrid) {
        return;
    }

    fetch('data/envios.json')
        .then(function (respuesta) {
            return respuesta.json();
        })
        .then(function (enviosJSON) {
            const enviosLocalStorage = obtenerEnvios();
            const todosLosEnvios = enviosJSON.concat(enviosLocalStorage);
            dibujarEnvios(todosLosEnvios);
        })
        .catch(function (error) {
            console.log('No se pudo cargar el JSON:', error);
            dibujarEnvios(obtenerEnvios());
        });

}


// ===========================
//   ENVÍOS - dibujar tarjetas
// ===========================
function dibujarEnvios(todosLosEnvios) {
    const enviosGrid = document.getElementById('enviosGrid');
    const contadorActivos = document.getElementById('contadorActivos');
    const contadorArchivados = document.getElementById('contadorArchivados');
    const contadorResultados = document.getElementById('contadorResultados');

    const activos = [];
    const archivados = [];

    for (const envio of todosLosEnvios) {
        if (envio.estado === 'entregado') {
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
        if (envio.nota !== '') {
            notaHTML =
                '<div class="nota">' +
                '<span class="material-symbols-outlined">sticky_note_2</span> ' +
                envio.nota +
                '</div>';
        }

        let botonesHTML = '';
        if (envio.estado !== 'entregado') {
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

    const botonesRecibido = document.querySelectorAll('.btn-recibido');
    for (const boton of botonesRecibido) {
        boton.addEventListener('click', function () {
            cambiarEstado(boton.dataset.id, 'entregado');
        });
    }

    const botonesArchivar = document.querySelectorAll('.btn-archivar');
    for (const boton of botonesArchivar) {
        boton.addEventListener('click', function () {
            archivarEnvio(boton.dataset.id);
        });
    }
}

// ===========================
//   ENVÍOS - cambiar estado
// ===========================

function cambiarEstado(id, nuevoEstado) {
    const envios = obtenerEnvios();

    for (const envio of envios) {
        if (envio.id === id) {
            envio.estado = nuevoEstado;
            envio.ultimoEvento = 'Marcado como entregado';
        }
    }

    guardarEnvios(envios);
    mostrarEnvios();
}

function archivarEnvio(id) {
    const envios = obtenerEnvios();

    for (const envio of envios) {
        if (envio.id === id) {
            envio.estado = 'entregado';
            envio.ultimoEvento = 'Archivado manualmente';
        }
    }

    guardarEnvios(envios);
    mostrarEnvios();
}

// ===========================
//   ENVÍOS - pestañas y filtros
// ===========================
const btnActivos = document.getElementById('btnActivos');
const btnArchivados = document.getElementById('btnArchivados');

if (btnActivos) {
    actualizarEstadosPorFecha();

    btnActivos.addEventListener('click', function () {
        pestanaActual = 'activos';
        btnActivos.classList.add('active');
        btnArchivados.classList.remove('active');
        mostrarEnvios();
    });


    btnArchivados.addEventListener('click', function () {
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

