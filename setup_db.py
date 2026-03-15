"""
setup_db.py
============
Carga el glosario JSON y crea la base de datos vectorial ChromaDB.
Usa sentence-transformers para embeddings 100% locales.

Uso: python setup_db.py
"""

import json
import os
import sys

DATA_DIR = os.path.join(os.path.dirname(__file__), "data")
GLOSSARY_PATH = os.path.join(DATA_DIR, "glossary.json")
CHROMA_PATH = os.path.join(DATA_DIR, "chroma_db")
COLLECTION_NAME = "ml_glossary"


def load_glossary() -> list[dict]:
    if not os.path.exists(GLOSSARY_PATH):
        print(f"ERROR: No se encontró {GLOSSARY_PATH}")
        print("Ejecuta primero: python scraper.py")
        sys.exit(1)

    with open(GLOSSARY_PATH, encoding="utf-8") as f:
        terms = json.load(f)
    print(f"Cargados {len(terms)} términos del glosario.")
    return terms


def build_vectorstore(terms: list[dict]):
    # Importaciones aquí para no requerir instaladas si solo se usa scraper
    from chromadb import PersistentClient
    from chromadb.utils.embedding_functions import SentenceTransformerEmbeddingFunction

    print("Inicializando ChromaDB...")
    client = PersistentClient(path=CHROMA_PATH)

    # Eliminar colección existente para reconstruir limpia
    try:
        client.delete_collection(COLLECTION_NAME)
        print("Colección anterior eliminada.")
    except Exception:
        pass

    embedding_fn = SentenceTransformerEmbeddingFunction(
        model_name="paraphrase-multilingual-MiniLM-L12-v2"
    )

    collection = client.create_collection(
        name=COLLECTION_NAME,
        embedding_function=embedding_fn,
        metadata={"hnsw:space": "cosine"},
    )

    print("Creando embeddings (esto puede tomar unos minutos la primera vez)...")

    # Insertar en lotes de 50 para no saturar memoria
    batch_size = 50
    for i in range(0, len(terms), batch_size):
        batch = terms[i : i + batch_size]
        documents = [
            f"Término: {t['term']}\nDefinición: {t['definition']}" for t in batch
        ]
        metadatas = [
            {"term": t["term"], "category": t.get("category", "")} for t in batch
        ]
        ids = [f"term_{i + j}" for j, _ in enumerate(batch)]

        collection.add(documents=documents, metadatas=metadatas, ids=ids)
        print(f"  Procesados {min(i + batch_size, len(terms))}/{len(terms)} términos...", end="\r")

    print(f"\nBase de datos vectorial creada en {CHROMA_PATH}")
    print(f"Total de documentos indexados: {collection.count()}")


def main():
    terms = load_glossary()
    build_vectorstore(terms)
    print("\nSetup completado. Ahora puedes ejecutar: streamlit run app.py")


if __name__ == "__main__":
    main()
