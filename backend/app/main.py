import secrets

from fastapi import Depends, FastAPI, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from . import models, schemas
from .db import Base, engine, get_db
from .scoring import rank_slots

app = FastAPI(title="Huddle API")
Base.metadata.create_all(engine)  # we'll switch to Alembic migrations later


def get_event_or_404(db: Session, event_id: str) -> models.Event:
    event = db.get(models.Event, event_id)
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    return event


@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/events", response_model=schemas.EventOut, status_code=201)
def create_event(body: schemas.EventCreate, db: Session = Depends(get_db)):
    event = models.Event(id=secrets.token_urlsafe(6), title=body.title.strip())
    for day in sorted(set(body.dates)):
        event.slots.append(models.Slot(day=day))
    db.add(event)
    db.commit()
    return event


@app.get("/events/{event_id}", response_model=schemas.EventOut)
def get_event(event_id: str, db: Session = Depends(get_db)):
    return get_event_or_404(db, event_id)


@app.post("/events/{event_id}/responses", status_code=201)
def submit_response(
    event_id: str, body: schemas.ResponseCreate, db: Session = Depends(get_db)
):
    event = get_event_or_404(db, event_id)
    valid_ids = {s.id for s in event.slots}
    if not set(body.free_slot_ids) <= valid_ids:
        raise HTTPException(status_code=422, detail="Unknown slot id")

    name = body.name.strip()
    person = next((p for p in event.participants if p.name == name), None)
    if person is None:
        person = models.Participant(event_id=event.id, name=name)
        db.add(person)
        db.flush()
    else:  # same name responding again = update their answers
        db.query(models.Availability).filter_by(participant_id=person.id).delete()

    for slot_id in set(body.free_slot_ids):
        db.add(models.Availability(participant_id=person.id, slot_id=slot_id))
    db.commit()
    return {"ok": True}


@app.get("/events/{event_id}/results", response_model=list[schemas.RankedSlot])
def get_results(event_id: str, db: Session = Depends(get_db)):
    event = get_event_or_404(db, event_id)
    names = {p.id: p.name for p in event.participants}
    slots = {s.id: s.day for s in event.slots}

    rows = db.execute(
        select(models.Availability).where(models.Availability.slot_id.in_(slots))
    ).scalars()
    free: dict[int, set[str]] = {}
    for row in rows:
        free.setdefault(row.slot_id, set()).add(names[row.participant_id])

    return rank_slots(slots, free, set(names.values()))