"""
tutor/flashcard.py
===================
Lógica de selección de flashcards.
Prioriza términos con baja puntuación o no vistos (spaced repetition simple).
"""

import json
import os
import random

GLOSSARY_PATH = os.path.join(os.path.dirname(__file__), "..", "data", "glossary.json")


def load_glossary() -> list[dict]:
    """Carga el glosario desde el JSON generado por scraper.py."""
    if not os.path.exists(GLOSSARY_PATH):
        return []
    with open(GLOSSARY_PATH, encoding="utf-8") as f:
        return json.load(f)


def select_next_card(glossary: list[dict], history: dict) -> dict | None:
    """
    Selecciona el próximo término para practicar.

    Estrategia:
    1. Primero términos nunca vistos (40% probabilidad si existen)
    2. Luego términos con puntuación < 60 (prioridad alta)
    3. Luego términos con puntuación < 80 (repaso)
    4. Cualquier término (revisión general)
    """
    if not glossary:
        return None

    term_names = {t["term"] for t in glossary}
    seen = set(history.keys())
    unseen = [t for t in glossary if t["term"] not in seen]
    weak = [
        t for t in glossary
        if t["term"] in history and history[t["term"]].get("last_score", 100) < 60
    ]
    review = [
        t for t in glossary
        if t["term"] in history and history[t["term"]].get("last_score", 100) < 80
    ]

    # Pesos de selección
    if unseen and random.random() < 0.45:
        return random.choice(unseen)
    if weak and random.random() < 0.40:
        return random.choice(weak)
    if review and random.random() < 0.30:
        return random.choice(review)
    return random.choice(glossary)


def get_stats(glossary: list[dict], history: dict) -> dict:
    """Calcula estadísticas de progreso del estudiante."""
    total = len(glossary)
    seen = len(history)
    if seen == 0:
        return {"total": total, "vistos": 0, "dominados": 0, "en_repaso": 0, "porcentaje": 0}

    scores = [v.get("last_score", 0) for v in history.values()]
    dominated = sum(1 for s in scores if s >= 80)
    needs_review = sum(1 for s in scores if s < 60)
    avg = sum(scores) / len(scores) if scores else 0

    return {
        "total": total,
        "vistos": seen,
        "dominados": dominated,
        "en_repaso": needs_review,
        "porcentaje": round(avg, 1),
    }
