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

        // 3. DAR RESPUESTA /// dibujando en el canvas

        canvasTool.refrescarLienzo(state.elementos.canvas.getContext('2d'), state.imagenActual);
        
        marcarPuntoEnGrafica("bolita", valComp, valTemp, state);
        // 2. Las cruces rojas de los límites encontrados
        if (resultados.izqReal) {
            marcarPuntoEnGrafica("cruz", resultados.izqReal, valTemp, state);
            console.log("limite izquierda");
        }
        if (resultados.derReal) {
            marcarPuntoEnGrafica("cruz", resultados.derReal, valTemp, state);
            console.log("limite derehca");
        }


        // 3. DAR RESPUESTA ///  Actualizar Textos (UI)
        state.elementos.resIzq.textContent = resultados.izqReal?.toFixed(4) || "No encontrado";
        state.elementos.resDer.textContent = resultados.derReal?.toFixed(4) || "No encontrado";

        // 4. ¡LA MAGIA! Dibujar todo con una sola línea
        console.log("Estado actual de la imagen:", state.imagenActual)
        // actualizarGrafica(state, resultados, valComp, valTemp);

        
    });
    
    /*
        C L I C K   E N  C A N V A S
    */
    
    /*  ---  ---  ESTO ES PARA QUE ME SE MAS FACIL AGREGAR UNA NUEVA GRAFICA --- ---  */
    // state.elementos.canvas.addEventListener('click', (e) => {
    //     const canvas = state.elementos.canvas;
    //     const rect = canvas.getBoundingClientRect();

    //     // 1. posicion RELATIVA (de 0 a 1)
    //     const xRel = (e.clientX - rect.left) / rect.width;
    //     const yRel = (e.clientY - rect.top) / rect.height;
        
    //     //! info importante para poner en el json
    //     // alert(`xRel: ${xRel.toFixed(4)}, clientWidth: ${canvas.clientWidth}, zoom: ${window.devicePixelRatio}`);
    //     // alert(`xRel: ${xRel.toFixed(4)}, yRel: ${yRel.toFixed(4)},`);


    //     if (!info || !info.limites_pixeles_usuario) {
    //         console.log(`%c [DEBUG] xRel: ${xRel.toFixed(4)}, yRel: ${yRel.toFixed(4)}`, "color: cyan;");
    //         return;
    //     }

    // });
    state.elementos.canvas.addEventListener('click', (e) => {
        const canvas = state.elementos.canvas;
        const rect = canvas.getBoundingClientRect();
        const info = state.materialSeleccionado;

        // 1. posicion RELATIVA (Invariante)
        const xRel = (e.clientX - rect.left) / rect.width;
        const yRel = (e.clientY - rect.top) / rect.height;

        if (!info || !info.limites_pixeles_usuario) {
            console.log(`%c [DEBUG] xRel: ${xRel.toFixed(4)}, yRel: ${yRel.toFixed(4)}`, "color: cyan;");
            return;
        }

        const cal = info.limites_pixeles_usuario;

        // 2. Calculo de valores reales usando xRel/yRel como el parámetro 'p'
        // Pasamos xRel como posición, y x_start/x_end como los límites (también en 0-1)
        const valComp = calculos.clicADatosReales(
            xRel, 
            cal.x_start, 
            cal.x_end, 
            info.x_min, 
            info.x_max
        );

        const valTemp = calculos.clicADatosReales(
            yRel, 
            cal.y_start, 
            cal.y_end, 
            info.y_min, 
            info.y_max
            // El parámetro 'invertir' no es necesario si y_start es mayor que y_end en el JSON
            // Pero tu función lo gestiona internamente si lo necesitas.
        );

        // 3. Log de resultados
        // alert(`%c Resultados: ${valComp.toFixed(3)}${info.unidad_x} | ${valTemp.toFixed(1)}${info.unidad_y}`, "color: #00ff00; font-weight: bold;");
        
        actualizarInputsUI(state, valTemp, valComp);

        // Disparar el cálculo manual automáticamente
        state.elementos.btnManual.click();
    
    });


    // reetear
    state.elementos.btnReiniciar.addEventListener('click', (e) => {
        canvasTool.refrescarLienzo(state.elementos.canvas.getContext('2d'), state.imagenActual);
    
    });
}

// js/interactuar.js

/**
 * Actualiza los campos de entrada manual con los valores calculados
 * @param {Object} state - El estado global de la aplicación
 * @param {number} temperatura - Valor de temperatura (eje Y)
 * @param {number} composicion - Valor de composición/carbono (eje X)
 */
export function actualizarInputsUI(state, temperatura, composicion) {
    // 1. Validamos que los elementos existan en el state
    const { inputTemp, inputComp } = state.elementos;

    if (inputTemp && inputComp) {
        // 2. Formateamos los valores:
        // Temperatura: Generalmente sin decimales o con 1 (°C)
        // Composición: Con 3 decimales para precisión en metalurgia (%C)
        inputTemp.value = temperatura.toFixed(1);
        inputComp.value = composicion.toFixed(3);
        
        // Opcional: Podrías disparar un pequeño efecto visual o log
        // console.log("UI Actualizada: ", { temperatura, composicion });
    }
}

/**
 * Traduce valores reales a coordenadas del canvas y dibuja el elemento
 * @param {string} tipo - "bolita" o "cruz"
 * @param {number} valorX - % de Carbono (Real)
 * @param {number} valorY - Temperatura (Real)
 * @param {Object} state - Estado global
 */
function marcarPuntoEnGrafica(tipo, valorX, valorY, state) {
    const canvas = state.elementos.canvas;
    const ctx = canvas.getContext('2d');
    const info = state.materialSeleccionado;
    const cal = info.limites_pixeles_usuario;

    // 1. TRADUCIR límites del JSON (0-1) a Píxeles Reales del Canvas (0-4460)
    // Esto es lo que faltaba: que Start y End estén en la misma escala que el Canvas
    const xStartPx = cal.x_start * canvas.width;
    const xEndPx = cal.x_end * canvas.width;
    const yStartPx = cal.y_start * canvas.height;
    const yEndPx = cal.y_end * canvas.height;

    // 2. CALCULAR Píxel Final
    // Ahora pasamos píxeles a la función, no porcentajes.
    const pxFinal = calculos.datosRealesAClic(
        valorX, 
        info.x_min, 
        info.x_max, 
        xStartPx, 
        xEndPx
    );

    const pyFinal = calculos.datosRealesAClic(
        valorY, 
        info.y_min, 
        info.y_max, 
        yStartPx, 
        yEndPx,
        true // Invertir para temperatura
    );

    // 3. Tamaño del punto
    const size = canvas.width * 0.01;

    // 4. Dibujar (Sin multiplicar por nada, porque pxFinal ya es el píxel exacto)
    if (tipo === "bolita") {
        canvasTool.dibujarBola(ctx, pxFinal, pyFinal, size);
    } else if (tipo === "cruz") {
        canvasTool.dibujarCruz(ctx, pxFinal, pyFinal, size * 1.2);
    }
}