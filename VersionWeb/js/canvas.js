/**
 * Carga una imagen y la dibuja en el canvas ajustando las dimensiones.
 * @param {string} ruta - Ruta de la imagen.
 * @param {HTMLCanvasElement} canvas - Referencia al elemento canvas.
 * @returns {Promise<HTMLImageElement>} - Retorna la imagen cargada.
 */
export async function ImagenEnCanvas(ruta, canvas) {
    return new Promise((resolve, reject) => {
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        const img = new Image();

        img.onload = () => {
            // Ajustamos el canvas al tamaño real de la imagen
            canvas.width = img.width;
            canvas.height = img.height;
            
            // Limpiamos y dibujamos
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0);
            
            resolve(img); // Devolvemos la imagen por si la necesitamos guardar
        };

        img.onerror = () => {
            reject(new Error(`No se pudo cargar la imagen en: ${ruta}`));
        };

        img.src = ruta;
    });
}



/**
 * Dibuja un círculo sólido (Bola azul)
 */
/**
 * Dibuja un punto (bola) azul en la posición especificada
 * @param {CanvasRenderingContext2D} ctx - Contexto del canvas
 * @param {number} x - Píxel X real en el canvas
 * @param {number} y - Píxel Y real en el canvas
 * @param {number} radio - Radio del punto
 */
export function dibujarBola(ctx, x, y, radio = 10) {
    ctx.save();
    ctx.beginPath();
    ctx.arc(x, y, radio, 0, Math.PI * 2);
    ctx.fillStyle = "#007bff"; // Azul vibrante
    ctx.fill();
    
    // Un pequeño borde blanco para que resalte sobre cualquier color
    ctx.strokeStyle = "white";
    ctx.lineWidth = radio / 4;
    ctx.stroke();
    ctx.restore();
}

/**
 * Dibuja una cruz (X) roja en la posición especificada
 * @param {CanvasRenderingContext2D} ctx - Contexto del canvas
 * @param {number} x - Píxel X real en el canvas
 * @param {number} y - Píxel Y real en el canvas
 * @param {number} tamano - Tamaño de los brazos de la cruz
 */
export function dibujarCruz(ctx, x, y, tamano = 12) {
    ctx.save();
    ctx.beginPath();
    ctx.strokeStyle = "#ff0000"; // Rojo puro
    ctx.lineWidth = tamano / 2;
    ctx.lineCap = "round";

    // Brazo 1: \
    ctx.moveTo(x - tamano, y - tamano);
    ctx.lineTo(x + tamano, y + tamano);

    // Brazo 2: /
    ctx.moveTo(x + tamano, y - tamano);
    ctx.lineTo(x - tamano, y + tamano);

    ctx.stroke();
    ctx.restore();
}

export function refrescarLienzo(ctx, imagen) {
    if (!imagen) return;
    ctx.drawImage(imagen, 0, 0, ctx.canvas.width, ctx.canvas.height);
}

