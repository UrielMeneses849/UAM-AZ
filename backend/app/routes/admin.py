from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session, joinedload

from app.auth import hash_password, require_admin
from app.database import get_db
from app.models import AcademicRecord, Notice, Student, Subject, Term, User
from app.schemas import (
    NoticeCreate,
    NoticeOut,
    NoticeUpdate,
    RecordCreate,
    RecordOut,
    RecordUpdate,
    StudentCreate,
    StudentOut,
    StudentUpdate,
    SubjectCreate,
    SubjectOut,
    TermCreate,
    TermOut,
)
from app.services import serialize_record


router = APIRouter(prefix="/api/admin", tags=["admin"], dependencies=[Depends(require_admin)])


def conflict(message: str):
    raise HTTPException(status_code=409, detail=message)


def get_student_or_404(db: Session, student_id: int) -> Student:
    student = db.get(Student, student_id)
    if student is None:
        raise HTTPException(status_code=404, detail="Alumno no encontrado")
    return student


def get_record_or_404(db: Session, record_id: int) -> AcademicRecord:
    record = (
        db.query(AcademicRecord)
        .options(joinedload(AcademicRecord.subject), joinedload(AcademicRecord.term))
        .filter(AcademicRecord.id == record_id)
        .first()
    )
    if record is None:
        raise HTTPException(status_code=404, detail="Registro no encontrado")
    return record


def validate_relations(db: Session, subject_id: int, term_id: int) -> tuple[Subject, Term]:
    subject = db.get(Subject, subject_id)
    term = db.get(Term, term_id)
    if subject is None or not subject.activo:
        raise HTTPException(status_code=400, detail="Materia inválida o inactiva")
    if term is None or not term.activo:
        raise HTTPException(status_code=400, detail="Trimestre inválido o inactivo")
    return subject, term


@router.get("/students", response_model=list[StudentOut])
def list_students(db: Session = Depends(get_db)):
    return db.query(Student).order_by(Student.first_last_name, Student.name).all()


@router.post("/students", response_model=StudentOut, status_code=201)
def create_student(payload: StudentCreate, db: Session = Depends(get_db)):
    data = payload.model_dump(exclude={"username", "password"})
    student = Student(**data)
    db.add(student)
    try:
        db.flush()
        db.add(
            User(
                username=payload.username.strip(),
                password_hash=hash_password(payload.password),
                role="STUDENT",
                student_id=student.id,
                active=True,
            )
        )
        db.commit()
        db.refresh(student)
        return student
    except IntegrityError:
        db.rollback()
        conflict("La cuenta, el correo o el usuario ya existen")


@router.get("/students/{student_id}", response_model=StudentOut)
def get_student(student_id: int, db: Session = Depends(get_db)):
    return get_student_or_404(db, student_id)


@router.put("/students/{student_id}", response_model=StudentOut)
def update_student(student_id: int, payload: StudentUpdate, db: Session = Depends(get_db)):
    student = get_student_or_404(db, student_id)
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(student, field, value)
    try:
        db.commit()
        db.refresh(student)
        return student
    except IntegrityError:
        db.rollback()
        conflict("La cuenta o el correo ya existen")


@router.get("/students/{student_id}/records", response_model=list[RecordOut])
def get_student_records(student_id: int, db: Session = Depends(get_db)):
    get_student_or_404(db, student_id)
    records = (
        db.query(AcademicRecord)
        .options(joinedload(AcademicRecord.subject), joinedload(AcademicRecord.term))
        .filter(AcademicRecord.student_id == student_id)
        .join(AcademicRecord.term)
        .order_by(Term.fecha_inicio, AcademicRecord.id)
        .all()
    )
    return [serialize_record(record) for record in records]


@router.post("/students/{student_id}/records", response_model=RecordOut, status_code=201)
def create_record(student_id: int, payload: RecordCreate, db: Session = Depends(get_db)):
    get_student_or_404(db, student_id)
    validate_relations(db, payload.subject_id, payload.term_id)
    record = AcademicRecord(student_id=student_id, **payload.model_dump())
    db.add(record)
    db.commit()
    return serialize_record(get_record_or_404(db, record.id))


@router.put("/records/{record_id}", response_model=RecordOut)
def update_record(record_id: int, payload: RecordUpdate, db: Session = Depends(get_db)):
    record = get_record_or_404(db, record_id)
    data = payload.model_dump(exclude_unset=True)
    validate_relations(db, data.get("subject_id", record.subject_id), data.get("term_id", record.term_id))
    for field, value in data.items():
        setattr(record, field, value)
    db.commit()
    return serialize_record(get_record_or_404(db, record_id))


@router.delete("/records/{record_id}", status_code=204)
def delete_record(record_id: int, db: Session = Depends(get_db)):
    record = get_record_or_404(db, record_id)
    db.delete(record)
    db.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@router.get("/subjects", response_model=list[SubjectOut])
def list_subjects(db: Session = Depends(get_db)):
    return db.query(Subject).order_by(Subject.clave).all()


@router.post("/subjects", response_model=SubjectOut, status_code=201)
def create_subject(payload: SubjectCreate, db: Session = Depends(get_db)):
    subject = Subject(**payload.model_dump())
    db.add(subject)
    try:
        db.commit()
        db.refresh(subject)
        return subject
    except IntegrityError:
        db.rollback()
        conflict("La clave de materia ya existe")


@router.get("/terms", response_model=list[TermOut])
def list_terms(db: Session = Depends(get_db)):
    return db.query(Term).order_by(Term.fecha_inicio).all()


@router.post("/terms", response_model=TermOut, status_code=201)
def create_term(payload: TermCreate, db: Session = Depends(get_db)):
    if payload.fecha_fin < payload.fecha_inicio:
        raise HTTPException(status_code=422, detail="La fecha final debe ser posterior a la inicial")
    term = Term(**payload.model_dump())
    db.add(term)
    try:
        db.commit()
        db.refresh(term)
        return term
    except IntegrityError:
        db.rollback()
        conflict("El código de trimestre ya existe")


@router.get("/notices", response_model=list[NoticeOut])
def list_notices(db: Session = Depends(get_db)):
    return db.query(Notice).order_by(Notice.published_at.desc()).all()


@router.post("/notices", response_model=NoticeOut, status_code=201)
def create_notice(payload: NoticeCreate, db: Session = Depends(get_db)):
    notice = Notice(**payload.model_dump())
    db.add(notice)
    db.commit()
    db.refresh(notice)
    return notice


@router.put("/notices/{notice_id}", response_model=NoticeOut)
def update_notice(notice_id: int, payload: NoticeUpdate, db: Session = Depends(get_db)):
    notice = db.get(Notice, notice_id)
    if notice is None:
        raise HTTPException(status_code=404, detail="Aviso no encontrado")
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(notice, field, value)
    db.commit()
    db.refresh(notice)
    return notice

