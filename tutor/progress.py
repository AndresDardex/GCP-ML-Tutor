"""
tutor/progress.py
==================
Persistencia del progreso del estudiante en un archivo JSON local.
"""

import json
import os
from datetime import datetime

PROGRESS_PATH = os.path.join(os.path.dirname(__file__), "..", "data", "progress.json")


def load_progress() -> dict:
    """Carga el historial de progreso del estudiante."""
    if not os.path.exists(PROGRESS_PATH):
        return {}
    with open(PROGRESS_PATH, encoding="utf-8") as f:
        return json.load(f)


def save_progress(history: dict):
    """Guarda el historial actualizado."""
    os.makedirs(os.path.dirname(PROGRESS_PATH), exist_ok=True)
    with open(PROGRESS_PATH, "w", encoding="utf-8") as f:
        json.dump(history, f, ensure_ascii=False, indent=2)


def record_attempt(history: dict, term: str, score: int, correct: bool) -> dict:
    """
    Registra un intento del estudiante para un término.
    Actualiza el historial en memoria y lo retorna.
    """
    if term not in history:
        history[term] = {
            "attempts": 0,
            "correct": 0,
            "last_score": 0,
            "best_score": 0,
            "last_seen": "",
        }

    entry = history[term]
    entry["attempts"] += 1
    if correct:
        entry["correct"] += 1
    entry["last_score"] = score
    entry["best_score"] = max(entry["best_score"], score)
    entry["last_seen"] = datetime.now().isoformat()

    return history
