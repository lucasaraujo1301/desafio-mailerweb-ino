from django.urls import path
from rest_framework import routers
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
)

from user import views

app_name = "user"

router = routers.SimpleRouter()
router.register(r"admin", views.AdminUserViewSet)

urlpatterns = [
    path("create/", views.CreateUserView.as_view(), name="create"),
    path("token/", TokenObtainPairView.as_view(), name="token"),
    path("me/", views.ManageUserView.as_view(), name="me"),
    path("", views.ListUserView.as_view(), name="list"),
] + router.urls
