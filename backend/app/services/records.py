from app.models import AcademicRecord


def serialize_record(record: AcademicRecord) -> dict:
    return {
        "id": record.id,
        "student_id": record.student_id,
        "subject_id": record.subject_id,
        "term_id": record.term_id,
        "subject_clave": record.subject.clave,
        "subject_name": record.subject.nombre,
        "term_code": record.term.codigo,
        "evaluation_type": record.evaluation_type,
        "grade": record.grade,
        "acta_number": record.acta_number,
        "credits": record.credits,
        "status": record.status,
        "created_at": record.created_at,
        "updated_at": record.updated_at,
    }

