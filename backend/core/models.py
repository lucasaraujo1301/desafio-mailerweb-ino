from django.contrib.auth.models import (
    AbstractBaseUser,
    BaseUserManager,
    PermissionsMixin,
)
from django.db import models


class UserManager(BaseUserManager):
    def create_user(self, email: str, password: str = None, **extra_fields):
        """
        The create_user function creates a new user with the given email and password.
        The function normalizes the email address by lowercase, then hashes the password using Django’s built-in
        set_password() method.
        Finally, we save() our newly created user to our database.

        :param self: Refer to the class itself
        :param email: Create a new user with the email address provided
        :param password: Set the password for the user
        :param **extra_fields: Pass in any additional fields that may be required by the user model
        :return: A user object
        :doc-author: Trelent
        """
        if not email:
            raise ValueError("Email must be provided.")
        if not isinstance(email, str):
            raise TypeError("Email must be an string.")

        user = self.model(email=self.normalize_email(email), **extra_fields)
        user.set_password(password)
        user.save(using=self._db)

        return user

    def create_superuser(self, email: str, password: str):
        """
        The create_superuser function is a helper function that creates a superuser with the given email and password.
        It also sets the is_staff and is_superuser flags to True.

        :param self: Refer to the class itself
        :param email: str: Define the email address of the superuser
        :param password: str: Set the password for the user
        :return: A user object
        :doc-author: Trelent
        """
        return self.create_user(email, password, is_staff=True, is_superuser=True)


class User(AbstractBaseUser, PermissionsMixin):
    email = models.EmailField(max_length=255, unique=True)
    name = models.CharField(max_length=255)
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)

    objects = UserManager()

    USERNAME_FIELD = "email"
