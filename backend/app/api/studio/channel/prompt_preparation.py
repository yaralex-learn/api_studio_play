import time
import json
import os
from openai import OpenAI
from typing import Dict, Any, List, Union
from app.models.channel import QuestionResponse, PromptResponse

# Load environment variables from .env file
try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    # dotenv not installed, that's okay
    pass

# Get API key from environment variable
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
if not OPENAI_API_KEY:
    raise ValueError("OPENAI_API_KEY environment variable is not set")

client = OpenAI(api_key=OPENAI_API_KEY)

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

    with open("app/api/studio/channel/template.json", "r", encoding="utf-8") as f:
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

def generate_text_prompt(
    text: str,
    context_type: str,
    max_retries: int = 3
) -> str:
    """
    Revise text grammatically and contextually based on where it will be used.
    
    Args:
        text: The original text to be revised
        context_type: Where the text will be used ("lesson", "activity", "unit", "section")
        max_retries: Maximum number of retry attempts
        
    Returns:
        String containing the revised text
    """
    
    context_guidelines = {
        "lesson": {
            "tone": "instructional and engaging",
            "style": "clear explanations with examples",
            "purpose": "teach specific concepts step by step",
            "audience": "students learning the material",
            "formatting": "structured with clear learning points"
        },
        "activity": {
            "tone": "interactive and motivating",
            "style": "action-oriented and practical",
            "purpose": "guide students through hands-on tasks",
            "audience": "students actively participating",
            "formatting": "step-by-step instructions with clear outcomes"
        },
        "unit": {
            "tone": "comprehensive and organized",
            "style": "overview with broader context",
            "purpose": "introduce major learning blocks and objectives",
            "audience": "students and educators planning study",
            "formatting": "structured overview with key themes"
        },
        "section": {
            "tone": "introductory and contextual",
            "style": "broad overview connecting topics",
            "purpose": "provide context and learning roadmap",
            "audience": "students beginning a new topic area",
            "formatting": "clear introduction with learning expectations"
        }
    }
    
    if context_type not in context_guidelines:
        raise ValueError(f"Invalid context_type: {context_type}. Must be one of: {list(context_guidelines.keys())}")
    
    guidelines = context_guidelines[context_type]
    
    system_msg = (
        "You are an expert educational content editor and grammar specialist. "
        "Your task is to revise text to be grammatically correct, contextually appropriate, "
        "and optimized for educational use. "
        "Return ONLY the revised text without any explanations or additional formatting."
    )
    
    user_msg = f"""
    Please revise the following text for use in a {context_type} text box:
    
    Original Text: "{text}"
    
    Context Guidelines:
    - Tone: {guidelines['tone']}
    - Style: {guidelines['style']}
    - Purpose: {guidelines['purpose']}
    - Audience: {guidelines['audience']}
    - Formatting: {guidelines['formatting']}
    
    Requirements:
    1. Correct all grammatical errors
    2. Improve clarity and readability
    3. Adjust tone and style to match the {context_type} context
    4. Ensure the text is appropriate for educational use
    5. Maintain the original meaning and intent
    6. Make it engaging and suitable for the intended audience
    
    Return only the revised text:
    """
    
    attempt = 0
    while attempt < max_retries:
        attempt += 1
        print(f"Revising {context_type} text - Attempt #{attempt}...")
        
        try:
            response = client.chat.completions.create(
                model="gpt-4o",
                messages=[
                    {"role": "system", "content": system_msg},
                    {"role": "user", "content": user_msg}
                ],
                temperature=0.3,
                max_tokens=1000
            )
            
            revised_text = response.choices[0].message.content.strip()
            
            # Basic validation - ensure we got meaningful content
            if len(revised_text) < 10:
                print("Revised text too short. Retrying...")
                time.sleep(1)
                continue
            
            # Remove any quotation marks that might wrap the response
            revised_text = revised_text.strip('"').strip("'")
            
            return revised_text
            
        except Exception as e:
            print(f"Error on attempt {attempt}: {str(e)}")
            if attempt < max_retries:
                time.sleep(1)
                continue
            else:
                raise
    
    raise ValueError(f"Failed to revise {context_type} text after {max_retries} attempts.")

# res = generate_questions_with_template(
#     concept_prompt = "give questions about orther food in restaurant, should point out the role of present perfect and future perfect grammer",
#     # concept_prompt = "concept of the question is about the weather",
#     template_id = 3,
#     num_questions = 10,
#     difficulty = "easy"
# )

# # Test the text revision function

