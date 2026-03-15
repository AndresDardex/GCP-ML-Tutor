"""
scraper.py
Descarga y parsea el Glosario de ML de Google.
Guarda los términos en data/glossary.json

Uso: python scraper.py
"""

import json
import os
import requests
from bs4 import BeautifulSoup

GLOSSARY_URL = "https://developers.google.com/machine-learning/glossary?hl=es-419"
OUTPUT_PATH = os.path.join(os.path.dirname(__file__), "data", "glossary.json")

HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/120.0.0.0 Safari/537.36"
    )
}


def scrape_glossary() -> list[dict]:
    """Descarga y parsea el glosario. Retorna lista de términos."""
    print(f"Descargando glosario desde {GLOSSARY_URL}...")
    response = requests.get(GLOSSARY_URL, headers=HEADERS, timeout=30)
    response.raise_for_status()

    soup = BeautifulSoup(response.text, "html.parser")
    terms = []

    # Los términos del glosario usan clase "hide-from-toc"; "glossary" son encabezados de letra
    glossary_headings = soup.find_all("h2", class_="hide-from-toc")

    for heading in glossary_headings:
        term_name = heading.get_text(strip=True)
        if not term_name:
            continue

        # Categoría: span.glossary-icon que sigue al h2
        category = ""
        icon_container = heading.find_next_sibling("div", class_="glossary-icon-container")
        if icon_container:
            icon = icon_container.find("span", class_="glossary-icon")
            if icon:
                category = icon.get("title", "").strip()

        # Definición: recopilar todo el texto hasta el próximo h2
        definition_parts = []
        sibling = heading.next_sibling
        while sibling:
            # Parar cuando encontramos el siguiente término o encabezado de letra
            if hasattr(sibling, "name"):
                if sibling.name == "h2":
                    break
                if sibling.name in ("p", "ul", "ol"):
                    text = sibling.get_text(separator=" ", strip=True)
                    if text:
                        definition_parts.append(text)
            sibling = sibling.next_sibling

        definition = "\n\n".join(definition_parts).strip()

        if term_name and definition:
            terms.append({
                "term": term_name,
                "definition": definition,
                "category": category,
            })

    return terms


def main():
    os.makedirs(os.path.dirname(OUTPUT_PATH), exist_ok=True)
    terms = scrape_glossary()

    with open(OUTPUT_PATH, "w", encoding="utf-8") as f:
        json.dump(terms, f, ensure_ascii=False, indent=2)

    print(f"Guardados {len(terms)} términos en {OUTPUT_PATH}")


if __name__ == "__main__":
    main()
