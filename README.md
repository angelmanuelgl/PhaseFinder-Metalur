# PhaseFinder-Metalur

**Autor:** Angel Manuel Gonzalez Lopez
**Institución:** Lic. Matemáticas Computacionales, CIMAT
**Stack:** Python (OpenCV), JavaScript (Canvas API), HTML5, CSS3 (Bootstrap)

---

##  Descripción

Herramienta integral para la digitalización y análisis de diagramas de fase metalúrgicos. El proyecto utiliza Python (OpenCV) para el preprocesamiento y limpieza de imágenes, aislando las regiones de interés, y una interfaz web interactiva (JavaScript/Canvas) para calcular automáticamente los límites de fase

La aplicación permite a los usuarios seleccionar una gráfica, realizar clics en puntos de interés y obtener automáticamente los límites de fase, convirtiendo píxeles en unidades reales de temperatura y composición.

---

## 🛠️ Estructura del Proyecto

El repositorio se divide en dos módulos principales:

### 1. Tratamiento de Imágenes (Python)
Ubicado en la carpeta `TratamientoImagenes/`.
* **`limpieza.py`**: Utiliza **OpenCV** para binarizar la imagen con un umbral inverso (`cv2.THRESH_BINARY_INV`) y detecta el contorno más grande para aislar el marco.
* **`main.py`**: Procesa las imágenes originales y guarda los resultados limpios en una nueva carpeta.
* **`funciones_graf.py`**: Contiene la lógica para la conversión bidireccional entre coordenadas de píxeles y valores reales (regla de tres).

### 2. Versión Web (JavaScript)
Ubicada en `VersionWeb/`.
* **`calculos.js`**: Implementa el algoritmo de "vecinos horizontales" que escanea la fila de píxeles buscando el primer blanco (255) a la izquierda y derecha del clic.
* **`canvas.js`**: Gestiona el renderizado de la imagen en el lienzo y el dibujo de marcadores visuales.
* **`cargar.js`**: Carga de forma asíncrona la configuración JSON y genera dinámicamente el selector de materiales.
* **`graficas_config.json`**: Almacena los metadatos, límites de escala ($X_{min}, X_{max}, Y_{min}, Y_{max}$) y rutas de archivos para cada material.

---

##  Instalación y Uso

### Requisitos previos
* Python 3.x
* OpenCV (`pip install opencv-python`)
* Un servidor local (como Live Server de VS Code) para ejecutar la versión web.

### Pasos
1. **Procesar imágenes:** Ejecuta `python TratamientoImagenes/main.py` para limpiar las gráficas.
2. **Lanzar la web:** Abre `VersionWeb/index.html` en tu navegador.
3. **Interacción:** Selecciona un material, haz clic en la gráfica o introduce valores manuales para obtener los límites de fase instantáneamente.

## 🔗 Enlaces
* **GitHub:** [github.com/angelmanuelgl](https://github.com/angelmanuelgl)
* **Portafolio:** [angelmanuelgl.github.io](https://angelmanuelgl.github.io/)
