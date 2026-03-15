"""
app.py
=======
MentorML – Tutor Académico de Machine Learning
Interfaz Streamlit con tres modos:
  1. Flashcards – aprende con preguntas y feedback personalizado
  2. Pregunta Libre – chat con el glosario como base de conocimiento
  3. Mi Progreso – visualiza tu avance
"""

import os
import sys

import streamlit as st

# Asegurar que los módulos locales sean accesibles
sys.path.insert(0, os.path.dirname(__file__))

# ─────────────────────────────────────────────────────────────────
# Configuración de página
# ─────────────────────────────────────────────────────────────────
st.set_page_config(
    page_title="MentorML",
    page_icon="🤖",
    layout="centered",
    initial_sidebar_state="collapsed",
)

# ─────────────────────────────────────────────────────────────────
# CSS personalizado
# ─────────────────────────────────────────────────────────────────
st.markdown(
    """
    <style>
    .main-title { font-size: 2.5rem; font-weight: 800; color: #1e3a5f; text-align: center; }
    .subtitle   { font-size: 1.1rem; color: #555; text-align: center; margin-bottom: 2rem; }
    .card-term  { font-size: 2rem; font-weight: 700; color: #1e3a5f; text-align: center;
                  padding: 1.5rem; background: #f0f4ff; border-radius: 12px;
                  border-left: 6px solid #4a90e2; margin-bottom: 1rem; }
    .feedback-box { padding: 1rem 1.5rem; border-radius: 10px; margin-top: 1rem; color: #1a1a1a; }
    .feedback-correct   { background: #e8f5e9; border-left: 5px solid #43a047; color: #1a1a1a; }
    .feedback-incorrect { background: #fce4ec; border-left: 5px solid #e53935; color: #1a1a1a; }
    .feedback-partial   { background: #fff8e1; border-left: 5px solid #fb8c00; color: #1a1a1a; }
    .score-label { font-size: 1rem; font-weight: 600; color: #333; }
    </style>
    """,
    unsafe_allow_html=True,
)

# ─────────────────────────────────────────────────────────────────
# Inicialización de session_state
# ─────────────────────────────────────────────────────────────────
def init_state():
    defaults = {
        "mode": "home",
        "glossary": None,
        "history": None,
        "chain": None,
        "current_card": None,
        "evaluation_result": None,
        "answer_submitted": False,
        "chat_messages": [],
    }
    for key, val in defaults.items():
        if key not in st.session_state:
            st.session_state[key] = val


init_state()


# ─────────────────────────────────────────────────────────────────
# Carga lazy de recursos pesados
# ─────────────────────────────────────────────────────────────────
@st.cache_resource(show_spinner="Cargando base de datos vectorial...")
def load_chain():
    from rag.chain import MLTutorChain
    return MLTutorChain()


@st.cache_data(show_spinner=False)
def load_glossary_data():
    from tutor.flashcard import load_glossary
    return load_glossary()


def get_chain():
    if st.session_state.chain is None:
        st.session_state.chain = load_chain()
    return st.session_state.chain


def get_glossary():
    if st.session_state.glossary is None:
        st.session_state.glossary = load_glossary_data()
    return st.session_state.glossary


def get_history():
    if st.session_state.history is None:
        from tutor.progress import load_progress
        st.session_state.history = load_progress()
    return st.session_state.history


# ─────────────────────────────────────────────────────────────────
# Helpers de navegación
# ─────────────────────────────────────────────────────────────────
def go_to(mode: str):
    st.session_state.mode = mode
    st.session_state.evaluation_result = None
    st.session_state.answer_submitted = False
    st.session_state.current_card = None


# ─────────────────────────────────────────────────────────────────
# PANTALLA: HOME
# ─────────────────────────────────────────────────────────────────
def render_home():
    st.markdown('<p class="main-title">🤖 MentorML</p>', unsafe_allow_html=True)
    st.markdown(
        '<p class="subtitle">Tu tutor personal de Machine Learning basado en el Glosario de Google</p>',
        unsafe_allow_html=True,
    )

    # Verificar si los datos están listos
    glossary = get_glossary()
    if not glossary:
        st.error(
            "**El glosario no está disponible.** Ejecuta primero:\n\n"
            "```\npython scraper.py\npython setup_db.py\n```"
        )
        return

    st.info(f"📚 Glosario cargado: **{len(glossary)} términos** de ML listos para practicar.")

    st.markdown("---")
    col1, col2, col3 = st.columns(3)

    with col1:
        st.markdown("### 🃏 Flashcards")
        st.write("Aprende con preguntas y recibe feedback inteligente sobre tus respuestas.")
        if st.button("Empezar a practicar", use_container_width=True, type="primary"):
            go_to("flashcard")
            st.rerun()

    with col2:
        st.markdown("### 💬 Pregunta Libre")
        st.write("Consulta cualquier concepto de ML y el tutor te explica con el glosario como fuente.")
        if st.button("Abrir chat", use_container_width=True):
            go_to("chat")
            st.rerun()

    with col3:
        st.markdown("### 📊 Mi Progreso")
        history = get_history()
        st.write(f"Llevas **{len(history)}** términos practicados.")
        if st.button("Ver progreso", use_container_width=True):
            go_to("progress")
            st.rerun()


# ─────────────────────────────────────────────────────────────────
# PANTALLA: FLASHCARD
# ─────────────────────────────────────────────────────────────────
def render_flashcard():
    st.markdown("### 🃏 Modo Flashcard")

    col_back, col_title = st.columns([1, 5])
    with col_back:
        if st.button("← Inicio"):
            go_to("home")
            st.rerun()

    glossary = get_glossary()
    if not glossary:
        st.error("Glosario no disponible. Ejecuta scraper.py y setup_db.py primero.")
        return

    history = get_history()

    # Seleccionar tarjeta si no hay una activa
    if st.session_state.current_card is None:
        from tutor.flashcard import select_next_card
        card = select_next_card(glossary, history)
        st.session_state.current_card = card
        st.session_state.answer_submitted = False
        st.session_state.evaluation_result = None

    card = st.session_state.current_card
    if card is None:
        st.warning("No hay términos disponibles.")
        return

    # Mostrar categoría si existe
    if card.get("category"):
        st.caption(f"Categoría: {card['category']}")

    # Tarjeta con el término
    st.markdown(f'<div class="card-term">{card["term"]}</div>', unsafe_allow_html=True)
    st.markdown("**¿Qué significa este término? Escribe tu definición:**")

    # Área de respuesta
    if not st.session_state.answer_submitted:
        answer = st.text_area(
            "Tu respuesta",
            placeholder="Escribe aquí tu definición...",
            height=120,
            key=f"answer_{card['term']}",
            label_visibility="collapsed",
        )

        col1, col2 = st.columns([3, 1])
        with col1:
            if st.button("Evaluar respuesta", type="primary", use_container_width=True):
                if not answer.strip():
                    st.warning("Escribe una respuesta antes de evaluar.")
                else:
                    with st.spinner("MentorML está evaluando tu respuesta..."):
                        chain = get_chain()
                        result = chain.evaluate_flashcard(
                            term=card["term"],
                            official_definition=card["definition"],
                            student_answer=answer.strip(),
                        )
                    st.session_state.evaluation_result = result
                    st.session_state.answer_submitted = True

                    # Guardar en historial
                    from tutor.progress import record_attempt, save_progress
                    history = record_attempt(
                        get_history(),
                        card["term"],
                        result.get("puntuacion", 0),
                        result.get("correcto", False),
                    )
                    save_progress(history)
                    st.rerun()
        with col2:
            if st.button("Saltar", use_container_width=True):
                st.session_state.current_card = None
                st.rerun()

    # Mostrar resultado de evaluación
    if st.session_state.answer_submitted and st.session_state.evaluation_result:
        result = st.session_state.evaluation_result
        score = result.get("puntuacion", 0)
        correct = result.get("correcto", False)
        feedback = result.get("feedback", "")
        missing = result.get("conceptos_clave_faltantes", [])

        # Barra de puntuación
        st.markdown(f'<p class="score-label">Puntuación: {score}/100</p>', unsafe_allow_html=True)
        st.progress(score / 100)

        # Caja de feedback con color según resultado
        if correct and score >= 80:
            css_class = "feedback-correct"
            icon = "✅"
        elif correct:
            css_class = "feedback-partial"
            icon = "🟡"
        else:
            css_class = "feedback-incorrect"
            icon = "❌"

        st.markdown(
            f'<div class="feedback-box {css_class}">{icon} <strong>Feedback:</strong><br>{feedback}</div>',
            unsafe_allow_html=True,
        )

        # Conceptos faltantes
        if missing:
            st.markdown("**Conceptos clave a reforzar:** " + ", ".join(f"`{c}`" for c in missing))

        # Definición oficial expandible
        with st.expander("Ver definición oficial del glosario"):
            st.write(card["definition"])

        st.markdown("---")
        if st.button("Siguiente tarjeta →", type="primary", use_container_width=True):
            st.session_state.current_card = None
            st.session_state.answer_submitted = False
            st.session_state.evaluation_result = None
            st.rerun()


# ─────────────────────────────────────────────────────────────────
# PANTALLA: CHAT LIBRE
# ─────────────────────────────────────────────────────────────────
def render_chat():
    st.markdown("### 💬 Pregunta Libre sobre ML")

    if st.button("← Inicio"):
        go_to("home")
        st.rerun()

    # Mostrar historial de mensajes
    for msg in st.session_state.chat_messages:
        with st.chat_message(msg["role"]):
            st.write(msg["content"])

    # Input del usuario
    if user_input := st.chat_input("¿Qué concepto de ML quieres entender?"):
        st.session_state.chat_messages.append({"role": "user", "content": user_input})
        with st.chat_message("user"):
            st.write(user_input)

        with st.chat_message("assistant"):
            with st.spinner("Consultando el glosario..."):
                chain = get_chain()
                response = chain.chat(user_input)
            st.write(response)
            st.session_state.chat_messages.append({"role": "assistant", "content": response})


# ─────────────────────────────────────────────────────────────────
# PANTALLA: PROGRESO
# ─────────────────────────────────────────────────────────────────
def render_progress():
    st.markdown("### 📊 Mi Progreso")

    if st.button("← Inicio"):
        go_to("home")
        st.rerun()

    glossary = get_glossary()
    history = get_history()

    from tutor.flashcard import get_stats
    stats = get_stats(glossary, history)

    # Métricas principales
    col1, col2, col3, col4 = st.columns(4)
    col1.metric("Total de términos", stats["total"])
    col2.metric("Practicados", stats["vistos"])
    col3.metric("Dominados (≥80)", stats["dominados"])
    col4.metric("Promedio", f"{stats['porcentaje']}%")

    if stats["vistos"] == 0:
        st.info("Aún no has practicado ningún término. ¡Empieza con las Flashcards!")
        return

    # Barra de progreso general
    progress_pct = stats["vistos"] / stats["total"] if stats["total"] > 0 else 0
    st.markdown(f"**Avance general:** {stats['vistos']}/{stats['total']} términos vistos")
    st.progress(progress_pct)

    # Términos que necesitan repaso
    needs_review = [
        (term, data)
        for term, data in history.items()
        if data.get("last_score", 0) < 60
    ]
    if needs_review:
        st.markdown("#### ⚠️ Términos que necesitan repaso (puntuación < 60)")
        for term, data in sorted(needs_review, key=lambda x: x[1].get("last_score", 0)):
            st.markdown(
                f"- **{term}** — última puntuación: `{data.get('last_score', 0)}/100`"
                f" | intentos: {data.get('attempts', 0)}"
            )

    # Términos dominados
    dominated = [
        (term, data)
        for term, data in history.items()
        if data.get("last_score", 0) >= 80
    ]
    if dominated:
        with st.expander(f"✅ Términos dominados ({len(dominated)})"):
            for term, data in sorted(dominated, key=lambda x: -x[1].get("last_score", 0)):
                st.markdown(
                    f"- **{term}** — {data.get('last_score', 0)}/100"
                    f" | mejor: {data.get('best_score', 0)}/100"
                )

    # Botón para resetear
    st.markdown("---")
    if st.button("🗑️ Reiniciar progreso", type="secondary"):
        from tutor.progress import save_progress
        st.session_state.history = {}
        save_progress({})
        st.success("Progreso reiniciado.")
        st.rerun()


# ─────────────────────────────────────────────────────────────────
# ROUTER PRINCIPAL
# ─────────────────────────────────────────────────────────────────
mode = st.session_state.get("mode", "home")

if mode == "home":
    render_home()
elif mode == "flashcard":
    render_flashcard()
elif mode == "chat":
    render_chat()
elif mode == "progress":
    render_progress()
