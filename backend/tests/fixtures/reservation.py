from datetime import timedelta

import pytest
from django.utils import timezone

from core.models import Reservation


@pytest.fixture
def reservation(room) -> Reservation:
    start_datetime = timezone.now()
    end_datetime = start_datetime + timedelta(minutes=15)

    return Reservation.objects.create(
        room=room,
        start_datetime=start_datetime,
        end_datetime=end_datetime,
        title="Test Reservation",
    )


@pytest.fixture
def reservation_with_user(reservation, user) -> Reservation:
    reservation.users.set([user])

    return reservation
