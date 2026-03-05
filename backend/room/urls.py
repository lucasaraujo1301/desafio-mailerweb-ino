from rest_framework import routers

from room import views

app_name = "room"

router = routers.SimpleRouter()
router.register(r"rooms", views.RoomViewSet)

urlpatterns = router.urls
