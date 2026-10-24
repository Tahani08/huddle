from datetime import date

from sqlalchemy import Date, ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .db import Base


class Event(Base):
    __tablename__ = "events"

    id: Mapped[str] = mapped_column(String(16), primary_key=True)
    title: Mapped[str] = mapped_column(String(120))
    slots: Mapped[list["Slot"]] = relationship(
        back_populates="event", cascade="all, delete-orphan", order_by="Slot.day"
    )
    participants: Mapped[list["Participant"]] = relationship(
        back_populates="event", cascade="all, delete-orphan"
    )


class Slot(Base):
    """One candidate date for an event."""
    __tablename__ = "slots"

    id: Mapped[int] = mapped_column(primary_key=True)
    event_id: Mapped[str] = mapped_column(ForeignKey("events.id"), index=True)
    day: Mapped[date] = mapped_column(Date)
    event: Mapped[Event] = relationship(back_populates="slots")


class Participant(Base):
    __tablename__ = "participants"

    id: Mapped[int] = mapped_column(primary_key=True)
    event_id: Mapped[str] = mapped_column(ForeignKey("events.id"), index=True)
    name: Mapped[str] = mapped_column(String(60))
    event: Mapped[Event] = relationship(back_populates="participants")


class Availability(Base):
    """Participant is free on this slot."""
    __tablename__ = "availability"

    participant_id: Mapped[int] = mapped_column(
        ForeignKey("participants.id", ondelete="CASCADE"), primary_key=True
    )
    slot_id: Mapped[int] = mapped_column(
        ForeignKey("slots.id", ondelete="CASCADE"), primary_key=True
    )