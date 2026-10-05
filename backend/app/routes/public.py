from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.auth import get_current_user
from app.database import get_db
from app.models import Notice, Term, User
from app.schemas import NoticeOut, TermOut


router = APIRouter(prefix="/api", tags=["notices"])


@router.get("/notices", response_model=list[NoticeOut])
def notices(
    _user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return (
        db.query(Notice)
        .filter(Notice.active.is_(True))
        .order_by(Notice.published_at.desc())
        .all()
    )


@router.get("/terms", response_model=list[TermOut])
def terms(
    _user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return db.query(Term).filter(Term.activo.is_(True)).order_by(Term.fecha_inicio).all()
