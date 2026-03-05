import pytest
from django.contrib.auth import get_user_model

from core.models import Reservation, User


@pytest.fixture
def user_factory():
    def factory(email, password, name) -> User:
        data = {"email": email, "password": password, "name": name}
        return get_user_model().objects.create_user(**data)

    return factory


@pytest.fixture
def reservation_factory():
    def factory(title, room, start_datetime, end_datetime, users: list[User]) -> Reservation:
        data = {
            "title": title,
            "room": room,
            "start_datetime": start_datetime,
            "end_datetime": end_datetime,
        }

        reservation = Reservation.objects.create(**data)

        if users:
            reservation.users.set(users)

        return reservation

    return factory
