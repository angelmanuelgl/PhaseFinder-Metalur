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
export function dibujarBola(ctx, x, y, radio = 8) {
    ctx.beginPath();
    ctx.arc(x, y, radio, 0, Math.PI * 2);
    ctx.fillStyle = "#007bff"; 
    ctx.fill();
    ctx.strokeStyle = "white";
    ctx.lineWidth = radio / 4;
    ctx.stroke();
}

export function dibujarCruz(ctx, x, y, tamano = 10) {
    ctx.beginPath();
    ctx.strokeStyle = "#ff0000";
    ctx.lineWidth = tamano / 3;
    ctx.moveTo(x - tamano, y - tamano);
    ctx.lineTo(x + tamano, y + tamano);
    ctx.moveTo(x + tamano, y - tamano);
    ctx.lineTo(x - tamano, y + tamano);
    ctx.stroke();
}

export function refrescarLienzo(ctx, imagen) {
    if (!imagen) return;
    ctx.drawImage(imagen, 0, 0, ctx.canvas.width, ctx.canvas.height);
}

