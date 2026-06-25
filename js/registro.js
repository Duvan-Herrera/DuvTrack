// ── Cálculo de precio ──
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
    precioFormula.textContent = km + ' km × ₡600 × ' + multiplicador;
    precioTotal.textContent = 'Total: ₡' + total;
}

if (inputKilometros) {
    inputKilometros.addEventListener('input', calcularPrecio);
    selectCategoria.addEventListener('change', calcularPrecio);
    calcularPrecio();
}

// ── Guardar envío ──
const formRegistro = document.getElementById('formRegistro');

if (formRegistro) {
    formRegistro.addEventListener('submit', function(event) {
        event.preventDefault();

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
            document.getElementById('errorKilometros').textContent = 'Debe ser mayor a 0';
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

        const costo = km * 600 * multiplicador;

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
            estado: 'Pendiente',
            fechaEstimada: fecha,
            ultimoEvento: 'Registrado por el usuario'
        };

        const envios = obtenerEnvios();
        envios.push(nuevoEnvio);
        guardarEnvios(envios);

        formRegistro.reset();
        calcularPrecio();
        mostrarEnviosRegistrados();

        const confirmacion = document.getElementById('mensajeConfirmacion');
        confirmacion.textContent = '✓ Envío registrado correctamente';
        confirmacion.classList.add('visible');

        setTimeout(function() {
            confirmacion.classList.remove('visible');
        }, 3000);
    });
}

// ── Botón limpiar ──
const btnLimpiar = document.getElementById('btnLimpiar');

if (btnLimpiar) {
    btnLimpiar.addEventListener('click', function() {
        const confirmar = confirm('¿Seguro que querés limpiar el formulario?');
        if (confirmar) {
            formRegistro.reset();
            calcularPrecio();
        }
    });
}

// ── Mostrar lista de envíos registrados ──
function mostrarEnviosRegistrados() {
    const listaEnvios = document.getElementById('listaEnvios');

    if (!listaEnvios) {
        return;
    }

    const envios = obtenerEnvios();
    listaEnvios.innerHTML = '';

    if (envios.length === 0) {
        listaEnvios.innerHTML = '<p class="vacio">Todavía no has registrado envíos.</p>';
        return;
    }

    for (const envio of envios) {
        const tarjeta = document.createElement('div');
        tarjeta.classList.add('envio-registrado');

        tarjeta.innerHTML =
            '<div style="flex:1">' +
                '<p class="numero-guia">#' + envio.numeroGuia + '</p>' +
                '<p class="detalle">' + envio.destinatario + '</p>' +
                '<p class="detalle">' + (envio.origen || '?') + ' → ' + envio.destino + ' · ' + envio.kilometros + ' km</p>' +
                '<p class="detalle">📅 Fecha Est. ' + envio.fechaEstimada + '</p>' +
                '<div class="badges">' +
                    '<span class="badge ' + envio.categoria + '">' + envio.categoria + '</span>' +
                    '<span class="badge entregado">₡' + envio.costo + '</span>' +
                '</div>' +
                '<div class="nota-editable">' +
                    '<input type="text" class="input-nota" data-id="' + envio.id + '" ' +
                    'placeholder="Agregar nota..." value="' + (envio.nota || '') + '">' +
                '</div>' +
            '</div>' +
            '<button class="btn-eliminar" data-id="' + envio.id + '">' +
                '<span class="material-symbols-outlined">delete</span>' +
            '</button>';

        listaEnvios.appendChild(tarjeta);
    }

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

    const botonesEliminar = document.querySelectorAll('.btn-eliminar');
    for (const boton of botonesEliminar) {
        boton.addEventListener('click', function() {
            eliminarEnvio(boton.dataset.id);
        });
    }
}

function eliminarEnvio(id) {
    const confirmar = confirm('¿Seguro que querés eliminar este envío?');

    if (!confirmar) {
        return;
    }

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