import traceback
from enum import Enum
from datetime import datetime

from fastapi import Response, status, HTTPException

from app.models import FailResponse
from app.models.error import Error as ErrorLog
from app.translations import translate
from app.settings import LANGUAGES

from app.messages.base import Error
from app.messages.general import General_Message
from app.messages.channel import Channel_Error, Channel_Message
from app.messages.user import User_Error, User_Message


MESSAGE_CLASSES = [
    General_Message,
    User_Message,
    Channel_Message,
]


ERROR_CLASSES = [
    User_Error,
    Channel_Error,
]


class CustomHTTPException(HTTPException):
    def __init__(self, status_code: int, response_data: dict):
        super().__init__(status_code=status_code, detail=response_data)
        self.response_data = response_data


def format_error_response(message: dict, error_code: str):
    return FailResponse(
        success=False,
        data=None,
        message=message,
        error=error_code,
    )


def unwrap_error(exception):
    if isinstance(exception, Enum) and isinstance(exception.value, Error):
        return exception.value
    return exception


def is_custom_error(exception):
    return isinstance(unwrap_error(exception), Error)


def inject_messages():
    # Inject into Error objects (if using error instances like before)
    for cls in ERROR_CLASSES:
        for member in cls.__members__.values():
            error = unwrap_error(member)
            if isinstance(error, Error):
                error.messages = translate(error.code)
    # Inject into Message Enums (adds `.messages` dynamically)
    for cls in MESSAGE_CLASSES:
        for msg in cls:
            setattr(msg, "messages", translate(msg.value))


async def log_unexpected_error_to_db(e: Exception):
    # Get the function name where the error occurred
    tb = traceback.extract_tb(e.__traceback__)
    function_name = tb[-1].name if tb else "Unknown"
    #
    await ErrorLog(
        time=datetime.now(),
        exception_type=type(e).__name__,
        message=str(e),
        function_name=function_name,
        traceback="".join(traceback.format_exception(None, e, e.__traceback__)),
    ).create()


async def handle_exception(response: Response, e: Exception):
    e = unwrap_error(e)
    if is_custom_error(e):
        response.status_code = status.HTTP_406_NOT_ACCEPTABLE
        return format_error_response(e.messages, e.code)

    if isinstance(e, HTTPException):
        response.status_code = e.status_code
        detail = e.detail if isinstance(e.detail, str) else str(e.detail)
        print('>>> HTTPException:', detail)
        return format_error_response({lang: detail for lang in LANGUAGES}, 'HTTPException')

    await log_unexpected_error_to_db(e)
    response.status_code = status.HTTP_500_INTERNAL_SERVER_ERROR
    error_msg = str(e)
    print('>>> Unexpected_error:', error_msg)
    return format_error_response({lang: error_msg for lang in LANGUAGES}, 'Exception')

