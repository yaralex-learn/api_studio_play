from fastapi import FastAPI
from fastapi.openapi.utils import get_openapi

from app.messages.general import General_Message
from app.translations import translate


SEP = ' ▸ '


def get_unique_tags(app: FastAPI):
    """Extract all unique tags from the app's routes."""
    tags = []
    for route in app.routes:
        if hasattr(route, "tags"):  # Check if the route has tags
            for tag in route.tags:
                if tag not in tags:
                    tags.append(tag)
    return tags


def categorize_tags(tags: list[str]) -> dict[str, list[str]]:
    """
    Categorize a list of tags based on the prefix before the first SEP.
    """
    categories = {}
    for tag in tags:
        # Determine the category: part before the first SEP if SEP exists, else the whole tag
        category = tag.split(SEP)[0].strip() if SEP in tag else tag
        # Initialize the category list if it doesn't exist
        if category not in categories:
            categories[category] = []
        # Append the full tag to the category's list
        categories[category].append(tag)
    return categories


def patch_openapi(app: FastAPI) -> dict:
    # Always generate a fresh schema to avoid caching issues
    openapi_schema = get_openapi(
        title=app.title,
        version=app.version,
        description=app.description,
        routes=app.routes,
    )
    # Ensure components and schemas sections exist
    if "components" not in openapi_schema:
        openapi_schema["components"] = {}
    if "schemas" not in openapi_schema["components"]:
        openapi_schema["components"]["schemas"] = {}
    # Define FailResponse schema in components/schemas
    openapi_schema["components"]["schemas"]["FailResponse"] = {
        "type": "object",
        "properties": {
            "success": {"type": "boolean", "example": False},
            "message": {
                "type": "object",
                "additionalProperties": {"type": "string"},
                "example": translate(General_Message.VALIDATION_ERROR.value),
            },
            "data": {"type": "object", "nullable": True, "example": None},
            "error": {"type": "string", "example": "User not found"},
        },
        "required": ["success", "message"],
    }
    # Patch 422 responses
    for path in openapi_schema["paths"].values():
        for method in path.values():
            if "422" in method["responses"]:
                method["responses"]["422"] = {
                    "description": "Validation Error (custom)",
                    "content": {
                        "application/json": {
                            "schema": {"$ref": "#/components/schemas/FailResponse"}
                        }
                    }
                }
    # Add x-tagGroups for ReDoc
    # the OpenAPI schema with categorized tag groups.
    unique_tags = get_unique_tags(app)
    categorized_tags = categorize_tags(unique_tags)
    # Add x-tagGroups for ReDoc hierarchical display
    openapi_schema["x-tagGroups"] = [
        {"name": category, "tags": tags}
        for category, tags in categorized_tags.items()
    ]
    # Assign and return the patched schema
    app.openapi_schema = openapi_schema
    return app.openapi_schema
