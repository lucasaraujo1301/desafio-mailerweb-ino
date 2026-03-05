from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated

from core.models import Reservation
from reservation.serializers import ReservationSerializer


class ReservationViewSet(viewsets.ModelViewSet):
    queryset = Reservation.objects.filter(is_active=True).order_by("-start_datetime")
    serializer_class = ReservationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        if self.request.user.is_admin():
            return self.queryset
        return self.queryset.filter(users=self.request.user.id).distinct()
