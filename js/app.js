

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
    precioFormula.textContent = km + 'kmn x ₡600 x ' + multiplicador;
    precioTotal.textContent = 'Total: ₡' + total;
}

//Solo corre si estamos en registro.html

if (inputKilometros) {
    inputKilometros.addEventListener ('input', calcularPrecio);
    selectCategoria.addEventListener ('change', calcularPrecio);
    calcularPrecio();
}