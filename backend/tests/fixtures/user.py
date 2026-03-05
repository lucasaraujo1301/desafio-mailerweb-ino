import pytest
from django.contrib.auth import get_user_model

User = get_user_model()


@pytest.fixture
def user() -> User:
    return get_user_model().objects.create(email="test@example.com", password="testpass123", name="Test User")


@pytest.mark.django_db
def admin_user() -> User:
    return get_user_model().objects.create_superuser("admin@example.com", "test123", name="Super Test User")
