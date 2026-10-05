from datetime import date

from sqlalchemy.orm import Session

from app.auth.security import hash_password
from app.models import AcademicRecord, Notice, Student, Subject, Term, User


TERMS = [
    ("24P", "Primavera 2024", date(2024, 4, 1), date(2024, 7, 19)),
    ("24O", "Otoño 2024", date(2024, 9, 2), date(2024, 12, 13)),
    ("25I", "Invierno 2025", date(2025, 1, 6), date(2025, 3, 28)),
    ("25P", "Primavera 2025", date(2025, 4, 7), date(2025, 7, 18)),
    ("25O", "Otoño 2025", date(2025, 9, 1), date(2025, 12, 12)),
    ("26I", "Invierno 2026", date(2026, 1, 5), date(2026, 3, 27)),
    ("26O", "Otoño 2026", date(2026, 9, 7), date(2026, 12, 18)),
]

SUBJECTS = [
    ("1100037", "INTRODUCCION A LA INGENIERIA", 6),
    ("1111078", "INTRODUCCION A LA FISICA", 4),
    ("1112013", "COMPLEMENTOS DE MATEMATICAS", 9),
    ("1112042", "INTRODUCCION AL CALCULO", 11),
    ("1113084", "ESTRUCTURA ATOMICA Y ENLACE QUIMICO", 9),
    ("1113085", "LABORATORIO DE REACCIONES QUIMICAS", 3),
]


def seed_database(db: Session) -> None:
    for codigo, nombre, fecha_inicio, fecha_fin in TERMS:
        term = db.query(Term).filter(Term.codigo == codigo).first()
        if term is None:
            term = Term(codigo=codigo, nombre=nombre, fecha_inicio=fecha_inicio, fecha_fin=fecha_fin, activo=True)
            db.add(term)
        else:
            term.nombre = nombre
            term.fecha_inicio = fecha_inicio
            term.fecha_fin = fecha_fin
            term.activo = True
    subjects_by_key: dict[str, Subject] = {}
    for clave, nombre, creditos in SUBJECTS:
        subject = db.query(Subject).filter(Subject.clave == clave).first()
        if subject is None:
            subject = Subject(clave=clave, nombre=nombre, creditos=creditos, activo=True)
            db.add(subject)
        else:
            subject.nombre = nombre
            subject.creditos = creditos
            subject.activo = True
        subjects_by_key[clave] = subject

    active_subject_keys = [clave for clave, _nombre, _creditos in SUBJECTS]
    for subject in db.query(Subject).filter(Subject.clave.notin_(active_subject_keys)).all():
        subject.activo = False
    db.flush()

    student = db.query(Student).filter(Student.account_number == "2213021117").first()
    if student is None:
        student = Student(
            account_number="2213021117",
            name="ALEX",
            first_last_name="MARTÍNEZ",
            second_last_name="RIVERA",
            email="alumno01@simulacion.local",
            campus="Azcapotzalco",
            career="Licenciatura Demo",
            status="ACTIVO",
        )
        db.add(student)
        db.flush()

    if db.query(User).filter(User.username == "admin").first() is None:
        db.add(User(username="admin", password_hash=hash_password("admin123"), role="ADMIN", active=True))
    if db.query(User).filter(User.username == "alumno01").first() is None:
        db.add(
            User(
                username="alumno01",
                password_hash=hash_password("alumno123"),
                role="STUDENT",
                student_id=student.id,
                active=True,
            )
        )

    terms = {term.codigo: term for term in db.query(Term).all()}
    existing_records = (
        db.query(AcademicRecord)
        .filter(AcademicRecord.student_id == student.id)
        .order_by(AcademicRecord.id)
        .all()
    )
    term_codes = ["26O"] * len(SUBJECTS)
    grades = ["B", "MB", "S", "B", "MB", "S"]
    for index, ((subject_key, _name, credits), term_code, grade) in enumerate(
        zip(SUBJECTS, term_codes, grades), start=1
    ):
        subject = subjects_by_key[subject_key]
        if index <= len(existing_records):
            record = existing_records[index - 1]
            record.subject_id = subject.id
            record.term_id = terms[term_code].id
            record.evaluation_type = "GLO."
            record.grade = grade
            record.acta_number = f"3101{11770 + index}"
            record.credits = credits
            record.status = "REGISTRADO"
        else:
            db.add(
                AcademicRecord(
                    student_id=student.id,
                    subject_id=subject.id,
                    term_id=terms[term_code].id,
                    evaluation_type="GLO.",
                    grade=grade,
                    acta_number=f"3101{11770 + index}",
                    credits=credits,
                    status="REGISTRADO",
                )
            )
    for record in existing_records[len(SUBJECTS) :]:
        if record.acta_number.startswith("3101"):
            db.delete(record)

    if db.query(Notice).count() == 0:
        db.add_all(
            [
                Notice(
                    title="Bienvenida al portal de simulación",
                    content="Consulta tu información académica y los registros capturados por administración.",
                    active=True,
                ),
                Notice(
                    title="Periodo lectivo 26O",
                    content="La información mostrada pertenece únicamente a esta simulación privada.",
                    active=True,
                ),
            ]
        )

    db.commit()
