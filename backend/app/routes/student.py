from __future__ import annotations

from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session, joinedload

from app.auth import require_student
from app.database import get_db
from app.models import AcademicRecord, Student, Term, User
from app.schemas import RecordOut, StudentOut
from app.services import serialize_record


router = APIRouter(prefix="/api/student", tags=["student"])


def current_student(user: User, db: Session) -> Student:
    student = db.get(Student, user.student_id)
    if student is None:
        raise HTTPException(status_code=404, detail="Alumno no encontrado")
    return student


@router.get("/me", response_model=StudentOut)
def student_me(user: User = Depends(require_student), db: Session = Depends(get_db)):
    return current_student(user, db)


@router.get("/me/records", response_model=list[RecordOut])
def student_records(
    term: Optional[str] = Query(default=None, max_length=20),
    user: User = Depends(require_student),
    db: Session = Depends(get_db),
):
    student = current_student(user, db)
    query = (
        db.query(AcademicRecord)
        .options(joinedload(AcademicRecord.subject), joinedload(AcademicRecord.term))
        .filter(AcademicRecord.student_id == student.id)
        .join(AcademicRecord.term)
    )
    if term:
        query = query.filter(Term.codigo == term)
    records = query.order_by(Term.fecha_inicio, AcademicRecord.id).all()
    return [serialize_record(record) for record in records]
