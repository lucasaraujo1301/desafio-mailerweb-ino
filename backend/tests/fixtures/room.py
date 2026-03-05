import pytest

from core.models import Room


@pytest.fixture
def room():
    return Room.objects.create(name="Test Room")
