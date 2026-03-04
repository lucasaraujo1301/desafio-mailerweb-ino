import pytest
from django.contrib.auth import get_user_model


@pytest.fixture
def user_factory():
    def factory(email, password, name):
        data = {"email": email, "password": password, "name": name}
        return get_user_model().objects.create_user(**data)

    return factory
