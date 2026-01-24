from enum import Enum, EnumMeta


class Error(Exception):
    def __init__(self, code: str):
        self.code = code
        self.messages = {}
        super().__init__(code)

    def __str__(self):
        return f"[{self.code}] {self.messages.get('en', self.code)}"


class ErrorEnumMeta(EnumMeta):
    def __call__(cls, *args, **kwargs):
        # allow calling the enum like User_Error("USERNAME_ERROR")
        return super().__call__(*args, **kwargs)


class ErrorEnum(Error, Enum, metaclass=ErrorEnumMeta):
    def __init__(self, code):
        Error.__init__(self, code)  # Initialize the base Error class
