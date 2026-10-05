from .admin import router as admin_router
from .auth import router as auth_router
from .public import router as public_router
from .student import router as student_router

__all__ = ["admin_router", "auth_router", "public_router", "student_router"]

