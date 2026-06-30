// Calculo de precios
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

// Se guarda el envio
const formRegistro = document.getElementById('formRegistro');

if (formRegistro) {
    formRegistro.addEventListener('submit', function (event) {
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

        //validaciones
        if (numeroGuia === '') {
            document.getElementById('errorGuia').textContent = 'Este campo es requerido';
            document.getElementById('errorGuia').classList.add('visible');
            valido = false;
        } else {
            document.getElementById('errorGuia').classList.remove('visible');
        }

        const envios = obtenerEnvios();
        const yaExiste = envios.some(function (envio) {
            return envio.numeroGuia === numeroGuia;
        });

        if (yaExiste) {
            document.getElementById('errorGuia').textContent = 'Ese número de guía ya existe';
            document.getElementById('errorGuia').classList.add('visible');
            valido = false;
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

        envios.push(nuevoEnvio);
        guardarEnvios(envios);

        formRegistro.reset();
        calcularPrecio();
        mostrarEnviosRegistrados();

        Swal.fire({
            title: '¡Envío registrado!',
            text: 'El envío fue guardado correctamente.',
            icon: 'success',
            confirmButtonColor: '#7803ED',
            timer: 2500,
            showConfirmButton: true
        });
    });
}

//Boton de limpiar
const btnLimpiar = document.getElementById('btnLimpiar');

if (btnLimpiar) {
    btnLimpiar.addEventListener('click', function () {
        Swal.fire({
            title: '¿Limpiar formulario?',
            text: 'Se borrarán todos los campos.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Sí, limpiar',
            cancelButtonText: 'Cancelar',
            confirmButtonColor: '#7803ED',
            cancelButtonColor: '#444'
        }).then(function (resultado) {
            if (resultado.isConfirmed) {
                formRegistro.reset();
                calcularPrecio();
            }
        });
    });
}

// Muestra la lista de envios registrados
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
        input.addEventListener('input', function () {
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
        boton.addEventListener('click', function () {
            eliminarEnvio(boton.dataset.id);
        });
    }
}

// Reemplaza eliminarEnvio completo
function eliminarEnvio(id) {
    Swal.fire({
        title: '¿Eliminar envío?',
        text: 'Esta acción no se puede deshacer.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar',
        confirmButtonColor: '#f44336',
        cancelButtonColor: '#444'
    }).then(function (resultado) {
        if (resultado.isConfirmed) {
            const envios = obtenerEnvios();
            const nuevosEnvios = [];

            for (const envio of envios) {
                if (envio.id !== id) {
                    nuevosEnvios.push(envio);
                }
            }

            guardarEnvios(nuevosEnvios);
            mostrarEnviosRegistrados();

            Swal.fire({
                title: 'Eliminado',
                text: 'El envío fue eliminado correctamente.',
                icon: 'success',
                confirmButtonColor: '#7803ED',
                timer: 2000,
                showConfirmButton: false
            });
        }
    });
}

if (document.getElementById('listaEnvios')) {
    mostrarEnviosRegistrados();
}