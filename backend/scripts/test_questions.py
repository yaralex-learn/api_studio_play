import time
import json
from openai import OpenAI

client = OpenAI()

OPENAI_API_KEY= "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"
# export OPENAI_API_KEY="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"

import re

def clean_json_text(raw_text: str) -> str:
    """
    Remove ```json or ``` wrappers if they exist.
    """
    # Remove common ```json\n ... ``` or ``` ... ``` fences
    cleaned = re.sub(r"^```(?:json)?\s*", "", raw_text.strip(), flags=re.IGNORECASE)
    cleaned = re.sub(r"\s*```$", "", cleaned.strip())
    return cleaned

def generate_questions_with_template(
    concept_prompt: str,
    template_id: int,
    num_questions: int,
    difficulty: str,
    max_retries: int = 3
) -> list:
    system_msg = (
        "You are a question generator for an educational app. "
        "ALWAYS output valid JSON matching the EXACT template. "
        "Do NOT add any explanations or text outside the JSON."
    )

    with open("scripts/template.json", "r", encoding="utf-8") as f:
        templates = json.load(f)
    template = next((item for item in templates if item["id"] == template_id), None)
    if template is None:
        raise ValueError(f"Template with id {template_id} not found.")

    user_msg = f"""
    Concept: {concept_prompt}
    Difficulty: {difficulty}
    Number of questions: {num_questions}
    Follow this JSON template exactly: {template}
    Return a JSON array of {num_questions} questions.
    """
    attempt = 0

    while attempt < max_retries:
        attempt += 1
        print(f"Attempt #{attempt}...")

        response = client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {"role": "system", "content": system_msg},
                {"role": "user", "content": user_msg}
            ],
            temperature=0.3
        )

        raw_text = response.choices[0].message.content.strip()

        try:
            cleaned_text = clean_json_text(raw_text)
            result = json.loads(cleaned_text)
        except json.JSONDecodeError:
            print("Invalid JSON returned. Retrying...")
            time.sleep(1)
            continue

        if not isinstance(result, list) or len(result) != num_questions:
            print("Output does not match required number of questions. Retrying...")
            time.sleep(1)
            continue

        return result

    raise ValueError(f"Failed to generate valid output after {max_retries} attempts.")


res = generate_questions_with_template(
    concept_prompt = "give questions about orther food in restaurant, should point out the role of present perfect and future perfect grammer",
    # concept_prompt = "concept of the question is about the weather",
    template_id = 3,
    num_questions = 10,
    difficulty = "easy"
)