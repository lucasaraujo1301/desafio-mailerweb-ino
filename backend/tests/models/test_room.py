import pytest
from django.db import IntegrityError

from core.models import Room


@pytest.mark.django_db
def test_create_room_success():
    room = Room.objects.create(name="Test Room")

    assert room is not None
    assert room.pk is not None
    assert room.capacity == 5
    assert room.name == "Test Room"


@pytest.mark.django_db
def test_create_room_error_capacity_must_be_over_0():
    with pytest.raises(IntegrityError, match="capacity_must_be_positive"):
        Room.objects.create(name="Test Room", capacity=0)
