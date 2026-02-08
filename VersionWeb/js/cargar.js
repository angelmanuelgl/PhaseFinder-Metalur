/**
 * Carga el archivo de configuración JSON.
 * @param {string} url - ruta del archivo .json
 * @returns {Promise<Object|null>} - Retorna el objeto de configuración o null si hay error.
 */
export async function Configuracion(url) {
    try {
        const respuesta = await fetch(url);
        
        // validamos si la respuesta es correcta
        if (!respuesta.ok) {
            throw new Error(`Error al cargar: ${respuesta.status} ${respuesta.statusText}`);
        }

        const datos = await respuesta.json();
        console.log("Configuración cargada con éxito:", datos);
        return datos;

    } catch (error) {
        console.error("Fallo crítico al obtener la configuración:", error);
        // todo: mostrar algo en HTML para que lo vea el usurio
        return null;
    }
}


/**
 * Llena un elemento <select> con las opciones de la configuración.
 * @param {Object} config - El objeto con los datos de los materiales.
 * @param {string} selectorId - El ID del elemento HTML <select>.
 */
export function Seleccionador(config, selectorId) {
    const select = document.getElementById(selectorId);
    
    if (!select) {
        console.error(`No se encontró el elemento con ID: ${selectorId}`);
        return;
    }

    // 1. Limpiar opciones previas y añadir la opción por defecto
    select.innerHTML = '';
    
    const defaultOption = document.createElement('option');
    defaultOption.value = "";
    defaultOption.textContent = "Selecciona una gráfica...";
    defaultOption.disabled = true;
    defaultOption.selected = true;
    select.appendChild(defaultOption);

    // 2. Validar que la configuración tenga datos
    if (!config || Object.keys(config).length === 0) {
        console.warn("La configuración está vacía, no hay opciones para mostrar.");
        return;
    }

    // 3. Crear las opciones dinámicamente
    // Usamos Object.entries para tener acceso directo a la clave (id) y al valor (datos)
    Object.entries(config).forEach(([id, datos]) => {
        const option = document.createElement('option');
        option.value = id;
        option.textContent = datos.nombre_display || id; // Fallback al ID si no hay nombre
        select.appendChild(option);
    });
}