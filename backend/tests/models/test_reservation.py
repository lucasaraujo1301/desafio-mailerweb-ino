from datetime import timedelta
from unittest.mock import patch

import pytest
from django.core.exceptions import ValidationError
from django.utils import timezone

from core.choices import Status
from core.models import Reservation


@pytest.mark.django_db
class TestReservation:
    def test_create_reservation(self, room):
        start_datetime = timezone.now()
        end_datetime = start_datetime + timedelta(minutes=15)
        reservation = Reservation.objects.create(
            title="Meeting 1:1", start_datetime=start_datetime, end_datetime=end_datetime, room=room
        )

        assert reservation is not None
        assert reservation.pk is not None

    def test_create_reservation_invalid_room(self):
        start_datetime = timezone.now()
        end_datetime = start_datetime + timedelta(minutes=15)

        with pytest.raises(ValidationError, match="This field cannot be null."):
            Reservation.objects.create(
                title="Meeting 1:1",
                start_datetime=start_datetime,
                end_datetime=end_datetime,
            )

    def test_create_reservation_over_room_capacity(self, room, user, admin_user):
        start_datetime = timezone.now()
        end_datetime = start_datetime + timedelta(minutes=15)

        room.capacity = 1
        room.save()

        reservation = Reservation.objects.create(
            title="Meeting 1:1", start_datetime=start_datetime, end_datetime=end_datetime, room=room
        )

        with pytest.raises(ValidationError, match="Room capacity is 1."):
            reservation.users.set([user, admin_user])

    def test_create_reservation_invalid_start_datetime(self, room):
        end_datetime = timezone.now()
        start_datetime = end_datetime + timedelta(minutes=15)

        with pytest.raises(ValidationError, match="End datetime must be after start datetime."):
            Reservation.objects.create(
                title="Meeting 1:1", start_datetime=start_datetime, end_datetime=end_datetime, room=room
            )

    def test_create_reservation_invalid_less_than_15min(self, room):
        start_datetime = timezone.now()
        end_datetime = start_datetime + timedelta(minutes=13)

        with pytest.raises(ValidationError, match="Reservation must be at least 15 minutes."):
            Reservation.objects.create(
                title="Meeting 1:1", start_datetime=start_datetime, end_datetime=end_datetime, room=room
            )

    def test_create_reservation_invalid_above_than_8_hours(self, room):
        start_datetime = timezone.now()
        end_datetime = start_datetime + timedelta(hours=9)

        with pytest.raises(ValidationError, match="Reservation cannot exceed 8 hours."):
            Reservation.objects.create(
                title="Meeting 1:1", start_datetime=start_datetime, end_datetime=end_datetime, room=room
            )

    def test_create_reservation_invalid_overlap(self, frozen_time, room, reservation):
        start_datetime = timezone.now()
        end_datetime = start_datetime + timedelta(minutes=15)

        with pytest.raises(ValidationError, match="Already have an reservation for that room between these time."):
            Reservation.objects.create(
                title="Meeting 1:1", start_datetime=start_datetime, end_datetime=end_datetime, room=room
            )

    def test_delete_reservation(self, reservation):
        assert reservation.is_active
        assert reservation.status == Status.ACTIVE

        reservation.delete()
        assert not reservation.is_active
        assert reservation.status == Status.CANCELED

    @patch("core.tasks.send_reservation_email_task.delay")
    def test_delete_reservation_call_email_sender(self, mock_email_send, reservation, user):
        reservation.users.set([user])

        assert mock_email_send.call_count == 1
