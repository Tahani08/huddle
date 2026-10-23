from datetime import date


def rank_slots(
    slots: dict[int, date],
    free: dict[int, set[str]],
    everyone: set[str],
) -> list[dict]:
    """
    slots:    slot_id -> date
    free:     slot_id -> names of people free that day
    everyone: names of all people who responded

    Best date = most people free. Ties go to the earlier date.
    """
    ranked = []
    for slot_id, day in slots.items():
        free_names = free.get(slot_id, set())
        ranked.append(
            {
                "slot_id": slot_id,
                "day": day,
                "free_count": len(free_names),
                "free_names": sorted(free_names),
                "busy_names": sorted(everyone - free_names),
            }
        )
    ranked.sort(key=lambda r: (-r["free_count"], r["day"]))
    return ranked