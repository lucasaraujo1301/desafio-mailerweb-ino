import pytest
from django.contrib.auth import get_user_model


@pytest.mark.django_db
def test_create_user_with_email_successful():
    email = "test@example.com"
    password = "testpass123"
    user = get_user_model().objects.create_user(email=email, password=password)

    assert email == user.email
    assert user.check_password(password)


@pytest.mark.django_db
def test_new_user_email_normalized():
    sample_emails = [
        ["test1@EXAMPLE.com", "test1@example.com"],
        ["Test2@Example.com", "Test2@example.com"],
        ["TEST3@EXAMPLE.COM", "TEST3@example.com"],
        ["test4@example.COM", "test4@example.com"],
    ]

    for email, expected in sample_emails:
        user = get_user_model().objects.create_user(email, "sample123")
        assert expected == user.email


@pytest.mark.django_db
def test_new_user_without_email_raises_error():
    with pytest.raises(ValueError, match="Email must be provided."):
        get_user_model().objects.create_user("", "sample123")


@pytest.mark.django_db
def test_new_user_with_email_raises_error():
    with pytest.raises(TypeError, match="Email must be an string."):
        get_user_model().objects.create_user(123, "sample123")


@pytest.mark.django_db
def test_create_superuser():
    user = get_user_model().objects.create_superuser("test@example.com", "test123")

    assert user.is_superuser
    assert user.is_staff
