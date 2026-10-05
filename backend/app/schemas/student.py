from __future__ import annotations

from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field


class StudentBase(BaseModel):
    account_number: str = Field(min_length=4, max_length=32)
    name: str = Field(min_length=1, max_length=120)
    first_last_name: str = Field(min_length=1, max_length=120)
    second_last_name: str = Field(default="", max_length=120)
    email: str = Field(min_length=5, max_length=200)
    campus: str = Field(min_length=1, max_length=160)
    career: str = Field(min_length=1, max_length=200)
    status: str = Field(default="ACTIVO", max_length=40)


class StudentCreate(StudentBase):
    username: str = Field(min_length=3, max_length=80)
    password: str = Field(min_length=8, max_length=200)


class StudentUpdate(BaseModel):
    account_number: Optional[str] = Field(default=None, min_length=4, max_length=32)
    name: Optional[str] = Field(default=None, min_length=1, max_length=120)
    first_last_name: Optional[str] = Field(default=None, min_length=1, max_length=120)
    second_last_name: Optional[str] = Field(default=None, max_length=120)
    email: Optional[str] = Field(default=None, min_length=5, max_length=200)
    campus: Optional[str] = Field(default=None, min_length=1, max_length=160)
    career: Optional[str] = Field(default=None, min_length=1, max_length=200)
    status: Optional[str] = Field(default=None, max_length=40)


class StudentOut(StudentBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    created_at: datetime
    updated_at: datetime
