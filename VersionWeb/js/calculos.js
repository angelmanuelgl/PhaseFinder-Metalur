/**
 * Convierte valor real a Píxel (Escalado lineal)
 */
export function valorAPixel(v, vMin, vMax, pMax, invertir = false) {
    const p = ((v - vMin) / (vMax - vMin)) * pMax;
    return invertir ? Math.round(pMax - p) : Math.round(p);
}

/**
 * Convierte Pixel a valor real
 */
export function pixelAValor(p, pMax, vMin, vMax, invertir = false) {
    const porcentaje = p / pMax;
    if (invertir) return vMax - (porcentaje * (vMax - vMin));
    return vMin + (porcentaje * (vMax - vMin));
}

/**
 * Escanea una fila de píxeles buscando el primer blanco (255) a izq y der.
 * @param {Uint8ClampedArray} data - Datos de la fila (RGBA)
 * @param {number} px - Punto de partida X
 * @param {number} width - Ancho del canvas
 * @returns {Object} {pIzq, pDer} en píxeles
 */
export function buscarVecinos(data, px, width) {
    let pIzq = null;
    let pDer = null;

    // Buscar a la izquierda
    for (let i = px; i >= 0; i--) {
        if (data[i * 4] > 128) { // Canal Rojo > 128 (es blanco)
            pIzq = i;
            break;
        }
    }

    // Buscar a la derecha
    for (let i = px; i < width; i++) {
        if (data[i * 4] > 128) {
            pDer = i;
            break;
        }
    }

    return { pIzq, pDer };
}


/**
 * Procesa la consulta 
 * ctxLimpio e sun canvas fantasma con la imagen que se usara
 * no la que usara el usuario
*/
export function procesarPunto(valX, valY, materialConfig, ctxLimpio) {
    console.log("cordenadas", valX, valY );
    const { x_min, x_max, y_min, y_max } = materialConfig;

    const width = ctxLimpio.canvas.width;
    const height = ctxLimpio.canvas.height;

    console.log("valores", x_min, x_max, y_min, y_max );
    console.log("imagen", width, height );
    // 1. Real -> Píxel
    const px = valorAPixel(valX, x_min, x_max, width);
    const py = valorAPixel(valY, y_min, y_max, height, true); // Eje Y invertido

    // datos de la iamgen limpia
    const imageData = ctxLimpio.getImageData(0, py, width, 1).data;

    // encontrar vecinos
    const { pIzq, pDer } = buscarVecinos(imageData, px, width);

    // 4. Pixel -> Real
    const izqReal= pIzq !== null ? pixelAValor(pIzq, width, x_min, x_max) : null;
    const derReal= pDer !== null ? pixelAValor(pDer, width, x_min, x_max) : null;

    return {
        izqReal:izqReal, derReal:derReal, // RESPUESTAS en cordenadas reales
        pIzq, pDer, // RESPUESTA en cordenadas pixeles
        px, py // devolvemos poscion  en coordenas p
    };
}



/**
    Píxel de Usuario -> Valor Real (Usando Calibración)

    estoy conciente que peudon reusar als funciones anteriroes pero eh
 */
export function clicADatosReales(p, pStart, pEnd, vMin, vMax, invertir = false) {
    // 1. Trasladamos el punto al nuevo origen y calculamos el ancho relativo
    const pRelativo = p - pStart;
    const pMaxRelativo = pEnd - pStart;

    // 2. Reutilizamos la función base
    return pixelAValor(pRelativo, pMaxRelativo, vMin, vMax, false);
}

export function datosRealesAClic(v, vMin, vMax, pStart, pEnd, invertir = false) {
    const pMaxRelativo = pEnd - pStart;
    
    // 1. Obtenemos la posición dentro del área de la gráfica
    const pRelativo = valorAPixel(v, vMin, vMax, pMaxRelativo, false);
    
    // 2. Trasladamos de regreso al origen de la imagen completa
    return pStart + pRelativo;
}

/**
 * Calcula la regla de la palanca
 * @param {number} c0 - Composición nominal (donde el usuario hizo clic)
 * @param {number} cL - Límite izquierdo (fase A)
 * @param {number} cS - Límite derecho (fase B)
 */
export function calcularPalanca(c0, cL, cS) {
    if (cL === null || cS === null || cS === cL) return null;

    // Proporción de la fase DERECHA (línea opuesta)
    const porcDer = ((c0 - cL) / (cS - cL)) * 100;
    // Proporción de la fase IZQUIERDA
    const porcIzq = 100 - porcDer;

    //  return { 
    //     izq: 25, 
    //     der: 75
    // };
    return { 
        izq: Math.max(0, Math.min(100, porcIzq)), 
        der: Math.max(0, Math.min(100, porcDer)) 
    };
}

/**
 * Determina si un punto pertenece a una región mediante trazado de línea recta.
 * @param {string} nombreRegion - Clave de la región en el JSON.
 * @param {number} px - Píxel X del punto de interés.
 * @param {number} py - Píxel Y del punto de interés.
 * @param {Object} materialConfig - Configuración del material.
 * @param {CanvasRenderingContext2D} ctxLimpio - Contexto de la imagen binarizada.
 * @returns {boolean} - True si no hay obstrucciones (píxeles blancos) en el camino.
 */
export function perteneceEnEstaRegion(nombreRegion, px, py, materialConfig, ctxLimpio) {
    const region = materialConfig.regiones[nombreRegion];
    if (!region) return false;

    const width = ctxLimpio.canvas.width;
    const height = ctxLimpio.canvas.height;

    // 1. Convertir coordenadas reales del representante a píxeles
    const targetPx = valorAPixel(region.x, materialConfig.x_min, materialConfig.x_max, width);
    const targetPy = valorAPixel(region.y, materialConfig.y_min, materialConfig.y_max, height, true);

    // 2. Algoritmo de trazado de línea (DDA simplificado)
    const dx = targetPx - px;
    const dy = targetPy - py;
    const pasos = Math.max(Math.abs(dx), Math.abs(dy));

    if (pasos === 0) return true;

    const xInc = dx / pasos;
    const yInc = dy / pasos;

    let xActual = px;
    let yActual = py;

    // 3. Muestrear la imagen binarizada a lo largo de la trayectoria
    for (let i = 0; i <= pasos; i++) {
        const checkX = Math.round(xActual);
        const checkY = Math.round(yActual);

        // Obtener color del píxel (Canal R es suficiente para binarizada)
        const pixelData = ctxLimpio.getImageData(checkX, checkY, 1, 1).data;
        
        // Si el píxel es blanco (> 128), cruzamos un borde
        if (pixelData[0] > 128) {
            return false; 
        }

        xActual += xInc;
        yActual += yInc;
    }

    return true;
}

/**
 * Identifica a qué región pertenece el punto clicado.
 * @param {number} px - Píxel X.
 * @param {number} py - Píxel Y.
 * @param {Object} materialConfig - Configuración.
 * @param {CanvasRenderingContext2D} ctxLimpio - Contexto binarizado.
 * @returns {string} - Nombre de la región encontrada o "Desconocida".
 */
export function deCualRegionEs(px, py, materialConfig, ctxLimpio) {
    if (!materialConfig.regiones) return "Desconocida";

    // Iterar por las regiones definidas en el JSON
    for( const nombreRegion in materialConfig.regiones) {
        // Ignoramos las combinaciones si solo buscamos regiones monofásicas puras inicialmente,
        // o las incluimos según tu lógica de regiones.
        if (perteneceEnEstaRegion(nombreRegion, px, py, materialConfig, ctxLimpio)) {
            return nombreRegion;
        }
    }

    return "Región no identificada";
}