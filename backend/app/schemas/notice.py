from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field


class NoticeCreate(BaseModel):
    title: str = Field(min_length=2, max_length=220)
    content: str = Field(min_length=2, max_length=5000)
    active: bool = True


class NoticeUpdate(BaseModel):
    title: Optional[str] = Field(default=None, min_length=2, max_length=220)
    content: Optional[str] = Field(default=None, min_length=2, max_length=5000)
    active: Optional[bool] = None


class NoticeOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    title: str
    content: str
    published_at: datetime
    active: bool
