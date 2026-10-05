from .academic import RecordCreate, RecordOut, RecordUpdate, SubjectCreate, SubjectOut, TermCreate, TermOut
from .auth import LoginRequest, PasswordChange, TokenResponse, UserOut
from .notice import NoticeCreate, NoticeOut, NoticeUpdate
from .student import StudentCreate, StudentOut, StudentUpdate

__all__ = [
    "LoginRequest", "NoticeCreate", "NoticeOut", "NoticeUpdate", "PasswordChange",
    "RecordCreate", "RecordOut", "RecordUpdate", "StudentCreate", "StudentOut",
    "StudentUpdate", "SubjectCreate", "SubjectOut", "TermCreate", "TermOut",
    "TokenResponse", "UserOut",
]

