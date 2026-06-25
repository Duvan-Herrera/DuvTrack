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
        if (envio.estado !== 'Entregado') {
            const fechaEnvio = new Date(envio.fechaEstimada);
            fechaEnvio.setHours(0, 0, 0, 0);

            if (fechaEnvio < hoy && envio.estado !== 'Retrasado') {
                envio.estado = 'Retrasado'
                envio.ultimoEvento = 'Fecha estimada vencida';
                cambios = true;
            }
        }
    }

    if (cambios) {
        guardarEnvios(envios);
    }
}