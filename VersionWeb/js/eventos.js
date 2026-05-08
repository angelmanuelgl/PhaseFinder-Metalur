import * as canvasTool from './canvas.js';
import * as calculos from './calculos.js';

/*
*
     E V E N T O S

*/

export function registrarEventos(state) {
     /*
        --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
        --- --- --- ---   C A M B I O    D E   G R A F I C A   --- --- --- ---
        --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
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
        --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
        --- --- --- --- --- B O T O N    M A N U A L --- --- --- --- ---
        --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
    */
    state.elementos.btnManual.addEventListener('click', () => {
        if (!state.materialSeleccionado || !state.ctxLimpio) {
            alert("Primero selecciona un material");
            return;
        }

        // --- --- --- --- --- --- --- --- --- ---   sINPUT  --- --- --- --- ---  --- --- --- --- ---   
        //  Obtener valores de los inputs
        const valTemp = parseFloat(state.elementos.inputTemp.value);
        const valComp = parseFloat(state.elementos.inputComp.value);

        if (isNaN(valTemp) || isNaN(valComp)) {
            alert("Ingresa valores numéricos válidos");
            return;
        }

        // --- --- --- --- ---  --- --- --- --- ---   CALCULOS  --- --- --- --- ---   --- --- --- --- ---  
        // Llamar a la función maestra de calculos.js
        // Pasamos: (Composición, Temperatura, Estado, ContextoBinarizado)
        // limites izquierdo y derechos
        const resultados = calculos.procesarPunto(
            valComp, 
            valTemp, 
            state.materialSeleccionado,
            state.ctxLimpio
        );
        console.log("ingresado:", valComp, valTemp);

        // la region donde se hizo click
        const nombreRegion = calculos.deCualRegionEs(
            resultados.px, 
            resultados.py, 
            state.materialSeleccionado, 
            state.ctxLimpio
        );
        const datosRegion = state.materialSeleccionado?.regiones?.[nombreRegion];
  


        // --- --- --- --- ---  --- --- --- --- ---   MARCAR CANVAS --- --- --- --- ---  --- --- --- --- ---   
        canvasTool.refrescarLienzo(state.elementos.canvas.getContext('2d'), state.imagenActual);
        
        // diujar bolita en el punto exacto
        marcarPuntoEnGrafica("bolita", valComp, valTemp, state);
        
        
        // poner curces en los limites
        if (resultados.izqReal) {
            marcarPuntoEnGrafica("cruz", resultados.izqReal, valTemp, state);
            console.log("limite izquierda");
        }
        if (resultados.derReal) {
            marcarPuntoEnGrafica("cruz", resultados.derReal, valTemp, state);
            console.log("limite derehca");
        }


        

        // --- --- --- --- ---   --- --- --- --- ---   DAR RESPUESTA UI --- --- --- --- ---  --- --- --- --- ---  
        //  Actualizar Textos (UI) DE IZQ Y DER
        state.elementos.resIzq.textContent = resultados.izqReal?.toFixed(4) || "No encontrado";
        state.elementos.resDer.textContent = resultados.derReal?.toFixed(4) || "No encontrado";

        //  --- --- --- --- ---  AVISOS  --- --- --- --- ---  
        // si es bifasico y no encontramos limites,
        // poner texto con salto de linea explicando que puede ser por estar muy cerca del limite o por imprecisión de la gráfica
        state.elementos.avisoContenedor.classList.add('d-none'); // ocultamos por defecto
 
        if( datosRegion && datosRegion.izq && datosRegion.der && (!resultados.izqReal || !resultados.derReal) ){
            state.elementos.avisoContenedor.classList.remove('d-none');
            state.elementos.avisoTitulo.textContent = "¡Atención!";
            state.elementos.avisoContenido.innerHTML = `
                Se esperaba una región bifásica (<b>${datosRegion.izq} + ${datosRegion.der}</b>), pero no se encontraron ambos límites. 
                <br><br>
                
                <b>Sugerencia:</b>
                <ul class="mt-1 mb-0">
                    <li>Seleccionar un punto más alejado del límite.</li>
                    <li>Mover el cursor para seleccionar otro punto cercano.</li>
                    <li><b>Cambiar de grafica. </b></li>
                </ul>

                <br>
                Esto puede deberse a:
                <ul class="mt-2 mb-0">
                    <li>El punto seleccionado está muy cerca de una línea de fase.</li>
                    <li>El escaneo horizontal no alcanzó a cruzar un borde negro.</li>
                    <li>La imagen de la grafica atual no contiene ambos límites.</li>
                </ul>

            `;
    }else{
            state.elementos.avisoContenedor.classList.add('d-none');
        }

        //  --- --- --- --- ---  NOMBRE  DE FASE  --- --- --- --- ---  
        state.elementos.faseNombre.textContent = `${nombreRegion}`;
        //   CASO BIFÁSICO 
        if( datosRegion && datosRegion.izq && datosRegion.der ){
            // Cambiamos a un color que resalte la combinación (ej: Warning/Naranja o Success/Verde)
            state.elementos.faseActual.classList.remove('bg-info', 'text-dark'); 
            state.elementos.faseActual.classList.add('bg-warning', 'text-dark');
        }
        //  CASO MONOFÁSICO 
        else {
            // Volvemos al color original (Info/Azul claro)
            state.elementos.faseActual.classList.remove('bg-warning');
            state.elementos.faseActual.classList.add('bg-info', 'text-dark');
        }


        //  --- --- --- --- ---  REGLA PALANCA  --- --- --- --- ---  
        // Solo si tenemos dos límites (bifásico) ( la región tiene datos de fases(
        // y si encontramos limites aplicamos la regla de la palanca
        if( resultados.izqReal && resultados.derReal && datosRegion && datosRegion.izq  && datosRegion.der ) {
            
            const palanca = calculos.calcularPalanca(valComp, resultados.izqReal, resultados.derReal);
            console.log("palanca", palanca);
            
        
            if (palanca) {
                // Mostrar contenedor
                state.elementos.contenedorPalanca.classList.remove('d-none');

                // Actualizar textos
                state.elementos.nameIzq.textContent = datosRegion.izq;
                state.elementos.nameDer.textContent = datosRegion.der;

                state.elementos.percIzq.textContent = palanca.izq.toFixed(1);
                state.elementos.percDer.textContent = palanca.der.toFixed(1);

                // Actualizar barras visuales
                state.elementos.barraIzq.style.width = `${palanca.izq}%`;
                state.elementos.barraDer.style.width = `${palanca.der}%`;

                // Generar Memoria de Cálculo
                state.elementos.detallesPalanca.classList.remove('d-none');
                state.elementos.pasosSustitucion.classList.remove('d-none');
                

                // paso a paso la regla de la palanca
                const C0 = valComp.toFixed(3);
                const CL = resultados.izqReal.toFixed(3);
                const CS = resultados.derReal.toFixed(3);
                const P_der = palanca.der.toFixed(1);
                const P_izq = palanca.izq.toFixed(1);
                
                state.elementos.pasosSustitucion.innerHTML = `
                    <div class="mb-3">
                        <strong>1. Datos identificados:</strong><br>
                        $C_0 = ${C0}\%$, $C_{izq} = ${CL}\%$, $C_{der} = ${CS}\%$
                    </div>
                    
                    <div class="mb-3">
                        <strong>2. Fase ($W_{der}$):</strong><br>
                        $W_{der} = \\frac{C_0 - C_{izq}}{C_{der} - C_{izq}} = \\frac{${C0} - ${CL}}{${CS} - ${CL}} = \\mathbf{${P_der}\%}$
                    </div>

                    <div>
                        <strong>3. Fase  ($W_{izq}$):</strong><br>
                        $W_{izq} = 100 - W_{der} = 100 - ${P_der} = \\mathbf{${P_izq}\%}$
                    </div>
                `;

                // CRÍTICO: Decirle a MathJax que renderice el nuevo contenido
                if(window.MathJax){
                    MathJax.typesetPromise([state.elementos.pasosSustitucion]);
                    console.log("MathJax renderizado para la memoria de cálculo.");
                }else{
                    console.warn("MathJax no está disponible. La memoria de cálculo puede no mostrarse correctamente.")
                }
            }


        } else {
            // Si no hay dos límites, es fase única
            state.elementos.contenedorPalanca.classList.add('d-none');
            state.elementos.pasosSustitucion.classList.add('d-none');
            state.elementos.detallesPalanca.classList.add('d-none');
        }



        // logs
        console.log("Estado actual de la imagen:", state.imagenActual)
        // actualizarGrafica(state, resultados, valComp, valTemp);

    });
    
    /*
        --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
        --- --- --- ---  C L I C K   E N  C A N V A S  --- --- --- ---
        --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
    */
    
    /*  ---  ---  ESTO ES PARA QUE ME SE MAS FACIL AGREGAR UNA NUEVA GRAFICA --- ---  */
    state.elementos.canvas.addEventListener('click', (e) => {
        const canvas = state.elementos.canvas;
        const rect = canvas.getBoundingClientRect();
        const info = state.materialSeleccionado;

        // 1. posicion RELATIVA (de 0 a 1)  (Invariante)
        const xRel = (e.clientX - rect.left) / rect.width;
        const yRel = (e.clientY - rect.top) / rect.height;
        
        //! info importante para poner en el json
        // alert(`xRel: ${xRel.toFixed(4)}, yRel: ${yRel.toFixed(4)},`);
        console.log(`clientWidth: ${canvas.clientWidth}, zoom: ${window.devicePixelRatio}`);
        console.log(`xRel: ${xRel.toFixed(4)}, yRel: ${yRel.toFixed(4)},`);

        if( info && info.limites_pixeles_usuario ){
            const cal = info.limites_pixeles_usuario;
            console.log("limites del json", cal);
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
    const size = canvas.width * 0.005;

    // 4. Dibujar (Sin multiplicar por nada, porque pxFinal ya es el píxel exacto)
    if (tipo === "bolita") {
        canvasTool.dibujarBola(ctx, pxFinal, pyFinal, size);
    } else if (tipo === "cruz") {
        canvasTool.dibujarCruz(ctx, pxFinal, pyFinal, size * 1.2);
    }
}