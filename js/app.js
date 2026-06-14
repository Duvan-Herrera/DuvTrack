

/* ESTADÍSTICAS DEL INDEX */

function cargarEstadisticas() {

    // Se lee los envíos que el usuario ha registrado
    // Si no hay nada guardado, usamos un arreglo vacío []
    const enviosGuardados = localStorage.getItem('duvtrack_envios_personalizados');
    const envios = JSON.parse(enviosGuardados || '[]');

    // Contadores que empiezan en 0
    let total = envios.length;
    let entregados = 0;
    let transito = 0;
    let retrasados = 0;

    // Se recorre los envíos guardados y contamos según su estado
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

    // Se muestran los resultados en el HTML
    document.getElementById('total-envios').textContent = total;
    document.getElementById('entregados').textContent = entregados;
    document.getElementById('en-transito').textContent = transito;
    document.getElementById('retrasados').textContent = retrasados;
}
if (document.getElementById('total-envios')) {
    cargarEstadisticas();
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
    precioFormula.textContent = km + 'km x ₡600 x ' + multiplicador;
    precioTotal.textContent = 'Total: ₡' + total;
}

if (inputKilometros) {
    inputKilometros.addEventListener ('input', calcularPrecio);
    selectCategoria.addEventListener ('change', calcularPrecio);
    calcularPrecio();
}

// ===========================
//   Guardar envios
// ===========================
const formRegistro = document.getElementById('formRegistro');

if (formRegistro) {
    formRegistro.addEventListener('submit', function(event) {
        event.preventDefault();

        /* se leen los valores del formulario */
        const numeroGuia = document.getElementById('numeroGuia').value.trim();
        const destinatario = document.getElementById('destinatario').value.trim();
        const destino = document.getElementById('destino').value.trim();
        const km = Number(inputKilometros.value);
        const multiplicador = Number(selectCategoria.value);
        const categoriaTexto = selectCategoria.options[selectCategoria.selectedIndex].dataset.nombre;
        const fecha = document.getElementById('fechaEstimada').value;

        //validacion
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

        /* Si algo no es valido, el sistema no continua */
        if (!valido){
            return;
        }

        /* Calculamos el costo final */
        const costo = km * 600 * multiplicador;

        /* Se crea el objeto del nuevo envío */
        const nuevoEnvio = {
            id: numeroGuia,
            numeroGuia: numeroGuia,
            destinatario: destinatario,
            destino: destino,
            kilometros: km,
            categoria: categoriaTexto,
            multiplicador: multiplicador,
            costo: costo,
            estado: 'pendiente',
            fechaEstimada: fecha,
            ultimoEvento: 'Registrado por el usuario',
            nota: ''
        };

        /* Se lee los envios guardados */
        const enviosGuardados = localStorage.getItem('duvtrack_envios_personalizados');
        const envios = JSON.parse(enviosGuardados || '[]');

        /* Se agrega el nuevo envio */
        envios.push(nuevoEnvio);

        /* Se agrega en localStorage */
        localStorage.setItem('duvtrack_envios_personalizados', JSON.stringify(envios));

        /* Se limpia el formulario */
        formRegistro.reset();
        calcularPrecio();

        /* Se vuelve a mostrar la lista actualizada */
        mostrarEnviosRegistrados();
    });
}

// ===========================
//  Mostrar envios registrados y boton de eliminar
// ===========================

function mostrarEnviosRegistrados() {

    const listaEnvios = document.getElementById('listaEnvios');
    const mensajeVacio = document.getElementById('mensajeVacio');

    /* Se lee los envios guardados */
    const enviosGuardados = localStorage.getItem('duvtrack_envios_personalizados');
    const envios = JSON.parse(enviosGuardados || '[]');

    /* Se limpia la lista actual */
    listaEnvios.innerHTML = '';

    /* Si no hay envíos, muestra el mensaje que esta vacio */
    if (envios.length === 0){
        listaEnvios.innerHTML = '<p class="vacio" id="mensajeVacio">Todavía no has registrado envíos.</p>';
        return;
    }

    /* Se recorre cada envio y se crea la tarjeta */
    for (const envio of envios) {
        const tarjeta = document.createElement('div');
        tarjeta.classList.add('envio-registrado');

        tarjeta.innerHTML =
        '<div>' +
                '<p class="numero-guia">#' + envio.numeroGuia + '</p>' +
                '<p class="detalle">' + envio.destinatario + ' · ' + envio.destino + ' · ' + envio.kilometros + ' km</p>' +
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

    /* Se agrega el evento de eliminar a cada botón */
    const botonesEliminar = document.querySelectorAll('.btn-eliminar');

    for (const boton of botonesEliminar) {
        boton.addEventListener('click', function() {
            const idEliminar = boton.dataset.id;
            eliminarEnvio(idEliminar);
        });
    }
}

function eliminarEnvio(id) {
    
     /* Se lee los envios guardados */
    const enviosGuardados = localStorage.getItem('duvtrack_envios_personalizados');
    const envios = JSON.parse(enviosGuardados || '[]');

    /* Se crea un nuevo arreglo sin el envio eliminado */
    const nuevosEnvios = [];

    for (const envio of envios) {
        if(envio.id !== id) {
            nuevosEnvios.push(envio);
        }
    }

    /* Se guarda el nuevo arreglo */
    localStorage.setItem('duvtrack_envios_personalizados', JSON.stringify(nuevosEnvios));

    /* Se vuelve a mostrar la lista */
    mostrarEnviosRegistrados();
}

/* Se muestra la lista al cargar la página */
if (document.getElementById('listaEnvios')){
    mostrarEnviosRegistrados();
}