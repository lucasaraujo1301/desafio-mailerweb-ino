from datetime import timedelta

from django.db import transaction
from rest_framework import serializers

from core.choices import OutboxEventType
from core.models import OutboxEvent, Reservation, Room, User
from core.serializers import BaseModelSerializer
from room.serializers import RoomSerializer
from user.serializers import UserSerializer


class ReservationSerializer(BaseModelSerializer):
    users = serializers.PrimaryKeyRelatedField(
        many=True,
        queryset=User.objects.filter(is_active=True),
        write_only=True,
        required=False,
    )
    users_detail = UserSerializer(read_only=True, many=True)
    room = serializers.PrimaryKeyRelatedField(
        queryset=Room.objects.filter(is_active=True),
        write_only=True,
    )
    room_detail = RoomSerializer(read_only=True)

    class Meta(BaseModelSerializer.Meta):
        model = Reservation
        fields = BaseModelSerializer.Meta.fields + [
            "room",
            "start_datetime",
            "end_datetime",
            "title",
            "users",
            "users_detail",
            "room_detail",
        ]

    def validate(self, attrs: dict) -> dict:
        start = attrs.get("start_datetime", self.instance.start_datetime if self.instance else None)
        end = attrs.get("end_datetime", self.instance.end_datetime if self.instance else None)

        if start and end:
            if start >= end:
                raise serializers.ValidationError({"end_datetime": "End datetime must be after start datetime."})

            duration = end - start

            if duration < timedelta(minutes=15):
                raise serializers.ValidationError({"end_datetime": "Reservation must be at least 15 minutes."})

            if duration > timedelta(hours=8):
                raise serializers.ValidationError({"end_datetime": "Reservation cannot exceed 8 hours."})

        self._get_reservation_users(attrs)

        return attrs

    def create(self, validated_data):
        with transaction.atomic():
            reservation = super().create(validated_data)
            self._create_outerbox_event(reservation, OutboxEventType.BOOKING_CREATED)
        return reservation

    def update(self, instance, validated_data):
        with transaction.atomic():
            reservation = super().update(instance, validated_data)
            self._create_outerbox_event(reservation, OutboxEventType.BOOKING_UPDATED)

        return reservation

    def _create_outerbox_event(self, reservation: Reservation, event_type: OutboxEventType) -> None:
        OutboxEvent.objects.create(
            event_type=event_type,
            payload={
                "reservation_id": reservation.pk,
                "title": reservation.title,
                "to_emails": list(reservation.users.values_list("email", flat=True)),
                "room_name": reservation.room.name,
                "start_datetime": reservation.start_datetime.strftime("%Y-%m-%d %H:%M:%S"),
                "end_datetime": reservation.end_datetime.strftime("%Y-%m-%d %H:%M:%S"),
                "event_type": event_type.label,
            },
        )

    def _get_request_user(self) -> User | None:
        context = self.context.get("request")

        if context:
            return context.user

        return None

    def _get_reservation_users(self, attrs: dict) -> dict:
        current_user = self._get_request_user()

        # If updating and users not provided → keep existing
        if self.instance and "users" not in attrs:
            return attrs

        users = attrs.get("users", [])

        if current_user is not None and current_user not in users:
            users.append(current_user)

        if len(users) > attrs["room"].capacity:
            raise serializers.ValidationError(
                {"users": f"Room capacity is {attrs['room'].capacity}, but {len(users)} users were provided."}
            )

        attrs["users"] = users
        return attrs
