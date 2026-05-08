import * as cargar from './cargar.js';
import * as canvasTool from './canvas.js';

import {registrarEventos} from './eventos.js';

/*
    I N I C I A L I Z A R
*/


// contenedor con toda la informacion
const AppState = {
    config: null,
    materialSeleccionado: null,
    elementos: {
        // 
        canvas: document.getElementById('canvasGrafica'),
        // seleccionar grafica
        select: document.getElementById('selectMaterial'),
        // respuestas
        resIzq: document.getElementById('resIzq'),
        resDer: document.getElementById('resDer'),
        status: document.getElementById('status'),
        // botones e input
        btnReiniciar: document.getElementById('btnReiniciar'),
        btnManual: document.getElementById('btnCalcularManual'),
        inputTemp: document.getElementById('inputTemp'),
        inputComp: document.getElementById('inputComp'),
        // donde poner los datos de la regla de la palanda
        contenedorPalanca: document.getElementById('contenedorPalanca'),
        faseActual: document.getElementById('faseActual'),
        faseNombre: document.getElementById('faseNombre'),
        // regla de la palnca
        percIzq: document.getElementById('percIzq'),
        percDer: document.getElementById('percDer'),
        nameIzq: document.getElementById('nameIzq'),
        nameDer: document.getElementById('nameDer'),
        barraIzq: document.getElementById('barraIzq'),
        barraDer: document.getElementById('barraDer'),
        // explicaciones
        detallesPalanca: document.getElementById('detallesPalanca'), // contenedior
        pasosSustitucion: document.getElementById('pasosSustitucion'), // div monospace con text
        // avisos
        avisoContenedor: document.getElementById('aviso_contenedor'),
        avisoTitulo: document.getElementById('aviso_titulo'),
        avisoContenido: document.getElementById('aviso_contenido'),
        
    }
};

// para inicializar
async function inicializarApp() {
    const url = 'js/graficas_config.json';
    const datos = await cargar.Configuracion(url);

    if( datos ){
        AppState.config = datos;
        // llenamos el menu donde se selecicona
        cargar.Seleccionador(datos, 'selectMaterial');

        // activar esucahdores de eventos
        registrarEventos(AppState);
    }
}

inicializarApp();

