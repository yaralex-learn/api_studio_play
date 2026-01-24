from enum import Enum

from app.messages.base import ErrorEnum



class Channel_Message(Enum):
    CHANNEL_CREATED = 'CHANNEL_CREATED'


class Channel_Error(ErrorEnum):
    CHANNEL_NOT_FOUND = 'CHANNEL_NOT_FOUND'