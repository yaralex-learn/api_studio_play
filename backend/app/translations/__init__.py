import yaml
from yaml.cyaml import CLoader

from app.settings import LANGUAGES


translations = {}


def load_translations():
    for lang in LANGUAGES:
        file_path = f'app/translations/{lang}.yaml'
        try:
            with open(file_path, encoding='utf-8') as f:
                translations[lang] = yaml.load(f, Loader=CLoader)
        except FileNotFoundError:
            translations[lang] = {}
            with open(file_path, 'w', encoding='utf-8') as f:
                yaml.dump(translations[lang], f)


def translate(code: str):
    """
    Translate a given code into all supported languages.
    If the code isn’t in the translation file, append it with '---'.
    If the value is '---', return the code itself.
    Updates the YAML files if new codes are added.
    """
    result = {}
    for lang in LANGUAGES:
        messages = translations.get(lang, {})
        value = messages.get(code, '---')
        #
        if code not in messages:
            # Append the code with '---' if it doesn’t exist
            messages[code] = '---'
            translations[lang] = messages
            # Update the YAML files
            with open(f'app/translations/{lang}.yaml', 'w', encoding='utf-8') as f:
                yaml.dump(messages, f)

        # If value is '---', use the code itself; otherwise, use the translated value
        result[lang] = code if value == '---' else value
    return result
