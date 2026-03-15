# 🤖 MentorML — Tutor Académico de Machine Learning

> **Sistema de IA local basado en RAG (Retrieval-Augmented Generation) para aprender y practicar conceptos de Machine Learning de manera interactiva.**

---

## 📋 Tabla de Contenidos

- [Descripción General](#-descripción-general)
- [Características](#-características)
- [Arquitectura del Sistema](#-arquitectura-del-sistema)
- [Diseño de Prompts (Avance 1)](#-diseño-de-prompts-avance-1)
- [Estructura del Proyecto](#-estructura-del-proyecto)
- [Requisitos Previos](#-requisitos-previos)
- [Instalación Paso a Paso](#-instalación-paso-a-paso)
- [Uso de la Aplicación](#-uso-de-la-aplicación)
- [Cómo Funciona el RAG](#-cómo-funciona-el-rag)
- [Stack Tecnológico](#-stack-tecnológico)
- [Privacidad y Ejecución Local](#-privacidad-y-ejecución-local)

---

## 📖 Descripción General

**MentorML** es un asistente tutor académico especializado en Machine Learning que opera **completamente de forma local**, sin enviar ningún dato a servicios externos. Usa el [Glosario oficial de ML de Google](https://developers.google.com/machine-learning/glossary?hl=es-419) como base de conocimientos y un modelo de lenguaje local (Ollama + llama3.2) para:

- **Evaluar** definiciones que escribe el estudiante y dar feedback inteligente y personalizado
- **Responder** preguntas libres sobre cualquier concepto de ML usando el glosario como fuente
- **Registrar** el progreso del estudiante y priorizar términos débiles para repasar

Este proyecto implementa las técnicas de **Prompt Engineering** del Avance 1:
- System Prompts estructurados con XML tags
- Few-Shot Prompting con ejemplos guía
- Formato de salida JSON estricto
- RAG para inyección de contexto relevante

---

## ✨ Características

| Funcionalidad | Descripción |
|---|---|
| 🃏 **Flashcards Inteligentes** | Practica términos de ML con evaluación automática por IA (puntuación 0–100) |
| 💬 **Chat Libre** | Pregunta cualquier concepto y recibe explicaciones basadas en el glosario |
| 📊 **Seguimiento de Progreso** | Visualiza términos dominados, en repaso y estadísticas generales |
| 🔁 **Spaced Repetition** | El sistema prioriza automáticamente los términos donde tienes más dificultad |
| 🔒 **100% Local** | Ningún dato sale de tu máquina. El LLM y los embeddings corren localmente |
| 📚 **697 Términos** | Cubre todo el glosario oficial de ML de Google en español |

---

## 🏗 Arquitectura del Sistema

```
┌─────────────────────────────────────────────────────────────────────┐
│                         USUARIO (Navegador)                         │
│                      http://localhost:8501                          │
└─────────────────────────┬───────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    app.py  (Streamlit UI)                           │
│                                                                     │
│   ┌──────────────┐  ┌──────────────┐  ┌────────────────────────┐  │
│   │  Flashcards  │  │  Chat Libre  │  │     Mi Progreso        │  │
│   └──────┬───────┘  └──────┬───────┘  └───────────┬────────────┘  │
└──────────┼────────────────┼───────────────────────┼───────────────┘
           │                │                       │
           ▼                ▼                       ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    rag/chain.py  (MLTutorChain)                     │
│                                                                     │
│  1. retrieve_context(query)  →  ChromaDB (búsqueda semántica)      │
│  2. Construir prompt          →  System Prompt + Few-Shot + RAG     │
│  3. llm.invoke(prompt)        →  Ollama / llama3.2                 │
│  4. _parse_json_response()    →  Retorna dict estructurado          │
└──────────┬──────────────────────────────────┬───────────────────────┘
           │                                  │
           ▼                                  ▼
┌──────────────────────┐          ┌───────────────────────────────────┐
│  data/chroma_db/     │          │  Ollama  (llama3.2 local)         │
│  (Vector Store)      │          │  Puerto: 11434                    │
│                      │          │  Temperatura: 0.3                 │
│  Embeddings:         │          │  100% privado, sin internet       │
│  paraphrase-         │          └───────────────────────────────────┘
│  multilingual-       │
│  MiniLM-L12-v2       │
│  697 documentos      │
└──────────────────────┘
```

### Flujo de datos completo

```
scraper.py          setup_db.py              app.py (runtime)
    │                    │                        │
    ▼                    ▼                        ▼
Google ML  ──→  glossary.json  ──→  chroma_db  ──→  MLTutorChain
Glossary                              (embeddings)   │
(HTML)                                               ▼
                                              Ollama LLM
                                                     │
                                                     ▼
                                              JSON Response
                                              {puntuacion, feedback...}
```

---

## 🎯 Diseño de Prompts (Avance 1)

Este proyecto implementa las tres técnicas de Prompt Engineering requeridas:

### 1. System Prompts con XML Tags

Los prompts usan **XML tags como delimitadores** para separar claramente cada sección:

```xml
<rol>
Eres MentorML, un tutor experto en Machine Learning...
</rol>

<reglas>
- Evalúa la respuesta del estudiante comparándola con la definición oficial
- Sé justo: reconoce las partes correctas antes de señalar las incorrectas
- SIEMPRE responde en formato JSON válido
</reglas>

<contexto_glosario>
{context}        ← Aquí se inyectan los términos relevantes del glosario (RAG)
</contexto_glosario>
```

### 2. Few-Shot Prompting

Se incluyen **3 ejemplos de evaluación** (respuesta excelente, parcial e incorrecta) para guiar al modelo hacia el formato y tono esperados:

```xml
<ejemplos_de_evaluacion>
  <ejemplo_1>
    <término>Overfitting</término>
    <respuesta_estudiante>cuando el modelo aprende demasiado...</respuesta_estudiante>
    <evaluacion_esperada>
    {
      "puntuacion": 75,
      "correcto": true,
      "feedback": "¡Bien! Captaste la idea principal...",
      "conceptos_clave_faltantes": ["generalización", "ruido"]
    }
    </evaluacion_esperada>
  </ejemplo_1>
  ...
</ejemplos_de_evaluacion>
```

### 3. Formato de Salida Estructurado (JSON)

El prompt especifica el esquema JSON exacto que debe retornar el modelo:

```json
{
  "puntuacion": 85,
  "correcto": true,
  "feedback": "Explicación motivadora de 2-3 oraciones...",
  "conceptos_clave_faltantes": ["concepto1", "concepto2"]
}
```

---

## 📁 Estructura del Proyecto

```
ml-tutor/
│
├── app.py                      # Interfaz Streamlit (punto de entrada)
│
├── scraper.py                  # Descarga el glosario de Google ML
│
├── setup_db.py                 # Crea la base de datos vectorial ChromaDB
│
├── requirements.txt            # Dependencias Python
│
├── prompts/
│   ├── __init__.py
│   ├── system_prompts.py       # System prompts con XML tags (AVANCE 1)
│   └── few_shot.py             # Ejemplos few-shot (AVANCE 1)
│
├── rag/
│   ├── __init__.py
│   └── chain.py                # Cadena RAG: ChromaDB + Ollama
│
├── tutor/
│   ├── __init__.py
│   ├── flashcard.py            # Lógica de selección (spaced repetition)
│   └── progress.py             # Persistencia del progreso del estudiante
│
└── data/                       # Generado automáticamente (NO subir a git)
    ├── glossary.json           # 697 términos scrapeados
    ├── progress.json           # Historial del estudiante
    └── chroma_db/              # Base de datos vectorial
```

---

## ✅ Requisitos Previos

Antes de instalar el proyecto, asegúrate de tener lo siguiente:

### 1. Python 3.11+

Verifica tu versión con:
```bash
python --version
```
Si no lo tienes, descárgalo desde [python.org](https://www.python.org/downloads/).

### 2. Ollama

Ollama es el motor que corre el modelo de lenguaje de forma local.

**Descarga e instala desde:** https://ollama.com

Después de instalarlo, descarga el modelo llama3.2:
```bash
ollama pull llama3.2
```

Verifica que esté corriendo:
```bash
ollama list
```
Deberías ver `llama3.2` en la lista.

> **Nota:** Ollama corre automáticamente en background después de instalarse. Si en algún momento no responde, ejecuta `ollama serve` en una terminal.

### 3. Git (opcional, para clonar el repo)

Descarga desde [git-scm.com](https://git-scm.com/).

---

## 🚀 Instalación Paso a Paso

Sigue estos pasos **en orden**. Cada uno es necesario para que el siguiente funcione.

### Paso 1: Clonar o descargar el proyecto

```bash
git clone https://github.com/tu-usuario/ml-tutor.git
cd ml-tutor
```

O descarga el ZIP desde GitHub y descomprímelo.

### Paso 2: Crear un entorno virtual (recomendado)

```bash
# Crear el entorno
python -m venv venv

# Activarlo en Windows
venv\Scripts\activate

# Activarlo en Mac/Linux
source venv/bin/activate
```

### Paso 3: Instalar dependencias

```bash
pip install -r requirements.txt
```

Esto instala: Streamlit, LangChain, ChromaDB, sentence-transformers, BeautifulSoup4 y todas sus dependencias.

> **Primera vez:** La descarga de `sentence-transformers` puede tomar varios minutos (~500 MB).

### Paso 4: Descargar el glosario de ML

```bash
python scraper.py
```

Esto descarga el Glosario de ML de Google y guarda **697 términos** en `data/glossary.json`.

**Salida esperada:**
```
Descargando glosario desde https://developers.google.com/machine-learning/glossary...
Guardados 697 términos en data/glossary.json
```

### Paso 5: Crear la base de datos vectorial

```bash
python setup_db.py
```

Esto genera los embeddings de cada término y los indexa en ChromaDB. La primera vez puede tardar **2–5 minutos** dependiendo de tu hardware.

**Salida esperada:**
```
Cargados 697 términos del glosario.
Inicializando ChromaDB...
Creando embeddings (esto puede tomar unos minutos la primera vez)...
  Procesados 697/697 términos...
Base de datos vectorial creada en data/chroma_db
Total de documentos indexados: 697

Setup completado. Ahora puedes ejecutar: streamlit run app.py
```

### Paso 6: Lanzar la aplicación

```bash
streamlit run app.py
```

La app abrirá automáticamente en tu navegador en **http://localhost:8501**

> Si no se abre automáticamente, cópiala y pégala en tu navegador.

---

## 📱 Uso de la Aplicación

### Pantalla de Inicio

Al abrir la app verás tres opciones:

- **🃏 Flashcards** → Modo de práctica con evaluación por IA
- **💬 Pregunta Libre** → Chat directo con el tutor
- **📊 Mi Progreso** → Dashboard con tus estadísticas

### Modo Flashcards

1. Aparece un término de ML en una tarjeta azul
2. Escribe tu definición en el área de texto
3. Presiona **"Evaluar respuesta"**
4. El LLM compara tu respuesta con la definición oficial y retorna:
   - **Puntuación** (0–100) con barra de progreso
   - **Feedback** con color: verde (≥80), amarillo (60–79), rojo (<60)
   - **Conceptos clave faltantes** para reforzar
   - Botón para ver la **definición oficial** del glosario
5. Presiona **"Siguiente tarjeta →"** para continuar

### Modo Pregunta Libre

1. Escribe cualquier pregunta sobre ML en el campo de chat
2. El tutor busca contexto relevante en el glosario y responde
3. El historial del chat se mantiene durante la sesión

### Mi Progreso

- **Total de términos:** 697 (todos los del glosario)
- **Practicados:** cuántos has intentado al menos una vez
- **Dominados (≥80):** términos que ya manejas bien
- **Promedio:** tu puntuación media general
- Lista de términos que necesitan repaso (puntuación < 60)
- Opción de **reiniciar progreso** para empezar de cero

---

## 🧠 Cómo Funciona el RAG

**RAG (Retrieval-Augmented Generation)** es la técnica central del sistema. En lugar de depender únicamente del conocimiento del LLM, se recupera información relevante de la base de datos antes de generar una respuesta.

### Proceso paso a paso:

```
1. Usuario escribe "¿Qué es gradient descent?"
        │
        ▼
2. retrieve_context("gradient descent")
   → ChromaDB convierte la query en un vector (embedding)
   → Busca los 3-4 documentos más similares por similitud coseno
   → Retorna los términos más relevantes del glosario
        │
        ▼
3. Construir el prompt:
   SYSTEM_PROMPT + contexto_recuperado + pregunta_usuario
        │
        ▼
4. llm.invoke(prompt) → Ollama genera la respuesta
   basándose en el contexto real del glosario, no en
   conocimiento genérico del modelo
        │
        ▼
5. Respuesta al usuario fundamentada en el glosario oficial
```

### Por qué RAG es superior al LLM solo:

| Sin RAG | Con RAG |
|---|---|
| Respuestas genéricas del modelo | Respuestas basadas en el glosario oficial de Google |
| Puede alucinar definiciones | Contexto verificable y preciso |
| No actualizable | Se puede actualizar solo re-ejecutando scraper + setup |
| Dependiente del entrenamiento del modelo | Fuente de verdad externa controlada |

---

## 🛠 Stack Tecnológico

| Componente | Tecnología | Versión | Propósito |
|---|---|---|---|
| **Frontend** | Streamlit | ≥1.31 | Interfaz web interactiva |
| **LLM Local** | Ollama + llama3.2 | latest | Generación de texto y evaluación |
| **Embeddings** | sentence-transformers | ≥3.0 | Vectorización multilingüe de textos |
| **Modelo de Embeddings** | paraphrase-multilingual-MiniLM-L12-v2 | - | Embeddings semánticos en español |
| **Vector DB** | ChromaDB | ≥0.5 | Almacenamiento y búsqueda semántica |
| **LLM Framework** | LangChain + langchain-ollama | ≥0.2 | Orquestación de cadenas LLM |
| **Web Scraping** | BeautifulSoup4 + requests | ≥4.12 | Extracción del glosario de Google |
| **Persistencia** | JSON (local) | - | Progreso del estudiante |

---

## 🔒 Privacidad y Ejecución Local

Este proyecto fue diseñado con privacidad como principio fundamental:

- **El LLM corre en tu máquina** via Ollama. Ninguna pregunta ni respuesta sale de tu PC.
- **Los embeddings se generan localmente** con `sentence-transformers`. No se llama a ninguna API externa.
- **ChromaDB es una base de datos local** almacenada en `data/chroma_db/`.
- **El progreso del estudiante** se guarda en `data/progress.json`, solo en tu máquina.
- La única conexión a internet es el scraping inicial del glosario público de Google (paso 4 del setup).

---

## ⚠️ Solución de Problemas Comunes

### Error: `httpx.ConnectError` al evaluar una respuesta
**Causa:** Ollama no está corriendo.
**Solución:**
```bash
ollama serve
```

### Error: `chromadb.errors.NotFoundError`
**Causa:** Se regeneró la BD vectorial pero la app tiene el cache anterior.
**Solución:** Reiniciar completamente el servidor de Streamlit (Ctrl+C y volver a ejecutar `streamlit run app.py`).

### Error: `ModuleNotFoundError`
**Causa:** Las dependencias no están instaladas o el entorno virtual no está activado.
**Solución:**
```bash
# Activar entorno virtual primero
venv\Scripts\activate       # Windows
source venv/bin/activate    # Mac/Linux

# Luego instalar dependencias
pip install -r requirements.txt
```

### El glosario muestra 0 términos
**Causa:** La estructura HTML de la página de Google cambió.
**Solución:** Re-ejecutar el scraper. Si persiste, revisar `scraper.py` y actualizar el selector CSS.

### La app tarda mucho en cargar la primera vez
**Causa normal:** `sentence-transformers` descarga el modelo de embeddings (~120 MB) la primera vez. Luego queda en caché.

---

## 📄 Licencia

Proyecto académico desarrollado como parte del curso de IA. El glosario utilizado es propiedad de Google y está disponible públicamente en [developers.google.com/machine-learning/glossary](https://developers.google.com/machine-learning/glossary).
