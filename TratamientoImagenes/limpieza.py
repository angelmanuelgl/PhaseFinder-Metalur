#   Proyecto de Metalurgia - Automatizacion de consultas en Diagtramas de Fases
#   autor: Angel Manuel Gonzalez Lopez 
#   github: https://github.com/angelmanuelgl
#   web: https://angelmanuelgl.github.io/
#
#   Archivo:   limpieza.py
#   Descripcion: Binarizar imagen, aislar el marco 
#  y quitar el grosor del marco para dejar solo la parte de la imagen con los datos.


import cv2
import matplotlib.pyplot as plt

def limpiar(img):
    
    # poner en binario
    # all abajo de 200 se vuelve negro (255)
    _, img_binario = cv2.threshold(img, 210, 255, cv2.THRESH_BINARY_INV)

    cnts, _ = cv2.findContours(img_binario, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    cnt = max(cnts, key=cv2.contourArea) # el contorno mas grande es el marco
    x, y, w, h = cv2.boundingRect(cnt)

    img_aislada = img_binario[y:y+h, x:x+w]

    
    #  quitar mas grosor mas finamente
    img_limpia = img_aislada.copy()

    offset = 25
    img_limpia[0:offset, :] = 0      # Arriba
    offset = 8
    img_limpia[-offset:, :] = 0      # Abajo

    offset = 8
    img_limpia[:, 0:offset] = 0      # Izquierda
    offset = 15
    img_limpia[:, -offset:] = 0      # Derecha

    return img_limpia
