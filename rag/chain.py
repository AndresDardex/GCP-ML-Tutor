"""
rag/chain.py
=============
Cadena RAG usando LangChain + ChromaDB + Ollama.
Recupera contexto relevante del glosario y lo inyecta en los prompts.
"""

import json
import os
import re

from chromadb import PersistentClient
from chromadb.utils.embedding_functions import SentenceTransformerEmbeddingFunction
from langchain_ollama import OllamaLLM

from prompts.few_shot import FEW_SHOT_EXAMPLES
from prompts.system_prompts import (
    CHAT_SYSTEM_PROMPT,
    EVALUATION_PROMPT_TEMPLATE,
    FLASHCARD_SYSTEM_PROMPT,
)

DATA_DIR = os.path.join(os.path.dirname(__file__), "..", "data")
CHROMA_PATH = os.path.join(DATA_DIR, "chroma_db")
COLLECTION_NAME = "ml_glossary"
OLLAMA_MODEL = "llama3.2"


class MLTutorChain:
    """Cadena RAG para el tutor de ML."""

    def __init__(self, model: str = OLLAMA_MODEL):
        self.llm = OllamaLLM(model=model, temperature=0.3)
        self._collection = None

    def _get_collection(self):
        if self._collection is None:
            embedding_fn = SentenceTransformerEmbeddingFunction(
                model_name="paraphrase-multilingual-MiniLM-L12-v2"
            )
            client = PersistentClient(path=os.path.abspath(CHROMA_PATH))
            self._collection = client.get_collection(
                name=COLLECTION_NAME, embedding_function=embedding_fn
            )
        return self._collection

    def retrieve_context(self, query: str, n_results: int = 3) -> str:
        """Recupera los N términos más relevantes para la consulta."""
        collection = self._get_collection()
        results = collection.query(
            query_texts=[query],
            n_results=n_results,
            include=["documents", "metadatas"],
        )
        docs = results["documents"][0] if results["documents"] else []
        return "\n\n".join(docs)

    def evaluate_flashcard(self, term: str, official_definition: str, student_answer: str) -> dict:
        """
        Evalúa la respuesta del estudiante en modo flashcard.
        Retorna dict con: puntuacion, correcto, feedback, conceptos_clave_faltantes
        """
        context = self.retrieve_context(term)
        system_prompt = FLASHCARD_SYSTEM_PROMPT.format(context=context)

        prompt = EVALUATION_PROMPT_TEMPLATE.format(
            system_prompt=system_prompt,
            few_shot_examples=FEW_SHOT_EXAMPLES,
            term=term,
            official_definition=official_definition,
            student_answer=student_answer,
        )

        raw_response = self.llm.invoke(prompt)
        return self._parse_json_response(raw_response)

    def chat(self, question: str) -> str:
        """Responde una pregunta libre sobre ML usando RAG."""
        context = self.retrieve_context(question, n_results=4)
        prompt = CHAT_SYSTEM_PROMPT.format(context=context, question=question)
        return self.llm.invoke(prompt)

    def _parse_json_response(self, raw: str) -> dict:
        """Extrae y parsea el JSON de la respuesta del LLM."""
        # Buscar bloque JSON en la respuesta
        match = re.search(r"\{.*\}", raw, re.DOTALL)
        if match:
            try:
                return json.loads(match.group())
            except json.JSONDecodeError:
                pass

        # Fallback si el modelo no siguió el formato
        return {
            "puntuacion": 0,
            "correcto": False,
            "feedback": raw.strip(),
            "conceptos_clave_faltantes": [],
        }
