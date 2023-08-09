export const formatearFecha = fecha => {
    // usamos los slit por el tipo de formato que nos devuelve mongo
    const nuevaFecha = new Date(fecha.split('T')[0].split('-'));

    const opciones = {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    }

    return nuevaFecha.toLocaleDateString('es-ES', opciones)
}