import pytest
from rest_framework.test import APIClient

from core.models import User


@pytest.fixture
def client() -> APIClient:
    return APIClient()


@pytest.fixture
def auth_client(user: User) -> APIClient:
    client = APIClient()
    client.force_authenticate(user=user)
    return client


@pytest.fixture
def admin_client(admin_user: User) -> APIClient:
    client = APIClient()
    client.force_authenticate(user=admin_user)

    return client
