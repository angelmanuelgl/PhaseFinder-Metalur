import * as canvasTool from './canvas.js';
import * as calculos from './calculos.js';

/*
*
     E V E N T O S

*/

export function registrarEventos(state) {
     /*
        C A M B I O    D E   G R A F I C A
    */
    state.elementos.select.addEventListener('change', async (e) => {
        const info = state.config[e.target.value];
        if (!info) return;

        state.materialSeleccionado = info;

        try {
            // 1. Imagen para el usuario (Visible)
            state.imagenActual = await canvasTool.ImagenEnCanvas(
                `sources/img_usuario/${info.archivo_usuario}`, 
                state.elementos.canvas
            );

            // 2. Imagen para el cálculo (Fantasma)
            const canvasOculto = document.createElement('canvas');
            // La cargamos pero no la pegamos al DOM
            const imgLimpia = await canvasTool.ImagenEnCanvas(
                `sources/img_limpias/${info.archivo_limpio}`, 
                canvasOculto
            );
            
            // Guardamos el contexto oculto en el estado para usarlo después
            state.ctxLimpio = canvasOculto.getContext('2d', { willReadFrequently: true });
            
            state.elementos.status.textContent = "Sistema listo.";
        } catch (err) {
            console.error(err);
        }
    });

    /*
        B O T O N    M A N U A L
    */
    state.elementos.btnManual.addEventListener('click', () => {
        if (!state.materialSeleccionado || !state.ctxLimpio) {
            alert("Primero selecciona un material");
            return;
        }

        // 1. Obtener valores de los inputs
        const valTemp = parseFloat(state.elementos.inputTemp.value);
        const valComp = parseFloat(state.elementos.inputComp.value);

        if (isNaN(valTemp) || isNaN(valComp)) {
            alert("Ingresa valores numéricos válidos");
            return;
        }

        // 2. Llamar a la función maestra de calculos.js
        // Pasamos: (Composición, Temperatura, Estado, ContextoBinarizado)
        const resultados = calculos.procesarPunto(
            valComp, 
            valTemp, 
            state.materialSeleccionado,
            state.ctxLimpio
        );
         console.log("ingresado:", valComp, valTemp);

        // 3. Actualizar Textos (UI)
        state.elementos.resIzq.textContent = resultados.izqReal?.toFixed(4) || "No encontrado";
        state.elementos.resDer.textContent = resultados.derReal?.toFixed(4) || "No encontrado";

        // 4. ¡LA MAGIA! Dibujar todo con una sola línea
        console.log("Estado actual de la imagen:", state.imagenActual)
        // actualizarGrafica(state, resultados, valComp, valTemp);

        
    });
    
    /*
        C L I C K   E N  C A N V A S
    */

state.elementos.canvas.addEventListener('click', (e) => {
    const canvas = state.elementos.canvas;
    const rect = canvas.getBoundingClientRect();

    // 1. Calculamos la posición RELATIVA (de 0 a 1)
    // Esto es lo único que NO cambia con el zoom o el tamaño de pantalla
    const xRel = (e.clientX - rect.left) / rect.width;
    const yRel = (e.clientY - rect.top) / rect.height;

    // 2. Lo convertimos a la "Escala de Calibración"
    // Usamos el ancho visual base (clientWidth) que es el que usaste en tu JSON.
    // OJO: Si tu JSON lo hiciste con el canvas midiendo 480px, puedes poner 480 fijo aquí.
    const x = Math.round(xRel * canvas.clientWidth);
    const y = Math.round(yRel * canvas.clientHeight);

    // EL CONSOLE LOG QUE BUSCABAS
    alert(`%c Coordenadas para el JSON: [X: ${x}, Y: ${y}]`, "color: yellow; background: black; font-weight: bold;");

    // ... resto de tu lógica para valComp y valTemp usando este x e y ...
    
    // Debug extra para que veas qué está pasando:
    alert(`Debug -> xRel: ${xRel.toFixed(4)}, clientWidth: ${canvas.clientWidth}, zoom: ${window.devicePixelRatio}`);
});
}

// js/interactuar.js

function actualizarGrafica(state, resultados, valComp, valTemp) {
    const canvas = state.elementos.canvas;
    const ctx = canvas.getContext('2d');
    const info = state.materialSeleccionado;
    const cal = info.limites_pixeles_usuario;

    // 1. Limpiar el fondo
    canvasTool.refrescarLienzo(ctx, state.imagenActual);

    // 2. EL FACTOR DE CORRECCIÓN
    // Si el canvas interno mide 4000 y en pantalla ves 400, el factor es 10.
    const factor = canvas.width / canvas.clientWidth;

    // 3. OBTENER PÍXELES USANDO TU FUNCIÓN (La que ya tenemos)
    // Pasamos los datos reales y nos devuelve píxeles de pantalla. 
    // Luego multiplicamos por el factor para ir al mundo real del canvas.
    const pxCentro = calculos.datosRealesAClic(valComp, info.x_min, info.x_max, cal.x_start, cal.x_end) * factor;
    const pyCentro = calculos.datosRealesAClic(valTemp, info.y_min, info.y_max, cal.y_start, cal.y_end) * factor;

    // 4. Radio proporcional (que se vea de unos 10px en pantalla siempre)
    const radioAjustado = 5 * factor;

    // 5. DIBUJAR
    canvasTool.dibujarBola(ctx, pxCentro, pyCentro, radioAjustado);

    if (resultados.izqReal !== null) {
        const pxIzq = calculos.datosRealesAClic(resultados.izqReal, info.x_min, info.x_max, cal.x_start, cal.x_end) * factor;
        canvasTool.dibujarCruz(ctx, pxIzq, pyCentro, radioAjustado * 1.0);
    }

    if (resultados.derReal !== null) {
        const pxDer = calculos.datosRealesAClic(resultados.derReal, info.x_min, info.x_max, cal.x_start, cal.x_end) * factor;
        canvasTool.dibujarCruz(ctx, pxDer, pyCentro, radioAjustado * 1.0);
    }
}