// globales
let config = null;
let materialActual = null;
const canvas = document.getElementById('canvasGrafica');
const ctx = canvas.getContext('2d', { willReadFrequently: true });

// --- cargar json ---
fetch('js/graficas_config.json')
    .then(response => response.json())
    .then(data => {
        config = data;
        llenarSelector();
    })
    .catch(err => console.error("Error cargando JSON:", err));

// --- menu desplegable --- 
function llenarSelector() {
    const select = document.getElementById('selectMaterial');
    select.innerHTML = '<option value="" selected disabled>Selecciona una gráfica...</option>';
    
    for (const id in config) {
        const option = document.createElement('option');
        option.value = id;
        option.textContent = config[id].nombre_display;
        select.appendChild(option);
    }
}
let imagenOriginal = null;
// --- cambiar de imagen ---
document.getElementById('selectMaterial').addEventListener('change', (e) => {
    materialActual = config[e.target.value];
    const img = new Image();
    //! AJUSTAR LA RUTA // DEPENDE DE DONDE SE EJECUTE
    img.src = '../TratamientoImagenes/img_limpias/' + materialActual.archivo_limpio;
    
    img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        imagenOriginal = img;
        document.getElementById('status').textContent = "Gráfica cargada. Haz clic en un punto.";
    };
});

// --- clic en el canvas ---
canvas.addEventListener('click', (e) => {
    if (!materialActual) return;

    // cordenadas del clic relativas al canvas
    const rect = canvas.getBoundingClientRect();
    const px = Math.round(e.clientX - rect.left);
    const py = Math.round(e.clientY - rect.top);

    // obtener datos de la fila de pixelkes
    const imgData = ctx.getImageData(0, py, canvas.width, 1).data;

    // bsucar vecinos blancos a izquierda y derecha
    let pIzq = null;
    let pDer = null;

    for (let i = px; i >= 0; i--) {
        if (imgData[i * 4] > 128) { // el indice es i*4 porque es RGBA (R > 128 es blanco)
            pIzq = i;
            break;
        }
    }

    for (let i = px; i < canvas.width; i++) {
        if (imgData[i * 4] > 128) {
            pDer = i;
            break;
        }
    }

    // convertir a unidades reales y mostrar
    mostrarResultados(pIzq, pDer, py);
    dibujarMarcadores(px, py, pIzq, pDer);
});

function mostrarResultados(pIzq, pDer, py) {
    const { x_min, x_max, y_min, y_max, unidad_x, unidad_y } = materialActual;
    const w = canvas.width;
    const h = canvas.height;

    if (pIzq !== null) {
        const valIzq = x_min + (pIzq / w) * (x_max - x_min);
        document.getElementById('resIzq').textContent = `${valIzq.toFixed(4)} ${unidad_x}`;
    } else {
        document.getElementById('resIzq').textContent = "No encontrado";
    }

    if (pDer !== null) {
        const valDer = x_min + (pDer / w) * (x_max - x_min);
        document.getElementById('resDer').textContent = `${valDer.toFixed(4)} ${unidad_x}`;
    } else {
        document.getElementById('resDer').textContent = "No encontrado";
    }

    const temp = y_max - (py / h) * (y_max - y_min);
    document.getElementById('status').textContent = `Consulta a ${temp.toFixed(1)} ${unidad_y}`;
}

function dibujarMarcadores(px, py, pIzq, pDer) {
    // Redibujar imagen para limpiar marcas anteriores
    const img = new Image();
    img.src = canvas.toDataURL(); 
    // Para no parpadear, mejor solo dibujamos encima o guardamos estado
    // Por simplicidad en este ejemplo, solo dibujamos círculos:
    
    ctx.fillStyle = "red";
    ctx.beginPath();
    ctx.arc(px, py, 3, 0, Math.PI * 2); // Punto donde hizo clic
    ctx.fill();

    ctx.fillStyle = "blue";
    if(pIzq) ctx.fillRect(pIzq - 2, py - 5, 4, 10); // Línea izq encontrada
    if(pDer) ctx.fillRect(pDer - 2, py - 5, 4, 10); // Línea der encontrada
}

document.getElementById('btnReiniciar').addEventListener('click', () => {
    // Recargar la imagen para limpiar puntos rojos/azules
    const event = new Event('change');
    document.getElementById('selectMaterial').dispatchEvent(event);
});


// Función para calcular desde los inputs manuales
document.getElementById('btnCalcularManual').addEventListener('click', () => {
    if (!materialActual) return;

    const valY = parseFloat(document.getElementById('inputTemp').value);
    const valX = parseFloat(document.getElementById('inputComp').value);

    if (isNaN(valY) || isNaN(valX)) {
        alert("Por favor, ingresa valores numéricos válidos.");
        return;
    }

    const { x_min, x_max, y_min, y_max } = materialActual;
    const w = canvas.width;
    const h = canvas.height;

    // CONVERSIÓN: Real -> Píxel (La misma lógica que tenías en Python)
    const px = Math.round(((valX - x_min) / (x_max - x_min)) * w);
    const py = Math.round(((y_max - valY) / (y_max - y_min)) * h);

    // Validar que el punto esté dentro de la gráfica
    if (px < 0 || px > w || py < 0 || py > h) {
        alert("El punto está fuera de los límites de esta gráfica.");
        return;
    }

    // Ejecutar búsqueda de vecinos
    const imgData = ctx.getImageData(0, py, w, 1).data;
    let pIzq = null;
    let pDer = null;

    for (let i = px; i >= 0; i--) {
        if (imgData[i * 4] > 128) { pIzq = i; break; }
    }
    for (let i = px; i < w; i++) {
        if (imgData[i * 4] > 128) { pDer = i; break; }
    }

    // Mostrar resultados y dibujar
    mostrarResultados(pIzq, pDer, py);
    dibujarMarcadores(px, py, pIzq, pDer);
});