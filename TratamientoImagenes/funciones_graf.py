#   Proyecto de Metalurgia - Automatizacion de consultas en Diagtramas de Fases
#   autor: Angel Manuel Gonzalez Lopez 
#   github: https://github.com/angelmanuelgl
#   web: https://angelmanuelgl.github.io/
#
#   Archivo: funciones_graf.py
#   Descripcion: Funciones para convertir entre coordenadas reales y pixeles,
#   y para buscar vecinos horizontales en una imagen binaria.

import numpy as np
from TratamientoImagenes.main import X_MAX, X_MIN, Y_MAX, Y_MIN
import cv2


def buscar_vecinos_horizontales(imagen_binaria, px, py):

    fila = imagen_binaria[py, :]

    # tomamos los pixeles blancos
    indices_blancos = np.where(fila > 0)[0]

    # print(indices_blancos)
    if len(indices_blancos) == 0:
        return None, None #  si no hay interseccion

    # separamos izquierda y derecha
    izquierda = indices_blancos[indices_blancos < px]
    derecha = indices_blancos[indices_blancos > px]

    # tomamos el mas cercano de cada lado
    p_izq = izquierda[-1] if len(izquierda) > 0 else None
    p_der = derecha[0] if len(derecha) > 0 else None

    return p_izq, p_der


def real_a_pixel(val_x, val_y, w, h, limites):
    """ (cordenaas en el Eje de la Imagen) -> (pixel)"""
    [X_MIN, X_MAX, Y_MIN, Y_MAX] = limites

    # X: regla de tres 
    px = (val_x - X_MIN) / (X_MAX - X_MIN) * w

    # Y: no olvidar que esta invertido
    py = (Y_MAX - val_y) / (Y_MAX - Y_MIN) * h

    return int(px), int(py)

def pixel_a_real(px, py, w, h, limites):
    """ (cordenaas en el Eje de la Imagen) <- (pixel)"""

    [X_MIN, X_MAX, Y_MIN, Y_MAX] = limites

    # X: regla de tres
    val_x = X_MIN + (px / w) * (X_MAX - X_MIN)

    # Y: no olvidar que esta invertido
    val_y = Y_MAX - (py / h) * (Y_MAX - Y_MIN)

    return round(val_x, 4), round(val_y, 2)