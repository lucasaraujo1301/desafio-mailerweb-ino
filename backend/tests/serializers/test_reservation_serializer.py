from datetime import timedelta

import pytest
from django.utils import timezone
from rest_framework.test import APIRequestFactory

from reservation.serializers import ReservationSerializer


@pytest.mark.django_db
class TestReservationSerializer:
    serializer_class = ReservationSerializer

    def test_reservation_serializer_validation_success(self, room):
        start_datetime = timezone.now()
        end_datetime = start_datetime + timedelta(minutes=15)
        payload = {
            "room": room.pk,
            "title": "test title",
            "start_datetime": start_datetime,
            "end_datetime": end_datetime,
        }

        serializer = self.serializer_class(data=payload)
        assert serializer.is_valid()

    def test_reservation_serializer_create_success(self, room):
        start_datetime = timezone.now()
        end_datetime = start_datetime + timedelta(minutes=15)
        payload = {
            "room": room.pk,
            "title": "test title",
            "start_datetime": start_datetime,
            "end_datetime": end_datetime,
        }

        serializer = self.serializer_class(data=payload)
        serializer.is_valid(raise_exception=True)
        reservation = serializer.create(serializer.validated_data)

        assert reservation is not None
        assert reservation.pk is not None
        assert reservation.start_datetime == start_datetime
        assert reservation.end_datetime == end_datetime
        assert reservation.room == room

    def test_reservation_serializer_create_with_user(self, room, user):
        factory = APIRequestFactory()
        request = factory.post("/reservations/")
        request.user = user

        start_datetime = timezone.now()
        end_datetime = start_datetime + timedelta(minutes=15)

        payload = {
            "room": room.pk,
            "title": "test title",
            "start_datetime": start_datetime,
            "end_datetime": end_datetime,
        }

        serializer = self.serializer_class(data=payload, context={"request": request})
        serializer.is_valid(raise_exception=True)
        reservation = serializer.create(serializer.validated_data)

        assert reservation is not None
        assert user in reservation.users.all()

    def test_reservation_serializer_validation_error_start_datetime(self, room):
        start_datetime = timezone.now()
        end_datetime = start_datetime - timedelta(minutes=15)

        payload = {
            "room": room.pk,
            "title": "test title",
            "start_datetime": start_datetime,
            "end_datetime": end_datetime,
        }

        serializer = self.serializer_class(data=payload)
        assert not serializer.is_valid()
        assert serializer.errors is not None
        assert "end_datetime" in serializer.errors
        assert serializer.errors["end_datetime"][0] == "End datetime must be after start datetime."

    def test_reservation_serializer_validation_error_below_15_minutes(self, room):
        start_datetime = timezone.now()
        end_datetime = start_datetime + timedelta(minutes=13)

        payload = {
            "room": room.pk,
            "title": "test title",
            "start_datetime": start_datetime,
            "end_datetime": end_datetime,
        }

        serializer = self.serializer_class(data=payload)
        assert not serializer.is_valid()
        assert serializer.errors is not None
        assert "end_datetime" in serializer.errors
        assert serializer.errors["end_datetime"][0] == "Reservation must be at least 15 minutes."

    def test_reservation_serializer_validation_error_above_8_hours(self, room):
        start_datetime = timezone.now()
        end_datetime = start_datetime + timedelta(hours=8, minutes=1)

        payload = {
            "room": room.pk,
            "title": "test title",
            "start_datetime": start_datetime,
            "end_datetime": end_datetime,
        }

        serializer = self.serializer_class(data=payload)
        assert not serializer.is_valid()
        assert serializer.errors is not None
        assert "end_datetime" in serializer.errors
        assert serializer.errors["end_datetime"][0] == "Reservation cannot exceed 8 hours."

    def test_user_exceed_room_capacity(self, auth_client, admin_user, user, room):
        room.capacity = 1
        room.save()

        payload = {
            "room": room.pk,
            "start_datetime": "2026-03-05T10:00:00Z",
            "end_datetime": "2026-03-05T11:00:00Z",
            "title": "API Reservation",
            "users": [admin_user.pk, user.pk],
        }

        serializer = self.serializer_class(data=payload)

        assert not serializer.is_valid()
        assert serializer.errors is not None
        assert "users" in serializer.errors
        assert serializer.errors["users"][0] == "Room capacity is 1, but 2 users were provided."
