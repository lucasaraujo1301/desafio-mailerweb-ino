from rest_framework import routers

from reservation import views

app_name = "reservation"

router = routers.SimpleRouter()
router.register(r"reservation", views.ReservationViewSet)

urlpatterns = router.urls
