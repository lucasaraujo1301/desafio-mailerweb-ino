import pytest
from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework import status

CREATE_USER_URL = reverse("user:create")
TOKEN_URL = reverse("user:token")
ME_URL = reverse("user:me")


@pytest.mark.django_db
class TestsPublicUserApi:
    def test_create_user_success(self, client):
        payload = {
            "email": "test@example.com",
            "password": "testpass123",
            "name": "Test Name",
        }

        res = client.post(CREATE_USER_URL, payload)

        assert res.status_code == status.HTTP_201_CREATED

        user = get_user_model().objects.get(email=payload["email"])
        assert user is not None
        assert user.check_password(payload["password"])
        assert "password" not in res.data

    def test_user_with_email_exists_error(self, client, user):
        payload = {
            "email": user.email,
            "password": "testpass123",
            "name": "Test Name",
        }

        res = client.post(CREATE_USER_URL, payload)

        assert res.status_code == status.HTTP_400_BAD_REQUEST
        assert "email" in res.data
        assert "user with this email already exists." in res.data["email"]

    def test_password_too_short_error(self, client):
        payload = {"email": "test@example.com", "password": "pw", "name": "Test Name"}
        res = client.post(CREATE_USER_URL, payload)

        assert res.status_code == status.HTTP_400_BAD_REQUEST
        assert "password" in res.data
        assert "Ensure this field has at least 5 characters." in res.data["password"]

        user_exists = get_user_model().objects.filter(email=payload["email"]).exists()
        assert not user_exists

    def test_get_user_jwt_token(self, client, user_factory):
        user_details = {
            "name": "Test Name",
            "email": "test@example.com",
            "password": "test123",
        }
        user_factory(**user_details)

        payload = {
            "email": user_details["email"],
            "password": user_details["password"],
        }
        res = client.post(TOKEN_URL, payload)

        assert res.status_code == status.HTTP_200_OK
        assert "access" in res.data
        assert "refresh" in res.data
        assert user_details["email"] == res.data["user_email"]
        assert user_details["name"] == res.data["user_name"]

    def test_get_user_jwt_token_with_wrong_credentials(self, client):
        payload = {
            "email": "wrong@email.com",
            "password": "wrongpass",
        }
        res = client.post(TOKEN_URL, payload)

        assert res.status_code == status.HTTP_401_UNAUTHORIZED
        assert "No active account found with the given credentials" == res.data["detail"]

    def test_get_user_jwt_token_with_empty_password(self, client):
        payload = {
            "email": "email@domain.com",
            "password": "",
        }
        res = client.post(TOKEN_URL, payload)

        assert res.status_code == status.HTTP_400_BAD_REQUEST
        assert "This field may not be blank." in res.data["password"]

    def test_retrieve_user_unauthorized(self, client):
        res = client.get(ME_URL)

        assert res.status_code == status.HTTP_401_UNAUTHORIZED
        assert "Authentication credentials were not provided." == res.data["detail"]


@pytest.mark.django_db
class TestsPrivateUserApi:
    def test_retrieve_profile_success(self, auth_client, user):
        res = auth_client.get(ME_URL)

        assert res.status_code == status.HTTP_200_OK

        expected = {
            "name": user.name,
            "email": user.email,
            "is_active": user.is_active,
            "id": user.id,
            "created_at": user.created_at.isoformat().replace("+00:00", "Z"),
            "updated_at": user.updated_at.isoformat().replace("+00:00", "Z"),
        }
        assert res.data == expected

    def test_post_me_not_allowed(self, auth_client):
        res = auth_client.post(ME_URL, {})

        assert res.status_code == status.HTTP_405_METHOD_NOT_ALLOWED

    def test_update_user_profile(self, auth_client, user):
        payload = {"name": "Updated Name", "password": "newpassword123"}

        res = auth_client.patch(ME_URL, payload)

        user.refresh_from_db()

        assert res.status_code == status.HTTP_200_OK
        assert user.name == payload["name"]
        assert user.check_password(payload["password"])
