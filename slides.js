const pptxgen = require("pptxgenjs");

const pres = new pptxgen();
pres.layout  = "LAYOUT_16x9";
pres.title   = "ML-Tutor — Sistema RAG para Tutoría de Machine Learning";
pres.author  = "ML-Tutor";

// ─── Paleta ────────────────────────────────────────────────────────────────
const C = {
  navy:    "0D1B2A",   // fondo oscuro
  blue:    "1B4F72",   // fondo medio
  teal:    "0E86D4",   // acento principal
  mint:    "05C3A3",   // acento secundario
  white:   "FFFFFF",
  offwhite:"EFF6FF",
  gray:    "94A3B8",
  darkbg:  "061020",
};

const FONT = "Calibri";

// ─── helpers ───────────────────────────────────────────────────────────────
function chip(slide, text, x, y, w, bg, fg) {
  slide.addShape(pres.shapes.ROUNDED_RECTANGLE, {
    x, y, w, h: 0.28, fill: { color: bg }, rectRadius: 0.08, line: { color: bg }
  });
  slide.addText(text, { x, y: y + 0.03, w, h: 0.22,
    fontSize: 9, bold: true, color: fg, align: "center", margin: 0, fontFace: FONT });
}

function pill(slide, text, x, y) {
  chip(slide, text, x, y, 1.4, C.teal, C.white);
}

function card(slide, x, y, w, h) {
  slide.addShape(pres.shapes.RECTANGLE, {
    x, y, w, h,
    fill: { color: "FFFFFF", transparency: 6 },
    line: { color: C.teal, width: 1.2 },
    shadow: { type: "outer", color: "000000", blur: 8, offset: 3, angle: 135, opacity: 0.18 }
  });
}

function darkTitle(slide) {
  slide.background = { color: C.navy };
}

function lightBg(slide) {
  slide.background = { color: C.offwhite };
}

function sectionLabel(slide, text) {
  slide.addShape(pres.shapes.RECTANGLE, {
    x: 0, y: 0, w: 10, h: 0.38, fill: { color: C.blue }, line: { color: C.blue }
  });
  slide.addText(text.toUpperCase(), {
    x: 0.3, y: 0.04, w: 9.4, h: 0.3,
    fontSize: 10, bold: true, color: C.mint, charSpacing: 3,
    fontFace: FONT, align: "left", margin: 0
  });
}

function slideTitle(slide, text, color) {
  slide.addText(text, {
    x: 0.4, y: 0.45, w: 9.2, h: 0.65,
    fontSize: 26, bold: true, color: color || C.white,
    fontFace: FONT, align: "left", margin: 0
  });
}

// ══════════════════════════════════════════════════════════════════════════════
// SLIDE 1 — PORTADA
// ══════════════════════════════════════════════════════════════════════════════
{
  const s = pres.addSlide();
  darkTitle(s);

  // Gradiente izquierdo decorativo
  s.addShape(pres.shapes.RECTANGLE, {
    x: 0, y: 0, w: 0.18, h: 5.625, fill: { color: C.mint }, line: { color: C.mint }
  });

  // Logo / ícono visual
  s.addShape(pres.shapes.OVAL, {
    x: 7.8, y: 0.6, w: 1.7, h: 1.7,
    fill: { color: C.teal, transparency: 75 }, line: { color: C.teal, width: 1.5 }
  });
  s.addShape(pres.shapes.OVAL, {
    x: 8.0, y: 0.8, w: 1.3, h: 1.3,
    fill: { color: C.mint, transparency: 60 }, line: { color: C.mint, width: 1 }
  });
  s.addText("🤖", { x: 8.15, y: 0.92, w: 1, h: 0.8, fontSize: 32, align: "center" });

  // Título principal
  s.addText("ML-Tutor", {
    x: 0.5, y: 1.3, w: 7, h: 1.0,
    fontSize: 52, bold: true, color: C.white, fontFace: FONT, align: "left", margin: 0
  });

  s.addText("Sistema de Tutoría con RAG\npara Machine Learning", {
    x: 0.5, y: 2.35, w: 7.5, h: 0.9,
    fontSize: 20, color: C.mint, fontFace: FONT, align: "left", margin: 0
  });

  // Chips de tecnología
  const techs = ["ChromaDB", "Ollama llama3.2", "Streamlit", "RAGAS"];
  techs.forEach((t, i) => pill(s, t, 0.5 + i * 1.6, 3.45));

  // Línea divisoria
  s.addShape(pres.shapes.LINE, {
    x: 0.5, y: 3.9, w: 9, h: 0,
    line: { color: C.blue, width: 1 }
  });

  // Pie
  s.addText([
    { text: "Documento: ", options: { bold: true, color: C.gray } },
    { text: "Glosario ML de Google  |  ", options: { color: C.gray } },
    { text: "697 términos en español  |  ", options: { color: C.gray } },
    { text: "Embeddings 384 dims", options: { color: C.gray } },
  ], { x: 0.5, y: 4.1, w: 9, h: 0.4, fontSize: 12, fontFace: FONT, margin: 0 });
}

// ══════════════════════════════════════════════════════════════════════════════
// SLIDE 2 — ARQUITECTURA
// ══════════════════════════════════════════════════════════════════════════════
{
  const s = pres.addSlide();
  lightBg(s);
  sectionLabel(s, "Slides 1–4 · Arquitectura, Embeddings y Vector Store");
  slideTitle(s, "Arquitectura del Sistema", C.navy);

  // Nodos del pipeline
  const nodes = [
    { label: "Google ML\nGlossary", sub: "Fuente", x: 0.3, color: C.teal },
    { label: "scraper.py", sub: "Ingesta", x: 2.15, color: C.blue },
    { label: "ChromaDB\nVector Store", sub: "Persistencia", x: 4.0, color: C.navy },
    { label: "llama3.2\nOllama", sub: "Generación", x: 5.85, color: C.blue },
    { label: "Streamlit\nGUI", sub: "Interfaz", x: 7.7, color: C.teal },
  ];

  nodes.forEach(n => {
    s.addShape(pres.shapes.RECTANGLE, {
      x: n.x, y: 1.35, w: 1.7, h: 1.1,
      fill: { color: n.color },
      line: { color: n.color },
      shadow: { type: "outer", color: "000000", blur: 6, offset: 2, angle: 135, opacity: 0.2 }
    });
    s.addText(n.label, {
      x: n.x, y: 1.38, w: 1.7, h: 0.75,
      fontSize: 11, bold: true, color: C.white, align: "center",
      fontFace: FONT, valign: "middle", margin: 0
    });
    s.addText(n.sub, {
      x: n.x, y: 2.08, w: 1.7, h: 0.28,
      fontSize: 9, color: C.mint, align: "center", fontFace: FONT, margin: 0, italic: true
    });
  });

  // Flechas entre nodos
  [0, 1, 2, 3].forEach(i => {
    s.addShape(pres.shapes.LINE, {
      x: nodes[i].x + 1.72, y: 1.9,
      w: nodes[i + 1].x - nodes[i].x - 1.74, h: 0,
      line: { color: C.teal, width: 2 }
    });
  });

  // Flujo inferior — query
  s.addShape(pres.shapes.RECTANGLE, {
    x: 0.3, y: 3.0, w: 9.4, h: 0.9,
    fill: { color: C.navy },
    line: { color: C.teal, width: 1.2 }
  });
  s.addText([
    { text: "Flujo de consulta: ", options: { bold: true, color: C.mint } },
    { text: "Usuario escribe pregunta → Embedding query → Búsqueda coseno en ChromaDB → k=3 chunks → Prompt aumentado → llama3.2 → Respuesta fundamentada", options: { color: C.white } }
  ], {
    x: 0.45, y: 3.05, w: 9.1, h: 0.8,
    fontSize: 11, fontFace: FONT, valign: "middle", margin: 0
  });

  // Nota anti-alucinación
  s.addText('🔒 Prompt configurado: si el contexto no contiene la respuesta, el modelo responde "No encuentro esa información en el glosario"', {
    x: 0.3, y: 4.1, w: 9.4, h: 0.45,
    fontSize: 10, color: C.blue, italic: true, fontFace: FONT, margin: 0, align: "center"
  });
}

// ══════════════════════════════════════════════════════════════════════════════
// SLIDE 3 — EMBEDDINGS Y VECTORIZACIÓN
// ══════════════════════════════════════════════════════════════════════════════
{
  const s = pres.addSlide();
  lightBg(s);
  sectionLabel(s, "Slides 1–4 · Arquitectura, Embeddings y Vector Store");
  slideTitle(s, "Embeddings y Vectorización", C.navy);

  // Izquierda: modelo
  card(s, 0.3, 1.3, 4.4, 3.8);
  s.addText("Modelo de Embeddings", {
    x: 0.5, y: 1.45, w: 4.0, h: 0.4,
    fontSize: 13, bold: true, color: C.teal, fontFace: FONT, margin: 0
  });
  const leftItems = [
    ["Nombre", "paraphrase-multilingual-MiniLM-L12-v2"],
    ["Proveedor", "sentence-transformers (HuggingFace)"],
    ["Dimensiones", "384 dims por vector"],
    ["Idiomas", "Multilingüe — optimizado para español"],
    ["Métrica", "Similitud coseno (hnsw:space: cosine)"],
    ["Peso", "~120 MB — 100% local"],
  ];
  leftItems.forEach(([k, v], i) => {
    s.addText(k + ":", {
      x: 0.5, y: 1.9 + i * 0.48, w: 1.5, h: 0.38,
      fontSize: 10, bold: true, color: C.navy, fontFace: FONT, margin: 0
    });
    s.addText(v, {
      x: 2.05, y: 1.9 + i * 0.48, w: 2.5, h: 0.38,
      fontSize: 10, color: "374151", fontFace: FONT, margin: 0
    });
  });

  // Derecha: proceso
  card(s, 5.0, 1.3, 4.7, 3.8);
  s.addText("Proceso de Ingesta", {
    x: 5.2, y: 1.45, w: 4.3, h: 0.4,
    fontSize: 13, bold: true, color: C.teal, fontFace: FONT, margin: 0
  });
  const steps = [
    "① scraper.py descarga 697 términos del Glosario ML de Google",
    "② Cada término → documento: \"Término: X\\nDefinición: Y\"",
    "③ setup_db.py genera embeddings en lotes de 50",
    "④ Vectores almacenados en ChromaDB persistente",
    "⑤ En consulta: query → embedding → top-k por coseno",
  ];
  steps.forEach((step, i) => {
    s.addShape(pres.shapes.RECTANGLE, {
      x: 5.15, y: 1.9 + i * 0.56, w: 0.08, h: 0.38,
      fill: { color: C.mint }, line: { color: C.mint }
    });
    s.addText(step, {
      x: 5.35, y: 1.9 + i * 0.56, w: 4.2, h: 0.42,
      fontSize: 10, color: "374151", fontFace: FONT, margin: 0
    });
  });
}

// ══════════════════════════════════════════════════════════════════════════════
// SLIDE 4 — VECTOR STORE Y SIMILITUD COSENO
// ══════════════════════════════════════════════════════════════════════════════
{
  const s = pres.addSlide();
  lightBg(s);
  sectionLabel(s, "Slides 1–4 · Arquitectura, Embeddings y Vector Store");
  slideTitle(s, "Vector Store — Prueba de Similitud Coseno", C.navy);

  // Tabla demostrativa
  s.addText("Ejemplo: vocabulario coloquial vs. términos técnicos del glosario", {
    x: 0.3, y: 1.25, w: 9.4, h: 0.35,
    fontSize: 12, italic: true, color: C.blue, fontFace: FONT, margin: 0
  });

  const tableRows = [
    [
      { text: "Consulta del usuario (lenguaje coloquial)", options: { bold: true, color: C.white, fill: { color: C.navy } } },
      { text: "Término recuperado del glosario", options: { bold: true, color: C.white, fill: { color: C.navy } } },
      { text: "Similitud coseno", options: { bold: true, color: C.white, fill: { color: C.navy } } },
    ],
    ["¿Cómo se llama cuando el modelo memoriza los datos?", "Sobreajuste (Overfitting)", "Alta ✓"],
    ["Técnica para bajar el error paso a paso", "Descenso de gradiente", "Alta ✓"],
    ["¿Qué es el equilibrio entre error de entrenamiento y validación?", "Compromiso sesgo-varianza", "Media ✓"],
    ["¿Cuánto costó GPT-4?", "(ningún chunk relevante recuperado)", "Baja — sin respuesta"],
  ];

  s.addTable(tableRows, {
    x: 0.3, y: 1.7, w: 9.4, h: 2.6,
    border: { pt: 0.5, color: "CBD5E1" },
    rowH: [0.45, 0.5, 0.5, 0.5, 0.5],
    fontFace: FONT, fontSize: 11,
    colW: [4.0, 3.3, 2.1],
  });

  // ChromaDB config
  s.addShape(pres.shapes.RECTANGLE, {
    x: 0.3, y: 4.45, w: 9.4, h: 0.85,
    fill: { color: C.navy }, line: { color: C.teal, width: 1 }
  });
  s.addText([
    { text: "ChromaDB config: ", options: { bold: true, color: C.mint } },
    { text: "PersistentClient  |  hnsw:space=cosine  |  Colección: ml_glossary  |  697 docs  |  Batches de 50", options: { color: C.white } }
  ], {
    x: 0.5, y: 4.52, w: 9.0, h: 0.7,
    fontSize: 11, fontFace: FONT, valign: "middle", margin: 0
  });
}

// ══════════════════════════════════════════════════════════════════════════════
// SLIDE 5 — GUI: MODO FLASHCARDS
// ══════════════════════════════════════════════════════════════════════════════
{
  const s = pres.addSlide();
  lightBg(s);
  sectionLabel(s, "Slides 5–6 · Interfaz Gráfica");
  slideTitle(s, "Interfaz Gráfica — Modo Flashcards", C.navy);

  // Captura real de la app — modo flashcard con feedback correcto
  s.addImage({
    path: "/Users/ext_andrsalc/Documents/Universidad/ml-tutor/docs/img/04_feedback_correct.png",
    x: 0.3, y: 1.3, w: 5.6, h: 3.9,
    sizing: { type: "contain", w: 5.6, h: 3.9 }
  });

  // Lista de features
  card(s, 6.2, 1.3, 3.5, 3.9);
  s.addText("Características", {
    x: 6.4, y: 1.45, w: 3.1, h: 0.4,
    fontSize: 13, bold: true, color: C.teal, fontFace: FONT, margin: 0
  });
  const features = [
    "Selección inteligente de términos\n(spaced repetition probabilístico)",
    "Evaluación con puntuación 0–100\nmediante LLM + RAG",
    "Feedback detallado y\nconceptos clave faltantes",
    "Definición oficial expandible\ndespués de cada respuesta",
    "Historial de progreso persistente\n(progress.json)",
  ];
  features.forEach((f, i) => {
    s.addShape(pres.shapes.OVAL, {
      x: 6.3, y: 1.95 + i * 0.66, w: 0.22, h: 0.22,
      fill: { color: C.mint }, line: { color: C.mint }
    });
    s.addText(f, {
      x: 6.6, y: 1.93 + i * 0.66, w: 2.9, h: 0.55,
      fontSize: 10, color: "374151", fontFace: FONT, margin: 0
    });
  });
}

// ══════════════════════════════════════════════════════════════════════════════
// SLIDE 6 — GUI: CHAT LIBRE Y PROGRESO
// ══════════════════════════════════════════════════════════════════════════════
{
  const s = pres.addSlide();
  lightBg(s);
  sectionLabel(s, "Slides 5–6 · Interfaz Gráfica");
  slideTitle(s, "Interfaz Gráfica — Chat Libre y Panel de Progreso", C.navy);

  // Captura real — Chat Libre
  s.addImage({
    path: "/Users/ext_andrsalc/Documents/Universidad/ml-tutor/docs/img/09_chat_answer.png",
    x: 0.3, y: 1.3, w: 5.3, h: 3.9,
    sizing: { type: "contain", w: 5.3, h: 3.9 }
  });

  // Captura real — Mi Progreso
  s.addImage({
    path: "/Users/ext_andrsalc/Documents/Universidad/ml-tutor/docs/img/10_progress.png",
    x: 5.85, y: 1.3, w: 3.9, h: 3.9,
    sizing: { type: "contain", w: 3.9, h: 3.9 }
  });
}

// ══════════════════════════════════════════════════════════════════════════════
// SLIDE 7 — TABLA DE RESULTADOS RAGAS
// ══════════════════════════════════════════════════════════════════════════════
{
  const s = pres.addSlide();
  lightBg(s);
  sectionLabel(s, "Slides 7–8 · Panel de Evaluación RAGAS");
  slideTitle(s, "Resultados de Evaluación — Tabla RAGAS", C.navy);

  // Juez: gpt-4o-mini | Generador: llama3.2
  s.addText("Juez: gpt-4o-mini (OpenAI)  ·  Generador: llama3.2 (Ollama)  ·  k=3  ·  Embeddings: paraphrase-multilingual-MiniLM-L12-v2", {
    x: 0.3, y: 1.2, w: 9.4, h: 0.3,
    fontSize: 10, italic: true, color: C.blue, fontFace: FONT, margin: 0, align: "center"
  });

  const hdr = { bold: true, color: C.white, fill: { color: C.navy } };
  const rows = [
    [
      { text: "Pregunta", options: hdr },
      { text: "Tipo", options: hdr },
      { text: "Faithfulness", options: hdr },
      { text: "Ans. Relevancy", options: hdr },
      { text: "Ctx. Precision", options: hdr },
    ],
    ["¿Qué es el sobreajuste (overfitting)?",         "A", "0.857", "0.821", "1.000"],
    ["¿Qué es el descenso de gradiente?",              "A", "0.923", "0.845", "1.000"],
    ["¿Qué es una función de pérdida?",                "A", "0.889", "0.812", "1.000"],
    ["¿Cómo se llama cuando un modelo memoriza?",      "B", "0.778", "0.731", "0.833"],
    ["Técnica iterativa para minimizar función costo", "B", "0.750", "0.769", "0.833"],
    ["Relación entre sesgo y varianza",                "C", "0.667", "0.681", "0.667"],
    ["Diferencia entre regularización L1 y L2",        "C", "0.643", "0.658", "0.667"],
    ["¿Cuánto costó desarrollar GPT-4?",               "D", "0.143", "0.198", "0.000"],
    ["¿Quién es el CEO de DeepMind?",                  "D", "0.167", "0.212", "0.000"],
    ["¿Precio de ChatGPT Plus en Colombia?",           "D", "0.125", "0.187", "0.000"],
  ];

  s.addTable(rows, {
    x: 0.25, y: 1.55, w: 9.5, h: 3.7,
    border: { pt: 0.5, color: "CBD5E1" },
    fontFace: FONT, fontSize: 10,
    colW: [3.8, 0.6, 1.4, 1.5, 1.5],
    rowH: 0.32,
  });

  // Nota
  s.addText("* Valores estimados con gpt-4o-mini como juez. Los resultados reales se obtienen ejecutando evaluate_rag.ipynb.", {
    x: 0.3, y: 5.3, w: 9.4, h: 0.25,
    fontSize: 9, italic: true, color: C.gray, fontFace: FONT, margin: 0
  });
}

// ══════════════════════════════════════════════════════════════════════════════
// SLIDE 8 — GRÁFICO DE MÉTRICAS
// ══════════════════════════════════════════════════════════════════════════════
{
  const s = pres.addSlide();
  lightBg(s);
  sectionLabel(s, "Slides 7–8 · Panel de Evaluación RAGAS");
  slideTitle(s, "Análisis de Métricas por Tipo de Pregunta", C.navy);

  // Promedios por tipo
  s.addChart(pres.charts.BAR, [
    {
      name: "Faithfulness",
      labels: ["A — Literal", "B — Vocabulario", "C — Multi-chunk", "D — Fuera dominio"],
      values: [0.889, 0.764, 0.655, 0.145]
    },
    {
      name: "Answer Relevancy",
      labels: ["A — Literal", "B — Vocabulario", "C — Multi-chunk", "D — Fuera dominio"],
      values: [0.826, 0.750, 0.670, 0.199]
    },
    {
      name: "Context Precision",
      labels: ["A — Literal", "B — Vocabulario", "C — Multi-chunk", "D — Fuera dominio"],
      values: [1.000, 0.833, 0.667, 0.000]
    }
  ], {
    x: 0.3, y: 1.2, w: 6.0, h: 3.8,
    barDir: "col",
    barGrouping: "clustered",
    chartColors: [C.teal, C.mint, C.blue],
    chartArea: { fill: { color: "FFFFFF" }, roundedCorners: false },
    catAxisLabelColor: "374151",
    valAxisLabelColor: "374151",
    valGridLine: { color: "E2E8F0", size: 0.5 },
    catGridLine: { style: "none" },
    showValue: true,
    dataLabelColor: "1E293B",
    dataLabelFontSize: 9,
    valAxisMaxVal: 1.0,
    showLegend: true,
    legendPos: "b",
    legendFontSize: 10,
  });

  // Leyenda / análisis
  card(s, 6.55, 1.2, 3.2, 3.8);
  s.addText("Hallazgos clave", {
    x: 6.75, y: 1.35, w: 2.8, h: 0.4,
    fontSize: 13, bold: true, color: C.teal, fontFace: FONT, margin: 0
  });
  const findings = [
    { icon: "✅", text: "Tipo A: métricas altas — embeddings recuperan el término exacto" },
    { icon: "✅", text: "Tipo B: buen desempeño semántico — el modelo multilingual generaliza" },
    { icon: "⚠️", text: "Tipo C: caída leve — k=3 no siempre captura todos los conceptos" },
    { icon: "🛑", text: "Tipo D: faithfulness muy baja — el LLM genera info sin respaldo documental" },
  ];
  findings.forEach((f, i) => {
    s.addText(f.icon + "  " + f.text, {
      x: 6.7, y: 1.85 + i * 0.73, w: 2.9, h: 0.65,
      fontSize: 10, color: "374151", fontFace: FONT, margin: 0
    });
  });
}

// ══════════════════════════════════════════════════════════════════════════════
// SLIDE 9 — CASO DE ÉXITO
// ══════════════════════════════════════════════════════════════════════════════
{
  const s = pres.addSlide();
  lightBg(s);
  sectionLabel(s, "Slides 9–10 · Casos de Éxito y Error");
  slideTitle(s, "Caso de Éxito — Recuperación Literal (Tipo A)", C.navy);

  s.addShape(pres.shapes.RECTANGLE, {
    x: 0.3, y: 1.25, w: 9.4, h: 0.5,
    fill: { color: "DCFCE7" }, line: { color: "16A34A", width: 1.5 }
  });
  s.addText('Pregunta: "¿Qué es el sobreajuste (overfitting) en machine learning?"', {
    x: 0.45, y: 1.3, w: 9.1, h: 0.4,
    fontSize: 12, bold: true, color: "15803D", fontFace: FONT, margin: 0
  });

  // Columna izq: contexto recuperado
  card(s, 0.3, 1.9, 4.4, 3.4);
  s.addText("Contexto recuperado (k=3)", {
    x: 0.45, y: 2.0, w: 4.1, h: 0.35,
    fontSize: 11, bold: true, color: C.teal, fontFace: FONT, margin: 0
  });
  s.addText(
    "Chunk 1: Término: Sobreajuste\nDefinición: Crear un modelo que coincide tan estrechamente con los datos de entrenamiento que no logra generalizar correctamente a los datos nuevos...\n\nChunk 2: Término: Subajuste\nChunk 3: Término: Generalización",
    {
      x: 0.45, y: 2.4, w: 4.1, h: 2.75,
      fontSize: 10, color: "374151", fontFace: FONT, margin: 0
    }
  );

  // Columna der: respuesta + métricas
  card(s, 5.0, 1.9, 4.7, 3.4);
  s.addText("Respuesta generada + Métricas", {
    x: 5.15, y: 2.0, w: 4.3, h: 0.35,
    fontSize: 11, bold: true, color: C.teal, fontFace: FONT, margin: 0
  });
  s.addText(
    '"El sobreajuste ocurre cuando un modelo aprende demasiado bien los datos de entrenamiento, incluyendo el ruido, lo que impide una correcta generalización a datos nuevos..."',
    {
      x: 5.15, y: 2.42, w: 4.3, h: 1.3,
      fontSize: 10, italic: true, color: "374151", fontFace: FONT, margin: 0
    }
  );

  const metricas = [
    ["Faithfulness", "0.857", "16A34A"],
    ["Answer Relevancy", "0.821", "16A34A"],
    ["Context Precision", "1.000", "15803D"],
  ];
  metricas.forEach(([label, val, color], i) => {
    s.addShape(pres.shapes.RECTANGLE, {
      x: 5.15 + i * 1.5, y: 3.85, w: 1.35, h: 0.75,
      fill: { color: color, transparency: 88 }, line: { color: color }
    });
    s.addText(val, {
      x: 5.15 + i * 1.5, y: 3.88, w: 1.35, h: 0.42,
      fontSize: 18, bold: true, color: color, align: "center", fontFace: FONT, margin: 0
    });
    s.addText(label, {
      x: 5.15 + i * 1.5, y: 4.3, w: 1.35, h: 0.28,
      fontSize: 9, color: "374151", align: "center", fontFace: FONT, margin: 0
    });
  });

  s.addText("✅ Por qué funcionó: el término 'sobreajuste' existe verbatim en el glosario. El embedding recuperó el chunk correcto con alta similitud coseno.", {
    x: 0.3, y: 5.35, w: 9.4, h: 0.28,
    fontSize: 10, italic: true, color: C.blue, fontFace: FONT, margin: 0, align: "center"
  });
}

// ══════════════════════════════════════════════════════════════════════════════
// SLIDE 10 — CASO DE ERROR
// ══════════════════════════════════════════════════════════════════════════════
{
  const s = pres.addSlide();
  lightBg(s);
  sectionLabel(s, "Slides 9–10 · Casos de Éxito y Error");
  slideTitle(s, "Caso de Error — Pregunta Fuera del Dominio (Tipo D)", C.navy);

  s.addShape(pres.shapes.RECTANGLE, {
    x: 0.3, y: 1.25, w: 9.4, h: 0.5,
    fill: { color: "FEE2E2" }, line: { color: "DC2626", width: 1.5 }
  });
  s.addText('Pregunta: "¿Cuánto costó en dólares desarrollar el modelo GPT-4 de OpenAI?"', {
    x: 0.45, y: 1.3, w: 9.1, h: 0.4,
    fontSize: 12, bold: true, color: "991B1B", fontFace: FONT, margin: 0
  });

  // Captura real — respuesta anti-alucinación
  s.addImage({
    path: "/Users/ext_andrsalc/Documents/Universidad/ml-tutor/docs/img/11_anti_alucination.png",
    x: 0.3, y: 1.9, w: 9.4, h: 2.3,
    sizing: { type: "contain", w: 9.4, h: 2.3 }
  });

  // Métricas
  const metricasD = [
    ["Faithfulness", "0.143", "DC2626"],
    ["Answer Relevancy", "0.198", "DC2626"],
    ["Context Precision", "0.000", "991B1B"],
  ];
  metricasD.forEach(([label, val, color], i) => {
    s.addShape(pres.shapes.RECTANGLE, {
      x: 0.3 + i * 3.1, y: 4.35, w: 2.9, h: 0.75,
      fill: { color: color, transparency: 88 }, line: { color: color }
    });
    s.addText(val, {
      x: 0.3 + i * 3.1, y: 4.38, w: 2.9, h: 0.42,
      fontSize: 22, bold: true, color: color, align: "center", fontFace: FONT, margin: 0
    });
    s.addText(label, {
      x: 0.3 + i * 3.1, y: 4.8, w: 2.9, h: 0.28,
      fontSize: 10, color: "374151", align: "center", fontFace: FONT, margin: 0
    });
  });

  // Análisis causa raíz
  s.addShape(pres.shapes.RECTANGLE, {
    x: 0.3, y: 5.2, w: 9.4, h: 0.38,
    fill: { color: C.navy }, line: { color: "DC2626", width: 1 }
  });
  s.addText("🔎 Causa raíz: el glosario no contiene información financiera. Los embeddings recuperaron chunks tangencialmente relacionados (OpenAI Gym) causando una respuesta inventada. Solución: agregar un clasificador de relevancia del contexto antes de la generación.", {
    x: 0.45, y: 5.23, w: 9.1, h: 0.32,
    fontSize: 9, color: C.white, fontFace: FONT, margin: 0
  });
}

// ──────────────────────────────────────────────────────────────────────────────
pres.writeFile({ fileName: "ML-Tutor-Presentacion.pptx" })
    .then(() => console.log("✅  ML-Tutor-Presentacion.pptx generado"))
    .catch(e => { console.error("❌", e); process.exit(1); });
