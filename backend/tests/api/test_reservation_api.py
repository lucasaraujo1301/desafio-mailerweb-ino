from datetime import timedelta

import pytest
from django.urls import reverse
from rest_framework import status


@pytest.mark.django_db
class TestReservationApi:
    GET_POST_RESERVATION_URL = reverse("reservation:reservation-list")

    def _get_reservation_url_detail(self, reservation_id):
        return reverse("reservation:reservation-detail", args=[reservation_id])

    def test_reservation_401_error(self, mock_email_task, client):
        response = client.get(self.GET_POST_RESERVATION_URL)

        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_reservation_list_only_user_reservations(
        self, mock_email_task, auth_client, reservation_with_user, admin_user, reservation_factory
    ):
        reservation_factory(
            room=reservation_with_user.room,
            start_datetime=reservation_with_user.end_datetime,
            end_datetime=reservation_with_user.end_datetime + timedelta(minutes=15),
            title="Other Reservation",
            users=[admin_user],
        )

        response = auth_client.get(self.GET_POST_RESERVATION_URL)

        assert response.status_code == status.HTTP_200_OK
        assert response.data["count"] == 1
        assert response.data["results"][0]["id"] == reservation_with_user.pk

    def test_admin_list_sees_all(self, mock_email_task, admin_client, reservation):
        response = admin_client.get(self.GET_POST_RESERVATION_URL)

        assert response.status_code == status.HTTP_200_OK
        assert response.data["count"] >= 1

    def test_reservation_detail_success(self, mock_email_task, auth_client, reservation_with_user):
        response = auth_client.get(self._get_reservation_url_detail(reservation_with_user.pk))

        assert response.status_code == status.HTTP_200_OK
        assert response.data["id"] == reservation_with_user.pk

    def test_create_reservation_success(self, mock_email_task, auth_client, room):
        payload = {
            "room": room.pk,
            "start_datetime": "2026-03-05T10:00:00Z",
            "end_datetime": "2026-03-05T11:00:00Z",
            "title": "API Reservation",
        }

        response = auth_client.post(
            self.GET_POST_RESERVATION_URL,
            payload,
            format="json",
        )

        assert response.status_code == status.HTTP_201_CREATED
        assert isinstance(response.data, dict)
        assert response.data["id"] is not None

    def test_update_reservation_success(self, mock_email_task, auth_client, reservation_with_user):
        payload = {"title": "Updated Title"}

        response = auth_client.patch(
            self._get_reservation_url_detail(reservation_with_user.pk),
            payload,
            format="json",
        )

        reservation_with_user.refresh_from_db()

        assert response.status_code == status.HTTP_200_OK
        assert reservation_with_user.title == payload["title"]

    def test_delete_reservation_success(self, mock_email_task, auth_client, reservation_with_user):
        response = auth_client.delete(self._get_reservation_url_detail(reservation_with_user.pk))

        reservation_with_user.refresh_from_db()

        assert response.status_code == status.HTTP_204_NO_CONTENT
        assert reservation_with_user.is_active is False
        mock_email_task.assert_called()

    def test_user_cannot_access_other_user_reservation(self, mock_email_task, auth_client, reservation, admin_user):
        reservation.users.clear()
        reservation.users.add(admin_user)

        response = auth_client.get(self._get_reservation_url_detail(reservation.pk))

        assert response.status_code == status.HTTP_404_NOT_FOUND
