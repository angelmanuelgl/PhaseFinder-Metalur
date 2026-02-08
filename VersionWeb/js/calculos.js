/**
 * Convierte valor real a Píxel (Escalado lineal)
 */
export function valorAPixel(v, vMin, vMax, pMax, invertir = false) {
    const p = ((v - vMin) / (vMax - vMin)) * pMax;
    return invertir ? Math.round(pMax - p) : Math.round(p);
}

/**
 * Convierte Píxel a valor real
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
    return {
        izqReal: pIzq !== null ? pixelAValor(pIzq, width, x_min, x_max) : null,
        derReal: pDer !== null ? pixelAValor(pDer, width, x_min, x_max) : null,
        px, py // devolvemos px/py para dibujar marcadores luego
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
    const pRelativo = valorAPixel(v, vMin, vMax, pMaxRelativo, invertir);
    
    // 2. Trasladamos de regreso al origen de la imagen completa
    return pStart + pRelativo;
}