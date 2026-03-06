from rest_framework import generics, permissions, viewsets

from core.models import User
from user.serializers import AdminUserSerializer, UserSerializer


class CreateUserView(generics.CreateAPIView):
    serializer_class = UserSerializer


class ManageUserView(generics.RetrieveUpdateAPIView):
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user


class ListUserView(generics.ListAPIView):
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        queryset = User.objects.filter(is_active=True).order_by("email")
        email = self.request.query_params.get("email")
        if email:
            queryset = queryset.filter(email__icontains=email)
        return queryset


class AdminUserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = AdminUserSerializer
    permissions_classes = [permissions.IsAdminUser]
