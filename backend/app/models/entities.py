from __future__ import annotations

from datetime import date, datetime, timezone
from typing import Optional

from sqlalchemy import Boolean, Date, DateTime, ForeignKey, Integer, Numeric, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


def utcnow() -> datetime:
    return datetime.now(timezone.utc)


class TimestampMixin:
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow, onupdate=utcnow)


class Student(Base, TimestampMixin):
    __tablename__ = "students"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    account_number: Mapped[str] = mapped_column(String(32), unique=True, index=True)
    name: Mapped[str] = mapped_column(String(120))
    first_last_name: Mapped[str] = mapped_column(String(120))
    second_last_name: Mapped[str] = mapped_column(String(120), default="")
    email: Mapped[str] = mapped_column(String(200), unique=True)
    campus: Mapped[str] = mapped_column(String(160))
    career: Mapped[str] = mapped_column(String(200))
    status: Mapped[str] = mapped_column(String(40), default="ACTIVO")

    user: Mapped[Optional["User"]] = relationship(back_populates="student", uselist=False)
    records: Mapped[list["AcademicRecord"]] = relationship(
        back_populates="student", cascade="all, delete-orphan"
    )


class User(Base, TimestampMixin):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    username: Mapped[str] = mapped_column(String(80), unique=True, index=True)
    password_hash: Mapped[str] = mapped_column(String(300))
    role: Mapped[str] = mapped_column(String(20), index=True)
    student_id: Mapped[Optional[int]] = mapped_column(ForeignKey("students.id"), nullable=True, unique=True)
    active: Mapped[bool] = mapped_column(Boolean, default=True)

    student: Mapped[Optional[Student]] = relationship(back_populates="user")


class Subject(Base):
    __tablename__ = "subjects"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    clave: Mapped[str] = mapped_column(String(40), unique=True, index=True)
    nombre: Mapped[str] = mapped_column(String(240))
    creditos: Mapped[int] = mapped_column(Integer)
    activo: Mapped[bool] = mapped_column(Boolean, default=True)

    records: Mapped[list["AcademicRecord"]] = relationship(back_populates="subject")


class Term(Base):
    __tablename__ = "terms"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    codigo: Mapped[str] = mapped_column(String(20), unique=True, index=True)
    nombre: Mapped[str] = mapped_column(String(120))
    fecha_inicio: Mapped[date] = mapped_column(Date)
    fecha_fin: Mapped[date] = mapped_column(Date)
    activo: Mapped[bool] = mapped_column(Boolean, default=True)

    records: Mapped[list["AcademicRecord"]] = relationship(back_populates="term")


class AcademicRecord(Base, TimestampMixin):
    __tablename__ = "academic_records"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    student_id: Mapped[int] = mapped_column(ForeignKey("students.id"), index=True)
    subject_id: Mapped[int] = mapped_column(ForeignKey("subjects.id"), index=True)
    term_id: Mapped[int] = mapped_column(ForeignKey("terms.id"), index=True)
    evaluation_type: Mapped[str] = mapped_column(String(30), default="GLO.")
    grade: Mapped[str] = mapped_column(String(30))
    acta_number: Mapped[str] = mapped_column(String(60))
    credits: Mapped[int] = mapped_column(Integer)
    status: Mapped[str] = mapped_column(String(40), default="REGISTRADO")

    student: Mapped[Student] = relationship(back_populates="records")
    subject: Mapped[Subject] = relationship(back_populates="records")
    term: Mapped[Term] = relationship(back_populates="records")


class Notice(Base):
    __tablename__ = "notices"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    title: Mapped[str] = mapped_column(String(220))
    content: Mapped[str] = mapped_column(Text)
    published_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)
    active: Mapped[bool] = mapped_column(Boolean, default=True)
