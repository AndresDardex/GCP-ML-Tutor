# ML-Tutor

Sistema de tutoría inteligente para Machine Learning basado en RAG (Retrieval-Augmented Generation). Usa el **Glosario Oficial de ML de Google** (697 términos en español) como base de conocimiento para generar respuestas fundamentadas, evaluar al estudiante mediante flashcards y detectar preguntas fuera del dominio.

---

## Tabla de contenidos

1. [Descripción](#descripción)
2. [Arquitectura del sistema](#arquitectura-del-sistema)
3. [Proceso de ingesta y vectorización](#proceso-de-ingesta-y-vectorización)
4. [Construcción del prompt aumentado](#construcción-del-prompt-aumentado)
5. [Pipeline RAG completo](#pipeline-rag-completo)
6. [Interfaz gráfica](#interfaz-gráfica)
7. [Instalación y uso](#instalación-y-uso)
8. [Evaluación RAGAS](#evaluación-ragas)
9. [Estructura del repositorio](#estructura-del-repositorio)

---

## Descripción

**ML-Tutor** es un tutor adaptativo que:

- Responde preguntas sobre ML citando únicamente el glosario oficial de Google
- Evalúa definiciones escritas por el estudiante con puntuación 0–100
- Aplica selección inteligente de términos (spaced repetition probabilístico)
- Detecta y rechaza preguntas fuera del dominio sin alucinar
- Funciona **100 % local** — sin enviar datos a servicios externos

**Stack:** Python · LangChain · ChromaDB · Ollama (`llama3.2`) · Streamlit · sentence-transformers · RAGAS

---

## Arquitectura del sistema

```
FASE DE INGESTA (offline)
─────────────────────────────────────────────────────────────────
Google ML Glossary --> scraper.py --> glossary.json (697 docs)
                                             |
                                        setup_db.py
                                             |
                           paraphrase-multilingual-MiniLM-L12-v2
                                             |
                                      ChromaDB (coseno)

FASE DE CONSULTA (online)
─────────────────────────────────────────────────────────────────
Usuario --> Streamlit GUI
                |
         consulta (texto)
                |
      embedding de la consulta
                |
      ChromaDB.query(k=3)  <-- similitud coseno
                |
      contexto (top-3 chunks)
                |
      SYSTEM PROMPT + contexto + consulta
                |
      llama3.2 (Ollama, temperature=0.3)
                |
      Respuesta fundamentada --> GUI
```

---

## Proceso de ingesta y vectorización

### 1. Scraping del glosario (`scraper.py`)

- **Fuente:** `https://developers.google.com/machine-learning/glossary?hl=es-419`
- **Parser:** BeautifulSoup4 — selector `h2.hide-from-toc` para términos, `span.glossary-icon` para categorías
- **Resultado:** `data/glossary.json` — 697 objetos `{term, definition, category}`

### 2. Vectorización (`setup_db.py`)

Cada término se convierte en un documento con el formato:

```
Término: {term}
Definición: {definition}
```

**Sin chunking tradicional** — cada término es un documento completo. Esto evita fragmentar definiciones y es apropiado para el tamaño compacto de cada entrada del glosario.

### 3. Modelo de embeddings

| Parámetro | Valor |
|-----------|-------|
| Modelo | `paraphrase-multilingual-MiniLM-L12-v2` |
| Proveedor | sentence-transformers (HuggingFace) |
| Dimensiones | 384 |
| Idiomas | Multilingüe (optimizado para español) |
| Peso | ~120 MB — 100% local |

### 4. Base de datos vectorial

| Parámetro | Valor |
|-----------|-------|
| Motor | ChromaDB PersistentClient |
| Ruta | `data/chroma_db/` |
| Colección | `ml_glossary` |
| Métrica | Coseno (`hnsw:space: cosine`) |
| Documentos | 697 |
| Lote de inserción | 50 términos |

---

## Construcción del prompt aumentado

El pipeline inyecta el contexto recuperado en el system prompt con **etiquetas XML**:

```
<rol>
Eres ML-Tutor, un asistente experto en Machine Learning...
</rol>

<reglas>
1. Responde UNICAMENTE con información del glosario proporcionado.
2. Si el contexto no contiene la respuesta, di:
   "No encuentro esa información en el glosario de ML de Google."
3. Cita el término fuente al final de cada respuesta.
</reglas>

<contexto_glosario>
{top-3 chunks recuperados por similitud coseno}
</contexto_glosario>

{pregunta del usuario}
```

El modo flashcard añade además **3 ejemplos few-shot** que guían al modelo a producir JSON con campos `puntuacion`, `correcto`, `feedback` y `conceptos_clave_faltantes`.

---

## Pipeline RAG completo

```
1. Usuario escribe pregunta en Streamlit
        |
2. MLTutorChain.retrieve_context(query, k=3)
   |-- SentenceTransformer genera embedding de la query
   |-- ChromaDB.query() --> top-3 docs por similitud coseno
        |
3. Contexto inyectado en SYSTEM_PROMPT via .format()
        |
4. OllamaLLM(model="llama3.2", temperature=0.3).invoke(prompt)
        |
5. Respuesta retornada a la GUI
   |-- Modo chat      --> texto libre
   |-- Modo flashcard --> JSON parseado --> puntuación + feedback
```

**k recuperado:** 3 en modo flashcard · 4 en modo chat libre

---

## Interfaz gráfica

### Flashcards
- Selección probabilística del siguiente término (spaced repetition)
- El estudiante escribe la definición
- LLM evalúa con score 0–100 y feedback detallado
- Definición oficial expandible después de cada intento

### Chat Libre
- Preguntas abiertas sobre cualquier concepto de ML
- RAG recupera k=4 chunks relevantes
- Respuesta fundamentada con cita de fuente
- Historial de conversación por sesión

### Mi Progreso
- Estadísticas: términos practicados, dominados (>=80), promedio de score
- Lista de términos por revisar (score <60)
- Opción de reiniciar historial

---

## Instalación y uso

### Prerequisitos

- Python 3.10+
- [Ollama](https://ollama.com) instalado

```bash
# Descargar el modelo LLM
ollama pull llama3.2

# Mantener Ollama activo (terminal separada)
ollama serve
```

### Pasos

```bash
git clone https://github.com/<usuario>/ml-tutor.git
cd ml-tutor

pip install -r requirements.txt

python scraper.py      # Descarga el glosario (requiere internet)
python setup_db.py     # Construye la base vectorial
streamlit run app.py   # Lanza la aplicación
```

### Evaluación RAGAS (opcional)

```bash
# Crear .env con tu API key de OpenAI (nunca se sube al repo)
echo "OPENAI_API_KEY=sk-..." > .env

pip install python-dotenv langchain-openai
jupyter notebook evaluate_rag.ipynb
```

---

## Evaluación RAGAS

### Parámetros

| Parámetro | Valor |
|-----------|-------|
| Documento(s) | Glosario ML de Google — 697 términos |
| Modelo de embeddings | `paraphrase-multilingual-MiniLM-L12-v2` (384 dims) |
| chunk_size / overlap | Sin chunking / sin overlap |
| k (chunks recuperados) | 3 |
| LLM generador | `llama3.2` (Ollama, temperature=0.3) |
| LLM juez (RAGAS) | `gpt-4o-mini` (OpenAI) |

### Tipos de preguntas (10 casos)

| Tipo | Descripción | N |
|------|-------------|---|
| A — Literal | Respuesta textual en el documento | 3 |
| B — Vocabulario diferente | Paráfrasis que prueba los embeddings | 2 |
| C — Combinar chunks | Requiere sintetizar varios términos | 2 |
| D — Fuera del dominio | Detecta alucinaciones | 3 |

### Resultados (ver `data/ragas_evaluation_results.csv`)

| Tipo | Faithfulness | Answer Relevancy | Context Precision |
|------|-------------|-----------------|------------------|
| A — Literal | ~0.89 | ~0.83 | ~1.00 |
| B — Vocabulario | ~0.76 | ~0.75 | ~0.83 |
| C — Multi-chunk | ~0.66 | ~0.67 | ~0.67 |
| D — Fuera del dominio | ~0.14 | ~0.20 | ~0.00 |

### Análisis crítico

- **Tipo A:** Alto desempeño — el embedding recupera el término exacto del glosario.
- **Tipo B:** Buen desempeño semántico — el modelo multilingual generaliza bien con paráfrasis.
- **Tipo C:** Caída moderada — k=3 no siempre captura todos los conceptos para síntesis.
- **Tipo D:** Faithfulness muy baja — el LLM fabrica información sin respaldo documental. **Recomendación:** agregar un clasificador de relevancia del contexto antes de la generación.

---

## Estructura del repositorio

```
ml-tutor/
├── app.py                  # Aplicación Streamlit (entry point)
├── scraper.py              # Scraper del Glosario ML de Google
├── setup_db.py             # Construye la base vectorial ChromaDB
├── requirements.txt        # Dependencias Python
├── evaluate_rag.ipynb      # Evaluación RAGAS (10 preguntas)
│
├── prompts/
│   ├── system_prompts.py   # Prompts con etiquetas XML
│   └── few_shot.py         # Ejemplos few-shot para flashcards
│
├── rag/
│   └── chain.py            # MLTutorChain — nucleo del pipeline RAG
│
├── tutor/
│   ├── flashcard.py        # Selección de términos (spaced repetition)
│   └── progress.py         # Persistencia del progreso del estudiante
│
└── data/                   # Generado localmente — excluido del repo
    ├── glossary.json
    ├── chroma_db/
    ├── progress.json
    └── ragas_evaluation_results.csv
```

---

## Seguridad y privacidad

- Embeddings y LLM se ejecutan **100 % localmente**
- Ningún dato del estudiante sale del dispositivo
- La API key de OpenAI (solo para evaluación RAGAS) se carga desde `.env`, excluido del repo por `.gitignore`
