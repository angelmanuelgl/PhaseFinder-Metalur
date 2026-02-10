# PhaseFinder-Metalur

**Autor:** Angel Manuel Gonzalez Lopez  
**Institución:** Lic. Matemáticas Computacionales, CIMAT  
**Stack:** Python (OpenCV), JavaScript (Canvas API), HTML5, CSS3 (Bootstrap)

---

## 📝 Descripción

Herramienta integral para la **digitalización y análisis de diagramas de fase metalúrgicos**. El proyecto combina el procesamiento de imágenes con algoritmos de mapeo de coordenadas para convertir representaciones gráficas estáticas en entornos de datos interactivos.

El flujo de trabajo utiliza **Python (OpenCV)** para el preprocesamiento y limpieza de imágenes (aislando las regiones de interés mediante binarización) y una interfaz web dinámica (**JavaScript/Canvas**) para el cálculo automático de límites de fase y transformación de sistemas de coordenadas.

La aplicación permite obtener instantáneamente valores reales de temperatura y composición a partir de píxeles, garantizando precisión matemática independientemente de la resolución o el zoom del dispositivo.

## 🖼️ Aplicación Final

<img width="1012" height="628" alt="Vista previa de la interfaz" src="https://github.com/user-attachments/assets/f66be9e8-33d3-43aa-bbd9-4cb18cd897b4" />

---

## 🚀 ¡Pruébalo ahora!

Haz clic en el botón para interactuar con la herramienta en vivo:

[![Abrir App](https://img.shields.io/badge/DEMO-EJECUTAR_PROYECTO-blue?style=for-the-badge&logo=googlechrome&logoColor=white)](https://angelmanuelgl.github.io/proyectos/PhaseFinder_Metalur/)

[![Report Bug](https://img.shields.io/badge/Reportar_Bug-red?style=for-the-badge&logo=github&logoColor=white)](mailto:tu-correo@ejemplo.com?subject=Bug%20Report%20-%20PhaseFinder)

---

## 📐 Fundamento Matemático

Para garantizar que el análisis sea preciso, el sistema implementa una transformación lineal de coordenadas. Dado un píxel $p$ en una imagen con límites de calibración $[p_{start}, p_{end}]$, el valor real $V$ se calcula mediante:

$$V = V_{min} + \left( \frac{p - p_{start}}{p_{end} - p_{start}} \right) \times (V_{max} - V_{min})$$

Este modelo se aplica de forma **invariante**, utilizando coordenadas normalizadas ($0$ a $1$) para evitar desfases causados por el escalado del navegador o el factor de zoom.

---

## 📂 Estructura del Proyecto

El repositorio se divide en dos módulos principales:

### 1. Tratamiento de Imágenes (Python)
Ubicado en la carpeta `TratamientoImagenes/`.
* **`limpieza.py`**: Utiliza **OpenCV** para binarizar la imagen con un umbral inverso (`cv2.THRESH_BINARY_INV`) y detecta el contorno más grande para aislar el marco de la gráfica.
* **`main.py`**: Automatiza el procesamiento de imágenes originales y exporta los resultados limpios listos para la web.

### 2. Versión Web (JavaScript)
Ubicada en `VersionWeb/`.
* **`calculos.js`**: Contiene la lógica central. Implementa el algoritmo de **"vecinos horizontales"** que escanea la fila de píxeles en la imagen binarizada para detectar cambios de estado (0 a 255) y localizar fronteras de fase.
* **`canvas.js`**: Gestiona el renderizado de alta resolución y el dibujo de marcadores dinámicos (bolas de consulta y cruces de límites).
* **`cargar.js`**: Maneja la carga asíncrona de configuraciones y la inyección dinámica de datos desde el archivo de configuración.
* **`graficas_config.json`**: Diccionario de metadatos que define los límites de escala, unidades y rutas de archivos para cada material.

---

## 🛠️ Instalación y Uso

Si deseas clonar el proyecto y procesar tus propios diagramas:

### Requisitos previos
* Python 3.x
* OpenCV (`pip install opencv-python`)
* Un servidor local (como *Live Server* de VS Code) para la versión web.

### Pasos
1. **Procesar imágenes:** Ejecuta `python TratamientoImagenes/main.py` para limpiar las gráficas nuevas.
2. **Lanzar la web:** Abre `VersionWeb/index.html` a través de un servidor local.
3. **Interacción:** Selecciona un material, haz clic en la gráfica o introduce valores manuales para obtener resultados instantáneos.

---

## 🏗️ En Construcción (Roadmap)
* [ ] **Escalado Inteligente:** Selección automática de gráfica (zoom) basada en el rango de los datos ingresados.
* [ ] **Regla de la Palanca:** Cálculo automático de fracciones de fase mediante isotermas.
* [ ] **Base de Datos:** Ampliación del catálogo de diagramas (actualmente enfocado en Hierro-Carbono).

---

## 🔗 Enlaces
* **GitHub:** [github.com/angelmanuelgl](https://github.com/angelmanuelgl)
* **Portafolio:** [angelmanuelgl.github.io](https://angelmanuelgl.github.io/)