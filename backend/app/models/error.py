from datetime import datetime
from beanie import Document, Indexed


class Error(Document):
    time: datetime
    exception_type: str
    message: str
    function_name: str
    traceback: str
