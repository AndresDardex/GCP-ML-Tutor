"""
prompts/few_shot.py
====================
AVANCE 1 – Few-Shot Prompting

Proporciona ejemplos de evaluaciones correctas para guiar al modelo
hacia el formato JSON esperado y el tono pedagógico deseado.

Estrategia: ejemplos con XML tags que separan término, respuesta del
estudiante y evaluación esperada (input → output).
"""

FEW_SHOT_EXAMPLES = """\
<ejemplos_de_evaluacion>

<ejemplo_1>
  <término>Overfitting (sobreajuste)</término>
  <respuesta_estudiante>cuando el modelo aprende demasiado los datos de entrenamiento</respuesta_estudiante>
  <evaluacion_esperada>
  {
    "puntuacion": 75,
    "correcto": true,
    "feedback": "¡Bien! Captaste la idea principal. Para completar: el overfitting ocurre cuando el modelo memoriza los datos de entrenamiento incluyendo el ruido, lo que provoca que funcione muy bien en entrenamiento pero mal en datos nuevos. La clave es la pérdida de capacidad de generalización.",
    "conceptos_clave_faltantes": ["generalización", "ruido en los datos", "datos de prueba"]
  }
  </evaluacion_esperada>
</ejemplo_1>

<ejemplo_2>
  <término>Gradient Descent (descenso de gradiente)</término>
  <respuesta_estudiante>es para entrenar redes neuronales</respuesta_estudiante>
  <evaluacion_esperada>
  {
    "puntuacion": 20,
    "correcto": false,
    "feedback": "Tu respuesta es muy incompleta. El Gradient Descent es un algoritmo de optimización que minimiza una función de pérdida ajustando los parámetros del modelo iterativamente en la dirección opuesta al gradiente. Se usa en todo tipo de modelos de ML, no solo en redes neuronales.",
    "conceptos_clave_faltantes": ["optimización", "función de pérdida", "gradiente", "iterativo", "parámetros del modelo"]
  }
  </evaluacion_esperada>
</ejemplo_2>

<ejemplo_3>
  <término>Feature (característica)</término>
  <respuesta_estudiante>una feature es una variable de entrada del modelo, como la edad o el precio de una casa, que se usa para hacer predicciones</respuesta_estudiante>
  <evaluacion_esperada>
  {
    "puntuacion": 95,
    "correcto": true,
    "feedback": "¡Excelente respuesta! Definiste correctamente una feature como variable de entrada con ejemplos concretos. Solo faltaría mencionar que las features pueden ser de distintos tipos (numéricas, categóricas) y que su selección e ingeniería impactan directamente en el rendimiento del modelo.",
    "conceptos_clave_faltantes": ["tipos de features", "feature engineering"]
  }
  </evaluacion_esperada>
</ejemplo_3>

</ejemplos_de_evaluacion>
"""
