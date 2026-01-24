from pydantic import BaseModel, Field
from typing import Optional, Any, Dict


class FailResponse(BaseModel):
    success: bool = False
    data: None = None
    message: Dict[str, str] = Field(..., example="error message")
    error: str = Field(..., example="Error_Code")


class Response_400(BaseModel):
    success: bool = False
    data: None = None
    message: Dict[str, str] = {'en': 'Bad request'}
    error: str = 'BAD_REQUEST'


class Response_401(BaseModel):
    success: bool = False
    data: None = None
    message: Dict[str, str] = {'en': 'Unauthorized'}
    error: str = 'UNAUTHORIZED'


class Response_403(BaseModel):
    success: bool = False
    data: None = None
    message: Dict[str, str] = {'en': 'Forbidden'}
    error: str = 'FORBIDDEN'


class Response_404(BaseModel):
    success: bool = False
    data: None = None
    message: Dict[str, str] = {'en': 'Not found'}
    error: str = 'NOT_FOUND'


class Response_406(BaseModel):
    success: bool = False
    data: None = None
    message: Dict[str, str] = {'en': 'Not acceptable'}
    error: str = 'NOT_ACCEPTABLE'


class Response_409(BaseModel):
    success: bool = False
    data: None = None
    message: Dict[str, str] = {'en': 'Conflict'}
    error: str = 'CONFLICT'


class Response_422(BaseModel):
    success: bool = False
    data: None = None
    message: Dict[str, str] = {'en': 'Validation error'}
    error: str = 'VALIDATION_ERROR'


class Response_Model(BaseModel):
    success: bool = Field(..., example=True)
    data: Optional[Any] = Field(..., example=None)
    message: Optional[Dict] = Field(..., example={'en': '...'})
    error: str = Field(..., example='OK')


responses = {
    '400': {400: {'model': Response_400}},
    '401': {401: {'model': Response_401}},
    '403': {403: {'model': Response_403}},
    '404': {404: {'model': Response_404}},
    '406': {406: {'model': Response_406}},
    '409': {409: {'model': Response_409}},
    '422': {422: {'model': Response_422}}
}
