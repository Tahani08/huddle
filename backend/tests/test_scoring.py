from datetime import date

from app.scoring import rank_slots


def test_most_free_people_wins():
    slots = {1: date(2027, 3, 1), 2: date(2027, 3, 2)}
    free = {1: {"Ana"}, 2: {"Ana", "Ben"}}
    result = rank_slots(slots, free, {"Ana", "Ben"})
    assert result[0]["slot_id"] == 2
    assert result[0]["free_count"] == 2


def test_tie_goes_to_earlier_date():
    slots = {1: date(2027, 3, 5), 2: date(2027, 3, 1)}
    free = {1: {"Ana"}, 2: {"Ana"}}
    result = rank_slots(slots, free, {"Ana"})
    assert result[0]["slot_id"] == 2


def test_busy_names_listed():
    slots = {1: date(2027, 3, 1)}
    result = rank_slots(slots, {1: {"Ana"}}, {"Ana", "Ben"})
    assert result[0]["busy_names"] == ["Ben"]


def test_slot_with_no_responses_has_zero():
    slots = {1: date(2027, 3, 1)}
    result = rank_slots(slots, {}, {"Ana"})
    assert result[0]["free_count"] == 0