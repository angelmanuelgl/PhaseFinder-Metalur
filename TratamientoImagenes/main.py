#   Proyecto de Metalurgia - Automatizacion de consultas en Diagtramas de Fases
#   autor: Angel Manuel Gonzalez Lopez 
#   github: https://github.com/angelmanuelgl
#   web: https://angelmanuelgl.github.io/
#
#   Archivo:   main.py
#   Descripcion: aqui hago el procesamiento de cada iamgen, llamando a la funcion de limpieza 
#   y guardando el resultado en una carpeta nueva.

import cv2
import matplotlib.pyplot as plt
import os
from limpieza import limpiar


def procesar_y_guardar(ruta_imagen, carpeta_destino="img_limpias"):
    # crear carpeta de destino si no existe
    if not os.path.exists(carpeta_destino):
        os.makedirs(carpeta_destino)
    
    #  imagen original
    img = cv2.imread(ruta_imagen, 0)
    if img is None:
        print(f" -- > Error: No se pudo cargar la imagen en {ruta_imagen}")
        return

    # limpieza
    img_limpia = limpiar(img)

    # guardar resultado
    nombre_archivo = os.path.basename(ruta_imagen)
    ruta_guardado = os.path.join(carpeta_destino, f"limpia_{nombre_archivo}")

    cv2.imwrite(ruta_guardado, img_limpia)
    print(f"Imagen guardada  --> {ruta_guardado}")


# usar
if __name__ == "__main__":
    ruta = "img/Fe_13000_16000_0_1.jpeg" 
    # ruta = "img/prueba.jpeg" 

    procesar_y_guardar(ruta)
