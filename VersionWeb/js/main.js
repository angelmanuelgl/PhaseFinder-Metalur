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
        //
        contenedorPalanca: document.getElementById('contenedorPalanca'),
        faseActual: document.getElementById('faseActual'),
        faseNombre: document.getElementById('faseNombre'),
        percIzq: document.getElementById('percIzq'),
        percDer: document.getElementById('percDer'),
        barraIzq: document.getElementById('barraIzq'),
        barraDer: document.getElementById('barraDer'),
        
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

