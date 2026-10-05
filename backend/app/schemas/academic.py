from __future__ import annotations

from datetime import date, datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field, field_validator


ALLOWED_GRADES = {"MB", "B", "S", "NA", "ACREDITADA", "NO ACREDITADA"}


class SubjectCreate(BaseModel):
    clave: str = Field(min_length=2, max_length=40)
    nombre: str = Field(min_length=2, max_length=240)
    creditos: int = Field(ge=0, le=200)
    activo: bool = True


class SubjectOut(SubjectCreate):
    model_config = ConfigDict(from_attributes=True)
    id: int


class TermCreate(BaseModel):
    codigo: str = Field(min_length=2, max_length=20)
    nombre: str = Field(min_length=2, max_length=120)
    fecha_inicio: date
    fecha_fin: date
    activo: bool = True


class TermOut(TermCreate):
    model_config = ConfigDict(from_attributes=True)
    id: int


class RecordBase(BaseModel):
    subject_id: int
    term_id: int
    evaluation_type: str = Field(default="GLO.", min_length=1, max_length=30)
    grade: str
    acta_number: str = Field(min_length=1, max_length=60)
    credits: int = Field(ge=0, le=200)
    status: str = Field(default="REGISTRADO", max_length=40)

    @field_validator("grade")
    @classmethod
    def validate_grade(cls, value: str) -> str:
        normalized = value.strip().upper()
        if normalized not in ALLOWED_GRADES:
            raise ValueError("Calificación no permitida")
        return normalized

    @field_validator("evaluation_type", "acta_number", "status")
    @classmethod
    def strip_text(cls, value: str) -> str:
        return value.strip()


class RecordCreate(RecordBase):
    pass


class RecordUpdate(BaseModel):
    subject_id: Optional[int] = None
    term_id: Optional[int] = None
    evaluation_type: Optional[str] = Field(default=None, min_length=1, max_length=30)
    grade: Optional[str] = None
    acta_number: Optional[str] = Field(default=None, min_length=1, max_length=60)
    credits: Optional[int] = Field(default=None, ge=0, le=200)
    status: Optional[str] = Field(default=None, max_length=40)

    @field_validator("grade")
    @classmethod
    def validate_grade(cls, value: Optional[str]) -> Optional[str]:
        if value is None:
            return None
        normalized = value.strip().upper()
        if normalized not in ALLOWED_GRADES:
            raise ValueError("Calificación no permitida")
        return normalized


class RecordOut(BaseModel):
    id: int
    student_id: int
    subject_id: int
    term_id: int
    subject_clave: str
    subject_name: str
    term_code: str
    evaluation_type: str
    grade: str
    acta_number: str
    credits: int
    status: str
    created_at: datetime
    updated_at: datetime
