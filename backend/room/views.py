from rest_framework import viewsets
from rest_framework.permissions import IsAdminUser, IsAuthenticated

from core.models import Room
from room.serializers import RoomSerializer


class RoomViewSet(viewsets.ModelViewSet):
    queryset = Room.objects.all().order_by("-created_at")
    serializer_class = RoomSerializer

    def get_permissions(self):
        permission_classes = [IsAuthenticated]

        # 1. 'create', 'update', 'partial_update', and 'destroy' require Admin
        if self.action in ["create", "update", "partial_update", "destroy"]:
            permission_classes = [IsAdminUser]

        return [permission() for permission in permission_classes]

    def get_queryset(self):
        if not self.request.user.is_admin():
            return self.queryset.filter(is_active=True)

        return self.queryset
