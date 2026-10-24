from datetime import date

from pydantic import BaseModel, Field


class EventCreate(BaseModel):
    title: str = Field(min_length=1, max_length=120)
    dates: list[date] = Field(min_length=1, max_length=60)


class ResponseCreate(BaseModel):
    name: str = Field(min_length=1, max_length=60)
    free_slot_ids: list[int]


class SlotOut(BaseModel):
    id: int
    day: date


class EventOut(BaseModel):
    id: str
    title: str
    slots: list[SlotOut]


class RankedSlot(BaseModel):
    slot_id: int
    day: date
    free_count: int
    free_names: list[str]
    busy_names: list[str]