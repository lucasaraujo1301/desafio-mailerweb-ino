import pytest
from django.urls import reverse
from rest_framework import status


@pytest.mark.django_db
class TestRoomApi:
    GET_POST_ROOM_URL = reverse("room:room-list")

    def _get_room_url_detail(self, room_id):
        return reverse("room:room-detail", args=[room_id])

    def test_room_401_error(self, client):
        response = client.get(self.GET_POST_ROOM_URL)

        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_room_list_success(self, auth_client, room):
        response = auth_client.get(self.GET_POST_ROOM_URL)

        assert response.status_code == status.HTTP_200_OK
        assert response.data["count"] == 1
        assert response.data["results"][0]["id"] == room.id

    def test_room_detail_success(self, auth_client, room):
        response = auth_client.get(self._get_room_url_detail(room.id))

        assert response.status_code == status.HTTP_200_OK
        assert response.data["id"] == room.id

    def test_create_room_403(self, auth_client):
        payload = {
            "name": "test",
        }

        response = auth_client.post(self.GET_POST_ROOM_URL, payload)

        assert response.status_code == status.HTTP_403_FORBIDDEN

    def test_update_room_403(self, auth_client, room):
        payload = {}

        response = auth_client.patch(self._get_room_url_detail(room.id), payload)

        assert response.status_code == status.HTTP_403_FORBIDDEN

    def test_delete_room_403(self, auth_client, room):
        response = auth_client.delete(self._get_room_url_detail(room.id))

        assert response.status_code == status.HTTP_403_FORBIDDEN

    def test_creat_room_with_admin_user_success(self, admin_client):
        payload = {
            "name": "test",
        }

        response = admin_client.post(self.GET_POST_ROOM_URL, payload)

        assert response.status_code == status.HTTP_201_CREATED
        assert isinstance(response.data, dict)
        assert response.data["id"] is not None

    def test_update_room_with_admin_user_success(self, admin_client, room):
        payload = {"name": "testing update"}

        response = admin_client.patch(self._get_room_url_detail(room.id), payload)
        room.refresh_from_db()

        assert response.status_code == status.HTTP_200_OK
        assert room.name == payload["name"]

    def test_delete_room_with_admin_user_success(self, admin_client, room):
        response = admin_client.delete(self._get_room_url_detail(room.id))
        room.refresh_from_db()

        assert response.status_code == status.HTTP_204_NO_CONTENT
        assert room.is_active is False
