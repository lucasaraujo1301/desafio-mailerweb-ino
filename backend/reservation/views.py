from django.db import transaction
from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated

from core.choices import OutboxEventType
from core.models import OutboxEvent, Reservation
from reservation.serializers import ReservationSerializer


class ReservationViewSet(viewsets.ModelViewSet):
    queryset = Reservation.objects.filter(is_active=True).order_by("-start_datetime")
    serializer_class = ReservationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        if self.request.user.is_admin():
            return self.queryset
        return self.queryset.filter(users=self.request.user.id).distinct()

    def perform_destroy(self, instance):
        with transaction.atomic():
            instance.delete()
            OutboxEvent.objects.create(
                event_type=OutboxEventType.BOOKING_CANCELED,
                payload={
                    "reservation_id": instance.id,
                    "title": instance.title,
                    "to_emails": list(instance.users.values_list("email", flat=True)),
                    "room_name": instance.room.name,
                    "start_datetime": instance.start_datetime.isoformat(),
                    "end_datetime": instance.end_datetime.isoformat(),
                    "event_type": OutboxEventType.BOOKING_CANCELED.label,
                },
            )
